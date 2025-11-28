# 🌊 DigitalOcean Deployment Guide - ProNet

Complete guide to deploy ProNet on DigitalOcean using Docker and App Platform.

---

## 🎯 Deployment Options

### Option 1: DigitalOcean App Platform (Recommended - Easy)
- Managed platform (like Heroku/Render)
- Auto-scaling and load balancing
- Built-in SSL certificates
- Cost: ~$12-20/month

### Option 2: DigitalOcean Droplet + Docker (Full Control)
- VPS with full control
- Manual setup required
- More cost-effective
- Cost: ~$6-12/month

---

## 📦 Option 1: App Platform Deployment

### Step 1: Create DigitalOcean Account

1. Go to [digitalocean.com](https://www.digitalocean.com)
2. Sign up (get $200 credit for 60 days with referral)
3. Add payment method

### Step 2: Create Managed Database

1. In DigitalOcean Dashboard, click **Create** → **Databases**
2. Choose **PostgreSQL 15**
3. Select datacenter region (closest to your users)
4. Choose plan:
   - **Basic** - $15/month (1GB RAM, 10GB storage)
   - **Dev Database** - $7/month (512MB RAM, 1GB storage) - Good for testing
5. Name: `pronet-postgres`
6. Click **Create Database Cluster**
7. Wait 3-5 minutes for provisioning
8. **Save connection details** (you'll need these)

### Step 3: Create App Platform Apps

#### A. Deploy User Service

1. Click **Create** → **Apps**
2. Choose **GitHub** as source
3. Select repository: `Abenezer0923/ProNet`
4. Configure:
   - **Branch**: `main`
   - **Source Directory**: `/services/user-service`
   - **Autodeploy**: ✅ Enabled
5. Click **Next**

**Build Settings:**
```
Build Command: npm install --legacy-peer-deps && npm run build
Run Command: npm run start:prod
```

**Environment Variables:**
```env
PORT=8080
DATABASE_HOST=${pronet-postgres.HOSTNAME}
DATABASE_PORT=${pronet-postgres.PORT}
DATABASE_USER=${pronet-postgres.USERNAME}
DATABASE_PASSWORD=${pronet-postgres.PASSWORD}
DATABASE_NAME=${pronet-postgres.DATABASE}
JWT_SECRET=<generate-random-32-char-string>
CLOUDINARY_CLOUD_NAME=dgl4cpuik
CLOUDINARY_API_KEY=637454513411741
CLOUDINARY_API_SECRET=7JHtL4bTAYqwq7RaQM60Ocf43fw
GOOGLE_CLIENT_ID=<your-google-client-id>
GOOGLE_CLIENT_SECRET=<your-google-client-secret>
GOOGLE_CALLBACK_URL=https://pronet-user-service-xxxxx.ondigitalocean.app/api/auth/google/callback
FRONTEND_URL=https://pronet-frontend-xxxxx.ondigitalocean.app
EMAIL_USER=<your-email>
EMAIL_PASSWORD=<your-email-app-password>
```

6. Choose plan: **Basic - $5/month** (512MB RAM)
7. Name: `pronet-user-service`
8. Click **Create Resources**

#### B. Deploy API Gateway

1. Click **Create** → **Apps**
2. Choose **GitHub** → `Abenezer0923/ProNet`
3. Configure:
   - **Source Directory**: `/services/api-gateway`
   - **Autodeploy**: ✅ Enabled

**Build Settings:**
```
Build Command: npm install --legacy-peer-deps && npm run build
Run Command: npm run start:prod
```

**Environment Variables:**
```env
PORT=8080
USER_SERVICE_URL=https://pronet-user-service-xxxxx.ondigitalocean.app
JWT_SECRET=<same-as-user-service>
```

4. Choose plan: **Basic - $5/month**
5. Name: `pronet-api-gateway`
6. Click **Create Resources**

#### C. Deploy Frontend

1. Click **Create** → **Apps**
2. Choose **GitHub** → `Abenezer0923/ProNet`
3. Configure:
   - **Source Directory**: `/frontend`
   - **Autodeploy**: ✅ Enabled

**Build Settings:**
```
Build Command: npm install && npm run build
Run Command: npm start
```

**Environment Variables:**
```env
NEXT_PUBLIC_API_URL=https://pronet-api-gateway-xxxxx.ondigitalocean.app
NEXT_PUBLIC_WS_URL=https://pronet-user-service-xxxxx.ondigitalocean.app
```

4. Choose plan: **Basic - $5/month**
5. Name: `pronet-frontend`
6. Click **Create Resources**

### Step 4: Configure Custom Domains (Optional)

1. Go to each app → **Settings** → **Domains**
2. Add your custom domain:
   - Frontend: `app.yourdomain.com`
   - API: `api.yourdomain.com`
   - User Service: `users.yourdomain.com`
3. Update DNS records as instructed
4. SSL certificates are auto-provisioned

### Step 5: Update Google OAuth

1. Go to [Google Cloud Console](https://console.cloud.google.com)
2. Navigate to **APIs & Services** → **Credentials**
3. Update OAuth 2.0 Client:
   - **Authorized redirect URIs**: Add your DigitalOcean user service URL
   - **Authorized JavaScript origins**: Add your frontend URL

---

## 🖥️ Option 2: Droplet Deployment (Docker)

### Step 1: Create Droplet

1. Click **Create** → **Droplets**
2. Choose image: **Ubuntu 22.04 LTS**
3. Choose plan:
   - **Basic** - $6/month (1GB RAM, 25GB SSD) - Minimum
   - **Basic** - $12/month (2GB RAM, 50GB SSD) - Recommended
4. Choose datacenter region
5. Authentication: **SSH Key** (recommended) or **Password**
6. Hostname: `pronet-server`
7. Click **Create Droplet**
8. Wait 1-2 minutes for provisioning
9. **Save the IP address**

### Step 2: Initial Server Setup

SSH into your droplet:

```bash
ssh root@your-droplet-ip
```

Update system and install dependencies:

```bash
# Update system
apt update && apt upgrade -y

# Install Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sh get-docker.sh

# Install Docker Compose
apt install docker-compose -y

# Install Git
apt install git -y

# Install Nginx
apt install nginx -y

# Install Certbot for SSL
apt install certbot python3-certbot-nginx -y

# Create swap file (if using 1GB RAM droplet)
fallocate -l 2G /swapfile
chmod 600 /swapfile
mkswap /swapfile
swapon /swapfile
echo '/swapfile none swap sw 0 0' | tee -a /etc/fstab
```

### Step 3: Clone and Configure Application

```bash
# Clone repository
cd /opt
git clone https://github.com/Abenezer0923/ProNet.git
cd ProNet

# Create production environment files
cp services/user-service/.env.example services/user-service/.env
cp services/api-gateway/.env.example services/api-gateway/.env
cp frontend/.env.local.example frontend/.env.local
```

Edit environment files:

```bash
# User Service
nano services/user-service/.env
```

```env
PORT=3001
DATABASE_HOST=postgres
DATABASE_PORT=5432
DATABASE_USER=postgres
DATABASE_PASSWORD=<strong-random-password>
DATABASE_NAME=profession_db
JWT_SECRET=<generate-random-32-char-string>
CLOUDINARY_CLOUD_NAME=dgl4cpuik
CLOUDINARY_API_KEY=637454513411741
CLOUDINARY_API_SECRET=7JHtL4bTAYqwq7RaQM60Ocf43fw
GOOGLE_CLIENT_ID=<your-google-client-id>
GOOGLE_CLIENT_SECRET=<your-google-client-secret>
GOOGLE_CALLBACK_URL=https://yourdomain.com/api/auth/google/callback
FRONTEND_URL=https://yourdomain.com
EMAIL_USER=<your-email>
EMAIL_PASSWORD=<your-email-app-password>
```

```bash
# API Gateway
nano services/api-gateway/.env
```

```env
PORT=3000
USER_SERVICE_URL=http://user-service:3001
JWT_SECRET=<same-as-user-service>
```

```bash
# Frontend
nano frontend/.env.local
```

```env
NEXT_PUBLIC_API_URL=https://yourdomain.com/api
NEXT_PUBLIC_WS_URL=https://yourdomain.com
```

Update docker-compose.yml for production:

```bash
nano docker-compose.yml
```

Update PostgreSQL password:

```yaml
postgres:
  environment:
    POSTGRES_PASSWORD: <your-strong-password>
```

### Step 4: Start Services

```bash
# Build and start all services
docker-compose up -d --build

# Check status
docker-compose ps

# View logs
docker-compose logs -f

# Wait for services to be healthy
docker-compose ps
```

### Step 5: Configure Nginx Reverse Proxy

Create Nginx configuration:

```bash
nano /etc/nginx/sites-available/pronet
```

```nginx
# Upstream servers
upstream frontend {
    server localhost:3100;
}

upstream api_gateway {
    server localhost:3000;
}

upstream user_service {
    server localhost:3001;
}

# HTTP to HTTPS redirect
server {
    listen 80;
    server_name yourdomain.com www.yourdomain.com;
    return 301 https://$server_name$request_uri;
}

# Main HTTPS server
server {
    listen 443 ssl http2;
    server_name yourdomain.com www.yourdomain.com;

    # SSL certificates (will be added by Certbot)
    # ssl_certificate /etc/letsencrypt/live/yourdomain.com/fullchain.pem;
    # ssl_certificate_key /etc/letsencrypt/live/yourdomain.com/privkey.pem;

    # Security headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;

    # Frontend
    location / {
        proxy_pass http://frontend;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }

    # API Gateway
    location /api/ {
        proxy_pass http://api_gateway/;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }

    # WebSocket for real-time features
    location /socket.io/ {
        proxy_pass http://user_service/socket.io/;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    # File upload size limit
    client_max_body_size 50M;
}
```

Enable the site:

```bash
# Test configuration
nginx -t

# Enable site
ln -s /etc/nginx/sites-available/pronet /etc/nginx/sites-enabled/

# Remove default site
rm /etc/nginx/sites-enabled/default

# Restart Nginx
systemctl restart nginx
```

### Step 6: Configure SSL with Let's Encrypt

```bash
# Get SSL certificate
certbot --nginx -d yourdomain.com -d www.yourdomain.com

# Follow prompts:
# - Enter email address
# - Agree to terms
# - Choose to redirect HTTP to HTTPS

# Test auto-renewal
certbot renew --dry-run

# Certificate will auto-renew every 90 days
```

### Step 7: Configure Firewall

```bash
# Enable UFW firewall
ufw allow OpenSSH
ufw allow 'Nginx Full'
ufw enable

# Check status
ufw status
```

### Step 8: Set Up Automatic Updates

```bash
# Enable automatic security updates
apt install unattended-upgrades -y
dpkg-reconfigure -plow unattended-upgrades
```

### Step 9: Configure DNS

In your domain registrar (Namecheap, GoDaddy, etc.):

1. Add **A Record**:
   - Host: `@`
   - Value: `your-droplet-ip`
   - TTL: 3600

2. Add **A Record** for www:
   - Host: `www`
   - Value: `your-droplet-ip`
   - TTL: 3600

Wait 5-30 minutes for DNS propagation.

---

## 🔧 Maintenance Commands

### View Logs

```bash
# All services
docker-compose logs -f

# Specific service
docker-compose logs -f user-service
docker-compose logs -f api-gateway
docker-compose logs -f frontend

# Nginx logs
tail -f /var/log/nginx/access.log
tail -f /var/log/nginx/error.log
```

### Restart Services

```bash
# Restart all
docker-compose restart

# Restart specific service
docker-compose restart user-service

# Restart Nginx
systemctl restart nginx
```

### Update Application

```bash
cd /opt/ProNet

# Pull latest code
git pull origin main

# Rebuild and restart
docker-compose down
docker-compose up -d --build

# Check status
docker-compose ps
```

### Database Backup

```bash
# Create backup directory
mkdir -p /opt/backups

# Backup PostgreSQL
docker exec profession-postgres pg_dump -U postgres profession_db > /opt/backups/backup-$(date +%Y%m%d-%H%M%S).sql

# Restore from backup
docker exec -i profession-postgres psql -U postgres profession_db < /opt/backups/backup-20240101-120000.sql
```

### Monitor Resources

```bash
# Docker stats
docker stats

# System resources
htop

# Disk usage
df -h

# Check service status
systemctl status nginx
docker-compose ps
```

---

## 📊 Cost Comparison

### App Platform (Managed)
- Database: $7-15/month
- User Service: $5/month
- API Gateway: $5/month
- Frontend: $5/month
- **Total: ~$22-30/month**

### Droplet (Self-Managed)
- Droplet (2GB): $12/month
- Managed Database: $7/month (optional)
- **Total: ~$12-19/month**

---

## 🔒 Security Checklist

- [ ] Changed default PostgreSQL password
- [ ] Generated strong JWT_SECRET (32+ characters)
- [ ] Configured firewall (UFW)
- [ ] Enabled SSL/HTTPS with Let's Encrypt
- [ ] Set up automatic security updates
- [ ] Configured proper CORS settings
- [ ] Enabled rate limiting in API Gateway
- [ ] Set up database backups
- [ ] Configured monitoring/alerts
- [ ] Reviewed all environment variables
- [ ] Tested OAuth flow end-to-end

---

## 🧪 Testing Deployment

### Health Checks

```bash
# API Gateway
curl https://yourdomain.com/api/health

# User Service
curl https://yourdomain.com/api/users/health

# Frontend
curl https://yourdomain.com
```

### Test OAuth Flow

1. Visit `https://yourdomain.com`
2. Click "Continue with Google"
3. Complete OAuth flow
4. Verify redirect to dashboard
5. Check user is logged in

### Load Testing

```bash
# Install Apache Bench
apt install apache2-utils -y

# Test API endpoint
ab -n 1000 -c 10 https://yourdomain.com/api/health
```

---

## 🐛 Troubleshooting

### Services won't start

```bash
# Check logs
docker-compose logs

# Restart services
docker-compose down
docker-compose up -d --build
```

### Database connection failed

```bash
# Check PostgreSQL is running
docker-compose ps postgres

# Check logs
docker-compose logs postgres

# Restart database
docker-compose restart postgres
```

### Nginx errors

```bash
# Test configuration
nginx -t

# Check logs
tail -f /var/log/nginx/error.log

# Restart Nginx
systemctl restart nginx
```

### SSL certificate issues

```bash
# Renew certificate
certbot renew

# Check certificate status
certbot certificates
```

### Out of memory

```bash
# Check memory usage
free -h

# Add more swap
fallocate -l 4G /swapfile2
chmod 600 /swapfile2
mkswap /swapfile2
swapon /swapfile2
```

---

## 📈 Monitoring Setup

### Install monitoring tools

```bash
# Install Netdata (real-time monitoring)
bash <(curl -Ss https://my-netdata.io/kickstart.sh)

# Access at: http://your-ip:19999
```

### Set up alerts

Configure email alerts for:
- High CPU usage (>80%)
- High memory usage (>90%)
- Disk space low (<10%)
- Service downtime

---

## 🚀 Quick Deploy Script

Create a deployment script:

```bash
nano /opt/deploy-digitalocean.sh
```

```bash
#!/bin/bash

echo "🚀 Deploying ProNet to DigitalOcean..."

# Navigate to project
cd /opt/ProNet

# Pull latest code
echo "📥 Pulling latest code..."
git pull origin main

# Stop services
echo "🛑 Stopping services..."
docker-compose down

# Build and start
echo "🔨 Building and starting services..."
docker-compose up -d --build

# Wait for services
echo "⏳ Waiting for services to start..."
sleep 30

# Check status
echo "✅ Checking service status..."
docker-compose ps

# Test endpoints
echo "🧪 Testing endpoints..."
curl -f http://localhost:3000/health || echo "❌ API Gateway failed"
curl -f http://localhost:3001/health || echo "❌ User Service failed"
curl -f http://localhost:3100 || echo "❌ Frontend failed"

echo "✅ Deployment complete!"
```

Make it executable:

```bash
chmod +x /opt/deploy-digitalocean.sh
```

Run deployment:

```bash
/opt/deploy-digitalocean.sh
```

---

## 📞 Support Resources

- **DigitalOcean Docs**: https://docs.digitalocean.com
- **Community Tutorials**: https://www.digitalocean.com/community/tutorials
- **Support Tickets**: https://cloud.digitalocean.com/support/tickets
- **Status Page**: https://status.digitalocean.com

---

## ✅ Post-Deployment Checklist

- [ ] All services running and healthy
- [ ] SSL certificate installed and working
- [ ] Domain pointing to droplet
- [ ] OAuth flow working correctly
- [ ] Database backups configured
- [ ] Monitoring set up
- [ ] Firewall configured
- [ ] Automatic updates enabled
- [ ] Documentation updated with URLs
- [ ] Team notified of new deployment

---

**Deployment Complete!** 🎉

Your ProNet application is now running on DigitalOcean.

**Frontend**: https://yourdomain.com
**API**: https://yourdomain.com/api
**Status**: Production Ready ✅
