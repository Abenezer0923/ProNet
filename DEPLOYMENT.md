# Deployment Guide

## Prerequisites

- Docker & Docker Compose installed
- Server with at least 2GB RAM
- Domain name (optional)
- SSL certificate (optional, for HTTPS)

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
