# Google OAuth URLs - Quick Reference

## 🔑 Your Google OAuth Credentials

```
Client ID: 1075769500266-h4qk4amb9du8pl4tnk3beht03dak9sju.apps.googleusercontent.com
Client Secret: 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
```

---

## 🌐 URLs Configuration

### Local Development

**Frontend URL:**
```
http://localhost:3000
```

**Backend URL:**
```
http://localhost:3001
```

**Google Callback URL:**
```
http://localhost:3001/api/auth/google/callback
```

**Frontend Redirect After OAuth:**
```
http://localhost:3000/auth/callback
```

---

### Production (Render + Vercel)

**Frontend URL (Vercel):**
```
https://your-app-name.vercel.app
```
*Replace `your-app-name` with your actual Vercel app name*

**Backend User Service URL (Render):**
```
https://pronet-user-service.onrender.com
```

**Backend API Gateway URL (Render):**
```
https://pronet-api-gateway.onrender.com
```

**Google Callback URL (Production):**
```
https://pronet-user-service.onrender.com/api/auth/google/callback
```

**Frontend Redirect After OAuth (Production):**
```
https://your-app-name.vercel.app/auth/callback
```

---

## 📝 Google Cloud Console Configuration

### Authorized Redirect URIs

Add these in Google Cloud Console → APIs & Services → Credentials → OAuth 2.0 Client ID:

```
http://localhost:3001/api/auth/google/callback
https://pronet-user-service.onrender.com/api/auth/google/callback
```

### Authorized JavaScript Origins

Add these for CORS:

```
http://localhost:3000
https://your-app-name.vercel.app
```

---

## 🔄 OAuth Flow

### Local Development Flow

1. User clicks "Continue with Google" on `http://localhost:3000`
2. Redirected to: `http://localhost:3001/api/auth/google`
3. Google OAuth consent screen
4. Google redirects to: `http://localhost:3001/api/auth/google/callback`
5. Backend generates JWT token
6. Redirects to: `http://localhost:3000/auth/callback?token=xxx`
7. Frontend stores token and redirects to dashboard

### Production Flow

1. User clicks "Continue with Google" on `https://your-app-name.vercel.app`
2. Redirected to: `https://pronet-user-service.onrender.com/api/auth/google`
3. Google OAuth consent screen
4. Google redirects to: `https://pronet-user-service.onrender.com/api/auth/google/callback`
5. Backend generates JWT token
6. Redirects to: `https://your-app-name.vercel.app/auth/callback?token=xxx`
7. Frontend stores token and redirects to dashboard

---

## ⚙️ Environment Variables

### services/user-service/.env (Local)

```env
GOOGLE_CLIENT_ID=1075769500266-h4qk4amb9du8pl4tnk3beht03dak9sju.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=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
GOOGLE_CALLBACK_URL=http://localhost:3001/api/auth/google/callback
FRONTEND_URL=http://localhost:3000
```

### Render - User Service (Production)

```env
GOOGLE_CLIENT_ID=1075769500266-h4qk4amb9du8pl4tnk3beht03dak9sju.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=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
GOOGLE_CALLBACK_URL=https://pronet-user-service.onrender.com/api/auth/google/callback
FRONTEND_URL=https://your-app-name.vercel.app
```

### frontend/.env.local (Local)

```env
NEXT_PUBLIC_API_URL=http://localhost:3000
NEXT_PUBLIC_WS_URL=http://localhost:3001
```

### Vercel - Frontend (Production)

```env
NEXT_PUBLIC_API_URL=https://pronet-api-gateway.onrender.com
NEXT_PUBLIC_WS_URL=https://pronet-user-service.onrender.com
```

---

## 🧪 Testing URLs

### Test Local OAuth

```bash
# Start services
docker-compose up

# Visit
http://localhost:3000

# Click "Continue with Google"
# Should redirect through OAuth flow
```

### Test Production OAuth

```bash
# Visit your Vercel URL
https://your-app-name.vercel.app

# Click "Continue with Google"
# Should redirect through OAuth flow
```

### Test API Endpoints

```bash
# Local
curl http://localhost:3001/api/auth/google

# Production
curl https://pronet-user-service.onrender.com/api/auth/google
```

---

## 🔍 Debugging

### Check if OAuth is configured correctly

**Local:**
```bash
# Check environment variables
cd services/user-service
cat .env | grep GOOGLE
```

**Production (Render):**
1. Go to Render Dashboard
2. Click on pronet-user-service
3. Go to Environment tab
4. Verify GOOGLE_* variables are set

### Common Issues

**Issue: "Redirect URI mismatch"**
- Check Google Console redirect URIs match exactly
- No trailing slashes
- Protocol must match (http vs https)

**Issue: "Origin not allowed"**
- Add JavaScript origins in Google Console
- Must match your frontend URL exactly

**Issue: "Invalid client"**
- Verify Client ID and Secret are correct
- Check for extra spaces or line breaks

---

## 📋 Deployment Checklist

### Before Deploying

- [ ] Google OAuth credentials obtained
- [ ] Local OAuth tested and working
- [ ] Environment variables configured locally

### Deploy Backend (Render)

- [ ] Deploy using Blueprint
- [ ] Wait for services to be "Live"
- [ ] Copy User Service URL
- [ ] Copy API Gateway URL
- [ ] Add Google OAuth environment variables
- [ ] Set FRONTEND_URL (will update after Vercel deploy)

### Deploy Frontend (Vercel)

- [ ] Import project from GitHub
- [ ] Set root directory to `frontend`
- [ ] Add NEXT_PUBLIC_API_URL
- [ ] Add NEXT_PUBLIC_WS_URL
- [ ] Deploy and copy Vercel URL

### Final Configuration

- [ ] Update FRONTEND_URL in Render
- [ ] Add production URLs to Google Console
- [ ] Test OAuth flow in production
- [ ] Verify all features work

---

## 🎯 Quick Copy-Paste

### For Google Cloud Console

**Redirect URIs (copy all):**
```
http://localhost:3001/api/auth/google/callback
https://pronet-user-service.onrender.com/api/auth/google/callback
```

**JavaScript Origins (copy all):**
```
http://localhost:3000
https://your-app-name.vercel.app
```

### For Render Environment Variables

```
GOOGLE_CLIENT_ID=1075769500266-h4qk4amb9du8pl4tnk3beht03dak9sju.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=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
GOOGLE_CALLBACK_URL=https://pronet-user-service.onrender.com/api/auth/google/callback
FRONTEND_URL=https://your-app-name.vercel.app
```

### For Vercel Environment Variables

```
NEXT_PUBLIC_API_URL=https://pronet-api-gateway.onrender.com
NEXT_PUBLIC_WS_URL=https://pronet-user-service.onrender.com
```

---

## 📞 Need Help?

1. Check `GOOGLE_OAUTH_DEPLOYMENT.md` for detailed steps
2. Check `GOOGLE_OAUTH_SETUP.md` for OAuth setup
3. Check Render logs for backend errors
4. Check browser console for frontend errors
5. Verify all URLs match exactly (no typos!)

---

**Remember**: After deploying to Vercel, update the `FRONTEND_URL` in Render and add the Vercel URL to Google Console! 🚀
