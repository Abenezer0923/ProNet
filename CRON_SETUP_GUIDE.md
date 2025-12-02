# ⏰ Cron Job Setup Guide - Keep Render Services Alive

## Problem
Render's free tier spins down services after 15 minutes of inactivity. This causes:
- Slow first request (30-60 seconds cold start)
- Failed Google OAuth attempts
- Poor user experience

## Solution
Use external cron services to ping your endpoints every 14 minutes, keeping services warm.

---

## Option 1: Cron-Job.org (Recommended) ⭐

### Why This Option?
- ✅ Free forever
- ✅ Reliable execution
- ✅ Easy setup
- ✅ Execution history
- ✅ Email notifications on failures

### Setup Steps

#### 1. Create Account
1. Go to [cron-job.org](https://cron-job.org)
2. Click "Sign Up" (top right)
3. Enter email and create password
4. Verify email

#### 2. Create First Cron Job (User Service)
1. Click "Create Cronjob" button
2. Fill in details:
   - **Title**: `ProNet User Service Keep-Alive`
   - **URL**: `https://pronet-user-service.onrender.com/api/health`
   - **Schedule**: 
     - Select "Every 14 minutes"
     - Or use custom: `*/14 * * * *`
   - **Request Method**: GET
   - **Timeout**: 30 seconds
3. Click "Create"

#### 3. Create Second Cron Job (API Gateway)
1. Click "Create Cronjob" again
2. Fill in details:
   - **Title**: `ProNet API Gateway Keep-Alive`
   - **URL**: `https://pronet-api-gateway.onrender.com/api/health`
   - **Schedule**: `*/14 * * * *`
   - **Request Method**: GET
   - **Timeout**: 30 seconds
3. Click "Create"

#### 4. Create Third Cron Job (Auth Warmup)
1. Click "Create Cronjob" again
2. Fill in details:
   - **Title**: `ProNet Auth Warmup`
   - **URL**: `https://pronet-user-service.onrender.com/api/health/ping`
   - **Schedule**: `7,21,35,49 * * * *` (offset by 7 minutes)
   - **Request Method**: GET
   - **Timeout**: 30 seconds
3. Click "Create"

#### 5. Enable Notifications (Optional)
1. Go to Settings
2. Enable "Email notifications on failures"
3. Set threshold (e.g., notify after 3 consecutive failures)

### Verify Setup
1. Go to "Execution History"
2. Wait for first execution (up to 14 minutes)
3. Check that status is "200 OK"
4. Verify response contains `{"status":"ok"}`

---

## Option 2: UptimeRobot (Alternative)

### Why This Option?
- ✅ Free tier: 50 monitors
- ✅ 5-minute check intervals
- ✅ Status page
- ⚠️ Minimum interval is 5 minutes (more frequent than needed)

### Setup Steps

#### 1. Create Account
1. Go to [uptimerobot.com](https://uptimerobot.com)
2. Sign up for free account
3. Verify email

#### 2. Add Monitors
1. Click "Add New Monitor"
2. **Monitor Type**: HTTP(s)
3. **Friendly Name**: ProNet User Service
4. **URL**: `https://pronet-user-service.onrender.com/api/health`
5. **Monitoring Interval**: 5 minutes
6. Click "Create Monitor"

7. Repeat for API Gateway:
   - **Friendly Name**: ProNet API Gateway
   - **URL**: `https://pronet-api-gateway.onrender.com/api/health`

#### 3. Setup Alerts (Optional)
1. Go to "Alert Contacts"
2. Add email for notifications
3. Configure alert thresholds

---

## Option 3: GitHub Actions (Free, Built-in)

### Why This Option?
- ✅ Free for public repos
- ✅ No external service needed
- ✅ Version controlled
- ⚠️ Requires GitHub repo

### Setup Steps

#### 1. Create Workflow File
File is already created at: `.github/workflows/keep-alive.yml`

#### 2. Enable GitHub Actions
1. Go to your GitHub repository
2. Click "Actions" tab
3. Enable workflows if prompted

#### 3. Verify Execution
1. Go to "Actions" tab
2. Click "Keep Render Services Alive"
3. Check execution history
4. Verify successful runs

#### 4. Manual Trigger (Optional)
1. Go to "Actions" tab
2. Select "Keep Render Services Alive"
3. Click "Run workflow"
4. Select branch and run

---

## Option 4: Multiple Services (Maximum Reliability) 🚀

### Why This Option?
- ✅ Redundancy
- ✅ Maximum uptime
- ✅ Failover protection

### Setup
Use **both** Cron-Job.org AND GitHub Actions:

1. Setup Cron-Job.org (every 14 minutes)
2. Setup GitHub Actions (every 14 minutes, offset)
3. Result: Service pinged every 7 minutes from different sources

**Cron Schedule:**
- Cron-Job.org: `*/14 * * * *` (0, 14, 28, 42, 56)
- GitHub Actions: `7-59/14 * * * *` (7, 21, 35, 49)

---

## Testing Your Setup

### 1. Test Health Endpoints
```bash
# Test user service
curl https://pronet-user-service.onrender.com/api/health

# Expected response:
# {"status":"ok","timestamp":"2024-...","service":"user-service","uptime":123.45}

# Test API gateway
curl https://pronet-api-gateway.onrender.com/api/health

# Test ping endpoint
curl https://pronet-user-service.onrender.com/api/health/ping
```

### 2. Monitor Execution
- **Cron-Job.org**: Check "Execution History"
- **UptimeRobot**: Check "Logs"
- **GitHub Actions**: Check "Actions" tab

### 3. Verify Service Stays Awake
1. Wait 20 minutes without accessing the site
2. Try Google OAuth login
3. Should be instant (no cold start)

---

## Troubleshooting

### Issue: Cron Job Returns Error
**Symptoms:**
- Status code: 500, 502, 503
- Response: timeout or error

**Solutions:**
1. Check Render service status
2. Verify URL is correct
3. Check Render logs for errors
4. Restart Render service
5. Increase timeout to 60 seconds

### Issue: Service Still Sleeping
**Symptoms:**
- First request takes 30-60 seconds
- Google OAuth fails initially

**Solutions:**
1. Verify cron jobs are enabled
2. Check execution history shows success
3. Ensure interval is 14 minutes or less
4. Add more cron jobs (redundancy)
5. Check Render logs for activity

### Issue: Too Many Requests
**Symptoms:**
- Render shows high request count
- Potential rate limiting

**Solutions:**
1. Reduce cron frequency to 14 minutes
2. Remove duplicate cron jobs
3. Use only one cron service
4. Monitor Render metrics

---

## Monitoring Dashboard

### Cron-Job.org Dashboard
- **URL**: https://cron-job.org/en/members/jobs/
- **Check**: Execution history, success rate
- **Alert**: Email on failures

### Render Dashboard
- **URL**: https://dashboard.render.com
- **Check**: Service logs, metrics
- **Monitor**: Request count, response times

### GitHub Actions
- **URL**: https://github.com/[your-repo]/actions
- **Check**: Workflow runs
- **Monitor**: Success/failure status

---

## Best Practices

### 1. Use Multiple Endpoints
- `/health` - Main health check
- `/health/ping` - Lightweight ping
- `/health/ready` - Database check

### 2. Stagger Cron Jobs
- Don't ping all services at exact same time
- Offset by a few minutes
- Reduces load spikes

### 3. Monitor Regularly
- Check cron execution weekly
- Review Render logs monthly
- Update URLs if services change

### 4. Set Up Alerts
- Email on cron failures
- Slack/Discord webhooks
- Status page for users

### 5. Document Everything
- Keep URLs updated
- Note any changes
- Share with team

---

## Cost Analysis

| Service | Free Tier | Paid Plans | Recommendation |
|---------|-----------|------------|----------------|
| Cron-Job.org | Unlimited jobs, 1-min intervals | €3.99/mo for premium | ✅ Use free tier |
| UptimeRobot | 50 monitors, 5-min intervals | $7/mo for 1-min | ✅ Use free tier |
| GitHub Actions | 2000 min/mo public repos | $0.008/min private | ✅ Use free tier |
| Render Free Tier | 750 hrs/mo, sleeps after 15 min | $7/mo for always-on | ✅ Keep free + cron |

**Total Cost: $0/month** 🎉

---

## Quick Start Checklist

- [ ] Choose cron service (Cron-Job.org recommended)
- [ ] Create account
- [ ] Add user service health check
- [ ] Add API gateway health check
- [ ] Set schedule to every 14 minutes
- [ ] Enable email notifications
- [ ] Test endpoints manually
- [ ] Wait 20 minutes and verify
- [ ] Check execution history
- [ ] Test Google OAuth
- [ ] Monitor for 24 hours
- [ ] Document setup

---

## Support Resources

- **Cron-Job.org Docs**: https://cron-job.org/en/documentation/
- **UptimeRobot Docs**: https://uptimerobot.com/api/
- **GitHub Actions Docs**: https://docs.github.com/en/actions
- **Render Docs**: https://render.com/docs

---

## Next Steps

1. ✅ Choose your cron service
2. ✅ Follow setup steps above
3. ✅ Test all endpoints
4. ✅ Monitor for 24 hours
5. ✅ Update team documentation
6. ✅ Set up alerts
7. ✅ Celebrate! 🎉
