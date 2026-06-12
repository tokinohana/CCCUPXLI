# Ticketing Module — Implementation Plan

## Architecture Overview

- **`User` model** (user app): Committee members who operate scanners. Authenticated via JWT.
- **`Ticket` model** (ticketing app): Customers/attendees. No user account required.
- **Hybrid Admin**: Django `/admin/` for master ops (export, void, audit). React SPA (`cc-cup-xli-ticketing`) for gate scanning.
- **Payment**: Manual/offline — committee marks tickets as paid after confirming cash payment.
- **Gates**: Multiple physical gates scanning simultaneously. Each scanner is assigned a `terminal` identifier.
- **Auth**: JWT (SimpleJWT) — committee logs in via `/api/ticketing/auth/login/`, receives access + refresh tokens.

---

## 1. Ticket Model

```python
# ticketing/models.py
import uuid
from django.db import models

class Ticket(models.Model):
    TICKET_STATUS = (
        ('pending', 'Pending'),
        ('paid', 'Paid'),
        ('voided', 'Voided'),
    )

    # Unique ID for the QR code (UUID makes it impossible to guess)
    ticket_id = models.UUIDField(default=uuid.uuid4, editable=False, unique=True)

    # Customer Data
    full_name = models.CharField(max_length=255)
    email = models.EmailField()
    identification_number = models.CharField(max_length=50, unique=True)  # Enforces 1 ID per 1 Ticket

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
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.full_name} - {self.identification_number}"
```

### Changes from original plan
- Added `status` field (`pending` / `paid` / `voided`) for manual payment lifecycle.
- Added `terminal` field to track which gate scanned the ticket.
- Added `created_at` / `updated_at` for audit trail.

---

## 2. API Specification

All endpoints prefixed with `/api/ticketing/`.

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| `POST` | `/auth/login/` | None | Committee login → returns JWT access + refresh tokens |
| `POST` | `/auth/refresh/` | None | Refresh expired access token |
| `GET` | `/tickets/` | JWT | List all tickets (with filters: `status`, `is_redeemed`, `terminal`) |
| `POST` | `/tickets/` | JWT | Create a new ticket (sales form) |
| `GET` | `/tickets/<uuid>/` | JWT | Get single ticket detail |
| `PATCH` | `/tickets/<uuid>/` | JWT | Update ticket (e.g., mark as paid, void) |
| `GET` | `/tickets/verify-nik/?nik=<value>` | JWT | Check if NIK already exists |
| `POST` | `/tickets/<uuid>/redeem/` | JWT | Redeem ticket at gate (scanner) |
| `GET` | `/tickets/export/` | JWT | Export tickets as CSV |

