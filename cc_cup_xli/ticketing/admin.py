from django.contrib import admin
from admin_utils import AppGroupPermissionMixin
from .models import Ticket

TICKETING_GROUP = 'Ticketing Committee'

@admin.register(Ticket)
class TicketAdmin(AppGroupPermissionMixin, admin.ModelAdmin):
    allowed_group = TICKETING_GROUP
    list_display = ('full_name', 'identification_number', 'is_redeemed', 'redeemed_at', 'scanned_by')
    list_filter = ('is_redeemed',)
    search_fields = ('full_name', 'identification_number', 'email')
    readonly_fields = ('ticket_id',)
