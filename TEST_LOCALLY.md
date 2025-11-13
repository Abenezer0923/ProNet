# 🧪 Test Locally - Quick Guide

## Option 1: Test with Docker (Recommended)

### Step 1: Start Everything
```bash
# Make sure you're in the project root
cd ~/Desktop/projects/idea/ProNet

# Start all services
./docker-start.sh

# Or manually:
docker-compose up -d
```

### Step 2: Check Services are Running
```bash
docker-compose ps

# You should see:
# - profession-postgres (healthy)
# - profession-redis (healthy)
# - profession-mongodb (healthy)
# - profession-user-service (Up)
# - profession-api-gateway (Up)
# - profession-frontend (Up)
```

### Step 3: View Logs
```bash
# View all logs
docker-compose logs -f

# Or specific service
docker-compose logs -f user-service
docker-compose logs -f api-gateway
docker-compose logs -f frontend
```

### Step 4: Test Registration

**Option A: Using Browser**
1. Open http://localhost:3100
2. Click "Get Started"
3. Fill in the form
4. Watch the logs for errors

**Option B: Using curl**
```bash
# Test User Service directly
curl -X POST http://localhost:3001/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "password123",
    "firstName": "Test",
    "lastName": "User",
    "profession": "Developer"
  }'

# Test through API Gateway
curl -X POST http://localhost:3000/api/users/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test2@example.com",
    "password": "password123",
    "firstName": "Test",
    "lastName": "User2",
    "profession": "Developer"
  }'
```

### Step 5: Check Database
```bash
# Connect to PostgreSQL
docker exec -it profession-postgres psql -U postgres -d profession_db

# List tables
\dt

# Check users table
SELECT * FROM users;

# Exit
\q
```

---

## Option 2: Test Without Docker (Manual)

### Step 1: Start PostgreSQL
```bash
# Start only the database
docker-compose up -d postgres redis mongodb
```

### Step 2: Start User Service
```bash
cd services/user-service

# Install dependencies (if not done)
npm install --legacy-peer-deps

# Start in dev mode
npm run start:dev

# You should see:
# 🚀 User Service running on http://localhost:3001
# 📊 Database: localhost:5432
```

### Step 3: Start API Gateway (New Terminal)
```bash
cd services/api-gateway

# Install dependencies (if not done)
npm install --legacy-peer-deps

# Start in dev mode
npm run start:dev

# You should see:
# 🚀 API Gateway running on http://localhost:3000
```

### Step 4: Start Frontend (New Terminal)
```bash
cd frontend

# Install dependencies (if not done)
npm install --legacy-peer-deps

# Start in dev mode
npm run dev

# You should see:
# ✓ Ready on http://localhost:3100
```

### Step 5: Test
Open http://localhost:3100 and try to register

---

## 🐛 Common Issues & Solutions

### Issue: "Cannot connect to database"
**Check:**
```bash
# Is PostgreSQL running?
docker-compose ps postgres

# Check logs
docker-compose logs postgres

# Restart if needed
docker-compose restart postgres
```

### Issue: "Port already in use"
**Solution:**
```bash
# Find what's using the port
lsof -i :3001  # User Service
lsof -i :3000  # API Gateway
lsof -i :3100  # Frontend

# Kill the process
kill -9 <PID>
```

### Issue: "Module not found"
**Solution:**
```bash
# Reinstall dependencies
cd services/user-service
rm -rf node_modules package-lock.json
npm install --legacy-peer-deps

# Same for api-gateway and frontend
```

### Issue: "Database tables not created"
**Solution:**
```bash
# Check if TypeORM is creating tables
# Look for SQL logs in user-service logs

# Manually create table (if needed)
docker exec -it profession-postgres psql -U postgres -d profession_db

CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR UNIQUE NOT NULL,
  password VARCHAR NOT NULL,
  "firstName" VARCHAR NOT NULL,
  "lastName" VARCHAR NOT NULL,
  profession VARCHAR,
  bio TEXT,
  avatar VARCHAR,
  "isActive" BOOLEAN DEFAULT true,
  "createdAt" TIMESTAMP DEFAULT NOW(),
  "updatedAt" TIMESTAMP DEFAULT NOW()
);
```

---

## 🔍 Debugging Steps

### 1. Check User Service Health
```bash
curl http://localhost:3001/health

# Should return:
# {"status":"healthy","uptime":123,"timestamp":"..."}
```

### 2. Check API Gateway Health
```bash
curl http://localhost:3000/health

# Should return:
# {"status":"healthy","uptime":123,"timestamp":"..."}
```

### 3. Test Registration Directly
```bash
# Test User Service
curl -v -X POST http://localhost:3001/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "debug@example.com",
    "password": "password123",
    "firstName": "Debug",
    "lastName": "User",
    "profession": "Tester"
  }'

# Look for:
# - HTTP status code (should be 201)
# - Response body (should have user and token)
# - Any error messages
```

### 4. Check Logs for Errors
```bash
# User Service logs
docker-compose logs user-service | grep -i error

# API Gateway logs
docker-compose logs api-gateway | grep -i error

# Frontend logs
docker-compose logs frontend | grep -i error
```

---

## 📊 Expected Behavior

### Successful Registration:
1. Frontend sends POST to API Gateway
2. API Gateway forwards to User Service
3. User Service:
   - Checks if email exists
   - Hashes password
   - Creates user in database
   - Generates JWT token
   - Returns user + token
4. Frontend stores token
5. Redirects to dashboard

### Logs You Should See:
```
user-service  | Registration attempt for: test@example.com
user-service  | Saving user to database...
user-service  | query: INSERT INTO "users"...
user-service  | User saved successfully
```

---

## ✅ Testing Checklist

- [ ] Docker containers running
- [ ] PostgreSQL healthy
- [ ] User Service responds to /health
- [ ] API Gateway responds to /health
- [ ] Frontend loads at localhost:3100
- [ ] Can see registration form
- [ ] Submit registration form
- [ ] Check browser console for errors
- [ ] Check user-service logs
- [ ] Check api-gateway logs
- [ ] Check database for new user

---

## 🎯 Quick Test Script

Save this as `test-registration.sh`:

```bash
#!/bin/bash

echo "🧪 Testing ProNet Registration..."
echo ""

# Test User Service Health
echo "1️⃣  Testing User Service..."
curl -s http://localhost:3001/health | jq .
echo ""

# Test API Gateway Health
echo "2️⃣  Testing API Gateway..."
curl -s http://localhost:3000/health | jq .
echo ""

# Test Registration
echo "3️⃣  Testing Registration..."
curl -X POST http://localhost:3001/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test-'$(date +%s)'@example.com",
    "password": "password123",
    "firstName": "Test",
    "lastName": "User",
    "profession": "Developer"
  }' | jq .

echo ""
echo "✅ Test complete!"
```

Run it:
```bash
chmod +x test-registration.sh
./test-registration.sh
```

---

**Start with Option 1 (Docker) and check the logs!** 🚀
