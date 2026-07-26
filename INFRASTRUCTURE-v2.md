# CC CUP XLI — Production Infrastructure Setup (v2)

> **Scope change from v1:** Frontends move to Vercel (one project each, own subdomain). The droplet is reduced to Django/Gunicorn only — serving `api.cccup.id` and `admin.cccup.id` directly over HTTPS, no nginx, no Caddy, no reverse proxy of any kind. This is a deliberate choice: the project has a ≤3-month lifespan, so certificate auto-renewal and reverse-proxy hardening aren't worth the operational surface. See rationale notes inline.

## Architecture Overview

```
                    ┌───────────────────────────────────────────┐
                    │              DNS (cccup.id)                │
                    │                                             │
                    │  cccup.id         → A     → Vercel          │
                    │  regis.cccup.id   → CNAME → Vercel           │
                    │  pay.cccup.id     → CNAME → Vercel           │
                    │  tix.cccup.id     → CNAME → Vercel           │
                    │  api.cccup.id     → A     → Droplet          │
                    │  admin.cccup.id   → A     → Droplet          │
                    └───────────────────┬────────────┬────────────┘
                                         │            │
                     ┌───────────────────▼──┐   ┌─────▼──────────────────────┐
                     │        Vercel          │   │   DigitalOcean Droplet     │
                     │                        │   │                            │
                     │  cccup.id   → homepage │   │  Gunicorn binds 0.0.0.0:443│
                     │  regis.*    → regis    │   │  directly (no proxy)       │
                     │  pay.*      → ccpay    │   │  TLS cert covers both      │
                     │  tix.*      → ticketing│   │  api.cccup.id + admin.*    │
                     │  4 separate projects   │   └─────────────┬──────────────┘
                     │  auto-deploy on push   │                 │
                     └───────────┬────────────┘   ┌─────────────▼──────────────┐
                                 │                 │  Neon PostgreSQL (external) │
                                 │  CORS + shared  │  Cloudinary (media)         │
                                 └────cookie domain│  Groq API (AI chat)         │
                                    (.cccup.id)    │  Zoho SMTP (email)          │
                                                    └─────────────────────────────┘
```

**Why no reverse proxy on the droplet?**
Gunicorn can terminate TLS itself via `--certfile`/`--keyfile` and bind directly to 443. The only thing nginx/Caddy would add here is (a) automated cert renewal — moot on a ≤3-month project that may only ever need one cert — and (b) request hardening (slowloris protection, buffering) sized for public internet-scale abuse, which doesn't match an internal committee/merchant coupon tool. Skipping it removes an entire service, config file, and failure surface. The tradeoff: no HTTP→HTTPS redirect (irrelevant — frontends only ever call `https://`), and cert renewal near the 90-day mark is a manual command, not automatic. See Task 5.

**Why does CCPay's risk profile matter here?**
CCPay is an internal fictional coupon/balance system, not a real payment processor — coupons give balance to committee members, who transact with merchants, who liquidate accumulated balance in cash at day's end. That's why this doc doesn't chase payment-industry-grade infra hardening; it optimizes for "boring and won't break" over "defensible against attackers."

---

## Task 1: Provision the DigitalOcean Droplet

### 1.1 Create the Droplet
- **Region:** Singapore (SGP1) — closest to Indonesia
- **Size:** Basic plan, 2GB RAM / 1 vCPU ($12/mo) — this is now API + admin only, no static file serving, so this is comfortably sufficient
- **OS:** Ubuntu 24.04 LTS
- **Auth:** SSH key

### 1.2 Initial Server Setup

```bash
ssh root@<DROPLET_IP>

# Create a deploy user
adduser deploy
usermod -aG sudo deploy
mkdir -p /home/deploy/.ssh
cp ~/.ssh/authorized_keys /home/deploy/.ssh/
chown -R deploy:deploy /home/deploy/.ssh

# Update system
apt update && apt upgrade -y

# Install essential packages — note: no nginx package here
apt install -y python3.12 python3.12-venv python3-pip \
  certbot postgresql-client ufw git
```

### 1.3 Firewall

No web server listening on 80/443 via nginx anymore — Gunicorn itself will bind those ports. Port 80 is only opened temporarily for certificate issuance (Task 5), then can stay closed.

```bash
ufw allow OpenSSH
ufw allow 443/tcp
ufw allow 80/tcp   # temporary — only needed during cert issuance/renewal
ufw enable
```

---

## Task 2: DNS Configuration

You'll split records between Vercel (frontends) and the droplet (API/admin).