### Redeem endpoint logic (`POST /tickets/<uuid>/redeem/`)
1. Verify JWT → confirm user is committee (`is_committee=True`).
2. Accept `terminal` in request body (e.g., `"GATE-A"`).
3. Use `select_for_update()` to prevent race conditions across gates.
4. Validate:
   - `status` must be `paid` (don't let unpaid tickets in).
   - `is_redeemed` must be `False` → else return `ALREADY_REDEEMED`.
5. Set `is_redeemed=True`, `redeemed_at=now()`, `scanned_by=request.user`, `terminal=<gate>`.
6. Return success with ticket details.

### Concurrency handling
Multiple gates scanning simultaneously means the `is_redeemed` check is a race condition.
Solution: wrap the redeem logic in `transaction.atomic()` + `select_for_update()`:

```python
from django.db import transaction

def redeem_ticket(ticket_uuid, user, terminal):
    with transaction.atomic():
        ticket = Ticket.objects.select_for_update().get(ticket_id=ticket_uuid)
        if ticket.status != 'paid':
            raise ValidationError("Ticket has not been paid.")
        if ticket.is_redeemed:
            raise ValidationError("Ticket already redeemed.")
        ticket.is_redeemed = True
        ticket.redeemed_at = timezone.now()
        ticket.scanned_by = user
        ticket.terminal = terminal
        ticket.save()
    return ticket
```

---

## 3. Authentication (Scanner SPA)

The React scanner is a separate SPA, so we use **JWT token auth** (SimpleJWT, already installed).

### Flow
1. Committee member opens scanner app → login page.
2. POST credentials to `/api/ticketing/auth/login/` (wraps SimpleJWT's `TokenObtainPairView`).
3. Store access token in memory, refresh token in httpOnly cookie or memory.
4. All scanner API calls send `Authorization: Bearer <access_token>`.
5. Backend validates JWT + checks `is_committee=True` on the user.

### Custom permission class
```python
# ticketing/permissions.py
from rest_framework.permissions import BasePermission

class IsCommittee(BasePermission):
    def has_permission(self, request, view):
        return (
            request.user
            and request.user.is_authenticated
            and request.user.is_committee
        )
```

### CORS
Already configured in `settings.py` for `localhost:5173` and `localhost:3000`. Add production origins before deploy.

---

## 4. QR Generation & Email Delivery

### QR Code
Use `python-qrcode` to encode the `ticket_id` UUID as a QR image.
The QR payload is just the UUID string — the scanner app reads it and calls the redeem API.

### Celery Task
Celery is already configured in `settings.py` (Redis broker on `localhost:6379`).

```python
# ticketing/tasks.py
from celery import shared_task
import qrcode
import io
from django.core.mail import EmailMessage
from .models import Ticket

@shared_task(bind=True, max_retries=3, default_retry_delay=60)
def send_ticket_qr_email(self, ticket_id):
    try:
        ticket = Ticket.objects.get(pk=ticket_id)
        # Generate QR code in memory
        qr = qrcode.make(str(ticket.ticket_id))
        buffer = io.BytesIO()
        qr.save(buffer, format='PNG')
        buffer.seek(0)

        email = EmailMessage(
            subject='Tiket Closing Event CCCUP XLI',
            body=f'Halo {ticket.full_name}! Ini QR Code tiket kamu.',
            from_email='noreply@cccupxli.com',
            to=[ticket.email],
        )
        email.attach(f'ticket_{ticket.ticket_id}.png', buffer.read(), 'image/png')
        email.send()
    except Ticket.DoesNotExist:
        pass  # Don't retry if ticket is gone
    except Exception as exc:
        raise self.retry(exc=exc)
```

### Email Backend
Configure SMTP for Zoho (or any provider) in `settings.py`:
```python
EMAIL_BACKEND = 'django.core.mail.backends.smtp.EmailBackend'
EMAIL_HOST = 'smtp.zoho.com'
EMAIL_PORT = 465
EMAIL_USE_SSL = True
EMAIL_HOST_USER = os.getenv('ZOHO_EMAIL')
EMAIL_HOST_PASSWORD = os.getenv('ZOHO_PASSWORD')
```

### Trigger
After creating a ticket with `status='paid'`, dispatch the Celery task:
```python
send_ticket_qr_email.delay(ticket.pk)
```

---

## 5. Ticket Sales Flow

Since payment is **manual/offline**, the flow is:

1. Committee member opens the React app → `TicketForm` page.
2. Fills in customer data (name, email, NIK).
3. Backend checks NIK uniqueness (`GET /tickets/verify-nik/?nik=<value>`).
4. If unique → create ticket with `status='pending'`.
5. Committee collects cash payment from customer.
6. Committee marks ticket as `paid` via `PATCH /tickets/<uuid>/` with `{"status": "paid"}`.
7. On status change to `paid` → trigger `send_ticket_qr_email` Celery task.

### Voiding tickets
Django admin or `PATCH /tickets/<uuid>/` with `{"status": "voided"}`.
Voided tickets cannot be redeemed at the gate.

---

## 6. Gate Scanning (Event Day)

### Scanner app flow
1. Committee member opens scanner → login with credentials → get JWT.
2. Camera reads QR → extracts UUID → calls `POST /tickets/<uuid>/redeem/` with `{"terminal": "GATE-A"}`.
3. Backend returns one of:
   - **200 Success**: Ticket details + green flash on screen.
   - **409 Conflict**: `ALREADY_REDEEMED` — ticket was already scanned (show red + error).
   - **404 Not Found**: `INVALID_TICKET` — UUID not in database.
   - **403 Forbidden**: `UNPAID_TICKET` — ticket status is not `paid`.

### Offline fallback
If the scanner loses connectivity:
- Show a "Network Error" overlay.
- Queue failed scans in `localStorage` with timestamps.
- Auto-retry queued scans when connectivity is restored.
- Scanner UI shows pending queue count.

---

## 7. Frontend-Backend Type Alignment

The frontend `Ticket` type must match the backend serializer output:

```typescript
// types/index.ts
export interface Ticket {
  ticket_id: string;           // UUID
  full_name: string;
  email: string;
  identification_number: string;  // NIK
  status: 'pending' | 'paid' | 'voided';
  is_redeemed: boolean;
  redeemed_at: string | null;
  scanned_by: string | null;      // User email
  terminal: string | null;        // Gate identifier
  created_at: string;
  updated_at: string;
}

export interface ScannerResult {
  success: boolean;
  ticket?: Ticket;
  error?: 'ALREADY_REDEEMED' | 'INVALID_TICKET' | 'UNPAID_TICKET' | 'NETWORK_ERROR';
}
```

### Key alignment changes
- `id` → `ticket_id` (UUID from backend)
- `nik` → `identification_number`
- `fullName` → `full_name` (snake_case from DRF serializer)
- Added `status: 'pending' | 'paid' | 'voided'`
- Added `UNPAID_TICKET` error type
- All fields use snake_case to match DRF's default serialization

---

## 8. Django Admin (Master Admin)

```python
# ticketing/admin.py
@admin.register(Ticket)
class TicketAdmin(AppGroupPermissionMixin, admin.ModelAdmin):
    allowed_group = 'Ticketing Committee'
    list_display = ('full_name', 'identification_number', 'status', 'is_redeemed', 'terminal', 'scanned_by', 'created_at')
    list_filter = ('status', 'is_redeemed', 'terminal')
    search_fields = ('full_name', 'identification_number', 'email')
    readonly_fields = ('ticket_id', 'created_at', 'updated_at')
    actions = ['export_csv', 'mark_voided']
```

---

## 9. Celery Setup Checklist

Celery config already exists in `settings.py`. Remaining tasks:
1. Add `python-qrcode` and `Pillow` to `requirements.txt`.
2. Create `ticketing/tasks.py` with the email task.
3. Add `ticketing` tasks to `CELERY_BEAT_SCHEDULE` if periodic jobs are needed.
4. Ensure Redis is running (`redis-server` or Docker).
5. Start worker: `celery -A cc_cup_XLI worker -l info`.
6. Configure Zoho SMTP env vars (`ZOHO_EMAIL`, `ZOHO_PASSWORD`).

---

## 10. Implementation Order

| Task | Description | Dependencies |
|------|-------------|-------------|
| 1 | Update `Ticket` model (add `status`, `terminal`, `created_at`, `updated_at`) | None |
| 2 | Run migration | Task 1 |
| 3 | Create `ticketing/serializers.py` (TicketSerializer, CreateTicketSerializer) | Task 1 |
| 4 | Create `ticketing/permissions.py` (IsCommittee) | None |
| 5 | Create `ticketing/views.py` (all API views from Section 2) | Tasks 3, 4 |
| 6 | Create `ticketing/urls.py` + register in root `urls.py` | Task 5 |
| 7 | Create `ticketing/tasks.py` (Celery QR email task) | Task 1 |
| 8 | Add email SMTP config to `settings.py` + env vars | None |
| 9 | Update `ticketing/admin.py` (add new fields, CSV export action) | Task 1 |
| 10 | Update frontend types to match backend (Section 7) | Task 5 |
| 11 | Wire frontend API service to real endpoints | Task 10 |
| 12 | Add `python-qrcode` + `Pillow` to `requirements.txt` | None |
