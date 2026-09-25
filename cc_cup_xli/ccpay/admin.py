from django.contrib import admin
from django.contrib.auth import get_user_model
from django.urls import path
from django.shortcuts import redirect
from django.contrib import messages

from admin_utils import AppGroupPermissionMixin
from .models import Transaction, MerchantStand, WeeklyDutySchedule
from .services import distribute_daily_funds, expire_daily_funds

CCPAY_GROUP = 'admin_ccpay'
User = get_user_model()


class DivisionFilter(admin.SimpleListFilter):
    title = 'Division'
    parameter_name = 'division'

    def lookups(self, request, model_admin):
        divisions = (
            User.objects
            .exclude(division_name__isnull=True)
            .exclude(division_name='')
            .values_list('division_name', flat=True)
            .distinct()
            .order_by('division_name')
        )

        return [(division, division) for division in divisions]

    def queryset(self, request, queryset):
        value = self.value()

        if not value:
            return queryset

        emails = User.objects.filter(
            division_name=value
        ).values_list('email', flat=True)

        return queryset.filter(user_email__in=emails)


@admin.register(Transaction)
class TransactionAdmin(AppGroupPermissionMixin, admin.ModelAdmin):
    allowed_group = CCPAY_GROUP
    change_list_template = 'admin/ccpay/transaction/change_list.html'
    list_display = (
        'id', 'type', 'sender', 'receiver',
        'merchant_stand_name', 'amount', 'timestamp'
    )
    list_filter = ('type', 'timestamp', 'merchant_stand')

    search_fields = (
        'sender__email',
        'receiver__email',
        'reference_id',
        'description'
    )
    readonly_fields = ('timestamp',)

    @admin.display(description='Merchant Stand')
    def merchant_stand_name(self, obj):
        return obj.merchant_stand.name if obj.merchant_stand else "-"

    def changelist_view(self, request, extra_context=None):
        extra_context = extra_context or {}
        extra_context['show_fund_buttons'] = True
        return super().changelist_view(request, extra_context=extra_context)

    def get_urls(self):
        urls = super().get_urls()
        custom = [
            path(
                'distribute-funds/',
                self.admin_site.admin_view(self.distribute_funds_view),
                name='ccpay-distribute-funds',
            ),
            path(
                'expire-funds/',
                self.admin_site.admin_view(self.expire_funds_view),
                name='ccpay-expire-funds',
            ),
        ]
        return custom + urls

    def distribute_funds_view(self, request):
        try:
            count = distribute_daily_funds()
            messages.success(
                request,
                f'Successfully distributed funds to {count} committee member(s).'
            )
        except Exception as e:
            messages.error(request, f'Error distributing funds: {e}')
        return redirect('admin:ccpay_transaction_changelist')

    def expire_funds_view(self, request):
        try:
            count = expire_daily_funds()
            messages.success(
                request,
                f'Successfully expired funds for {count} committee member(s).'
            )
        except Exception as e:
            messages.error(request, f'Error expiring funds: {e}')
        return redirect('admin:ccpay_transaction_changelist')


@admin.register(MerchantStand)
class MerchantStandAdmin(AppGroupPermissionMixin, admin.ModelAdmin):
    allowed_group = CCPAY_GROUP
    list_display = ('name', 'token', 'is_active')
    list_filter = ('is_active',)
    search_fields = ('name', 'token')


@admin.register(WeeklyDutySchedule)
class WeeklyDutyScheduleAdmin(AppGroupPermissionMixin, admin.ModelAdmin):
    allowed_group = CCPAY_GROUP
    list_display = (
        'user_email',
        'h1', 'h2', 'h3', 'h4',
        'h5', 'h6', 'h7', 'h8'
    )
    list_editable = (
        'h1', 'h2', 'h3', 'h4',
        'h5', 'h6', 'h7', 'h8'
    )
    list_filter = (DivisionFilter,)
    search_fields = ('user_email',)