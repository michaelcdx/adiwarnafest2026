# Adiwarna Festival — DigitalOcean Deployment Plan

**Event Date:** 2026-05-30 (~9 days away)
**Expected Load:** 100–200 concurrent users on event day
**Stack:** .NET 9 backend + React/Vite frontend + PostgreSQL + nginx, all dockerized

---

## 1. Current State (What You Have)

Locally working Docker Compose setup with 4 services:

| Service   | Image / Build              | Internal Port | Host Port |
|-----------|----------------------------|---------------|-----------|
| postgres  | postgres:16-alpine         | 5432          | 5432      |
| backend   | ./adiwarnafest-backend     | 5190 (listens on 8080) | 8080 |
| frontend  | ./adiwarnafest-frontend    | 80            | 5173      |
| nginx     | nginx:alpine (reverse proxy)| 80           | 80        |

**Files involved:**
- `docker-compose.yml` — orchestration
- `nginx.conf` — root-level reverse proxy
- `adiwarnafest-backend/Dockerfile` — .NET 9 build
- `adiwarnafest-frontend/Dockerfile` — Vite build + nginx serve
- `adiwarnafest-frontend/nginx.conf` — frontend nginx config with `/api` proxy
- `adiwarnafest-frontend/.env` — `VITE_API_BASE_URL=` (empty, uses relative paths)

**Issues to fix before production:**
- Secrets are hardcoded in `docker-compose.yml` (JWT token, DB password)
- `AppSettings__Issuer` and `AppSettings__Audience` point to `http://localhost`
- No HTTPS/SSL configured
- PostgreSQL is using default `postgres/postgres` credentials
- No backup strategy in place
- No log rotation configured

---

## 2. Recommended Deployment Architecture

**Option A (Recommended): Single Droplet + Docker Compose**

```
┌─────────────────────────────────────────────────┐
│           DigitalOcean Droplet                  │
│  (Ubuntu 22.04 LTS, 2 vCPU / 4GB RAM)           │
│                                                 │
│  ┌───────────┐                                  │
│  │  Nginx    │ ← Port 80/443 (public)          │
│  │  (proxy)  │                                  │
│  └─────┬─────┘                                  │
│        │                                        │
│        ├──→ Frontend (React static via nginx)   │
│        └──→ Backend (.NET API)                  │
│                  │                              │
│                  └──→ PostgreSQL (container)    │
│                       └──→ Volume: postgres_data│
└─────────────────────────────────────────────────┘
              ↑
        Cloudflare/Domain → Droplet IP
```

**Why this option:**
- Simplest to deploy quickly (9-day deadline)
- 100–200 concurrent users easily handled by a 4GB droplet
- All your existing Docker config works as-is
- Estimated cost: ~$24/month (4GB droplet)

**Option B: Droplet + Managed PostgreSQL** (only if you need DB resilience)
- Adds ~$15/month for managed Postgres
- Better backups & failover, but adds setup complexity
- Skip unless you've already lost DB data before

---

## 3. Pre-Deployment Tasks (Do These Locally First)

### 3.1 Generate strong secrets

```powershell
# Generate JWT secret (64+ chars)
[Convert]::ToBase64String((1..64 | ForEach-Object { Get-Random -Maximum 256 }))

# Generate PostgreSQL password
[Convert]::ToBase64String((1..24 | ForEach-Object { Get-Random -Maximum 256 }))
```

### 3.2 Create production `.env` file at repo root

```env
# .env.production (DO NOT COMMIT)
POSTGRES_USER=adiwarna_prod
POSTGRES_PASSWORD=<generated-strong-password>
POSTGRES_DB=adiwarna

JWT_SECRET=<generated-64-char-secret>
JWT_ISSUER=https://yourdomain.com
JWT_AUDIENCE=https://yourdomain.com

ASPNETCORE_ENVIRONMENT=Production
```

### 3.3 Update `docker-compose.yml` to use env vars

Replace hardcoded values with `${VAR_NAME}` references that pull from `.env.production`.

