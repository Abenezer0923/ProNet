#!/bin/bash

echo "🚀 Deploying Authentication Fix to Render"
echo "=========================================="
echo ""

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Check if git is clean
if [[ -n $(git status -s) ]]; then
    echo -e "${YELLOW}⚠️  You have uncommitted changes${NC}"
    echo ""
    git status -s
    echo ""
    read -p "Do you want to commit these changes? (y/n) " -n 1 -r
    echo ""
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        echo ""
        echo "📝 Committing changes..."
        git add .
        git commit -m "Fix: Authentication system with keep-alive strategy

- Add health check endpoints (/health, /health/ping, /health/ready)
- Improve email service with fallback to console logging
- Update email service to work without RESEND_API_KEY
- Add GitHub Actions workflow for keep-alive
- Add comprehensive documentation for setup
- Support both personal and organizational registration
- Improve OTP generation and verification
- Add forgot password and reset password flows
- Update Google OAuth with OTP verification"
        echo -e "${GREEN}✓ Changes committed${NC}"
    else
        echo -e "${RED}✗ Deployment cancelled${NC}"
        exit 1
    fi
fi

echo ""
echo "🔍 Pre-deployment Checklist"
echo "---------------------------"

# Check if health controller exists
if [ -f "services/user-service/src/health/health.controller.ts" ]; then
    echo -e "${GREEN}✓${NC} Health controller exists"
else
    echo -e "${RED}✗${NC} Health controller missing"
    exit 1
fi

# Check if email service is updated
if grep -q "emailProvider" "services/user-service/src/auth/email.service.ts"; then
    echo -e "${GREEN}✓${NC} Email service updated"
else
    echo -e "${RED}✗${NC} Email service not updated"
    exit 1
fi

# Check if GitHub Actions workflow exists
if [ -f ".github/workflows/keep-alive.yml" ]; then
    echo -e "${GREEN}✓${NC} GitHub Actions workflow exists"
else
    echo -e "${YELLOW}⚠${NC} GitHub Actions workflow missing (optional)"
fi

echo ""
echo "📤 Pushing to GitHub..."
echo "----------------------"

# Push to GitHub
git push origin main

if [ $? -eq 0 ]; then
    echo -e "${GREEN}✓ Pushed to GitHub successfully${NC}"
else
    echo -e "${RED}✗ Failed to push to GitHub${NC}"
    exit 1
fi

echo ""
echo "⏳ Waiting for Render to deploy..."
echo "----------------------------------"
echo ""
echo "Render will automatically deploy from GitHub."
echo "This usually takes 2-5 minutes."
echo ""
echo -e "${BLUE}📊 Monitor deployment:${NC}"
echo "   https://dashboard.render.com"
echo ""

# Wait a bit
sleep 5

echo "🔄 Checking deployment status..."
echo ""

# Try to ping the service every 30 seconds
MAX_ATTEMPTS=20
ATTEMPT=0

while [ $ATTEMPT -lt $MAX_ATTEMPTS ]; do
    ATTEMPT=$((ATTEMPT + 1))
    echo -n "   Attempt $ATTEMPT/$MAX_ATTEMPTS: "
    
    RESPONSE=$(curl -s -o /dev/null -w "%{http_code}" "https://pronet-user-service.onrender.com/api/health")
    
    if [ "$RESPONSE" == "200" ]; then
        echo -e "${GREEN}✓ Service is live!${NC}"
        break
    else
        echo -e "${YELLOW}⏳ Waiting... (Status: $RESPONSE)${NC}"
        sleep 30
    fi
done

if [ $ATTEMPT -eq $MAX_ATTEMPTS ]; then
    echo ""
    echo -e "${RED}⚠️  Service didn't respond after $MAX_ATTEMPTS attempts${NC}"
    echo "   Please check Render dashboard for deployment status"
    echo "   https://dashboard.render.com"
    exit 1
fi

echo ""
echo "🧪 Testing deployed service..."
echo "------------------------------"

# Test health endpoints
echo -n "   /health: "
HEALTH=$(curl -s "https://pronet-user-service.onrender.com/api/health")
if echo "$HEALTH" | grep -q "ok"; then
    echo -e "${GREEN}✓ OK${NC}"
else
    echo -e "${RED}✗ FAILED${NC}"
fi

echo -n "   /health/ping: "
PING=$(curl -s "https://pronet-user-service.onrender.com/api/health/ping")
if echo "$PING" | grep -q "alive"; then
    echo -e "${GREEN}✓ OK${NC}"
else
    echo -e "${RED}✗ FAILED${NC}"
fi

echo -n "   /health/ready: "
READY=$(curl -s "https://pronet-user-service.onrender.com/api/health/ready")
if echo "$READY" | grep -q "ready"; then
    echo -e "${GREEN}✓ OK${NC}"
else
    echo -e "${RED}✗ FAILED${NC}"
fi

echo ""
echo "=========================================="
echo -e "${GREEN}✅ Deployment Complete!${NC}"
echo "=========================================="
echo ""
echo "📋 Next Steps:"
echo ""
echo "1️⃣  Setup Cron Jobs (Keep-Alive)"
echo "   Follow: CRON_SETUP_GUIDE.md"
echo "   Quick: https://cron-job.org"
echo ""
echo "2️⃣  Configure Email Service (Optional)"
echo "   Follow: EMAIL_SERVICE_SETUP.md"
echo "   Get API key: https://resend.com"
echo ""
echo "3️⃣  Update Google OAuth Settings"
echo "   Add callback URL to Google Console:"
echo "   https://pronet-user-service.onrender.com/api/auth/google/callback"
echo ""
echo "4️⃣  Update Render Environment Variables"
echo "   Go to: https://dashboard.render.com"
echo "   Add/Update:"
echo "   - GOOGLE_CALLBACK_URL=https://pronet-user-service.onrender.com/api/auth/google/callback"
echo "   - FRONTEND_URL=https://pro-net-ten.vercel.app"
echo "   - RESEND_API_KEY=re_... (optional)"
echo ""
echo "5️⃣  Test Authentication System"
echo "   Run: ./test-auth-system.sh prod"
echo ""
echo "🔗 Useful Links:"
echo "   - Service: https://pronet-user-service.onrender.com"
echo "   - Health: https://pronet-user-service.onrender.com/api/health"
echo "   - Frontend: https://pro-net-ten.vercel.app"
echo "   - Render: https://dashboard.render.com"
echo ""
echo "📚 Documentation:"
echo "   - AUTH_FIX_IMPLEMENTATION.md"
echo "   - CRON_SETUP_GUIDE.md"
echo "   - EMAIL_SERVICE_SETUP.md"
echo ""
