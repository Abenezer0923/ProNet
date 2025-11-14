#!/bin/bash
echo "Building api-gateway with Node.js..."
npm install --legacy-peer-deps
npm run build
echo "Build complete!"
