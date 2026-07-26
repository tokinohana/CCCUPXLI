# CC CUP XLI — Production Infrastructure Setup

## Architecture Overview

```
                         ┌─────────────────────────────────┐
                         │        DNS (cccup.id)           │
                         │                                 │
                         │  cccup.id          → A (Droplet)│
                         │  api.cccup.id      → A (Droplet)│
                         │  admin.cccup.id    → A (Droplet)│
                         └────────────┬────────────────────┘
                                      │
                         ┌────────────▼────────────────────┐
                         │     DigitalOcean Droplet         │
                         │          (nginx)                 │
                         │                                 │
                         │  cccup.id/        → static files│
                         │  cccup.id/regis/  → static files│
                         │  cccup.id/ccpay/  → static files│
                         │  cccup.id/ticketing/ → static files│
                         │  api.cccup.id/*   → Gunicorn    │
                         │  admin.cccup.id/* → Gunicorn    │
                         └────────────┬────────────────────┘
                                      │
                         ┌────────────▼────────────────────┐
                         │   Gunicorn :8000 (Django)        │
                         └─────────────────────────────────┘
                                      │
                         ┌────────────▼────────────────────┐
                         │  Neon PostgreSQL (external)      │
                         │  Cloudinary (media storage)      │
                         │  Groq API (AI chat)              │
                         │  Zoho SMTP (email)               │
                         └─────────────────────────────────┘
```

**Why self-host everything on the droplet?**
Since you want a unified domain (`cccup.id`) with path-based routing, hosting all frontends as static builds on the droplet behind nginx is the simplest approach. Vercel doesn't support routing multiple projects under different paths of the same domain. This way you get full control with a single server.

---

## Task 1: Provision the DigitalOcean Droplet

### 1.1 Create the Droplet
- **Region:** Singapore (SGP1) — closest to your audience (Indonesia)
- **Size:** Basic plan, 2GB RAM / 1 vCPU ($12/mo) — sufficient for this workload
- **OS:** Ubuntu 24.04 LTS
- **Auth:** SSH key (add your public key during creation)

### 1.2 Initial Server Setup

```bash
# SSH into the droplet (replace with your droplet IP)
ssh root@<DROPLET_IP>

# Create a deploy user
adduser deploy
usermod -aG sudo deploy
mkdir -p /home/deploy/.ssh
cp ~/.ssh/authorized_keys /home/deploy/.ssh/
chown -R deploy:deploy /home/deploy/.ssh

# Update system
apt update && apt upgrade -y

# Install essential packages
apt install -y nginx python3.12 python3.12-venv python3-pip \
  certbot python3-certbot-nginx postgresql-client ufw git

# Configure firewall
ufw allow OpenSSH
ufw allow 'Nginx Full'
ufw enable
```

---

## Task 2: DNS Configuration

Point your domain to the droplet. In your domain registrar (where you bought `cccup.id`):

| Type | Name | Value | TTL |
|------|------|-------|-----|
| A | `@` | `<DROPLET_IP>` | 3600 |
| A | `api` | `<DROPLET_IP>` | 3600 |
| A | `admin` | `<DROPLET_IP>` | 3600 |

> **Note:** If your registrar uses a different DNS format, just create three A records pointing to your droplet IP. Propagation may take up to 48 hours but usually takes minutes.

---

## Task 3: SSL Certificates (Let's Encrypt)

```bash
# Obtain SSL certs for all subdomains (run after DNS propagation)
certbot --nginx -d cccup.id -d api.cccup.id -d admin.cccup.id

# Certbot auto-renews via systemd timer, verify:
systemctl status certbot.timer
```

---

## Task 4: Deploy Django Backend

### 4.1 Clone the Repository

```bash
su - deploy
mkdir -p /home/deploy/apps
cd /home/deploy/apps
git clone <YOUR_REPO_URL> cccupxli
# Or use git with deploy keys / personal access token
```

### 4.2 Python Virtual Environment

```bash
cd /home/deploy/apps/cccupxli/cc_cup_xli
python3.12 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
pip install gunicorn  # Production WSGI server
```

### 4.3 Production Environment Variables

Create `/home/deploy/apps/cccupxli/cc_cup_xli/.env`:

