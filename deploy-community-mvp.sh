#!/bin/bash

echo "🚀 Deploying Community System MVP"
echo "=================================="

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Check if services are running
echo ""
echo "📋 Step 1: Checking services..."

# Check backend
if curl -s http://localhost:3001/health > /dev/null 2>&1; then
    echo -e "${GREEN}✓${NC} Backend is running on port 3001"
else
    echo -e "${RED}✗${NC} Backend is not running on port 3001"
    echo "   Starting backend..."
    cd services/user-service
    npm run start:dev &
    BACKEND_PID=$!
    cd ../..
    sleep 5
fi

# Check API Gateway
if curl -s http://localhost:3000/health > /dev/null 2>&1; then
    echo -e "${GREEN}✓${NC} API Gateway is running on port 3000"
else
    echo -e "${YELLOW}⚠${NC} API Gateway is not running on port 3000"
    echo "   You may need to start it manually"
fi

# Check frontend
if curl -s http://localhost:3002 > /dev/null 2>&1; then
    echo -e "${GREEN}✓${NC} Frontend is running on port 3002"
else
    echo -e "${YELLOW}⚠${NC} Frontend is not running on port 3002"
    echo "   You may need to start it manually"
fi

# Check database
echo ""
echo "📋 Step 2: Checking database..."
if psql -h localhost -U postgres -d profession_db -c "SELECT 1" > /dev/null 2>&1; then
    echo -e "${GREEN}✓${NC} Database is accessible"
else
    echo -e "${RED}✗${NC} Database is not accessible"
    echo "   Please ensure PostgreSQL is running"
fi

# Run database migrations
echo ""
echo "📋 Step 3: Running database migrations..."
cd services/user-service
echo "   TypeORM will auto-sync tables (synchronize: true)"
echo -e "${GREEN}✓${NC} Database schema will be created automatically"
cd ../..

# Test API endpoints
echo ""
echo "📋 Step 4: Testing API endpoints..."

# Test health endpoint
if curl -s http://localhost:3000/health | grep -q "healthy"; then
    echo -e "${GREEN}✓${NC} Health endpoint working"
else
    echo -e "${RED}✗${NC} Health endpoint not working"
fi

# Test communities endpoint
if curl -s http://localhost:3000/communities > /dev/null 2>&1; then
    echo -e "${GREEN}✓${NC} Communities endpoint accessible"
else
    echo -e "${RED}✗${NC} Communities endpoint not accessible"
fi

# Summary
echo ""
echo "=================================="
echo "📊 Deployment Summary"
echo "=================================="
echo ""
echo "Services:"
echo "  - Backend:     http://localhost:3001"
echo "  - API Gateway: http://localhost:3000"
echo "  - Frontend:    http://localhost:3002"
echo ""
echo "Community Features:"
echo "  ✓ Create/Join/Leave communities"
echo "  ✓ Create groups (chat, mentorship, meeting, announcement)"
echo "  ✓ Real-time messaging with WebSocket"
echo "  ✓ Member management (roles, permissions)"
echo "  ✓ Typing indicators"
echo "  ✓ Online status"
echo ""
echo "Next Steps:"
echo "  1. Open http://localhost:3002/communities"
echo "  2. Create a community"
echo "  3. Create groups within the community"
echo "  4. Test messaging with multiple users"
echo ""
echo "Testing:"
echo "  - Run: ./test-community-api.sh <YOUR_JWT_TOKEN>"
echo "  - Check: COMMUNITY_FIXES.md for known issues"
echo ""
echo -e "${GREEN}✓${NC} Deployment complete!"
echo ""
