# ProNet - DigitalOcean Deployment Script
# This script helps deploy ProNet to a DigitalOcean Droplet.
# 
# 🚀 MIGRATION NOTE:
# If you are migrating from Render/Vercel, this script will set up a FRESH environment.
# You must migrate your database separately using the instructions in:
# MIGRATION_GUIDE_VERCEL_RENDER_TO_DO.md
#
# This script will:
# 1. Install dependencies (Docker, Nginx, etc.)
# 2. Clone/Update the repository
# 3. Configure environment variables
# 4. Start the application

set -e

echo "🌊 ProNet DigitalOcean Deployment & Migration Helper"
echo "=================================================="
echo ""

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check if running as root
if [ "$EUID" -ne 0 ]; then 
    echo -e "${RED}❌ Please run as root (use sudo)${NC}"
    exit 1
fi

echo -e "${YELLOW}📋 This script will:${NC}"
echo "  1. Install Docker and Docker Compose"
echo "  2. Install Nginx"
echo "  3. Clone ProNet repository"
echo "  4. Configure environment variables"
echo "  5. Start all services"
echo "  6. Configure firewall"
echo ""

read -p "Continue? (y/n) " -n 1 -r
echo
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    exit 1
fi

# Update system
echo -e "${GREEN}📦 Updating system...${NC}"
apt update && apt upgrade -y

# Install Docker
echo -e "${GREEN}🐳 Installing Docker...${NC}"
if ! command -v docker &> /dev/null; then
    curl -fsSL https://get.docker.com -o get-docker.sh
    sh get-docker.sh
    rm get-docker.sh
else
    echo "Docker already installed"
fi

# Install Docker Compose
echo -e "${GREEN}🐳 Installing Docker Compose...${NC}"
if ! command -v docker-compose &> /dev/null; then
    apt install docker-compose -y
else
    echo "Docker Compose already installed"
fi

# Install Nginx
echo -e "${GREEN}🌐 Installing Nginx...${NC}"
if ! command -v nginx &> /dev/null; then
    apt install nginx -y
else
    echo "Nginx already installed"
fi

# Install Certbot
echo -e "${GREEN}🔒 Installing Certbot...${NC}"
if ! command -v certbot &> /dev/null; then
    apt install certbot python3-certbot-nginx -y
else
    echo "Certbot already installed"
fi

# Install Git
echo -e "${GREEN}📥 Installing Git...${NC}"
if ! command -v git &> /dev/null; then
    apt install git -y
else
    echo "Git already installed"
fi

# Create swap file (for 1GB RAM droplets)
echo -e "${GREEN}💾 Creating swap file...${NC}"
if [ ! -f /swapfile ]; then
    fallocate -l 2G /swapfile
    chmod 600 /swapfile
    mkswap /swapfile
    swapon /swapfile
    echo '/swapfile none swap sw 0 0' | tee -a /etc/fstab
else
    echo "Swap file already exists"
fi

# Clone repository
echo -e "${GREEN}📥 Cloning ProNet repository...${NC}"
cd /opt
if [ ! -d "ProNet" ]; then
    git clone https://github.com/Abenezer0923/ProNet.git
    cd ProNet
else
    echo "Repository already exists, pulling latest changes..."
    cd ProNet
    git pull origin main
fi

# Configure environment variables
echo ""
echo -e "${YELLOW}🔧 Environment Configuration${NC}"
echo "=================================="
echo ""

# Get domain
read -p "Enter your domain (e.g., example.com): " DOMAIN
if [ -z "$DOMAIN" ]; then
    DOMAIN="localhost"
fi

# Generate JWT secret
JWT_SECRET=$(openssl rand -base64 32)

# Get database password
read -sp "Enter PostgreSQL password (or press Enter for random): " DB_PASSWORD
echo
if [ -z "$DB_PASSWORD" ]; then
    DB_PASSWORD=$(openssl rand -base64 16)
fi

# Get Google OAuth credentials
echo ""
read -p "Enter Google Client ID: " GOOGLE_CLIENT_ID
read -sp "Enter Google Client Secret: " GOOGLE_CLIENT_SECRET
echo

# Get email credentials
echo ""
read -p "Enter email for notifications: " EMAIL_USER
read -sp "Enter email app password: " EMAIL_PASSWORD
echo