### 3.4 Update `nginx.conf` for production

- Add `server_name yourdomain.com;` instead of `localhost`
- Add SSL config (will populate after Let's Encrypt cert is issued)
- Add gzip compression
- Add security headers (HSTS, X-Frame-Options, etc.)

### 3.5 Add `.dockerignore` to both projects to reduce build size

### 3.6 Add `.gitignore` entries

```
.env
.env.production
.env.*.local
```

---

## 4. DigitalOcean Setup Steps

### 4.1 Create the Droplet

1. Sign in to DigitalOcean → **Create → Droplets**
2. Choose:
   - **Image:** Ubuntu 22.04 LTS
   - **Plan:** Basic → Regular SSD → **$24/mo (4GB RAM, 2 vCPU, 80GB SSD)**
   - **Datacenter:** Closest to event location (Singapore for Malaysia)
   - **Authentication:** SSH Key (generate one if needed)
   - **Hostname:** `adiwarna-prod`
3. Click **Create Droplet** → note the IPv4 address

### 4.2 Initial server setup

SSH in as root, then:

```bash
ssh root@<droplet-ip>

# Update system
apt update && apt upgrade -y

# Create non-root user
adduser adiwarna
usermod -aG sudo adiwarna
rsync --archive --chown=adiwarna:adiwarna ~/.ssh /home/adiwarna

# Setup firewall
ufw allow OpenSSH
ufw allow 80/tcp
ufw allow 443/tcp
ufw enable

# Install Docker + Docker Compose
curl -fsSL https://get.docker.com -o get-docker.sh
sh get-docker.sh
usermod -aG docker adiwarna

# Switch to adiwarna user for remaining steps
su - adiwarna
```

### 4.3 Set up domain (optional but recommended)

- Buy domain from Namecheap/Cloudflare (~$10/year)
- Point A record to droplet IP: `@` → `<droplet-ip>`
- Wait ~5-30 min for DNS propagation

---

## 5. Deploy the Application

### 5.1 Get code onto the server

**Option A: Git** (recommended if you have a repo)
```bash
git clone <your-repo-url> ~/adiwarna
cd ~/adiwarna
```

**Option B: SCP** (if no git)
```bash
# From local Windows PowerShell:
scp -r C:\Users\USER\Desktop\adiwarna\* adiwarna@<droplet-ip>:~/adiwarna/
```

### 5.2 Create `.env.production` on the server

```bash
nano ~/adiwarna/.env.production
# Paste the env vars from step 3.2
chmod 600 ~/adiwarna/.env.production
```

### 5.3 First deployment

```bash
cd ~/adiwarna
docker compose --env-file .env.production up -d --build

# Verify all containers running
docker ps

# Check logs
docker compose logs -f
```

### 5.4 Verify it works

Visit `http://<droplet-ip>` in browser — should load the frontend. Test login.

---

## 6. Set up HTTPS (Let's Encrypt)

### 6.1 Install Certbot

```bash
sudo apt install -y certbot
```

### 6.2 Stop nginx temporarily

```bash
docker compose stop nginx
```

### 6.3 Get certificate

```bash
sudo certbot certonly --standalone -d yourdomain.com -d www.yourdomain.com
# Certificates stored at /etc/letsencrypt/live/yourdomain.com/
```

### 6.4 Update `nginx.conf` to use SSL

Add server block listening on 443 with SSL cert paths, redirect 80→443.

### 6.5 Mount cert directory into nginx container

In `docker-compose.yml`, add to nginx service:
```yaml
volumes:
  - ./nginx.conf:/etc/nginx/conf.d/default.conf:ro
  - /etc/letsencrypt:/etc/letsencrypt:ro
```

### 6.6 Auto-renewal cron

```bash
sudo crontab -e
# Add:
0 3 * * * certbot renew --quiet --pre-hook "docker compose -f /home/adiwarna/adiwarna/docker-compose.yml stop nginx" --post-hook "docker compose -f /home/adiwarna/adiwarna/docker-compose.yml start nginx"
```

---

## 7. Production Hardening

### 7.1 PostgreSQL backups (CRITICAL — event day data!)

Daily backup cron:
```bash
mkdir -p ~/backups
crontab -e
# Add daily 2am backup:
0 2 * * * docker exec adiwarna-postgres-1 pg_dump -U adiwarna_prod adiwarna | gzip > ~/backups/adiwarna-$(date +\%Y\%m\%d).sql.gz
# Keep last 14 days
0 3 * * * find ~/backups -name "*.sql.gz" -mtime +14 -delete
```

Also: download backups to your laptop daily before event:
```powershell
scp adiwarna@<droplet-ip>:~/backups/adiwarna-*.sql.gz C:\backups\
```

### 7.2 Resource monitoring

Install `htop` and `ctop`:
```bash
sudo apt install -y htop
sudo wget https://github.com/bcicen/ctop/releases/download/v0.7.7/ctop-0.7.7-linux-amd64 -O /usr/local/bin/ctop
sudo chmod +x /usr/local/bin/ctop
```

Enable DigitalOcean monitoring (free): Droplet settings → Monitoring → Enable.

### 7.3 Log rotation

Docker logs can fill the disk. Add to `/etc/docker/daemon.json`:
```json
{
  "log-driver": "json-file",
  "log-opts": {
    "max-size": "10m",
    "max-file": "3"
  }
}
```
Then `sudo systemctl restart docker`.

### 7.4 Pre-event load test

Use a tool like `k6` or `ab` from your laptop to simulate 200 concurrent users hitting login/lucky-draw endpoints. Identify bottlenecks 3-5 days before event.

```bash
# Quick check:
ab -n 1000 -c 50 https://yourdomain.com/api/some-endpoint
```

---

## 8. Event Day Runbook

**T-24 hours:**
- Verify backups working (test restore on a fresh container)
- Confirm SSL cert valid for >30 days
- Check disk space: `df -h` (need >10GB free)
- Tail logs while you sleep: `docker compose logs -f`

**T-2 hours:**
- SSH into droplet, keep terminal open
- Run `ctop` to watch container resource usage
- Have backup laptop ready in case primary fails

**During event:**
- Monitor `ctop` for CPU/memory spikes
- Monitor PostgreSQL connections: `docker exec adiwarna-postgres-1 psql -U adiwarna_prod -c "SELECT count(*) FROM pg_stat_activity;"`
- If backend crashes: `docker compose restart backend`

**Emergency rollback:**
```bash
# Stop everything
docker compose down

# Restore latest backup
gunzip -c ~/backups/adiwarna-YYYYMMDD.sql.gz | docker exec -i adiwarna-postgres-1 psql -U adiwarna_prod adiwarna

# Start back up
docker compose up -d
```

---

## 9. Cost Summary

| Item                     | Monthly Cost |
|--------------------------|--------------|
| Droplet (4GB / 2 vCPU)   | $24          |
| Domain (optional)        | ~$1 ($12/yr) |
| Backups (DO snapshots)   | $4.80 (20%)  |
| **Total**                | **~$30/mo**  |

You can downsize the droplet to 2GB ($12/mo) after the event.

---

## 10. Timeline (Suggested)

| Day | Task |
|-----|------|
| Day 1 (today) | Generate secrets, externalize env vars, create Droplet |
| Day 2 | Deploy app, verify functionality, set up domain |
| Day 3 | Configure HTTPS, security hardening, backups |
| Day 4 | Load testing, fix any bottlenecks |
| Day 5 | Final review, test full user flow end-to-end |
| Day 6-8 | Buffer for unexpected issues |
| Day 9 (2026-05-30) | Event day |

---

## 11. Open Questions to Resolve

- [ ] Do you have a domain name yet?
- [ ] Will users access via mobile? (test responsiveness on production)
- [ ] What's the lucky draw concurrency requirement? (could be a hot path)
- [ ] Do you need email/SMS notifications? (would add SMTP service)
- [ ] Will Chris or you own the DO account / billing?
