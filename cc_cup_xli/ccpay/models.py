from django.db import models
from datetime import date

EVENT_DAY_MAP = {
    date(2026, 9, 19): 1,
    date(2026, 9, 20): 2,
    date(2026, 9, 21): 3,
    date(2026, 9, 22): 4,
    date(2026, 9, 23): 5,
    date(2026, 9, 24): 6,
    date(2026, 9, 25): 7,
    date(2026, 9, 26): 8,
}

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
    Per-event-day eligibility for a committee member's daily coupon distribution.
    Keyed by email (not a ForeignKey) to stay consistent with Transaction's
    isolation-from-the-user-app design.

    NOTE: rows are optional. If a committee member has no WeeklyDutySchedule row
    yet (schedule data hasn't arrived), distribute_daily_funds() falls back to
    including them every day — this keeps today's blanket-distribution behavior
    working unchanged until the real schedule spreadsheet is imported.

    H1..H8 = "Hari 1".."Hari 8" of the event (8 specific calendar dates), not
    weekdays. is_scheduled_on() needs a way to turn an actual date into an
    event-day number (1-8).
    """
    user_email = models.CharField(
        max_length=255,
        unique=True,
        help_text="Email of the committee member this schedule applies to"
    )
    h1 = models.BooleanField(default=False)
    h2 = models.BooleanField(default=False)
    h3 = models.BooleanField(default=False)
    h4 = models.BooleanField(default=False)
    h5 = models.BooleanField(default=False)
    h6 = models.BooleanField(default=False)
    h7 = models.BooleanField(default=False)
    h8 = models.BooleanField(default=False)

    # Maps event-day number (1-8) to the field name above
    DAY_FIELD_MAP = {
        1: 'h1', 2: 'h2', 3: 'h3', 4: 'h4',
        5: 'h5', 6: 'h6', 7: 'h7', 8: 'h8',
    }

    def is_scheduled_on(self, target_date):
        day_number = EVENT_DAY_MAP.get(target_date)
        if day_number is None:
            # Date falls outside the known event days — treat as not scheduled.
            return False
        field_name = self.DAY_FIELD_MAP[day_number]
        return getattr(self, field_name)

    def __str__(self):
        return f"Schedule for {self.user_email}"