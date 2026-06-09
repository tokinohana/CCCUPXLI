from django.contrib import admin
from .models import Transaction, MerchantStand

@admin.register(Transaction)
class TransactionAdmin(admin.ModelAdmin):
    list_display = ('id', 'type', 'sender', 'receiver', 'merchant_stand_name', 'amount', 'timestamp')
    list_filter = ('type', 'timestamp', 'merchant_stand')
    
    # FIXED: Updated lookups with double underscores to safely search related model strings
    search_fields = ('sender__email', 'receiver__email', 'reference_id', 'description')
    readonly_fields = ('timestamp',)

    @admin.display(description='Merchant Stand')
    def merchant_stand_name(self, obj):
        return obj.merchant_stand.name if obj.merchant_stand else "-"


@admin.register(MerchantStand)
class MerchantStandAdmin(admin.ModelAdmin):
    list_display = ('name', 'token', 'is_active')
    list_filter = ('is_active',)
    search_fields = ('name', 'token')