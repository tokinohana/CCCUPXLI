The **`User` model** is perfect for authentication, but to handle this ticketing flow without cluttering your system, you shouldn't use the `User` model for the *ticket holders*.

Instead, you should treat **Ticket Holders** as a separate entity. The `User` model handles **who is scanning** (the committee), while a **`Ticket` model** handles **who is entering** (the customers).

Here is how your `users` and `ticketing` apps will collaborate to fulfill this 1-ID-per-ticket requirement:

### 1. The Ticketing Model Logic
You need a model in your `ticketing` app that enforces your constraints (1 ID = 1 Ticket). Notice we don't necessarily need the customer to create a "User Account" to buy a ticket; we just need to record their data.

```python
# ticketing/models.py
import uuid
from django.db import models

class Ticket(models.Model):
    # Unique ID for the QR code (UUID makes it impossible to guess)
    ticket_id = models.UUIDField(default=uuid.uuid4, editable=False, unique=True)
    
    # Customer Data
    full_name = models.CharField(max_length=255)
    email = models.EmailField()
    identification_number = models.CharField(max_length=50, unique=True) # Enforces 1 ID per 1 Ticket
    
    # Status Control
    is_redeemed = models.BooleanField(default=False)
    redeemed_at = models.DateTimeField(null=True, blank=True)
    
    # Track which committee member scanned it
    scanned_by = models.ForeignKey(
        'user.User', 
        on_delete=models.SET_NULL, 
        null=True, 
        blank=True
    )

    def __str__(self):
        return f"{self.full_name} - {self.identification_number}"
```

---

### 2. Handling the Vision: 5 Steps to Implementation

#### Step 1: The Sales Form (24–26)
Since you are using **Zoho Mail**, when the user submits the purchase form, your Django view will:
1. Check if the `identification_number` already exists in the `Ticket` table.
2. If unique, save the record.
3. Trigger a **Celery Task** to generate the QR code and send the email.

#### Step 2: QR Generation & Delivery (Zoho Mail)
You can use the `python-qrcode` library to turn the `ticket_id` (UUID) into a QR image.
```python
# ticketing/utils.py
import qrcode
from django.core.mail import EmailMessage

def send_ticket_email(ticket):
    qr_img = qrcode.make(str(ticket.ticket_id))
    # ... logic to attach image and send via Zoho SMTP ...
    email = EmailMessage(
        'Tiket Closing Event CCCUP XL',
        'Halo! Ini QR Code tiket kamu.',
        'admin@your-zoho-domain.com',
        [ticket.email],
    )
    # Attach the QR code and send
```

#### Step 3: The Custom Scanning Admin (The 27th)
As per your plan, you'll write a custom admin page. This page will be restricted to users where `is_committee=True`.
1. The scanner (phone camera) reads the QR and hits an API: `POST /api/ticketing/validate/<uuid>/`.
2. **Backend Logic:**
   - If `is_redeemed` is True $\rightarrow$ Return **Error: "Ticket already used!"**
   - If `ticket_id` not found $\rightarrow$ Return **Error: "Invalid Ticket!"**
   - If valid $\rightarrow$ Set `is_redeemed = True`, set `scanned_by = request.user`, return **Success**.

#### Step 4: Access Control (The "Staff" Side)
Your `User` model handles the "Guardians." You will log in as the developer or a committee member.
- **You:** Access via Google OAuth/Session.
- **Staff:** Access via traditional login to reach the scanner page.

---

### 3. Does the "Users" model handle this?
**Yes, but as the "Controller," not the "Customer."**

* **Internal Students (Committee):** They use your `User` model to log in to the scanner app. We track their actions via the `scanned_by` field so you know which committee member is at which gate.
* **External Customers:** They **do not** need a `User` account. Creating accounts for thousands of ticket buyers just for one event is a UX nightmare and increases your database overhead. They only exist in the `Ticket` table.



### Summary for your Plan:
1.  **Keep `User` model for staff identity.**
2.  **Create `Ticket` model for customer data and uniqueness.**
3.  **Use UUIDs for QR codes** to stop "evil" students from guessing ticket IDs (e.g., they can't change `id=101` to `id=102`).
4.  **Enforce `unique=True`** on the ID Card field in your database to automate the 1-ticket-per-person rule.