```bash
# ── Core ──
SECRET_KEY=<GENERATE_A_NEW_SECURE_KEY>
DEBUG=False
ALLOWED_HOSTS=api.cccup.id,admin.cccup.id,cccup.id

# ── Database (Neon PostgreSQL — already external) ──
DATABASE_URL=postgresql://<user>:<pass>@<host>/neondb?sslmode=require

# ── Cloudinary ──
CLOUDINARY_CLOUD_NAME=<your_cloud_name>
CLOUDINARY_API_KEY=<your_api_key>
CLOUDINARY_API_SECRET=<your_api_secret>

# ── Google OAuth (CCPay) ──
GOOGLE_CLIENT_ID=<your_client_id>
GOOGLE_CLIENT_SECRET=<your_client_secret>

# ── Google Vision (Ticketing) ──
GOOGLE_APPLICATION_CREDENTIALS=ticketing/secrets/relay-496307-78b7a70f534b.json

# ── Groq AI Chat ──
GROQ_API_KEY=<your_groq_key>
GROQ_MODEL=llama-3.3-70b-versatile
CHAT_ADMIN_PHONE=+62-812-3456-7890
CHAT_DEFAULT_TOKEN_CAP=10000

# ── Zoho SMTP ──
ZOHO_EMAIL=<your_email>
ZOHO_PASSWORD=<your_password>
```

### 4.4 Django Settings Adjustments

In `settings.py`, update these for production:

```python
# Replace the current ALLOWED_HOSTS line
ALLOWED_HOSTS = os.getenv('ALLOWED_HOSTS', 'localhost').split(',')

# Add production CORS origins (replace the current CORS_ALLOWED_ORIGINS block)
CORS_ALLOWED_ORIGINS = [
    "https://cccup.id",
    "https://api.cccup.id",
    "https://admin.cccup.id",
    # Development
    "http://localhost:3000",
    "http://localhost:5173",
    "http://127.0.0.1:3000",
    "http://127.0.0.1:5173",
]

# Add secure settings (only active when DEBUG=False)
if not DEBUG:
    SECURE_SSL_REDIRECT = True
    SESSION_COOKIE_SECURE = True
    CSRF_COOKIE_SECURE = True
    SECURE_HSTS_SECONDS = 31536000
    SECURE_HSTS_INCLUDE_SUBDOMAINS = True

# Add STATIC_ROOT for collectstatic
STATIC_ROOT = BASE_DIR / 'staticfiles'
```

### 4.5 Database Migration & Static Files

```bash
cd /home/deploy/apps/cccupxli/cc_cup_xli
source .venv/bin/activate

python manage.py migrate
python manage.py collectstatic --no-input
```

### 4.6 Gunicorn Systemd Service

Create `/etc/systemd/system/gunicorn.service`:

```ini
[Unit]
Description=Gunicorn for CC CUP XLI
After=network.target

[Service]
User=deploy
Group=deploy
WorkingDirectory=/home/deploy/apps/cccupxli/cc_cup_xli
Environment="PATH=/home/deploy/apps/cccupxli/cc_cup_xli/.venv/bin"
ExecStart=/home/deploy/apps/cccupxli/cc_cup_xli/.venv/bin/gunicorn \
    --workers 3 \
    --bind 127.0.0.1:8000 \
    --access-logfile /home/deploy/apps/cccupxli/gunicorn-access.log \
    --error-logfile /home/deploy/apps/cccupxli/gunicorn-error.log \
    cc_cup_XLI.wsgi:application
Restart=always
RestartSec=3

[Install]
WantedBy=multi-user.target
```

```bash
sudo systemctl daemon-reload
sudo systemctl enable --now gunicorn
```

---

## Task 5: Build & Deploy Frontends

Each frontend is built as static files and served by nginx directly.

### 5.1 Build All Frontends

```bash
# From the repo root on the droplet
cd /home/deploy/apps/cccupxli/cc-cup-frontend

# Homepage (served at /)
cd cc-cup-xli-homepage
npm install && npm run build
# Output: dist/

# Registration (served at /regis/)
cd ../cc-cup-xli-regis
npm install && npm run build
# Output: dist/

# CCPay (served at /ccpay/)
cd ../cc-cup-xli-ccpay
npm install && npm run build
# Output: dist/

# Ticketing (served at /ticketing/)
cd ../cc-cup-xli-ticketing
npm install && npm run build
# Output: dist/
```

### 5.2 Copy Builds to Web Root

```bash
sudo mkdir -p /var/www/cccup

# Homepage → root
sudo cp -r /home/deploy/apps/cccupxli/cc-cup-frontend/cc-cup-xli-homepage/dist/* /var/www/cccup/

# Regis → /regis/
sudo mkdir -p /var/www/cccup/regis
sudo cp -r /home/deploy/apps/cccupxli/cc-cup-frontend/cc-cup-xli-regis/dist/* /var/www/cccup/regis/

# CCPay → /ccpay/
sudo mkdir -p /var/www/cccup/ccpay
sudo cp -r /home/deploy/apps/cccupxli/cc-cup-frontend/cc-cup-xli-ccpay/dist/* /var/www/cccup/ccpay/

# Ticketing → /ticketing/
sudo mkdir -p /var/www/cccup/ticketing
sudo cp -r /home/deploy/apps/cccupxli/cc-cup-frontend/cc-cup-xli-ticketing/dist/* /var/www/cccup/ticketing/

sudo chown -R deploy:deploy /var/www/cccup
```

