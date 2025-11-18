#!/bin/bash

# Script to restart services after image upload fix

echo "🔧 Restarting services after image upload fix..."
echo ""

# Check if we're in the right directory
if [ ! -d "services/user-service" ]; then
    echo "❌ Error: Please run this script from the project root directory"
    exit 1
fi

# Stop any running services
echo "⏹️  Stopping any running services..."
pkill -f "nest start" 2>/dev/null || true
pkill -f "node.*user-service" 2>/dev/null || true

# Navigate to user service
cd services/user-service

# Check if node_modules exists
if [ ! -d "node_modules" ]; then
    echo "📦 Installing dependencies..."
    npm install
fi

# Clean build directory
echo "🧹 Cleaning build directory..."
rm -rf dist

# Build the service
echo "🔨 Building service..."
npm run build

if [ $? -ne 0 ]; then
    echo "❌ Build failed! Please check for errors above."
    exit 1
fi

echo ""
echo "✅ Build successful!"
echo ""
echo "🚀 Starting user service..."
echo "   Press Ctrl+C to stop"
echo ""

# Start the service
npm run start:dev
