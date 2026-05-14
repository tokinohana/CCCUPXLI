from django.contrib import admin
from .models import Ticket

@admin.register(Ticket)
class TicketAdmin(admin.ModelAdmin):
    list_display = ('full_name', 'identification_number', 'is_redeemed', 'redeemed_at', 'scanned_by')
    list_filter = ('is_redeemed',)
    search_fields = ('full_name', 'identification_number', 'email')
    readonly_fields = ('ticket_id',)
