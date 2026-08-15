import csv
from django import forms
from django.contrib import admin
from django.db import transaction
from django.http import HttpResponse
from .models import Buyer, Ticket
from .services import queue_ticket_email

# admin_utils.py lives at the project root (next to manage.py), not inside
# the ticketing app — confirmed against regis/admin.py's working import.
from admin_utils import AppGroupPermissionMixin

TICKETING_GROUP = 'admin_ticketing'


class TicketAdminForm(forms.ModelForm):
    """
    Surfaces Buyer fields directly on the Ticket add/change form, so stall
    admins still create a buyer + ticket in one action even though they're
    two separate tables under the hood.
    """
    full_name = forms.CharField(max_length=255, label='Full name')
    email = forms.EmailField(label='Email')
    identification_number = forms.CharField(max_length=50, label='NIK')

    class Meta:
        model = Ticket
        fields = ['status', 'terminal']  # buyer-linked fields are handled manually below

    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        if self.instance and self.instance.pk and self.instance.buyer_id:
            self.fields['full_name'].initial = self.instance.buyer.full_name
            self.fields['email'].initial = self.instance.buyer.email
            self.fields['identification_number'].initial = self.instance.buyer.identification_number
            # Lock NIK on existing tickets — don't silently reassign a
            # ticket to a different person after creation.
            self.fields['identification_number'].disabled = True

    def clean_identification_number(self):
        nik = self.cleaned_data['identification_number']
        qs = Buyer.objects.filter(identification_number=nik)
        if self.instance and self.instance.pk and self.instance.buyer_id:
            qs = qs.exclude(pk=self.instance.buyer_id)
        if qs.exists():
            raise forms.ValidationError('A ticket with this identification number already exists.')
        return nik


@admin.register(Buyer)
class BuyerAdmin(AppGroupPermissionMixin, admin.ModelAdmin):
    """
    Read-mostly: Buyer rows are only ever created via the Ticket add form
    (TicketAdminForm), so add/delete are locked here to keep every Buyer
    tied to exactly one Ticket. Editing (fixing a typo'd name/email) is
    still allowed, same as editing via the Ticket form does.
    """
    allowed_group = TICKETING_GROUP
    list_display = ('full_name', 'identification_number', 'email', 'created_at')
    search_fields = ('full_name', 'identification_number', 'email')
    readonly_fields = ('identification_number', 'created_at', 'updated_at')

    def has_add_permission(self, request):
        return False

    def has_delete_permission(self, request, obj=None):
        return False


@admin.register(Ticket)
class TicketAdmin(AppGroupPermissionMixin, admin.ModelAdmin):
    allowed_group = TICKETING_GROUP
    form = TicketAdminForm
    list_display = (
        'buyer_full_name', 'buyer_nik', 'status',
        'is_redeemed', 'terminal', 'scanned_by', 'created_at',
    )
    list_filter = ('status', 'is_redeemed', 'terminal')
    search_fields = ('buyer__full_name', 'buyer__identification_number', 'buyer__email')
    readonly_fields = ('ticket_id', 'created_at', 'updated_at')

    actions = ['export_csv', 'mark_voided']

    def get_queryset(self, request):
        return super().get_queryset(request).select_related('buyer')

    @admin.display(description='Full name', ordering='buyer__full_name')
    def buyer_full_name(self, obj):
        return obj.buyer.full_name

    @admin.display(description='NIK', ordering='buyer__identification_number')
    def buyer_nik(self, obj):
        return obj.buyer.identification_number

    def save_model(self, request, obj, form, change):
        """
        Mirrors TicketListCreateView.perform_create: a ticket created here
        is paid immediately (cash-at-stall, one action) and creates its
        Buyer row in the same transaction; the QR email fires off-thread
        after commit via the shared services.queue_ticket_email. Editing
        an existing ticket does NOT re-trigger an email — only a new row
        does.
        """
        is_new = obj.pk is None
        with transaction.atomic():
            if is_new:
                buyer = Buyer.objects.create(
                    full_name=form.cleaned_data['full_name'],
                    email=form.cleaned_data['email'],
                    identification_number=form.cleaned_data['identification_number'],
                )
                obj.buyer = buyer
                obj.status = 'paid'
            else:
                # Allow correcting name/email post-creation; NIK stays locked (see form).
                buyer = obj.buyer
                buyer.full_name = form.cleaned_data['full_name']
                buyer.email = form.cleaned_data['email']
                buyer.save(update_fields=['full_name', 'email'])
            super().save_model(request, obj, form, change)
        if is_new:
            queue_ticket_email(obj)

    @admin.action(description='Export selected tickets to CSV')
    def export_csv(self, request, queryset):
        response = HttpResponse(content_type='text/csv')
        response['Content-Disposition'] = 'attachment; filename="tickets_export.csv"'

        writer = csv.writer(response)
        writer.writerow([
            'Ticket ID', 'Full Name', 'Email', 'Identification Number',
            'Status', 'Is Redeemed', 'Redeemed At', 'Terminal',
            'Scanned By', 'Created At',
        ])

        for t in queryset.select_related('buyer'):
            writer.writerow([
                t.ticket_id,
                t.buyer.full_name,
                t.buyer.email,
                t.buyer.identification_number,
                t.status,
                t.is_redeemed,
                t.redeemed_at.isoformat() if t.redeemed_at else '',
                t.terminal or '',
                t.scanned_by.email if t.scanned_by else '',
                t.created_at.isoformat() if t.created_at else '',
            ])

        return response

    @admin.action(description='Mark selected tickets as voided')
    def mark_voided(self, request, queryset):
        updated = queryset.update(status='voided')
        self.message_user(request, f'{updated} ticket(s) marked as voided.')