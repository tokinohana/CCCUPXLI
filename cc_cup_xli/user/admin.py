from django.contrib import admin
from .models import User

@admin.register(User)
class UserAdmin(admin.ModelAdmin):
    list_display = ('email', 'username', 'is_committee', 'is_external', 'is_staff')
    list_filter = ('is_committee', 'is_external', 'is_staff')
    search_fields = ('email', 'username')