| Type | Name | Value | Notes |
|------|------|-------|-------|
| A | `@` | Vercel apex IP (shown in Vercel dashboard, typically `76.76.21.21`) | Homepage |
| CNAME | `regis` | `cname.vercel-dns.com` | Regis frontend |
| CNAME | `pay` | `cname.vercel-dns.com` | CCPay frontend |
| CNAME | `tix` | `cname.vercel-dns.com` | Ticketing frontend |
| A | `api` | `<DROPLET_IP>` | Django API |
| A | `admin` | `<DROPLET_IP>` | Django admin |

> Vercel shows the exact current apex IP / CNAME target in each project's **Settings → Domains** screen once you add the domain — use whatever it displays rather than assuming the value above, Vercel occasionally changes the specific IP.

---

## Task 3: Set Up the 4 Vercel Projects

Repos are already split (one repo per frontend), so this is dashboard/CLI work, no code restructuring.

For **each** of the 4 repos (`cc-cup-xli-homepage`, `cc-cup-xli-regis`, `cc-cup-xli-ccpay`, `cc-cup-xli-ticketing`):

### 3.1 Import the project
1. Vercel dashboard → **Add New → Project** → import the GitHub repo.
2. Framework preset: **Vite**.
3. Root directory: repo root (each repo is now standalone, not a subfolder of a monorepo).
4. Leave build command as `npm run build`, output directory `dist` (Vercel autodetects this for Vite).

### 3.2 Add the custom domain
In **Project Settings → Domains**, add:
- Homepage project → `cccup.id` (and consider `www.cccup.id` redirecting to it, optional)
- Regis project → `regis.cccup.id`
- CCPay project → `pay.cccup.id`
- Ticketing project → `tix.cccup.id`

### 3.3 Set the API base URL as an environment variable
In **Project Settings → Environment Variables** (Production environment) for each project:

| Project | Variable | Value |
|---|---|---|
| regis | `VITE_API_BASE_URL` | `https://api.cccup.id/api/regis` |
| ccpay | `VITE_API_BASE_URL` | `https://api.cccup.id` |
| ticketing | `VITE_API_BASE_URL` | `https://api.cccup.id/api/ticketing` |
| homepage | *(none needed unless homepage calls the API)* | |

This replaces the old `VITE_API_BASE_URL=... npm run build` CLI-flag approach from v1 — Vercel builds happen in Vercel's environment, not on the droplet, so the variable has to live in Vercel's project settings instead.

### 3.4 Revert the Vite `base` path — important correction from v1
In v1, each frontend's `vite.config` set a `base` path (e.g. `base: '/regis/'`) because it was served from a subpath (`cccup.id/regis/`) on shared nginx. **That no longer applies.** Each frontend now lives at the root of its own subdomain, so `base` must be the default (`/`) or omitted entirely:

**cc-cup-xli-homepage/vite.config**, **cc-cup-xli-regis/vite.config**, **cc-cup-xli-ccpay/vite.config.js**, **cc-cup-xli-ticketing/vite.config.ts** — remove any `base: '/xxx/'` line, or explicitly set `base: '/'`.

If this isn't reverted, asset URLs will 404 on Vercel (they'll be requested from `/regis/assets/...` on a domain that has nothing at `/regis/`).

### 3.5 Auto-deploy
Once connected, every push to the production branch triggers an automatic build + deploy per project. No manual `npm run build` / `scp` step remains — this whole category of work from the v1 deploy script goes away.

---

## Task 4: Django Backend Setup (unchanged from v1, with additions below)

### 4.1 Clone & venv

```bash
su - deploy
mkdir -p /home/deploy/apps
cd /home/deploy/apps
git clone <YOUR_REPO_URL> cccupxli

cd cccupxli/cc_cup_xli
python3.12 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
pip install gunicorn whitenoise
```

**`whitenoise` is a new addition, and it's required.** In v1, nginx served `/static/` (Django admin's CSS/JS) via an `alias`. With no reverse proxy, Gunicorn/Django has to serve those files itself — WhiteNoise is the standard way to do that efficiently from within the Django process, otherwise the admin panel at `admin.cccup.id` will load with broken styling.

### 4.2 Production Environment Variables

Same `.env` as v1 (Neon, Cloudinary, Google OAuth, Google Vision, Groq, Zoho — unchanged), but update:

```bash
ALLOWED_HOSTS=api.cccup.id,admin.cccup.id
```

Drop `cccup.id` from `ALLOWED_HOSTS` — Gunicorn never receives requests with that Host header anymore; only `api.cccup.id` and `admin.cccup.id` hit the droplet.

### 4.3 `settings.py` changes

