# Deployment Guide

This guide explains how to deploy the kassa-app to your Ubuntu home server using GitHub Actions for continuous deployment.

## Architecture

- **Domain**: kassa.sennegeerts.com
- **SSL**: Cloudflare (Full mode) - HTTPS between user ↔ Cloudflare, HTTP Cloudflare ↔ server
- **Deployment**: GitHub Actions SSH to server on push to `master` branch
- **Stack**: Docker Compose with Nginx reverse proxy, Spring Boot API, Next.js frontend, PostgreSQL

## Server Prerequisites

### 1. Install Docker and Docker Compose

```bash
# Install Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh

# Install Docker Compose
sudo apt update
sudo apt install docker-compose-plugin

# Add your user to docker group (logout/login after)
sudo usermod -aG docker $USER
```

### 2. Create Deployment Directory

```bash
sudo mkdir -p /opt/kassa-app
sudo chown $USER:$USER /opt/kassa-app
cd /opt/kassa-app
```

### 3. Clone Repository

```bash
git clone https://github.com/Senne-Geerts/kassa-app.git .
```

### 4. Create Environment File

Create `/opt/kassa-app/.env` with production secrets:

```bash
# Database password (generate a strong password)
POSTGRES_PASSWORD=your-strong-password-here
POSTGRES_DB=kassa_development
POSTGRES_USER=kassa

# API URL for production (set in shell, not in .env)
# export NEXT_PUBLIC_API_URL=https://kassa.sennegeerts.com
```

**Important**: Never commit `.env` to git. It's already in `.gitignore`.

### 5. Set Up SSH Key for GitHub Actions

```bash
# Generate SSH key pair
ssh-keygen -t ed25519 -C "github-actions-deploy" -f ~/.ssh/github-actions

# Add public key to authorized_keys
cat ~/.ssh/github-actions.pub >> ~/.ssh/authorized_keys

# Display private key (add to GitHub Secrets)
cat ~/.ssh/github-actions
```

## GitHub Configuration

### Required Secrets

Add these secrets in your GitHub repository settings (Settings → Secrets and variables → Actions):

1. **SSH_HOST**: Your home server's IP address or hostname
2. **SSH_USERNAME**: Your username on the server (e.g., `senne`)
3. **SSH_PRIVATE_KEY**: Contents of `~/.ssh/github-actions` (entire file)
4. **SSH_PORT**: SSH port (default: `22`)

To add secrets:
1. Go to https://github.com/Senne-Geerts/kassa-app/settings/secrets/actions
2. Click "New repository secret"
3. Add each secret with its value

## Cloudflare DNS Configuration

### 1. Add DNS Record

In your Cloudflare dashboard:
1. Go to DNS settings for `sennegeerts.com`
2. Add an A record:
   - **Type**: A
   - **Name**: kassa
   - **IPv4 address**: Your home server's public IP
   - **Proxy status**: Proxied (orange cloud)
   - **TTL**: Auto

### 2. Verify SSL/TLS Settings

1. Go to SSL/TLS → Overview
2. Ensure mode is set to **Full** (not Full Strict, since we're using HTTP on the origin)
3. This enables HTTPS between users and Cloudflare, HTTP between Cloudflare and your server

## Initial Deployment

### Manual First Deployment

Before GitHub Actions can deploy, you need to do an initial manual deployment:

```bash
cd /opt/kassa-app

# Set production environment
export NEXT_PUBLIC_API_URL=https://kassa.sennegeerts.com

# Build and start containers
docker compose up --build -d

# Check logs
docker compose logs -f

# Verify services are running
docker compose ps
```

### Test the Deployment

1. Visit https://kassa.sennegeerts.com
2. Verify the frontend loads
3. Check that you can view/create events
4. Monitor logs: `docker compose logs -f`

## GitHub Actions Deployment

Once the initial deployment is complete and GitHub secrets are configured:

1. Push code to `master` branch:
   ```bash
   git push origin master
   ```

2. Watch the deployment:
   - Go to https://github.com/Senne-Geerts/kassa-app/actions
   - Click on the latest workflow run
   - Monitor the "Deploy to Production" job

3. The workflow will:
   - Run CI tests (API + frontend)
   - SSH to your server
   - Pull latest code
   - Rebuild and restart containers
   - Verify API health

## Monitoring and Maintenance

### View Logs

```bash
# All services
docker compose logs -f

# Specific service
docker compose logs -f api
docker compose logs -f frontend
docker compose logs -f nginx
```

### Restart Services

```bash
# Restart all
docker compose restart

# Restart specific service
docker compose restart api
```

### Update Containers

```bash
cd /opt/kassa-app
git pull
docker compose up --build -d
```

### Database Backup

```bash
# Backup
docker compose exec db pg_dump -U kassa kassa_development > backup-$(date +%Y%m%d).sql

# Restore
docker compose exec -T db psql -U kassa kassa_development < backup-20261103.sql
```

## Troubleshooting

### Check Container Status

```bash
docker compose ps
docker compose logs api
```

### Test API Directly

```bash
curl http://localhost:8080/api/events
```

### Test Nginx Routing

```bash
curl http://localhost/api/events
```

### Verify DNS

```bash
nslookup kassa.sennegeerts.com
```

### Check Cloudflare Connection

Check your server's firewall allows incoming connections on port 80:

```bash
sudo ufw status
sudo ufw allow 80/tcp
```

### GitHub Actions Fails to Connect

- Verify SSH_HOST is your server's public IP
- Ensure SSH_PORT is correct (default 22)
- Check SSH_PRIVATE_KEY includes the entire key (including headers)
- Test SSH manually: `ssh -i ~/.ssh/github-actions user@host`

## Rollback

If deployment fails:

```bash
cd /opt/kassa-app

# Check what commit is deployed
git log -1

# Rollback to previous commit
git reset --hard HEAD~1

# Rebuild containers
export NEXT_PUBLIC_API_URL=https://kassa.sennegeerts.com
docker compose up --build -d
```

## Security Considerations

- Database is only accessible from API container (isolated network)
- `.env` file contains secrets and is never committed to git
- SSH key authentication for GitHub Actions (no passwords)
- Cloudflare provides DDoS protection and SSL/TLS
- Nginx security headers protect against common attacks
- Keep Docker images updated: `docker compose pull && docker compose up -d`

## Local Development

For local development, use the default settings:

```bash
# Local dev (no NEXT_PUBLIC_API_URL needed)
docker compose up --build

# Access locally
# Frontend: http://localhost:3000
# API: http://localhost:8080
```

The code automatically uses `localhost:8080` for local development when `NEXT_PUBLIC_API_URL` is not set.
