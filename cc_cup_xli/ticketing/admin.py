import csv
from django.contrib import admin
from django.http import HttpResponse
from admin_utils import AppGroupPermissionMixin
from .models import Ticket

TICKETING_GROUP = 'Ticketing Committee'


@admin.register(Ticket)
class TicketAdmin(AppGroupPermissionMixin, admin.ModelAdmin):
    allowed_group = TICKETING_GROUP
    list_display = (
        'full_name', 'identification_number', 'status',
        'is_redeemed', 'terminal', 'scanned_by', 'created_at',
    )
    list_filter = ('status', 'is_redeemed', 'terminal')
    search_fields = ('full_name', 'identification_number', 'email')
    readonly_fields = ('ticket_id', 'created_at', 'updated_at')

    actions = ['export_csv', 'mark_voided']

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

        for t in queryset:
            writer.writerow([
                t.ticket_id,
                t.full_name,
                t.email,
                t.identification_number,
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