### 5.3 Frontend Vite Config Adjustments

Before building, each frontend's `vite.config` needs the correct `base` path so assets load properly:

**cc-cup-xli-homepage/vite.config.ts** — no changes needed (base is `/` by default)

**cc-cup-xli-regis/vite.config.js** — add:
```js
export default defineConfig({
  base: '/regis/',
  plugins: [react(), tailwindcss()],
})
```

**cc-cup-xli-ccpay/vite.config.js** — already has `base: '/ccpay/'` ✓

**cc-cup-xli-ticketing/vite.config.ts** — add:
```ts
export default defineConfig({
  base: '/ticketing/',
  plugins: [react(), tsconfigPaths()],
})
```

### 5.4 Frontend API URL Updates

Each frontend needs to call `api.cccup.id` instead of `localhost:8000`:

**cc-cup-xli-regis** — Set env var at build time:
```bash
VITE_API_BASE_URL=https://api.cccup.id/api/regis npm run build
```
Or create a `.env.production` file in the regis directory:
```
VITE_API_BASE_URL=https://api.cccup.id/api/regis
```

**cc-cup-xli-ccpay** — All `fetch('/api/ccpay/...')` calls need to use the API domain. Update the fetch calls to use a base URL:
```js
// Create src/lib/api.js (or add at top of each page)
const API_BASE = import.meta.env.VITE_API_BASE_URL || '';
// Then use: fetch(`${API_BASE}/api/ccpay/...`)
```
And set in `.env.production`:
```
VITE_API_BASE_URL=https://api.cccup.id
```

**cc-cup-xli-ticketing** — Update `src/services/api.ts`:
```ts
const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || "/api/ticketing",
});
```
And set in `.env.production`:
```
VITE_API_BASE_URL=https://api.cccup.id/api/ticketing
```

---

## Task 6: Nginx Configuration

### 6.1 Main Site Config

Create `/etc/nginx/sites-available/cccup`:

```nginx
# ── Homepage (cccup.id) ──
server {
    listen 80;
    server_name cccup.id;
    return 301 https://$host$request_uri;
}

server {
    listen 443 ssl http2;
    server_name cccup.id;

    # SSL managed by certbot (will be auto-inserted)
    # ssl_certificate /etc/letsencrypt/live/cccup.id/fullchain.pem;
    # ssl_certificate_key /etc/letsencrypt/live/cccup.id/privkey.pem;

    root /var/www/cccup;
    index index.html;

    # ── Homepage SPA ──
    location / {
        try_files $uri $uri/ /index.html;
    }

    # ── Registration SPA ──
    location /regis/ {
        alias /var/www/cccup/regis/;
        try_files $uri $uri/ /regis/index.html;
    }

    # ── CCPay SPA ──
    location /ccpay/ {
        alias /var/www/cccup/ccpay/;
        try_files $uri $uri/ /ccpay/index.html;
    }

    # ── Ticketing SPA ──
    location /ticketing/ {
        alias /var/www/cccup/ticketing/;
        try_files $uri $uri/ /ticketing/index.html;
    }

    # ── Static file caching ──
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$ {
        expires 30d;
        add_header Cache-Control "public, immutable";
    }

    # ── Security headers ──
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header Referrer-Policy "strict-origin-when-cross-origin" always;
}

# ── API Backend (api.cccup.id) ──
server {
    listen 80;
    server_name api.cccup.id;
    return 301 https://$host$request_uri;
}

server {
    listen 443 ssl http2;
    server_name api.cccup.id;

    # SSL managed by certbot

    client_max_body_size 10M;

    # ── Django API ──
    location / {
        proxy_pass http://127.0.0.1:8000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_read_timeout 120s;
    }

    # ── Django static files ──
    location /static/ {
        alias /home/deploy/apps/cccupxli/cc_cup_xli/staticfiles/;
        expires 30d;
    }
}

# ── Django Admin (admin.cccup.id) ──
server {
    listen 80;
    server_name admin.cccup.id;
    return 301 https://$host$request_uri;
}

server {
    listen 443 ssl http2;
    server_name admin.cccup.id;

    # SSL managed by certbot

    location / {
        proxy_pass http://127.0.0.1:8000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    location /static/ {
        alias /home/deploy/apps/cccupxli/cc_cup_xli/staticfiles/;
        expires 30d;
    }
}
```

