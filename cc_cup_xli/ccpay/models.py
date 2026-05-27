from django.db import models
from django.conf import settings

class Division(models.Model):
    name = models.CharField(max_length=100)
    # The Head/Captain of the division
    head = models.OneToOneField(settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True, blank=True, related_name='led_division')

    def __str__(self):
        return self.name

class Shift(models.Model):
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='shifts')
    date = models.DateField()
    start_time = models.TimeField(default='14:00')
    end_time = models.TimeField(default='17:00')
    is_distributed = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ('user', 'date')

    def __str__(self):
        return f"{self.user.email} - {self.date}"

class Transaction(models.Model):
    TYPE_CHOICES = (
        ('DISTRIBUTION', 'Distribution'),
        ('PAYMENT', 'Payment'),
        ('EXPIRATION', 'Expiration'),
        ('ADJUSTMENT', 'Adjustment'),
    )
    
    sender = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True, blank=True, related_name='sent_transactions')
    receiver = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True, blank=True, related_name='received_transactions')
    merchant_stand = models.ForeignKey('MerchantStand', on_delete=models.SET_NULL, null=True, blank=True, related_name='transactions')
    reference_id = models.UUIDField(null=True, blank=True, unique=True, help_text="Unique reference for payment idempotency")
    amount = models.BigIntegerField()
    type = models.CharField(max_length=20, choices=TYPE_CHOICES)
    timestamp = models.DateTimeField(auto_now_add=True)
    description = models.CharField(max_length=255, blank=True, null=True)

    def __str__(self):
        return f"{self.type} - {self.amount} - {self.timestamp}"

class MerchantStand(models.Model):
    name = models.CharField(max_length=100)
    token = models.CharField(max_length=64, unique=True)
    is_active = models.BooleanField(default=True)

    def __str__(self):
        return self.name
