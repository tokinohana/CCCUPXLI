"""
Custom authentication forms for the swapped User model.

These are required because Django's built-in UserCreationForm / UserChangeForm
reference ``auth.User`` which has been swapped out for ``user.User``.
Without custom forms, Django Admin's "Add User" page will crash with:
    AttributeError: Manager isn't available; 'auth.User' has been swapped for 'user.User'
"""

from django.contrib.auth.forms import (
    UserCreationForm as BaseUserCreationForm,
    UserChangeForm as BaseUserChangeForm,
)
from .models import User


class UserCreationForm(BaseUserCreationForm):
    class Meta(BaseUserCreationForm.Meta):
        model = User
        fields = ('email', 'username')


class UserChangeForm(BaseUserChangeForm):
    class Meta(BaseUserChangeForm.Meta):
        model = User
        fields = ('email', 'username')
