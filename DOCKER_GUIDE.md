# 🐳 Docker Setup Guide

## Running Everything in Docker

This guide shows you how to run the entire application (frontend + backend + databases) in Docker containers.

## 🚀 Quick Start (One Command)

```bash
./docker-start.sh
```

That's it! This will:
1. Stop any existing containers
2. Build all services (frontend, backend, databases)
3. Start everything in Docker
4. Show you the status

## 📋 Manual Commands

### Start All Services
```bash
docker-compose up --build -d
```

### Stop All Services
```bash
docker-compose down
```

Or use the script:
```bash
./docker-stop.sh
```

### View Logs
```bash
# All services
docker-compose logs -f

# Specific service
docker-compose logs -f frontend
docker-compose logs -f api-gateway
docker-compose logs -f user-service
docker-compose logs -f postgres
```

Or use the script:
```bash
# All logs
./docker-logs.sh

# Specific service
./docker-logs.sh frontend
./docker-logs.sh api-gateway
./docker-logs.sh user-service
```

### Check Status
```bash
docker-compose ps
```

### Restart a Service
```bash
docker-compose restart frontend
docker-compose restart api-gateway
docker-compose restart user-service
```

## 🌐 Access Points

Once running, access your application at:

- **Frontend**: http://localhost:3100
- **API Gateway**: http://localhost:3000
- **User Service**: http://localhost:3001

## 🔍 Verify Everything is Working

### Check in Browser
1. Open http://localhost:3100 - You should see the landing page
2. Open http://localhost:3000/health - Should return JSON
3. Open http://localhost:3001/health - Should return JSON

### Check in Terminal
```bash
# Check all containers are running
docker-compose ps

# Test API Gateway
curl http://localhost:3000/health

# Test User Service
curl http://localhost:3001/health
```

## 📊 Container List

| Container Name              | Service      | Port  | Status |
|-----------------------------|--------------|-------|--------|
| profession-frontend         | Frontend     | 3100  | ✅     |
| profession-api-gateway      | API Gateway  | 3000  | ✅     |
| profession-user-service     | User Service | 3001  | ✅     |
| profession-postgres         | PostgreSQL   | 5432  | ✅     |
| profession-redis            | Redis        | 6379  | ✅     |
| profession-mongodb          | MongoDB      | 27017 | ✅     |

## 🛠️ Useful Commands

### Rebuild a Specific Service
```bash
docker-compose up --build -d frontend
docker-compose up --build -d api-gateway
docker-compose up --build -d user-service
```

### Remove All Containers and Volumes
```bash
docker-compose down -v
```

### View Resource Usage
```bash
docker stats
```

### Execute Command in Container
```bash
# Access PostgreSQL
docker exec -it profession-postgres psql -U postgres -d profession_db

# Access Redis CLI
docker exec -it profession-redis redis-cli

# Access MongoDB Shell
docker exec -it profession-mongodb mongosh -u mongo -p mongo

# Access container shell
docker exec -it profession-frontend sh
docker exec -it profession-api-gateway sh
docker exec -it profession-user-service sh
```

## 🔧 Troubleshooting

### Problem: Containers won't start

**Solution 1**: Clean restart
```bash
docker-compose down
docker-compose up --build -d
```

**Solution 2**: Remove everything and start fresh
```bash
docker-compose down -v
docker system prune -a
./docker-start.sh
```

### Problem: Port already in use

**Solution**: Stop the conflicting service
```bash
# Find what's using the port
lsof -i :3000
lsof -i :3001
lsof -i :3100

# Kill the process
kill -9 <PID>

# Or stop all Docker containers
docker-compose down
```

### Problem: Build fails

**Solution**: Clear Docker cache and rebuild
```bash
docker-compose down
docker system prune -a
docker-compose build --no-cache
docker-compose up -d
```

### Problem: Database connection errors

**Solution**: Wait for databases to be ready
```bash
# Check database health
docker-compose ps

# View database logs
docker-compose logs postgres
docker-compose logs mongodb
docker-compose logs redis

# Restart databases
docker-compose restart postgres redis mongodb
```

### Problem: Frontend shows error

**Solution**: Check logs and rebuild
```bash
# View frontend logs
docker-compose logs frontend

# Rebuild frontend
docker-compose up --build -d frontend
```

## 📝 Development Workflow

### Making Code Changes

When you make changes to your code:

1. **Frontend changes**:
```bash
docker-compose up --build -d frontend
```

2. **API Gateway changes**:
```bash
docker-compose up --build -d api-gateway
```

3. **User Service changes**:
```bash
docker-compose up --build -d user-service
```

### Viewing Logs While Developing
```bash
# Watch all logs
docker-compose logs -f

# Watch specific service
docker-compose logs -f frontend
```

## 🎯 Quick Reference

```bash
# Start everything
./docker-start.sh

# Stop everything
./docker-stop.sh

# View logs
./docker-logs.sh

# Check status
docker-compose ps

# Restart a service
docker-compose restart <service-name>

# Rebuild and restart
docker-compose up --build -d <service-name>

# Clean everything
docker-compose down -v
```

## ✅ Success Checklist

After running `./docker-start.sh`, verify:

- [ ] All 6 containers are running (`docker-compose ps`)
- [ ] Frontend accessible at http://localhost:3100
- [ ] API Gateway health check works: http://localhost:3000/health
- [ ] User Service health check works: http://localhost:3001/health
- [ ] No errors in logs (`docker-compose logs`)

## 🎉 You're Ready!

Once all containers are running and healthy, you can:
1. Access the landing page at http://localhost:3100
2. Start implementing features
3. Make changes and rebuild as needed

---

**Pro Tip**: Keep `docker-compose logs -f` running in a separate terminal to monitor all services in real-time!
