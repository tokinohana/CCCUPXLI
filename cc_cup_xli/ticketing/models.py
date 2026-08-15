import uuid
from django.db import models


class Buyer(models.Model):
    full_name = models.CharField(max_length=255)
    email = models.EmailField()
    identification_number = models.CharField(max_length=50, unique=True, db_index=True)  # NIK
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.full_name} - {self.identification_number}"


class Ticket(models.Model):
    TICKET_STATUS = (
        ('pending', 'Pending'),
        ('paid', 'Paid'),
        ('voided', 'Voided'),
    )

    # Unique ID for the QR code (UUID makes it impossible to guess)
    ticket_id = models.UUIDField(default=uuid.uuid4, editable=False, unique=True)

    # 1 buyer <-> 1 ticket, enforced at the DB level (matches the NIK
    # uniqueness rule: one person, one ticket)
    buyer = models.OneToOneField(Buyer, on_delete=models.PROTECT, related_name='ticket')

    # Status Control
    status = models.CharField(max_length=10, choices=TICKET_STATUS, default='pending')
    is_redeemed = models.BooleanField(default=False)
    redeemed_at = models.DateTimeField(null=True, blank=True)

    # Multi-gate tracking
    terminal = models.CharField(max_length=50, blank=True, null=True)  # e.g., "GATE-A", "GATE-B"

    # Track which committee member scanned it
    scanned_by = models.ForeignKey(
        'user.User',
        on_delete=models.SET_NULL,
        null=True,
        blank=True
    )

    # Audit trail
    created_at = models.DateTimeField(auto_now_add=True, null=True)
    updated_at = models.DateTimeField(auto_now=True, null=True)

    def __str__(self):
        return f"{self.buyer.full_name} - {self.buyer.identification_number}"