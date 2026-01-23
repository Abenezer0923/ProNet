# Use the slim variant which is often more reliable to pull in CI/Docker Desktop
# If you prefer Alpine, you can change back to node:20-alpine.
FROM node:20-slim

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install minimal build dependencies required for some native modules
# This improves success rate when building inside Debian-slim images.
RUN apt-get update && apt-get install -y python3 make g++ --no-install-recommends \
	&& rm -rf /var/lib/apt/lists/*

# Install dependencies
RUN npm install --legacy-peer-deps

# Copy source code
COPY . .

# Build the application
RUN npm run build

# Expose port
# Default to 8000 to match common platform health-check defaults. The app
# will still use process.env.PORT if provided at runtime.
EXPOSE 8000

# Start the application
# Default PORT inside container — can be overridden by the platform via PORT env
ENV PORT=8000

CMD ["npm", "run", "start"]
