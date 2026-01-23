import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module';
import * as express from 'express';
import * as http from 'http';

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

    // Default to 8000 which is commonly used by some hosting health checks
    // (e.g., Koyeb / platform defaults). If your platform sets PORT explicitly,
    // that value will be used instead.
    const port = Number(process.env.PORT) || 8000;
    await app.listen(port);

    console.log(`🚀 User Service running on http://localhost:${port}`);
    console.log(`📊 Database: ${process.env.DATABASE_HOST}:${process.env.DATABASE_PORT}`);
    console.log(`📦 Database Name: ${process.env.DATABASE_NAME}`);

    // Optional secondary health port: if the hosting platform probes a fixed port
    // (e.g., 8000) while the app listens on a different PORT, start a tiny health
    // responder on HEALTHCHECK_PORT (defaults to PORT). This prevents "TCP health
    // check failed on port <x>" when the platform expects another port.
    const healthPort = Number(process.env.HEALTHCHECK_PORT || process.env.HEALTH_PORT || port);
    if (healthPort !== port) {
      http
        .createServer((req, res) => {
          res.writeHead(200, { 'Content-Type': 'text/plain' });
          res.end('ok');
        })
        .listen(healthPort, () => {
          console.log(`💓 Health responder listening on port ${healthPort} (app port ${port})`);
        });
    }

    // Removed Render-specific keep-alive logic. When deploying to platforms
    // like Koyeb or production, don't attempt to self-ping; rely on the
    // platform's health checks or an external uptime monitor if needed.

  } catch (error) {
    console.error('❌ Failed to start application:', error);
    process.exit(1);
  }
}

bootstrap();
