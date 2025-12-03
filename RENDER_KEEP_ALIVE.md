# Render Keep-Alive Cron Job

To prevent the Render free tier instance from spinning down due to inactivity, a simple "cron job" (using `setInterval`) has been added to the main entry point of the User Service.

## Implementation

File: `services/user-service/src/main.ts`

The following logic runs every 14 minutes:

```typescript
    // Keep-alive cron job for Render
    const keepAliveUrl = 'https://pronet-user-service.onrender.com/api/auth/google';
    console.log('🕒 Initializing keep-alive cron job for Render...');
    
    // Ping every 14 minutes (Render sleeps after 15 mins of inactivity)
    setInterval(async () => {
      try {
        console.log(`Ping sending to ${keepAliveUrl}`);
        const response = await axios.get(keepAliveUrl);
        console.log(`✅ Keep-alive ping successful: ${response.status}`);
      } catch (error) {
        // Even if it fails (e.g. 401 or redirect), the request hit the server which is what matters
        console.log(`⚠️ Keep-alive ping completed: ${error.message}`);
      }
    }, 14 * 60 * 1000); 
```

## Why?

Render's free tier spins down services after 15 minutes of no incoming traffic. By making a self-request every 14 minutes, we ensure the service stays active.

## Removal

If you upgrade to a paid Render plan, you can remove this code block from `services/user-service/src/main.ts`.
