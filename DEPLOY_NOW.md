# 🚀 Deploy ProNet NOW - Step by Step

## Option 1: Manual Render Setup (Easiest)

Since Render isn't detecting `render.yaml`, let's deploy manually:

---

## Step 1: Deploy PostgreSQL Database

1. Go to [render.com](https://render.com/dashboard)
2. Click "New" → "PostgreSQL"
3. Fill in:
   - **Name**: `pronet-postgres`
   - **Database**: `profession_db`
   - **User**: `postgres`
   - **Region**: Choose closest to you
   - **Plan**: **Free**
4. Click "Create Database"
5. Wait 2-3 minutes
6. **Copy the Internal Database URL** (you'll need this!)

---

## Step 2: Deploy User Service

1. Click "New" → "Web Service"
2. Connect your GitHub: `Abenezer0923/ProNet`
3. **IMPORTANT**: When Render detects Dockerfile, click "Configure" to change settings
4. Fill in:
   - **Name**: `pronet-user-service`
   - **Region**: Same as database
   - **Environment**: **Node** (NOT Docker!)
   - **Root Directory**: `services/user-service`
   - **Build Command**: `npm install --legacy-peer-deps && npm run build`
   - **Start Command**: `npm run start`
   - **Plan**: **Free**

4. Click "Advanced" → Add Environment Variables:
   ```
   PORT = 3001
   DATABASE_HOST = <from your postgres internal URL>
   DATABASE_PORT = 5432
   DATABASE_USER = postgres
   DATABASE_PASSWORD = <from your postgres>
   DATABASE_NAME = profession_db
   JWT_SECRET = your-super-secret-key-change-this-12345
   ```

5. Click "Create Web Service"
6. Wait 5-10 minutes
7. **Copy the service URL**: `https://pronet-user-service.onrender.com`

---

## Step 3: Deploy API Gateway

1. Click "New" → "Web Service"
2. Connect your GitHub: `Abenezer0923/ProNet`
3. **IMPORTANT**: When Render detects Dockerfile, click "Configure" to change settings
4. Fill in:
   - **Name**: `pronet-api-gateway`
   - **Region**: Same as others
   - **Environment**: **Node** (NOT Docker!)
   - **Root Directory**: `services/api-gateway`
   - **Build Command**: `npm install --legacy-peer-deps && npm run build`
   - **Start Command**: `npm run start`
   - **Plan**: **Free**

4. Add Environment Variables:
   ```
   PORT = 3000
   JWT_SECRET = your-super-secret-key-change-this-12345
   USER_SERVICE_URL = https://pronet-user-service.onrender.com
   ```

5. Click "Create Web Service"
6. Wait 5-10 minutes
7. **Copy the service URL**: `https://pronet-api-gateway.onrender.com`

---

## Step 4: Deploy Frontend to Vercel

1. Go to [vercel.com/new](https://vercel.com/new)
2. Import `Abenezer0923/ProNet`
3. Configure:
   - **Root Directory**: `frontend`
   - **Framework Preset**: Next.js
   - **Build Command**: Leave default
   - **Output Directory**: Leave default

4. Add Environment Variable:
   - **Name**: `NEXT_PUBLIC_API_URL`
   - **Value**: `https://pronet-api-gateway.onrender.com`

5. Click "Deploy"
6. Wait 2-3 minutes
7. **Your app is live!** 🎉

---

## 🎯 Quick Reference

### What to enter in Render:

**User Service:**
```
Root Directory: services/user-service
Build Command: npm install --legacy-peer-deps && npm run build
Start Command: npm run start
```

**API Gateway:**
```
Root Directory: services/api-gateway
Build Command: npm install --legacy-peer-deps && npm run build
Start Command: npm run start
```

**Frontend (Vercel):**
```
Root Directory: frontend
Framework: Next.js
```

---

## 🔧 Getting Database Connection Info

After creating PostgreSQL on Render:

1. Go to your database dashboard
2. Scroll down to "Connections"
3. Copy these values:
   - **Internal Database URL**: Use this for services
   - **Host**: For DATABASE_HOST
   - **Port**: Usually 5432
   - **Database**: profession_db
   - **Username**: postgres
   - **Password**: Auto-generated

---

## ⚠️ Important Notes

1. **Free tier services sleep after 15 min** - First request takes 30-60s
2. **Use same JWT_SECRET** for both API Gateway and User Service
3. **Use Internal Database URL** for better performance
4. **Wait for each service** to deploy before moving to next

---

## 🐛 Troubleshooting

### Build fails on Render
**Solution**: Check build logs. Usually it's:
- Missing dependencies → Use `--legacy-peer-deps`
- Wrong directory → Check Root Directory setting

### Can't connect to database
**Solution**: 
- Use Internal Database URL (not External)
- Check all DATABASE_* variables are set correctly

### Frontend can't reach backend
**Solution**:
- Check NEXT_PUBLIC_API_URL is correct
- Check CORS settings in API Gateway

### Service shows "Service Unavailable"
**Solution**: 
- Wait 30-60 seconds (cold start)
- Check service logs in Render dashboard

---

## ✅ Deployment Checklist

- [ ] PostgreSQL database created
- [ ] Database connection info copied
- [ ] User Service deployed with correct env vars
- [ ] User Service URL copied
- [ ] API Gateway deployed with User Service URL
- [ ] API Gateway URL copied
- [ ] Frontend deployed to Vercel
- [ ] Frontend has API Gateway URL in env
- [ ] Test: Can register new account
- [ ] Test: Can login
- [ ] Test: Dashboard loads

---

## 🎉 Success!

Your URLs:
```
Frontend: https://pronet-<random>.vercel.app
API: https://pronet-api-gateway.onrender.com
```

**Total Cost: $0/month** 🎊

---

## 📞 Need Help?

If you get stuck:
1. Check Render service logs
2. Check Vercel deployment logs
3. Verify all environment variables
4. Make sure services are running (not sleeping)

---

**Let's deploy! Follow the steps above one by one.** 🚀
