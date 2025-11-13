#!/bin/bash

echo "🔧 Fixing Chat Connection Issue"
echo "================================"
echo ""

echo "🛑 Step 1: Stopping containers..."
docker-compose down

echo ""
echo "🗑️  Step 2: Removing old images..."
docker rmi pronet-frontend pronet-user-service 2>/dev/null || echo "Images already removed or don't exist"

echo ""
echo "🔨 Step 3: Rebuilding containers (this may take a few minutes)..."
docker-compose build --no-cache frontend user-service

echo ""
echo "🚀 Step 4: Starting containers..."
docker-compose up -d

echo ""
echo "⏳ Step 5: Waiting for services to start..."
sleep 15

echo ""
echo "✅ Step 6: Checking services status..."
docker-compose ps

echo ""
echo "📋 Step 7: Checking user-service logs..."
docker-compose logs --tail=30 user-service

echo ""
echo "🎯 Step 8: Verifying dependencies..."
echo "Checking backend Socket.IO..."
docker-compose exec -T user-service npm list socket.io 2>/dev/null | grep socket.io || echo "⚠️  Socket.IO not found in backend"

echo ""
echo "Checking frontend Socket.IO client..."
docker-compose exec -T frontend npm list socket.io-client 2>/dev/null | grep socket.io-client || echo "⚠️  Socket.IO client not found in frontend"

echo ""
echo "================================"
echo "✨ Done!"
echo ""
echo "🌐 Open your browser to: http://localhost:3100/chat"
echo "🔍 Open browser console (F12) to see connection status"
echo ""
echo "Expected console output:"
echo "  ✅ 'Socket connected' = Working!"
echo "  ❌ 'Socket connection error' = Check logs above"
echo ""
echo "To view live logs:"
echo "  docker-compose logs -f user-service"
echo "  docker-compose logs -f frontend"
