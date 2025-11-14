#!/bin/bash
echo "Building user-service with Node.js..."
npm install --legacy-peer-deps
npm run build
echo "Build complete!"
