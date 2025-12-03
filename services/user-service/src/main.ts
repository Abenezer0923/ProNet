import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module';
import * as express from 'express';
import axios from 'axios';

async function bootstrap() {
  try {
    const app = await NestFactory.create(AppModule, {
      bodyParser: true,
    });

    // Set global prefix
    app.setGlobalPrefix('api');

    // Increase payload size limit for file uploads
    app.use(express.json({ limit: '50mb' }));
    app.use(express.urlencoded({ limit: '50mb', extended: true }));

    // Enable validation
    app.useGlobalPipes(new ValidationPipe({
      whitelist: true,
      transform: true,
    }));

    // Enable CORS
    app.enableCors({
      origin: true, // Allow all origins in development
      credentials: true,
      methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
      allowedHeaders: ['Content-Type', 'Authorization'],
    });

    const port = process.env.PORT || 3001;
    await app.listen(port);

    console.log(`🚀 User Service running on http://localhost:${port}`);
    console.log(`📊 Database: ${process.env.DATABASE_HOST}:${process.env.DATABASE_PORT}`);
    console.log(`📦 Database Name: ${process.env.DATABASE_NAME}`);

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

  } catch (error) {
    console.error('❌ Failed to start application:', error);
    process.exit(1);
  }
}

bootstrap();
