from django.db import models

class MerchantStand(models.Model):
    name = models.CharField(max_length=100)
    token = models.CharField(max_length=64, unique=True, help_text="Secret token assigned to the merchant terminal")
    is_active = models.BooleanField(default=True)

    def __str__(self):
        return self.name


class Transaction(models.Model):
    TYPE_CHOICES = (
        ('DISTRIBUTION', 'Distribution'),
        ('PAYMENT', 'Payment'),
        ('EXPIRATION', 'Expiration'),
        ('ADJUSTMENT', 'Adjustment'),
    )
    
    # Changed from ForeignKeys to standalone CharFields to isolate the CCPAY app.
    # You can store the user's Email or NIS string directly in these fields.
    sender = models.CharField(
        max_length=255, 
        null=True, 
        blank=True,
        help_text="Identifier (Email/NIS) of the sender. Null for system distributions."
    )
    receiver = models.CharField(
        max_length=255, 
        null=True, 
        blank=True,
        help_text="Identifier (Email/NIS) of the receiver. Null for terminal checkout payments."
    )
    
    # Kept as a localized ForeignKey since MerchantStand belongs strictly inside the CCPAY app ecosystem.
    merchant_stand = models.ForeignKey(
        MerchantStand, 
        on_delete=models.SET_NULL, 
        null=True, 
        blank=True, 
        related_name='transactions'
    )
    
    reference_id = models.CharField(
        max_length=255, 
        null=True, 
        blank=True, 
        unique=True, 
        help_text="Unique client token (idempotency key) to prevent double-deduction"
    )
    amount = models.BigIntegerField()
    type = models.CharField(max_length=20, choices=TYPE_CHOICES)
    timestamp = models.DateTimeField(auto_now_add=True)
    description = models.CharField(max_length=255, blank=True, null=True)

    def __str__(self):
        return f"[{self.type}] {self.amount} ID: {self.id}"