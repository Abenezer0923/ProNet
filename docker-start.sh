#!/bin/bash

echo "🚀 Starting Professional Community Platform in Docker..."
echo ""

# Stop any existing containers
echo "🛑 Stopping existing containers..."
docker-compose down

echo ""
echo "🏗️  Building and starting all services..."
echo "This may take a few minutes on first run..."
echo ""

# Build and start all services
docker-compose up --build -d

echo ""
echo "⏳ Waiting for services to be ready..."
sleep 15

echo ""
echo "📊 Checking service status..."
docker-compose ps

echo ""
echo "✅ All services started!"
echo ""
echo "🌐 Access your application:"
echo "   Frontend:     http://localhost:3100"
echo "   API Gateway:  http://localhost:3000"
echo "   User Service: http://localhost:3001"
echo ""
echo "📝 View logs:"
echo "   All services:    docker-compose logs -f"
echo "   Frontend:        docker-compose logs -f frontend"
echo "   API Gateway:     docker-compose logs -f api-gateway"
echo "   User Service:    docker-compose logs -f user-service"
echo ""
echo "🛑 To stop all services:"
echo "   docker-compose down"
echo ""
