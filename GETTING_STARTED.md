# Getting Started Guide

## Prerequisites

Before you begin, ensure you have the following installed:
- **Docker** and **Docker Compose** (for databases)
- **Node.js** 18+ and **npm** (for backend and frontend)

## Quick Start

### Step 1: Start Infrastructure

Run the setup script to start all databases:

```bash
./setup.sh
```

This will start:
- PostgreSQL (port 5432)
- Redis (port 6379)
- MongoDB (port 27017)

### Step 2: Install Dependencies

Open 3 separate terminals and run:

**Terminal 1 - API Gateway:**
```bash
cd services/api-gateway
npm install
```

**Terminal 2 - User Service:**
```bash
cd services/user-service
npm install
```

**Terminal 3 - Frontend:**
```bash
cd frontend
npm install
```

### Step 3: Start Services

In each terminal, start the respective service:

**Terminal 1 - API Gateway:**
```bash
npm run start:dev
```

**Terminal 2 - User Service:**
```bash
npm run start:dev
```

**Terminal 3 - Frontend:**
```bash
npm run dev
```

### Step 4: Access the Application

- **Frontend**: http://localhost:3100
- **API Gateway**: http://localhost:3000
- **User Service**: http://localhost:3001

## Verify Installation

### Check API Gateway
```bash
curl http://localhost:3000/health
```

### Check User Service
```bash
curl http://localhost:3001/health
```

### Check Frontend
Open your browser and navigate to http://localhost:3100

## Troubleshooting

### Docker containers not starting
```bash
docker-compose down
docker-compose up -d
docker-compose ps
```

### Port already in use
Check if ports 3000, 3001, 3100, 5432, 6379, or 27017 are already in use:
```bash
lsof -i :3000
lsof -i :3001
lsof -i :3100
```

### Database connection issues
Make sure PostgreSQL is running:
```bash
docker-compose logs postgres
```

## Next Steps

Once everything is running:
1. Explore the landing page at http://localhost:3100
2. Check the API health endpoints
3. Start implementing user authentication
4. Build the user dashboard

## Stopping Services

To stop all services:

**Stop Docker containers:**
```bash
docker-compose down
```

**Stop Node services:**
Press `Ctrl+C` in each terminal

## Clean Start

To completely reset:
```bash
docker-compose down -v  # Remove volumes
rm -rf services/*/node_modules
rm -rf frontend/node_modules
./setup.sh
```

Then reinstall dependencies and restart services.
