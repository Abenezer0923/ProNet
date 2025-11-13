# 🚀 FREE Deployment Guide - ProNeemo

## 🎯 Best FREE Optionsfor Demo

All optiour depow are **100% FREE** - perfemos, portfolios, aning!

1. **[Vercel]+ Render](#option-1-ver- Frontnder-recommended)** D
2. **[Railway](#option-2-railway-all-in-oul)** - All-in-one solution
3. **[Render]Only](#option-3-render-o Full* - Simple full-stack

---

## 📦 Whatying

- ✅ Fronteent Setup
- ✅ API Gateway (NestJS)
- ✅ User Ser:(NestJ
- ✅ FrstgreSQL extabase
- ✅ Redis cacay (Nptional forrt 300

- ✅

## Option 1: Verloyment (Frr tend OnENDED) ⭐

**Why?** 1: cel is the BESndt.js, Render is grbackend + 

### Part A: Deploy Backend to Render (5 minutes
cd frontend
ep 1: Createccount
1. Go to [render.com](https://renr.com)
2. Sign upel.jsoGitHub (FREE)

#### Step 2: Dd":oy PostgreSQL Database
1. Click "New +" → "PostgreSQL"
  "fame: `pr": t-db`
3. Dat": se: `profession
4. User: `postgres`
5 }: Choose closest to you
6. FREE**
7. Click "Creabase"
```he Inrnal Database URL**h `postgres://`)

####Step 2: Deplloy User cel
1. Click w +" → "Web Service"
2. Connect your GitHub reenezer0923/ProNet`
# Inste: `pronet-uLIvice`
4. Roostallectory: `servicr-service`
Buildmmand: `npm install --legacy-pepm run buil
6. Start Command: `npm run st
verceln: **FREE**
8. Addronment Variables:
   eploy
   PORT=3001
   DATABAST=<from-render-postgr

### Step 3: Configure Environment Variables

In Vercel Dashboard:
1. Go to Project Settings
2. Add Environment Variable:
   - `NEXT_PUBLIC_API_URL` = Your backend URL

**Cost**: FREE ✅

---

## 2. Railway Deployment (Full Stack)

### Step 1: Install Railway CLI

```bash
npm install -g @railway/cli
railway login
```

### Step 2: Create railway.json

```bash
cat > railway.json << 'EOF'
{
  "$schema": "https://railway.app/railway.schema.json",
  "build": {
    "builder": "NIXPACKS"
  },
  "deploy": {
    "startCommand": "docker-compose up",
    "restartPolicyType": "ON_FAILURE",
    "restartPolicyMaxRetries": 10
  }
}
EOF
```

### Step 3: Deploy Services

```bash
# Initialize Railway project
railway init

# Deploy PostgreSQL
railway add postgresql

# Deploy Redis
railway add redis

# Deploy Frontend
cd frontend
railway up

# Deploy API Gateway
cd ../services/api-gateway
railway up

# Deploy User Service
cd ../user-service
railway up
```

### Step 4: Link Services

```bash
# Get database URL
railway variables

# Set environment variables
railway variables set DATABASE_URL=<postgres-url>
railway variables set REDIS_URL=<redis-url>
```

**Cost**: FREE (500 hours/month) ✅

---

## 3. Render Deployment (Full Stack)

### Step 1: Create render.yaml

```yaml
services:
  # PostgreSQL
  - type: pserv
    name: pronet-postgres
    env: docker
    plan: free
    
  # Redis
  - type: redis
    name: pronet-redis
    plan: free
    
  # User Service
  - type: web
    name: pronet-user-service
    env: node
    buildCommand: cd services/user-service && npm install && npm run build
    startCommand: cd services/user-service && npm start
    envVars:
      - key: DATABASE_URL
        fromDatabase:
          name: pronet-postgres
          property: connectionString
      - key: JWT_SECRET
        generateValue: true
    
  # API Gateway
  - type: web
    name: pronet-api-gateway
    env: node
    buildCommand: cd services/api-gateway && npm install && npm run build
    startCommand: cd services/api-gateway && npm start
    envVars:
      - key: USER_SERVICE_URL
        value: https://pronet-user-service.onrender.com
    
  # Frontend
  - type: web
    name: pronet-frontend
    env: node
    buildCommand: cd frontend && npm install && npm run build
    startCommand: cd frontend && npm start
    envVars:
      - key: NEXT_PUBLIC_API_URL
        value: https://pronet-api-gateway.onrender.com
```

### Step 2: Deploy

1. Push code to GitHub
2. Go to [render.com](https://render.com)
3. Click "New" → "Blueprint"
4. Connect your GitHub repo
5. Render will auto-deploy from `render.yaml`

**Cost**: FREE ✅

---

## 4. DigitalOcean Deployment (VPS)

### Step 1: Create Droplet

```bash
# Create Ubuntu 22.04 droplet (2GB RAM minimum)
# Cost: $6/month
```

### Step 2: SSH and Setup

```bash
# SSH into droplet
ssh root@your-droplet-ip

# Update system
apt update && apt upgrade -y

# Install Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sh get-docker.sh

# Install Docker Compose
apt install docker-compose -y

# Clone repository
git clone https://github.com/Abenezer0923/ProNet.git
cd ProNet
```

### Step 3: Configure Environment

```bash
# Update environment variables
nano services/user-service/.env
# Change JWT_SECRET, DATABASE_PASSWORD

nano services/api-gateway/.env
# Update USER_SERVICE_URL

nano frontend/.env.local
# Update NEXT_PUBLIC_API_URL to your domain
```

### Step 4: Start Services

```bash
# Start all services
docker-compose up -d

# Check status
docker-compose ps

# View logs
docker-compose logs -f
```

### Step 5: Configure Domain (Optional)

```bash
# Install Nginx
apt install nginx -y

# Create Nginx config
nano /etc/nginx/sites-available/pronet
```

```nginx
server {
    listen 80;
    server_name your-domain.com;

    location / {
        proxy_pass http://localhost:3100;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }

    location /api {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

```bash
# Enable site
ln -s /etc/nginx/sites-available/pronet /etc/nginx/sites-enabled/
nginx -t
systemctl restart nginx

# Install SSL (Let's Encrypt)
apt install certbot python3-certbot-nginx -y
certbot --nginx -d your-domain.com
```

**Cost**: $6/month 💰

---

## 5. AWS Deployment

### Option A: AWS Elastic Beanstalk

```bash
# Install EB CLI
pip install awsebcli

# Initialize
eb init -p docker pronet

# Create environment
eb create pronet-prod

# Deploy
eb deploy
```

### Option B: AWS ECS (Docker)

1. Push images to ECR
2. Create ECS cluster
3. Define task definitions
4. Create services
5. Configure load balancer

**Cost**: Pay as you go 💰

---

## 🔧 Environment Variables

### Frontend (.env.local)
```bash
NEXT_PUBLIC_API_URL=https://your-api-url.com
```

### API Gateway (.env)
```bash
PORT=3000
JWT_SECRET=your-super-secret-key-change-this
USER_SERVICE_URL=http://user-service:3001
```

### User Service (.env)
```bash
PORT=3001
DATABASE_HOST=your-db-host
DATABASE_PORT=5432
DATABASE_USER=postgres
DATABASE_PASSWORD=your-secure-password
DATABASE_NAME=profession_db
JWT_SECRET=same-as-api-gateway
```

---

## 📊 Deployment Comparison

| Platform | Difficulty | Cost | Best For |
|----------|-----------|------|----------|
| Vercel | ⭐ Easy | FREE | Frontend only |
| Railway | ⭐⭐ Easy | FREE | Full stack, quick deploy |
| Render | ⭐⭐ Easy | FREE | Full stack, auto-deploy |
| DigitalOcean | ⭐⭐⭐ Medium | $6/mo | Full control, production |
| AWS | ⭐⭐⭐⭐ Hard | Variable | Enterprise, scalable |

---

## 🎯 Recommended Approach

### For Testing/Demo:
1. Deploy Frontend to **Vercel** (FREE)
2. Deploy Backend to **Railway** or **Render** (FREE)

### For Production:
1. Deploy everything to **DigitalOcean** ($6/month)
2. Use managed databases (PostgreSQL, Redis)
3. Set up SSL with Let's Encrypt
4. Configure backups

---

## Local Deployment

```bash
# Clone the repository
git clone https://github.com/Abenezer0923/ProNet.git
cd ProNet

# Start all services
./docker-start.sh

# Access the application
# Frontend: http://localhost:3100
# API: http://localhost:3000
```

## Production Deployment

### 1. Server Setup

```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh

# Install Docker Compose
sudo apt install docker-compose -y

# Clone repository
git clone https://github.com/Abenezer0923/ProNet.git
cd ProNet
```

### 2. Environment Configuration

```bash
# Update environment variables
nano services/api-gateway/.env
nano services/user-service/.env
nano frontend/.env.local

# Important: Change JWT_SECRET in production!
```

### 3. Start Services

```bash
# Build and start
docker-compose up --build -d

# Check status
docker-compose ps

# View logs
docker-compose logs -f
```

### 4. Configure Nginx (Optional)

```nginx
server {
    listen 80;
    server_name your-domain.com;

    location / {
        proxy_pass http://localhost:3100;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }

    location /api {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

### 5. SSL with Let's Encrypt

```bash
# Install Certbot
sudo apt install certbot python3-certbot-nginx -y

# Get certificate
sudo certbot --nginx -d your-domain.com

# Auto-renewal
sudo certbot renew --dry-run
```

## Docker Hub Deployment

### 1. Build and Tag Images

```bash
# Build images
docker-compose build

# Tag images
docker tag pronet_frontend:latest yourusername/pronet-frontend:latest
docker tag pronet_api-gateway:latest yourusername/pronet-api-gateway:latest
docker tag pronet_user-service:latest yourusername/pronet-user-service:latest
```

### 2. Push to Docker Hub

```bash
# Login
docker login

# Push images
docker push yourusername/pronet-frontend:latest
docker push yourusername/pronet-api-gateway:latest
docker push yourusername/pronet-user-service:latest
```

## Cloud Deployment

### AWS EC2

1. Launch EC2 instance (Ubuntu 22.04, t2.medium)
2. Configure security groups (ports 80, 443, 22)
3. SSH into instance
4. Follow "Production Deployment" steps above

### DigitalOcean

1. Create Droplet (Ubuntu 22.04, 2GB RAM)
2. Add SSH key
3. SSH into droplet
4. Follow "Production Deployment" steps above

### Heroku

```bash
# Install Heroku CLI
curl https://cli-assets.heroku.com/install.sh | sh

# Login
heroku login

# Create apps
heroku create pronet-frontend
heroku create pronet-api
heroku create pronet-user-service

# Add PostgreSQL
heroku addons:create heroku-postgresql:hobby-dev -a pronet-user-service

# Deploy
git push heroku main
```

## Monitoring

### View Logs

```bash
# All services
docker-compose logs -f

# Specific service
docker-compose logs -f frontend
docker-compose logs -f api-gateway
docker-compose logs -f user-service
```

### Check Resource Usage

```bash
docker stats
```

### Database Backup

```bash
# Backup PostgreSQL
docker exec profession-postgres pg_dump -U postgres profession_db > backup.sql

# Restore
docker exec -i profession-postgres psql -U postgres profession_db < backup.sql
```

## Scaling

### Horizontal Scaling

```bash
# Scale services
docker-compose up -d --scale user-service=3
docker-compose up -d --scale api-gateway=2
```

### Load Balancer

Use Nginx or HAProxy to distribute traffic across multiple instances.

## Troubleshooting

### Services won't start

```bash
docker-compose down
docker-compose up --build -d
```

### Database connection issues

```bash
docker-compose logs postgres
docker-compose restart postgres
```

### Out of memory

```bash
# Increase Docker memory limit
# Or upgrade server RAM
```

## Security Checklist

- [ ] Change default passwords
- [ ] Update JWT_SECRET
- [ ] Enable HTTPS
- [ ] Configure firewall
- [ ] Set up backups
- [ ] Enable rate limiting
- [ ] Update dependencies regularly
- [ ] Monitor logs for suspicious activity

## Maintenance

### Update Application

```bash
cd ProNet
git pull origin main
docker-compose down
docker-compose up --build -d
```

### Clean Up

```bash
# Remove unused images
docker system prune -a

# Remove unused volumes
docker volume prune
```

---

For questions or issues, open a GitHub issue or contact the maintainers.


---

## 🚀 Quick Deploy Scripts

### Deploy to Vercel (Frontend)

```bash
# Create deploy-vercel.sh
cat > deploy-vercel.sh << 'EOF'
#!/bin/bash
echo "🚀 Deploying Frontend to Vercel..."
cd frontend
npm install -g vercel
vercel --prod
echo "✅ Deployed! Check your Vercel dashboard"
EOF

chmod +x deploy-vercel.sh
./deploy-vercel.sh
```

### Deploy to Railway (Full Stack)

```bash
# Create deploy-railway.sh
cat > deploy-railway.sh << 'EOF'
#!/bin/bash
echo "🚀 Deploying to Railway..."
npm install -g @railway/cli
railway login
railway init
railway up
echo "✅ Deployed! Check your Railway dashboard"
EOF

chmod +x deploy-railway.sh
./deploy-railway.sh
```

---

## 🔒 Security Checklist

Before deploying to production:

- [ ] Change all default passwords
- [ ] Update JWT_SECRET to a strong random string
- [ ] Enable HTTPS/SSL
- [ ] Configure CORS properly
- [ ] Set up firewall rules
- [ ] Enable rate limiting
- [ ] Set up database backups
- [ ] Configure monitoring
- [ ] Review environment variables
- [ ] Test authentication flow

---

## 📈 Monitoring & Maintenance

### Health Checks

```bash
# Check API Gateway
curl https://your-api-url.com/health

# Check User Service
curl https:/-urlers/healthheck Fronnd
curl httpour-frontend-url.c
```

### Vie``bash
# Docker logs
dcompose lo service
dockeogs -f frontend
docker-compose loapi-gatewa-compose logser-service
```

### Database Backh
# Backup PostgreSQL
docker exe-postgres pg_dump -Ues profession_db > backup-$(date +%
# Restoreker exec -i profession-postgres psql -U postgres profebackup-20240101.sql
```

---
ubleshooting

### Frontend can't conend
- Check `NEXT_PUBC_API_URL` environle
- Verify CORS settings ateway
-rk/firews

### Database connection failed
- Verify DAT Check database i
- Verify credent

### Set start
``sher-compo
docker-compose up  -d
docker-compose logs
```

### Out of memory
 server RAM
- Optimize Docimits
- Use mbases

---

## 📞 Support

- **Isss**: https:/ithub.com/Abenezer0923/ProNet/issues
- **Docume: Che.md files in the repo
- **Community*b Discussio

## 🎉 Next Steps After De

1. Test authcation flow
2. Create test accounts
3.nitor peance
4. Set up antics
n feature roll

---

**Ready to deploy? Choose your platfove and follow the steps
