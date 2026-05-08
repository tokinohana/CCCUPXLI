How Django handles the **Password** and the **Traditional vs. JWT** conflict.

### 1. Where is the Password?
The `password` field is **not missing**. 
Because your `User` model inherits from `AbstractUser`, it automatically includes:
- `password` (hashed and salted)
- `last_login`
- `date_joined`
- `first_name` and `last_name`
- `is_active`

Even though you don't see `password` written in the code, Django has it under the hood. It works perfectly with traditional `LoginView` and `authenticate(email=email, password=password)`.

### 2. The Traditional vs. JWT Conflict
You are right to be concerned. By default, Django uses **Sessions** (cookies) for traditional logins. JWT is **Stateless** (headers). 

**The Solution:** You don't have to choose one. You can run them side-by-side.
- **Regis (Traditional):** When the Captain logs in, Django creates a Session cookie.
- **CCPAY (JWT):** When you (the Dev) log in via Google, Django issues a JWT.

### 3. Refined User Model for Both Worlds
To make this work seamlessly for your specific vision, here is the updated `User` model with the fix for `username` (since you're using Email as the primary login) and the logic for the "Traditional" side.

```python
from django.contrib.auth.models import AbstractUser
from django.db import models

class User(AbstractUser):
    # 1. AUTHENTICATION CORE
    # We use email for login. AbstractUser provides the 'password' field automatically.
    email = models.EmailField(unique=True)
    
    # We still need a username field for Django internals, 
    # but we can make it blank or auto-fill it with the email prefix.
    username = models.CharField(max_length=150, unique=True, blank=True, null=True)

    # 2. THE ROLES (Your Vision)
    is_external = models.BooleanField(default=False)  # Team Captains
    is_committee = models.BooleanField(default=False) # Regis Admin / Ticketing Staff

    # 3. METADATA
    phone_number = models.CharField(max_length=15, blank=True, null=True)
    
    USERNAME_FIELD = 'email'  # This tells Django: "Login with email"
    REQUIRED_FIELDS = ['username']

    def save(self, *args, **kwargs):
        # Auto-generate username from email if not provided
        if not self.username:
            self.username = self.email.split('@')[0]
        super().save(*args, **kwargs)

    def __str__(self):
        return self.email
```

---

### How this works in practice:

#### A. Traditional Login (Regis)
In your `regis` app, you use the standard Django `LoginView`. When the Captain enters their email/password:
1. Django checks the `auth_user` table.
2. It validates the password hash.
3. It creates a **Cookie Session**.
4. The user is redirected to `/dashboard`.

#### B. JWT Login (CCPAY)
In your `ccpay` app, your custom Google OAuth view (which we discussed earlier) does this:
1. Verifies your Google ID Token.
2. Checks if `email == "your-dev-email@school.sch.id"`.
3. If yes, it uses `RefreshToken.for_user(user)` to generate a **JWT String**.
4. Your React/Vite frontend saves that string and puts it in the `Authorization: Bearer <token>` header.

### 4. Integration Tip: The `AUTHENTICATION_BACKENDS`
To make sure everything plays nice, check your `settings.py`. Django is smart enough to handle multiple auth types if you tell it where to look.

```python
# settings.py
REST_FRAMEWORK = {
    'DEFAULT_AUTHENTICATION_CLASSES': (
        'rest_framework_simplejwt.authentication.JWTAuthentication', # For CCPAY
        'rest_framework.authentication.SessionAuthentication',        # For Regis/Admin
    ),
}
```



**Summary:**
- The **Captain** logs in traditionally $\rightarrow$ Gets a **Session Cookie**.
- **You** log in to CCPAY via Google $\rightarrow$ Get a **JWT**.
- **Committee** logs in to Admin traditionally $\rightarrow$ Gets a **Session Cookie**.

The `User` model is the anchor for all three. Does the "Username" vs "Email" part of this model make sense for your registration signup?