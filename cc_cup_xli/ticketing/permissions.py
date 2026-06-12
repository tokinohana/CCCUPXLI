from rest_framework.permissions import BasePermission


class IsCommittee(BasePermission):
    """Allows access only to committee members."""

    def has_permission(self, request, view):
        return (
            request.user
            and request.user.is_authenticated
            and request.user.is_committee
        )