# Create User Service .env
echo -e "${GREEN}📝 Creating User Service environment file...${NC}"
cat > services/user-service/.env << EOF
PORT=3001
DATABASE_HOST=postgres
DATABASE_PORT=5432
DATABASE_USER=postgres
DATABASE_PASSWORD=${DB_PASSWORD}
DATABASE_NAME=profession_db
JWT_SECRET=${JWT_SECRET}
CLOUDINARY_CLOUD_NAME=dgl4cpuik
CLOUDINARY_API_KEY=637454513411741
CLOUDINARY_API_SECRET=7JHtL4bTAYqwq7RaQM60Ocf43fw
GOOGLE_CLIENT_ID=${GOOGLE_CLIENT_ID}
GOOGLE_CLIENT_SECRET=${GOOGLE_CLIENT_SECRET}
GOOGLE_CALLBACK_URL=https://${DOMAIN}/api/auth/google/callback
FRONTEND_URL=https://${DOMAIN}
EMAIL_USER=${EMAIL_USER}
EMAIL_PASSWORD=${EMAIL_PASSWORD}
EOF

# Create API Gateway .env
echo -e "${GREEN}📝 Creating API Gateway environment file...${NC}"
cat > services/api-gateway/.env << EOF
PORT=3000
USER_SERVICE_URL=http://user-service:3001
JWT_SECRET=${JWT_SECRET}
EOF

# Create Frontend .env
echo -e "${GREEN}📝 Creating Frontend environment file...${NC}"
cat > frontend/.env.local << EOF
NEXT_PUBLIC_API_URL=https://${DOMAIN}/api
NEXT_PUBLIC_WS_URL=https://${DOMAIN}
EOF

# Update docker-compose.yml with new password
echo -e "${GREEN}📝 Updating docker-compose.yml...${NC}"
sed -i "s/POSTGRES_PASSWORD: postgres/POSTGRES_PASSWORD: ${DB_PASSWORD}/" docker-compose.yml

# Start services
echo -e "${GREEN}🚀 Starting services...${NC}"
docker-compose down 2>/dev/null || true
docker-compose up -d --build

# Wait for services to start
echo -e "${YELLOW}⏳ Waiting for services to start (60 seconds)...${NC}"
sleep 60

# Check service status
echo -e "${GREEN}✅ Checking service status...${NC}"
docker-compose ps

# Configure Nginx
echo -e "${GREEN}🌐 Configuring Nginx...${NC}"
cat > /etc/nginx/sites-available/pronet << 'NGINX_EOF'
upstream frontend {
    server localhost:3100;
}

upstream api_gateway {
    server localhost:3000;
}

upstream user_service {
    server localhost:3001;
}

server {
    listen 80;
    server_name DOMAIN_PLACEHOLDER www.DOMAIN_PLACEHOLDER;

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

    client_max_body_size 50M;
}
NGINX_EOF

# Replace domain placeholder
sed -i "s/DOMAIN_PLACEHOLDER/${DOMAIN}/g" /etc/nginx/sites-available/pronet

# Enable site
ln -sf /etc/nginx/sites-available/pronet /etc/nginx/sites-enabled/
rm -f /etc/nginx/sites-enabled/default

# Test and restart Nginx
nginx -t
systemctl restart nginx

# Configure firewall
echo -e "${GREEN}🔒 Configuring firewall...${NC}"
ufw --force enable
ufw allow OpenSSH
ufw allow 'Nginx Full'

# Get server IP
SERVER_IP=$(curl -s ifconfig.me)

echo ""
echo -e "${GREEN}✅ Deployment Complete!${NC}"
echo "=================================="
echo ""
echo "📋 Summary:"
echo "  Server IP: ${SERVER_IP}"
echo "  Domain: ${DOMAIN}"
echo "  JWT Secret: ${JWT_SECRET}"
echo "  Database Password: ${DB_PASSWORD}"
echo ""
echo "🌐 Access your application:"
echo "  Frontend: http://${DOMAIN} (or http://${SERVER_IP})"
echo "  API: http://${DOMAIN}/api"
echo ""
echo "📝 Next Steps:"
echo "  1. Point your domain DNS to: ${SERVER_IP}"
echo "  2. Wait for DNS propagation (5-30 minutes)"
echo "  3. Run SSL setup: certbot --nginx -d ${DOMAIN} -d www.${DOMAIN}"
echo "  4. Update Google OAuth redirect URI to: https://${DOMAIN}/api/auth/google/callback"
echo "  5. Test your application"
echo ""
echo "📚 Useful Commands:"
echo "  View logs: docker-compose logs -f"
echo "  Restart services: docker-compose restart"
echo "  Stop services: docker-compose down"
echo "  Update app: cd /opt/ProNet && git pull && docker-compose up -d --build"
echo ""
echo "🔒 Security Notes:"
echo "  - Save your JWT secret and database password securely"
echo "  - Enable SSL/HTTPS before going to production"
echo "  - Configure automatic backups"
echo ""
echo -e "${GREEN}Happy deploying! 🚀${NC}"
