from django.contrib import admin
from django.contrib.auth.admin import UserAdmin as BaseUserAdmin, GroupAdmin
from django.contrib.auth.models import Group
from admin_utils import AppGroupPermissionMixin
from .models import User
from .forms import UserCreationForm, UserChangeForm

# ── Restrict third-party admin models to superuser-only ───────────────────
# Django's built-in Group model
try:
    admin.site.unregister(Group)
except admin.sites.NotRegistered:
    pass


class SuperuserOnlyGroupAdmin(GroupAdmin):
    """Restrict Group management to superusers only."""
    pass


admin.site.register(Group, SuperuserOnlyGroupAdmin)

# SimpleJWT token blacklist models
try:
    from rest_framework_simplejwt.token_blacklist.models import (
        BlacklistedToken, OutstandingToken,
    )
    from rest_framework_simplejwt.token_blacklist.admin import (
        BlacklistedTokenAdmin, OutstandingTokenAdmin,
    )

    class SuperuserOnlyBlacklistedTokenAdmin(BlacklistedTokenAdmin):
        pass

    class SuperuserOnlyOutstandingTokenAdmin(OutstandingTokenAdmin):
        pass

    admin.site.unregister(BlacklistedToken)
    admin.site.unregister(OutstandingToken)
    admin.site.register(BlacklistedToken, SuperuserOnlyBlacklistedTokenAdmin)
    admin.site.register(OutstandingToken, SuperuserOnlyOutstandingTokenAdmin)
except (ImportError, admin.sites.NotRegistered):
    pass


@admin.register(User)
class UserAdmin(BaseUserAdmin):
    """Custom user admin with proper password hashing via built-in forms."""

    def has_module_permission(self, request):
        """Hides the entire model/app from the admin index dashboard for non-superusers."""
        return request.user.is_superuser

    def has_view_permission(self, request, obj=None):
        """Prevents direct URL access to view object listings or details."""
        return request.user.is_superuser

    def has_add_permission(self, request):
        """Prevents adding new records."""
        return request.user.is_superuser

    def has_change_permission(self, request, obj=None):
        """Prevents editing existing records."""
        return request.user.is_superuser

    def has_delete_permission(self, request, obj=None):
        """Prevents deleting records."""
        return request.user.is_superuser
    
    form = UserChangeForm
    add_form = UserCreationForm

    list_display = ('email', 'username', 'is_committee', 'is_external', 'is_staff', 'is_active')
    list_filter = ('is_committee', 'is_external', 'is_staff', 'is_active', 'groups')
    search_fields = ('email', 'username')
    ordering = ('email',)

    fieldsets = (
        (None, {'fields': ('email', 'username', 'password')}),
        ('Roles', {'fields': ('is_external', 'is_committee')}),
        ('Profile', {'fields': ('phone_number', 'nis', 'division_name')}),
        ('CC Pay', {'fields': ('role', 'current_saldo'), 'classes': ('collapse',)}),
        ('OAuth', {'fields': ('google_id',), 'classes': ('collapse',)}),
        ('Permissions', {'fields': ('is_active', 'is_staff', 'is_superuser', 'groups', 'user_permissions')}),
        ('Important dates', {'fields': ('last_login', 'date_joined')}),
    )

    add_fieldsets = (
        (None, {
            'classes': ('wide',),
            'fields': ('email', 'username', 'password1', 'password2', 'is_staff', 'is_committee', 'is_external', 'groups'),
        }),
    )
