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

### Revised User App Architecture
To make this work, your `User` model just needs two simple types:

| User Role | Auth Method | Destination |
| :--- | :--- | :--- |
| **You (Dev)** | Google OAuth | CCPAY Admin + Django Admin |
| **Committee** | Traditional/Google | Regis Admin (Django Admin) + Ticketing |
| **Student** | Traditional | Registration Dashboard (`/dashboard`) |

### Final "Anti-Evil" Tip:
Since you're worried about students messing with the bot and the forms:
1.  **Session Hijacking:** In `settings.py`, set `SESSION_COOKIE_SECURE = True` (once you have HTTPS) and `SESSION_EXPIRE_AT_BROWSER_CLOSE = True`. 
2.  **Audit Logs:** Even if you trust the committee, use a simple library like `django-simple-history`. If a "trusted" committee member accidentally deletes a team's registration, you can see exactly who did it and revert the change in one click.

This setup is perfect because it uses **Django's strengths** (Admin for Registration) while keeping **High-Risk areas** (CCPAY) locked down to just you.