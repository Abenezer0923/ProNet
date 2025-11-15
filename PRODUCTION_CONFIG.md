# Production Configuration - ProNet

## 🎯 Current Production Setup

### Frontend (Vercel)
**URL**: https://pro-net-ten.vercel.app/

### Backend (Render)
**User Service**: https://pronet-user-service.onrender.com
**API Gateway**: https://pronet-api-gateway.onrender.com

---

## 🔑 Google OAuth Credentials (Updated)

```
Client ID: 1075769500266-gee3kfr5mt1obnc06q2c21vamscfcq0t.apps.googleusercontent.com
Client Secret: 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
```

---

## 🔗 OAuth URLs Configuration

### Google Cloud Console Setup

Go to: https://console.cloud.google.com/
Navigate to: **APIs & Services** > **Credentials** > **OAuth 2.0 Client ID**

#### Authorized Redirect URIs
Add these URLs:
```
http://localhost:3001/api/auth/google/callback
https://pronet-user-service.onrender.com/api/auth/google/callback
```

#### Authorized JavaScript Origins
Add these URLs:
```
http://localhost:3000
https://pro-net-ten.vercel.app
```

---

## ⚙️ Environment Variables

### Render - User Service

In Render Dashboard → pronet-user-service → Environment:

```env
GOOGLE_CLIENT_ID=1075769500266-gee3kfr5mt1obnc06q2c21vamscfcq0t.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=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
GOOGLE_CALLBACK_URL=https://pronet-user-service.onrender.com/api/auth/google/callback
FRONTEND_URL=https://pro-net-ten.vercel.app
```

### Vercel - Frontend

In Vercel Dashboard → pro-net-ten → Settings → Environment Variables:

```env
NEXT_PUBLIC_API_URL=https://pronet-api-gateway.onrender.com
NEXT_PUBLIC_WS_URL=https://pronet-user-service.onrender.com
```

---

## 🔄 OAuth Flow

### Production Flow:

1. User visits: `https://pro-net-ten.vercel.app`
2. Clicks "Continue with Google"
3. Redirected to: `https://pronet-user-service.onrender.com/api/auth/google`
4. Google OAuth consent screen
5. Google redirects to: `https://pronet-user-service.onrender.com/api/auth/google/callback`
6. Backend generates JWT token
7. Redirects to: `https://pro-net-ten.vercel.app/auth/callback?token=xxx`
8. Frontend stores token
9. Redirects to: `https://pro-net-ten.vercel.app/dashboard` ✅

---

## 📋 Deployment Checklist

### Google Cloud Console
- [ ] Updated OAuth Client ID with new credentials
- [ ] Added redirect URI: `https://pronet-user-service.onrender.com/api/auth/google/callback`
- [ ] Added JavaScript origin: `https://pro-net-ten.vercel.app`
- [ ] Saved changes

### Render
- [ ] Services deployed and running
- [ ] Environment variables updated with new credentials
- [ ] `GOOGLE_CALLBACK_URL` set correctly
- [ ] `FRONTEND_URL` set to `https://pro-net-ten.vercel.app`
- [ ] Services redeployed after env changes

### Vercel
- [ ] Frontend deployed successfully
- [ ] `NEXT_PUBLIC_API_URL` points to Render API Gateway
- [ ] `NEXT_PUBLIC_WS_URL` points to Render User Service
- [ ] Build completed without errors
- [ ] Site accessible at https://pro-net-ten.vercel.app

### Testing
- [ ] Visit https://pro-net-ten.vercel.app
- [ ] Click "Continue with Google"
- [ ] Complete OAuth flow
- [ ] Redirected to dashboard
- [ ] User logged in successfully
- [ ] All features working

---

## 🧪 Testing Commands

### Check if services are running:

```bash
# API Gateway
curl https://pronet-api-gateway.onrender.com/health

# User Service
curl https://pronet-user-service.onrender.com/health

# Frontend
curl https://pro-net-ten.vercel.app
```

### Test OAuth endpoint:

```bash
# This should redirect to Google
curl -I https://pronet-user-service.onrender.com/api/auth/google
```

---

## 🐛 Troubleshooting

### Issue: "Redirect URI mismatch"

**Solution:**
1. Go to Google Cloud Console
2. Verify redirect URI is exactly: `https://pronet-user-service.onrender.com/api/auth/google/callback`
3. No trailing slashes
4. Must be HTTPS

### Issue: OAuth redirects to wrong URL

**Solution:**
1. Check Render environment variable `FRONTEND_URL`
2. Should be: `https://pro-net-ten.vercel.app`
3. No trailing slash
4. Redeploy service after changing

### Issue: "Invalid client"

**Solution:**
1. Verify Client ID and Secret in Render match Google Console
2. Check for extra spaces or line breaks
3. Ensure OAuth client is enabled in Google Console

### Issue: Slow first request (30-60 seconds)

**Cause:** Render free tier spins down after inactivity

**Solution:**
- This is normal behavior
- First request wakes up the service
- Consider upgrading to paid tier for always-on

---

## 📊 Service Status

### Check Render Services

1. Go to: https://dashboard.render.com
2. Check all services show "Live" status
3. View logs for any errors

### Check Vercel Deployment

1. Go to: https://vercel.com/dashboard
2. Check latest deployment is successful
3. View deployment logs if needed

---

## 🔒 Security Notes

1. **Never commit credentials to Git**
   - Credentials are in `.env` (gitignored)
   - Production credentials in Render dashboard

2. **HTTPS Only in Production**
   - All production URLs use HTTPS
   - Google OAuth requires HTTPS for production

3. **Environment Variables**
   - Stored securely in Render/Vercel
   - Not exposed in client-side code
   - JWT_SECRET is auto-generated by Render

---

## 🚀 Quick Deploy

### Push changes to trigger deployment:

```bash
git add .
git commit -m "Update Google OAuth credentials"
git push origin main
```

### Services will auto-deploy:
- Render: 10-15 minutes
- Vercel: 2-3 minutes

---

## 📞 Support Links

- **Render Dashboard**: https://dashboard.render.com
- **Vercel Dashboard**: https://vercel.com/dashboard
- **Google Console**: https://console.cloud.google.com
- **Your Frontend**: https://pro-net-ten.vercel.app
- **GitHub Repo**: https://github.com/Abenezer0923/ProNet

---

## ✅ Final Verification

After deployment, test the complete flow:

1. ✅ Visit https://pro-net-ten.vercel.app
2. ✅ Landing page loads correctly
3. ✅ Click "Continue with Google"
4. ✅ Google OAuth consent screen appears
5. ✅ Authorize the app
6. ✅ Redirected back to your app
7. ✅ Logged in successfully
8. ✅ Dashboard loads at https://pro-net-ten.vercel.app/dashboard
9. ✅ All features work correctly

---

**Last Updated**: $(date)
**Status**: Ready for deployment
**Frontend**: https://pro-net-ten.vercel.app
**Backend**: https://pronet-user-service.onrender.com
