# ⏰ How to Keep Render Awake (Cron Job)

Render's free tier spins down after 15 minutes of inactivity. To prevent this, we will use a free external service to "ping" your server every 14 minutes.

## Step 1: Deploy First
Make sure you have pushed the latest changes and your Render service is deployed and running.

## Step 2: Get Your Health URL
Your health endpoint is:
`https://pronet-user-service.onrender.com/health`

Try visiting this URL in your browser. You should see:
```json
{"status":"ok", "timestamp":"..."}
```

## Step 3: Set Up Cron Job
1.  Go to [cron-job.org](https://cron-job.org) (it's free).
2.  Sign up / Login.
3.  Click **Create Cronjob**.
4.  **Title**: ProNet Keep Alive
5.  **URL**: `https://pronet-user-service.onrender.com/health`
6.  **Execution Schedule**:
    *   Select **Every 14 minutes**.
    *   (Or choose "User-defined" and enter `*/14 * * * *`).
7.  **Create**.

## Done!
Now `cron-job.org` will visit your site every 14 minutes, which resets Render's inactivity timer. Your server will stay awake!
