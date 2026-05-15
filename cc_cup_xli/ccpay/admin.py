from django.contrib import admin
from .models import Division, Shift, Transaction

@admin.register(Division)
class DivisionAdmin(admin.ModelAdmin):
    list_display = ('name', 'head')

@admin.register(Shift)
class ShiftAdmin(admin.ModelAdmin):
    list_display = ('user', 'date', 'is_distributed')
    list_filter = ('date', 'is_distributed')
    search_fields = ('user__email', 'user__nis')

@admin.register(Transaction)
class TransactionAdmin(admin.ModelAdmin):
    list_display = ('type', 'receiver', 'sender', 'amount', 'timestamp')
    list_filter = ('type', 'timestamp')
    search_fields = ('receiver__email', 'sender__email')
