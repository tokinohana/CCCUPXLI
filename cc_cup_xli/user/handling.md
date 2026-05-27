**"tiered security"** model: High-security Google OAuth for the money, standard Django Admin for the data-heavy registration, and custom lightweight tools for the gate.

Here is how you can implement this "Simple & Secure" design without the code getting messy:

### 1. CCPAY: The "Solo Developer" Admin
Since you are the only one who needs to access the CCPAY backend, you don't need a complex permission system. You can use a **Hardcoded Superuser Check** in your `ccpay` views.

**In `ccpay/views.py`:**
```python
from django.core.exceptions import PermissionDenied

def ccpay_admin_only(view_func):
    def _wrapped_view(request, *args, **kwargs):
        # 1. Must be logged in via Google
        # 2. Must be YOUR specific school email
        if request.user.is_authenticated and request.user.email == "your-email@school.sch.id":
            return view_func(request, *args, **kwargs)
        raise PermissionDenied("Hayo, mau ngapain? Ini area khusus.")
    return _wrapped_view
```
This is the ultimate "Anti-Troll" defense. Even if another committee member logs in with their school email, they are physically blocked from the CCPAY routes.

### 2. Registration: Leveraging Django Admin
Since registration is your priority, you can let the committee do the heavy lifting of verifying data inside the standard Django Admin.

* **For You:** Use `/admin` to manage everything.
* **For the Committee:** Give them `is_staff` access, but use **Django Groups** to limit them to *only* seeing the `Regis` app models. They shouldn't be able to see the `User` table or the `CCPAY` ledger.
* **The "Shitty Student" Guard:** Registrants never see the admin. They stay on the custom `/dashboard` route defined in your `REGIS_ROUTES.md`.



### 3. Ticketing: The "High-Trust" Custom Panel
Since you trust your internal committee for ticketing, you can avoid the complexity of Django Admin for them. Build a single, mobile-responsive page in the `ticketing` app.

* **Login:** Traditional school email/password.
* **The UI:** A simple search bar (to find names) and a "Scan" button that opens the camera.
* **Speed:** Because it’s custom, it will load much faster on crappy school Wi-Fi than the full Django Admin would.

---

### 4. Unified Admin Strategy (The "Oracle" & "Tools" Model)

To keep the project manageable as it grows, we will follow a **Unified Backend but Split UI** strategy.

#### A. The "Oracle" (Master Django Admin)
We will use a single standard Django Admin panel (`/admin/`) as the single source of truth for all data management.
- **Permissions**: We use **Django Groups** to separate concerns:
    - **Group: `Regis_Staff`**: Can view/edit competition teams and participants.
    - **Group: `CCPAY_Heads`**: Can view/edit shifts and transaction history for their divisions.
    - **Group: `Ticketing_Admin`**: Can view ticket redemption status and run manual overrides.
- **SuperAdmins**: Only you (the developer) have access to the full database, including the `User` table and raw CCPAY balances.

#### B. The "Tools" (Specialized Operator Interfaces)
For tasks that require speed or special hardware (like scanning), we build lightweight custom interfaces that hit our API:
- **Ticketing Scanner**: A custom, mobile-optimized page for fast camera scanning at the gate.
- **Merchant Dashboard**: A token-based "Scan & Pay" interface for canteen stands.

| Tool | Audience | Goal |
| :--- | :--- | :--- |
| **Django Admin** | You / Managers | Data cleanup, manual overrides, CSV imports. |
| **Scanner Page** | Gate Staff | High-speed entry validation (1-2 seconds per person). |
| **Merchant App** | Food Stands | Quick balance deduction via QR scan. |

---

### Final "Anti-Evil" Tip:
1.  **Audit Logs:** Even if you trust the committee, use a simple library like `django-simple-history`. If a "trusted" committee member accidentally deletes a team's registration, you can see exactly who did it and revert the change in one click.
2.  **Session Security:** Set `SESSION_COOKIE_SECURE = True` and `SESSION_EXPIRE_AT_BROWSER_CLOSE = True` to prevent stale sessions on shared devices.

This setup gives you the **Master Control** of a unified system while giving your staff **simple, focused tools** for their specific jobs.