```python
ALLOWED_HOSTS = os.getenv('ALLOWED_HOSTS', 'localhost').split(',')

# ── CORS: the 4 Vercel-hosted frontends ──
CORS_ALLOWED_ORIGINS = [
    "https://cccup.id",
    "https://regis.cccup.id",
    "https://pay.cccup.id",
    "https://tix.cccup.id",
    # Development
    "http://localhost:3000",
    "http://localhost:5173",
    "http://127.0.0.1:3000",
    "http://127.0.0.1:5173",
]

# ── CSRF: cross-subdomain POSTs (registration forms, CCPay transactions) need this ──
CSRF_TRUSTED_ORIGINS = [
    "https://cccup.id",
    "https://regis.cccup.id",
    "https://pay.cccup.id",
    "https://tix.cccup.id",
]

# ── Shared cookie domain: lets a session set on api.cccup.id be readable ──
# across regis/pay/tix subdomains (relevant for CCPay's Google OAuth flow) ──
SESSION_COOKIE_DOMAIN = ".cccup.id"
CSRF_COOKIE_DOMAIN = ".cccup.id"

if not DEBUG:
    SECURE_SSL_REDIRECT = True
    SESSION_COOKIE_SECURE = True
    CSRF_COOKIE_SECURE = True
    SECURE_HSTS_SECONDS = 31536000
    SECURE_HSTS_INCLUDE_SUBDOMAINS = True

STATIC_ROOT = BASE_DIR / 'staticfiles'

# ── WhiteNoise: serves STATIC_ROOT directly from Gunicorn, no nginx alias needed ──
MIDDLEWARE = [
    'django.middleware.security.SecurityMiddleware',
    'whitenoise.middleware.WhiteNoiseMiddleware',  # add immediately after SecurityMiddleware
    # ...rest of existing middleware unchanged
]
STATICFILES_STORAGE = 'whitenoise.storage.CompressedManifestStaticFilesStorage'
```

### 4.4 Migrate & collect static

```bash
cd /home/deploy/apps/cccupxli/cc_cup_xli
source .venv/bin/activate
python manage.py migrate
python manage.py collectstatic --no-input
```

---

## Task 5: TLS Certificate + Direct Gunicorn Bind (replaces v1's nginx + certbot-nginx Task 3 & 6)

### 5.1 Issue the certificate once, standalone (no web server running yet)

```bash
sudo certbot certonly --standalone -d api.cccup.id -d admin.cccup.id
```

`--standalone` spins up a temporary bare-bones server on port 80 just to prove domain ownership, then exits. This is a single multi-SAN cert covering both hostnames — one cert file pair, no per-subdomain certs needed. Certs land in `/etc/letsencrypt/live/api.cccup.id/fullchain.pem` and `privkey.pem`.

> **Renewal note (given the ≤3 month lifespan):** this cert is valid 90 days. If the project runs its full course, you likely never renew. If it does approach the 90-day mark, renewal is manual — not automated:
> ```bash
> sudo systemctl stop gunicorn   # frees port 80/443 briefly
> sudo certbot renew
> sudo systemctl start gunicorn
> ```
> A few seconds of downtime, once, if it's ever needed. No cron job, no auto-reload machinery.

### 5.2 Let Gunicorn bind port 443 without running as root

```bash
sudo setcap 'cap_net_bind_service=+ep' $(readlink -f $(which gunicorn))
```

Run once. This grants just the "bind to a privileged port" capability to the Gunicorn binary itself, so the `gunicorn` systemd service can run as the unprivileged `deploy` user rather than root.

> **Caveat:** `setcap` is applied to the binary at this exact venv path. If you ever recreate the virtualenv (`rm -rf .venv && python3.12 -m venv .venv` again), re-run this command — the new gunicorn binary won't have the capability until you do.

### 5.3 Gunicorn systemd service

Create `/etc/systemd/system/gunicorn.service`:

```ini
[Unit]
Description=Gunicorn for CC CUP XLI (direct TLS bind, no reverse proxy)
After=network.target

[Service]
User=deploy
Group=deploy
WorkingDirectory=/home/deploy/apps/cccupxli/cc_cup_xli
Environment="PATH=/home/deploy/apps/cccupxli/cc_cup_xli/.venv/bin"
ExecStart=/home/deploy/apps/cccupxli/cc_cup_xli/.venv/bin/gunicorn \
    --workers 3 \
    --bind 0.0.0.0:443 \
    --certfile=/etc/letsencrypt/live/api.cccup.id/fullchain.pem \
    --keyfile=/etc/letsencrypt/live/api.cccup.id/privkey.pem \
    --limit-request-line 8190 \
    --timeout 120 \
    --access-logfile /home/deploy/apps/cccupxli/gunicorn-access.log \
    --error-logfile /home/deploy/apps/cccupxli/gunicorn-error.log \
    cc_cup_XLI.wsgi:application
Restart=always
RestartSec=3

[Install]
WantedBy=multi-user.target
```

