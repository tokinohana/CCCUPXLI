from django.contrib.auth.models import AbstractUser
from django.db import models

class User(AbstractUser):
    # 1. AUTHENTICATION CORE
    email = models.EmailField(unique=True)
    username = models.CharField(max_length=150, unique=True, blank=True, null=True)

    # 2. THE ROLES 
    is_external = models.BooleanField(default=False)  # Team Captains
    is_committee = models.BooleanField(default=False) # Regis Admin / Ticketing Staff / CC PAY Eligible

    # 3. METADATA
    phone_number = models.CharField(max_length=15, blank=True, null=True)
    nis = models.CharField(max_length=20, unique=True, blank=True, null=True)
    
    # 4. CCPAY LOGIC (Simplified & Decoupled)
    ROLE_CHOICES = (
        ('HEAD', 'Head'),
        ('MEMBER', 'Member'),
    )
    role = models.CharField(max_length=10, choices=ROLE_CHOICES, default='MEMBER')
    current_saldo = models.BigIntegerField(default=0)
    
    # CHANGED: Replaced the dead ForeignKey link with a simple text storage column
    division_name = models.CharField(max_length=100, default="UNREGISTERED", blank=True, null=True)
    
    google_id = models.CharField(max_length=255, unique=True, null=True, blank=True)

    USERNAME_FIELD = 'email'
    REQUIRED_FIELDS = ['username']

    def save(self, *args, **kwargs):
        if not self.username and self.email:
            self.username = self.email.split('@')[0]
        super().save(*args, **kwargs)

    def __str__(self):
        return self.email