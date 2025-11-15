#!/bin/bash

echo "🌅 Waking up Render services..."
echo ""

echo "Pinging User Service..."
curl -s https://pronet-user-service.onrender.com > /dev/null &
PID1=$!

echo "Pinging API Gateway..."
curl -s https://pronet-api-gateway.onrender.com > /dev/null &
PID2=$!

echo ""
echo "⏳ Waiting for services to wake up (this takes 30-60 seconds)..."
echo ""

# Show a progress indicator
for i in {1..60}; do
    echo -n "."
    sleep 1
done

echo ""
echo ""
echo "✅ Services should be awake now!"
echo ""
echo "🧪 Test OAuth at: https://pro-net-ten.vercel.app"
echo ""
