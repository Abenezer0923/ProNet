# 🚀 Migration Guide: Vercel & Render to DigitalOcean

This guide outlines the steps to migrate your ProNet application from Vercel (Frontend) and Render (Backend/Database) to DigitalOcean.

---

## 📋 Overview

| Component | Current Host | New Host (DigitalOcean) | Migration Strategy |
|-----------|--------------|-------------------------|--------------------|
| **Frontend** | Vercel | App Platform / Droplet | Re-deploy from GitHub |
| **Backend** | Render | App Platform / Droplet | Re-deploy from GitHub |
| **Database** | Render (Postgres) | Managed Database / Droplet | Dump & Restore |
| **Redis** | Render (if used) | Managed Redis / Droplet | Re-deploy (Data loss usually acceptable) |

---

## 🛠️ Pre-Migration Checklist

1.  **DigitalOcean Account**: Ensure you have an active account with billing set up.
2.  **GitHub Access**: Ensure you have admin access to the `Abenezer0923/ProNet` repository.
3.  **Local Tools**: Install `pg_dump` and `psql` (PostgreSQL client tools) on your local machine.
4.  **Downtime**: Plan for a short maintenance window (approx. 30-60 mins) as DNS propagates and data is moved.

---

## 📦 Step 1: Database Migration (The Most Critical Part)

We need to move your data from Render to DigitalOcean.

### 1.1. Create DigitalOcean Database
1.  Go to DigitalOcean Dashboard -> **Create** -> **Databases**.
2.  Select **PostgreSQL**.
3.  Choose a plan (e.g., Basic $15/mo or Dev $7/mo for testing).
4.  Select a region close to your users.
5.  Create the database cluster.
6.  **Wait** for it to be ready.
7.  Go to the **Overview** tab of your new DB and copy the **Connection String** (choose "Public network" for now).

### 1.2. Export Data from Render
1.  Log in to your Render Dashboard.
2.  Go to your **PostgreSQL** service.
3.  Click **Connect** -> **External Connection**.
4.  Copy the `External Connection String`.
5.  Run this command in your local terminal to dump the data:
    ```bash
    pg_dump "your_render_connection_string" > pronet_backup.sql
    ```
    *Note: Replace `your_render_connection_string` with the actual URL starting with `postgres://...`*

### 1.3. Import Data to DigitalOcean
1.  Run this command to restore the data to DigitalOcean:
    ```bash
    psql "your_digitalocean_connection_string" < pronet_backup.sql
    ```
    *Note: Replace `your_digitalocean_connection_string` with the one you copied in step 1.1.*
    *If you get SSL errors, append `?sslmode=require` to the connection string.*

---

## 🚀 Step 2: Backend Migration (User Service & API Gateway)

### Option A: App Platform (Easiest)
1.  Go to **Apps** -> **Create App**.
2.  Select **GitHub** and your repo `Abenezer0923/ProNet`.
3.  **User Service**:
    *   Source Directory: `services/user-service`
    *   Env Vars: Copy from Render, but **UPDATE** `DATABASE_URL` (or individual DB vars) to point to your new DigitalOcean DB.
4.  **API Gateway**:
    *   Source Directory: `services/api-gateway`
    *   Env Vars: Update `USER_SERVICE_URL` to the internal URL of the User Service you just created in App Platform.

### Option B: Droplet (Cheaper, Full Control)
1.  Create a Droplet (Ubuntu 22.04).
2.  SSH into it.
3.  Clone your repo.
4.  Update `.env` files in `services/user-service` and `services/api-gateway` with the new Database credentials.
5.  Run `docker-compose up -d`.
    *See `DIGITALOCEAN_DEPLOYMENT.md` for detailed Droplet instructions.*

---

## 🎨 Step 3: Frontend Migration

### Option A: App Platform
1.  Add a new component to your App (or create a new App).
2.  Source Directory: `frontend`.
3.  **Environment Variables**:
    *   `NEXT_PUBLIC_API_URL`: Point to your new DigitalOcean API Gateway URL.
    *   `NEXT_PUBLIC_WS_URL`: Point to your new DigitalOcean User Service URL (for sockets).

### Option B: Droplet
1.  Update `frontend/.env.local` on your Droplet.
2.  Rebuild the frontend container: `docker-compose up -d --build frontend`.

---

## 🔄 Step 4: DNS Switch

1.  Go to your Domain Registrar (e.g., Namecheap, GoDaddy).
2.  Update the **A Records** or **CNAME Records** to point to your new DigitalOcean IP (Droplet) or App Platform URL.
3.  Wait for propagation.

---

## 🧪 Step 5: Verification

1.  **Check Logs**: Ensure backend services are running without DB connection errors.
2.  **Test Login**: Try logging in (verifies DB and Auth).
3.  **Test Real-time**: Check if chat/notifications work (verifies WebSockets).
4.  **Test File Upload**: Upload a profile picture (verifies Cloudinary - usually no change needed if using same credentials).

---

## ⚠️ Common Issues & Fixes

*   **Database Connection Error**: Check if your DigitalOcean Database allows connections from your Droplet/App (Trusted Sources). For App Platform, use the "Trusted Sources" feature.
*   **CORS Errors**: Update your Backend `CORS_ORIGIN` or `FRONTEND_URL` env var to match the new Frontend domain/URL.
*   **WebSocket Failures**: Ensure your Nginx config (on Droplet) or App Platform settings allow WebSocket upgrades.

---

> [!TIP]
> Keep your Render/Vercel services running for 24-48 hours after migration as a backup, then shut them down to avoid extra costs.
