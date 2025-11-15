# Fix Render Deployment - Docker Error

## Problem
Render is trying to use Docker to build the services instead of using the Node.js runtime specified in `render.yaml`.

**Error:**
```
error: failed to solve: failed to read dockerfile: open Dockerfile: no such file or directory
```

## Why This Happens
- Render detects Dockerfiles in the subdirectories
- It tries to use Docker build instead of the Node.js runtime
- The Dockerfiles are for local development, not for Render

## Solution Options

### Option 1: Delete and Redeploy (RECOMMENDED)

1. **Delete existing services in Render:**
   - Go to https://dashboard.render.com
   - Delete `pronet-user-service` (if exists)
   - Delete `pronet-api-gateway` (if exists)
   - Keep the database `pronet-postgres`

2. **Deploy using Blueprint:**
   - Click **"New"** → **"Blueprint"** (NOT "Web Service"!)
   - Connect repository: `Abenezer0923/ProNet`
   - Render will detect `render.yaml`
   - Click **"Apply"**
   - Wait 10-15 minutes for deployment

### Option 2: Temporarily Rename Dockerfiles

If you can't delete the services:

1. **Rename Dockerfiles:**
   ```bash
   mv services/user-service/Dockerfile services/user-service/Dockerfile.local
   mv services/api-gateway/Dockerfile services/api-gateway/Dockerfile.local
   mv frontend/Dockerfile frontend/Dockerfile.local
   ```

2. **Commit and push:**
   ```bash
   git add .
   git commit -m "temp: Rename Dockerfiles for Render deployment"
   git push origin main
   ```

3. **After deployment succeeds, rename back:**
   ```bash
   mv services/user-service/Dockerfile.local services/user-service/Dockerfile
   mv services/api-gateway/Dockerfile.local services/api-gateway/Dockerfile
   mv frontend/Dockerfile.local frontend/Dockerfile
   git add .
   git commit -m "chore: Restore Dockerfiles"
   git push origin main
   ```

### Option 3: Manual Service Configuration

If Blueprint doesn't work:

1. **Create User Service manually:**
   - Click **"New"** → **"Web Service"**
   - Connect repository
   - Settings:
     - **Name**: `pronet-user-service`
     - **Runtime**: Node
     - **Root Directory**: `services/user-service`
     - **Build Command**: `npm install --legacy-peer-deps && npm run build`
     - **Start Command**: `npm run start`
   - Add all environment variables from `render.yaml`

2. **Create API Gateway manually:**
   - Same process as above
   - **Root Directory**: `services/api-gateway`

## Verification

After deployment:

```bash
# Check if services are running
curl https://pronet-api-gateway.onrender.com/health
curl https://pronet-user-service.onrender.com/health
```

## Why Blueprint is Better

- Automatically configures all services from `render.yaml`
- Handles database connections
- Sets up environment variables
- Manages service dependencies
- One-click deployment

## Current render.yaml Configuration

The `render.yaml` is correctly configured with:
- `runtime: node` (not Docker)
- Direct npm commands (not bash scripts)
- Proper root directories
- All environment variables

## If Still Having Issues

1. **Check Render Dashboard:**
   - Look for any existing services
   - Delete them if they're using Docker

2. **Verify render.yaml is in root:**
   ```bash
   ls -la render.yaml
   ```

3. **Check for hidden Docker settings:**
   - Render might have cached the Docker detection
   - Deleting and recreating services fixes this

4. **Contact Render Support:**
   - If Blueprint still tries to use Docker
   - They can reset the service detection

## Expected Deployment Flow

1. Render clones repository
2. Detects `render.yaml` (Blueprint mode)
3. Creates PostgreSQL database
4. Creates User Service with Node runtime
5. Creates API Gateway with Node runtime
6. Runs `npm install --legacy-peer-deps && npm run build`
7. Starts services with `npm run start`
8. Services are live! ✅

## Quick Commands

```bash
# Check current Render services
# Go to: https://dashboard.render.com

# Redeploy from GitHub
# Render auto-deploys on push to main branch

# Manual trigger
# Dashboard → Service → "Manual Deploy" → "Deploy latest commit"
```

---

**Recommended Action:** Use Option 1 (Delete and Redeploy with Blueprint)
