"""
Shared admin permission utilities for Role-Based Access Control (RBAC).

Provides a mixin that restricts Django Admin model visibility and
CRUD access based on Django Group membership.

Design:
  - Set `allowed_group` on each ModelAdmin to a Group name string.
  - Superusers bypass ALL checks (Django default behavior preserved).
  - If `allowed_group = None` (default), only superusers can access.
  - `has_module_permission` hides the entire app section from the
    admin index/sidebar for users not in the allowed group.
"""

from django.contrib import admin


class AppGroupPermissionMixin:
    """
    Restricts Django ModelAdmin access to users who belong to a
    specific Django Group. Superusers always have full access.

    Usage:
        class MyModelAdmin(AppGroupPermissionMixin, admin.ModelAdmin):
            allowed_group = 'Registration Committee'
            ...
    """

    allowed_group = None  # Override in subclass; None = superuser-only

    def _has_group_access(self, request):
        if request.user.is_superuser:
            return True
        if self.allowed_group is None:
            return False
        return request.user.groups.filter(name=self.allowed_group).exists()

    # ── Sidebar / index visibility ──────────────────────────────────────────
    def has_module_permission(self, request):
        return self._has_group_access(request)

    # ── CRUD permissions ────────────────────────────────────────────────────
    def has_view_permission(self, request, obj=None):
        return self._has_group_access(request)

    def has_add_permission(self, request):
        return self._has_group_access(request)

    def has_change_permission(self, request, obj=None):
        return self._has_group_access(request)

    def has_delete_permission(self, request, obj=None):
        return self._has_group_access(request)

    # ── Propagate to inlines ────────────────────────────────────────────────
    def get_inline_instances(self, request, obj=None):
        """Auto-restrict inlines to match the parent's group."""
        inlines = super().get_inline_instances(request, obj)
        allowed = self._has_group_access(request)
        for inline in inlines:
            if not allowed:
                inline.has_add_permission = lambda r, o=None: False
                inline.has_change_permission = lambda r, o=None, **kw: False
                inline.has_delete_permission = lambda r, o=None, **kw: False
                inline.has_view_permission = lambda r, o=None: False
        return inlines
