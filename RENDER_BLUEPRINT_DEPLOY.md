# 🚀 Deploy with Render Blueprint (render.yaml)

## ⚠️ Important: Use Blueprint, NOT Web Service

When deploying with `render.yaml`, you must use **Blueprint** deployment, not regular Web Service!

---

## Step-by-Step Blueprint Deployment

### Step 1: Go to Render Dashboard

1. Go to [render.com/dashboard](https://render.com/dashboard)
2. Make sure you're signed in

### Step 2: Create New Blueprint

1. Click **"New"** button (top right)
2. Select **"Blueprint"** (NOT "Web Service"!)
3. You'll see "Deploy from a Git repository"

### Step 3: Connect Repository

1. Click **"Connect account"** if not connected
2. Select **GitHub**
3. Find and select: **`Abenezer0923/ProNet`**
4. Click **"Connect"**

### Step 4: Render Detects render.yaml

Render will automatically detect `render.yaml` in your repository and show:
- ✅ pronet-postgres (Database)
- ✅ pronet-user-service (Web Service)
- ✅ pronet-api-gateway (Web Service)

### Step 5: Review and Apply

1. Review the services
2. Click **"Apply"** button
3. Wait 10-15 minutes for all services to deploy

---

## 🎯 What Happens Next

Render will:
1. Create PostgreSQL database (2-3 min)
2. Deploy User Service (5-7 min)
3. Deploy API Gateway (5-7 min)
4. Connect everything automatically

---

## ✅ After Deployment

### Get Your URLs

1. Go to Dashboard
2. Click on **pronet-api-gateway**
3. Copy the URL: `https://pronet-api-gateway.onrender.com`

### Deploy Frontend to Vercel

Now deploy frontend with the API URL:

1. Go to [vercel.com/new](https://vercel.com/new)
2. Import `Abenezer0923/ProNet`
3. Set **Root Directory**: `frontend`
4. Add Environment Variable:
   - **Name**: `NEXT_PUBLIC_API_URL`
   - **Value**: `https://pronet-api-gateway.onrender.com`
5. Click **Deploy**

---

## 🐛 Troubleshooting

### Issue: "Dockerfile not found"
**Cause**: You clicked "Web Service" instead of "Blueprint"
**Solution**: 
1. Delete the failed service
2. Go back and click **"New" → "Blueprint"**

### Issue: render.yaml not detected
**Cause**: File not in root directory or wrong format
**Solution**: 
1. Make sure `render.yaml` is in project root (not in a folder)
2. Check the file is pushed to GitHub
3. Try refreshing the page

### Issue: Services won't start
**Solution**: 
1. Check logs in Render dashboard
2. Wait 10-15 minutes (first deploy takes time)
3. Database must be ready before services start

---

## 📊 Deployment Timeline

```
0 min:  Click "Apply"
2 min:  PostgreSQL provisioning
5 min:  User Service building
7 min:  User Service starting
10 min: API Gateway building
12 min: API Gateway starting
15 min: ✅ All services running!
```

---

## 🎉 Success Checklist

- [ ] Used "Blueprint" (not "Web Service")
- [ ] Render detected render.yaml
- [ ] All 3 services shown (postgres, user-service, api-gateway)
- [ ] Clicked "Apply"
- [ ] Waited 15 minutes
- [ ] All services show "Live" status
- [ ] Copied API Gateway URL
- [ ] Deployed frontend to Vercel
- [ ] Frontend has correct API URL
- [ ] Can register and login

---

## 💡 Pro Tips

1. **Always use Blueprint** when you have render.yaml
2. **Wait patiently** - First deploy takes 10-15 minutes
3. **Check logs** if something fails
4. **Database first** - Services wait for database to be ready
5. **Free tier sleeps** - First request takes 30-60 seconds

---

## � Quiick Links

- **Render Dashboard**: https://dashboard.render.com
- **Render Docs**: https://render.com/docs/blueprint-spec
- **Your Repo**: https://github.com/Abenezer0923/ProNet

---

**Remember: Use "Blueprint", not "Web Service"!** 🎯