### 6.2 Enable the Site

```bash
sudo ln -s /etc/nginx/sites-available/cccup /etc/nginx/sites-enabled/
sudo rm /etc/nginx/sites-enabled/default  # Remove default site
sudo nginx -t                             # Test configuration
sudo systemctl reload nginx
```

---

## Task 7: Deploy Script

Create `/home/deploy/apps/cccupxli/deploy.sh` for easy redeployment:

```bash
#!/bin/bash
set -e

APP_DIR="/home/deploy/apps/cccupxli"
WEB_ROOT="/var/www/cccup"

echo "=== Pulling latest code ==="
cd $APP_DIR
git pull origin main

echo "=== Backend: Installing dependencies ==="
cd $APP_DIR/cc_cup_xli
source .venv/bin/activate
pip install -r requirements.txt

echo "=== Backend: Running migrations ==="
python manage.py migrate --no-input

echo "=== Backend: Collecting static files ==="
python manage.py collectstatic --no-input

echo "=== Frontend: Building all apps ==="
cd $APP_DIR/cc-cup-frontend

# Homepage
cd cc-cup-xli-homepage
npm ci && npm run build
rm -rf $WEB_ROOT/assets $WEB_ROOT/index.html
cp -r dist/* $WEB_ROOT/

# Regis
cd ../cc-cup-xli-regis
npm ci && VITE_API_BASE_URL=https://api.cccup.id/api/regis npm run build
rm -rf $WEB_ROOT/regis
mkdir -p $WEB_ROOT/regis && cp -r dist/* $WEB_ROOT/regis/

# CCPay
cd ../cc-cup-xli-ccpay
npm ci && VITE_API_BASE_URL=https://api.cccup.id npm run build
rm -rf $WEB_ROOT/ccpay
mkdir -p $WEB_ROOT/ccpay && cp -r dist/* $WEB_ROOT/ccpay/

# Ticketing
cd ../cc-cup-xli-ticketing
npm ci && VITE_API_BASE_URL=https://api.cccup.id/api/ticketing npm run build
rm -rf $WEB_ROOT/ticketing
mkdir -p $WEB_ROOT/ticketing && cp -r dist/* $WEB_ROOT/ticketing/

echo "=== Restarting services ==="
sudo systemctl restart gunicorn
sudo systemctl reload nginx

echo "=== Deploy complete! ==="
```

```bash
chmod +x /home/deploy/apps/cccupxli/deploy.sh
```

---

## Task 8: Post-Deploy Checklist

- [ ] Run `certbot --nginx` and verify SSL on all subdomains
- [ ] Visit `https://cccup.id` — homepage loads
- [ ] Visit `https://cccup.id/regis/` — registration loads
- [ ] Visit `https://cccup.id/ccpay/` — ccpay loads
- [ ] Visit `https://cccup.id/ticketing/` — ticketing loads
- [ ] Visit `https://api.cccup.id/api/regis/` — API responds
- [ ] Visit `https://admin.cccup.id/admin/` — Django admin loads
- [ ] Test registration flow end-to-end
- [ ] Test CCPay Google OAuth (update OAuth redirect URIs in Google Cloud Console to `https://api.cccup.id/api/ccpay/auth/google/callback/`)
- [ ] Set up automatic backups for Neon PostgreSQL
- [ ] Rotate all secrets exposed in `.env` (currently in git history)

---

## Quick Reference

| URL | Purpose |
|-----|---------|
| `https://cccup.id` | Homepage |
| `https://cccup.id/regis/` | Registration |
| `https://cccup.id/ccpay/` | Payment system |
| `https://cccup.id/ticketing/` | Ticketing |
| `https://api.cccup.id/api/*` | Django REST API |
| `https://admin.cccup.id/admin/` | Django admin panel |

| Service | Port | Managed by |
|---------|------|-----------|
| nginx | 80/443 | systemd |
| Gunicorn | 8000 (localhost) | systemd (`gunicorn`) |
| PostgreSQL | External (Neon) | Neon dashboard |

---

## Troubleshooting

```bash
# Check service status
sudo systemctl status gunicorn
sudo systemctl status nginx

# View logs
tail -f /home/deploy/apps/cccupxli/gunicorn-error.log
sudo tail -f /var/log/nginx/error.log

# Test nginx config
sudo nginx -t

# Restart everything
sudo systemctl restart gunicorn nginx
```
