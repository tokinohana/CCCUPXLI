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


class WeeklyDutySchedule(models.Model):
    """
    Per-weekday eligibility for a committee member's daily coupon distribution.
    Keyed by email (not a ForeignKey) to stay consistent with Transaction's
    isolation-from-the-user-app design.

    NOTE: rows are optional. If a committee member has no WeeklyDutySchedule row
    yet (schedule data hasn't arrived), distribute_daily_funds() falls back to
    including them every day — this keeps today's blanket-distribution behavior
    working unchanged until the real schedule spreadsheet is imported.
    """
    user_email = models.CharField(
        max_length=255,
        unique=True,
        help_text="Email of the committee member this schedule applies to"
    )
    senin = models.BooleanField(default=False)
    selasa = models.BooleanField(default=False)
    rabu = models.BooleanField(default=False)
    kamis = models.BooleanField(default=False)
    jumat = models.BooleanField(default=False)
    sabtu = models.BooleanField(default=False)
    minggu = models.BooleanField(default=False)

    # Maps Python's date.weekday() (Mon=0 .. Sun=6) to the field name above
    WEEKDAY_FIELD_MAP = {
        0: 'senin', 1: 'selasa', 2: 'rabu', 3: 'kamis',
        4: 'jumat', 5: 'sabtu', 6: 'minggu',
    }

    def is_scheduled_on(self, date):
        field_name = self.WEEKDAY_FIELD_MAP[date.weekday()]
        return getattr(self, field_name)

    def __str__(self):
        return f"Schedule for {self.user_email}"