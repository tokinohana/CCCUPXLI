from django.contrib.auth.models import AbstractUser
from django.db import models

class User(AbstractUser):
    # 1. AUTHENTICATION CORE
    # We use email for login. AbstractUser provides the 'password' field automatically.
    email = models.EmailField(unique=True)
    
    # We still need a username field for Django internals, 
    # but we can make it blank or auto-fill it with the email prefix.
    username = models.CharField(max_length=150, unique=True, blank=True, null=True)

    # 2. THE ROLES (Your Vision)
    is_external = models.BooleanField(default=False)  # Team Captains
    is_committee = models.BooleanField(default=False) # Regis Admin / Ticketing Staff

    # 3. METADATA
    phone_number = models.CharField(max_length=15, blank=True, null=True)
    nis = models.CharField(max_length=20, unique=True, blank=True, null=True)
    
    # 4. CCPAY LOGIC
    ROLE_CHOICES = (
        ('HEAD', 'Head'),
        ('MEMBER', 'Member'),
    )
    role = models.CharField(max_length=10, choices=ROLE_CHOICES, default='MEMBER')
    current_saldo = models.BigIntegerField(default=0)
    division = models.ForeignKey('ccpay.Division', on_delete=models.SET_NULL, null=True, blank=True, related_name='members')

    USERNAME_FIELD = 'email'  # This tells Django: "Login with email"
    REQUIRED_FIELDS = ['username']

    def save(self, *args, **kwargs):
        # Auto-generate username from email if not provided
        if not self.username:
            self.username = self.email.split('@')[0]
        super().save(*args, **kwargs)

    def __str__(self):
        return self.email
