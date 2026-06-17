from django.contrib import admin
from django.urls import path
from django.shortcuts import redirect
from django.contrib import messages
from admin_utils import AppGroupPermissionMixin
from .models import Transaction, MerchantStand
from .services import distribute_daily_funds, expire_daily_funds
# ccpay is superuser-only: allowed_group stays None


@admin.register(Transaction)
class TransactionAdmin(AppGroupPermissionMixin, admin.ModelAdmin):
    # allowed_group = None  →  superuser only
    change_list_template = 'admin/ccpay/transaction/change_list.html'
    list_display = ('id', 'type', 'sender', 'receiver', 'merchant_stand_name', 'amount', 'timestamp')
    list_filter = ('type', 'timestamp', 'merchant_stand')

    # FIXED: Updated lookups with double underscores to safely search related model strings
    search_fields = ('sender__email', 'receiver__email', 'reference_id', 'description')
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
        """Admin action: distribute daily coupon funds to all active committee members."""
        try:
            count = distribute_daily_funds()
            messages.success(request, f'Successfully distributed funds to {count} committee member(s).')
        except Exception as e:
            messages.error(request, f'Error distributing funds: {e}')
        return redirect('admin:ccpay_transaction_changelist')

    def expire_funds_view(self, request):
        """Admin action: expire all unspent daily coupon funds."""
        try:
            count = expire_daily_funds()
            messages.success(request, f'Successfully expired funds for {count} committee member(s).')
        except Exception as e:
            messages.error(request, f'Error expiring funds: {e}')
        return redirect('admin:ccpay_transaction_changelist')


@admin.register(MerchantStand)
class MerchantStandAdmin(AppGroupPermissionMixin, admin.ModelAdmin):
    # allowed_group = None  →  superuser only
    list_display = ('name', 'token', 'is_active')
    list_filter = ('is_active',)
    search_fields = ('name', 'token')