Both `api.cccup.id` and `admin.cccup.id` point to the same droplet IP and hit this same Gunicorn process — Django's own URL routing (not host-based routing) is what separates `/api/...` from `/admin/...`, exactly as it did in v1's Django app itself (nginx in v1 only proxied both hostnames to the same Gunicorn — it never did host-based routing either).

```bash
sudo systemctl daemon-reload
sudo systemctl enable --now gunicorn
```

### 5.4 Close port 80 once the cert is issued (optional hardening)

```bash
sudo ufw delete allow 80/tcp
```

Reopen it only when you next need `certbot renew --standalone`.

---

## Task 6: Deploy Script (backend only now)

Create `/home/deploy/apps/cccupxli/deploy.sh`:

```bash
#!/bin/bash
set -e

APP_DIR="/home/deploy/apps/cccupxli"

echo "=== Pulling latest code ==="
cd $APP_DIR
git pull origin main

echo "=== Installing dependencies ==="
cd $APP_DIR/cc_cup_xli
source .venv/bin/activate
pip install -r requirements.txt

echo "=== Running migrations ==="
python manage.py migrate --no-input

echo "=== Collecting static files ==="
python manage.py collectstatic --no-input

echo "=== Restarting Gunicorn ==="
sudo systemctl restart gunicorn

echo "=== Deploy complete! ==="
```

```bash
chmod +x /home/deploy/apps/cccupxli/deploy.sh
```

No frontend steps here at all — those 4 projects redeploy themselves on `git push`, independently of this script and this droplet.

---

## Task 7: Post-Deploy Checklist

- [ ] `sudo certbot certonly --standalone -d api.cccup.id -d admin.cccup.id` succeeded, cert files exist
- [ ] `systemctl status gunicorn` shows active/running, listening on 443
- [ ] Visit `https://cccup.id` — homepage loads (Vercel)
- [ ] Visit `https://regis.cccup.id` — registration loads (Vercel)
- [ ] Visit `https://pay.cccup.id` — CCPay loads (Vercel)
- [ ] Visit `https://tix.cccup.id` — ticketing loads (Vercel)
- [ ] Visit `https://api.cccup.id/api/regis/` — API responds, no CORS console errors from any of the 3 frontends
- [ ] Visit `https://admin.cccup.id/admin/` — Django admin loads **with styling** (confirms WhiteNoise is serving static files correctly)
- [ ] Test registration flow end-to-end (regis.cccup.id → api.cccup.id)
- [ ] Test CCPay Google OAuth — confirm redirect URI in Google Cloud Console is `https://api.cccup.id/api/ccpay/auth/google/callback/`, and add `https://pay.cccup.id` as an authorized JavaScript origin
- [ ] Confirm session/CSRF cookies persist correctly across `pay.cccup.id` ↔ `api.cccup.id` (this is what `SESSION_COOKIE_DOMAIN = ".cccup.id"` is for)
- [ ] `sudo ufw status` — only 22 and 443 open (80 closed unless mid-renewal)
- [ ] Rotate any secrets exposed in `.env` that made it into git history

---

## Quick Reference

| URL | Purpose | Hosted on |
|-----|---------|-----------|
| `https://cccup.id` | Homepage | Vercel |
| `https://regis.cccup.id` | Registration | Vercel |
| `https://pay.cccup.id` | CCPay | Vercel |
| `https://tix.cccup.id` | Ticketing | Vercel |
| `https://api.cccup.id/api/*` | Django REST API | Droplet (Gunicorn, direct TLS) |
| `https://admin.cccup.id/admin/` | Django admin | Droplet (Gunicorn, direct TLS) |

| Service | Port | Managed by |
|---------|------|-----------|
| Gunicorn | 443 (public), direct TLS bind | systemd (`gunicorn`) |
| PostgreSQL | External (Neon) | Neon dashboard |
| Frontend builds/hosting | — | Vercel (4 projects, auto-deploy) |

---

## Troubleshooting

```bash
# Check Gunicorn status
sudo systemctl status gunicorn

# View logs
tail -f /home/deploy/apps/cccupxli/gunicorn-access.log
tail -f /home/deploy/apps/cccupxli/gunicorn-error.log

# Confirm cert is valid and check expiry
sudo certbot certificates

# Restart
sudo systemctl restart gunicorn

# CORS errors in browser console
#   → check CORS_ALLOWED_ORIGINS in settings.py matches the exact frontend origin
#   → check the request isn't missing credentials mode if cookies are involved

# Admin panel loads unstyled
#   → whitenoise isn't installed/configured, or collectstatic wasn't run after deploy
```