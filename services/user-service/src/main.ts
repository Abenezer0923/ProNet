import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module';
import * as express from 'express';

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
  } catch (error) {
    console.error('❌ Failed to start application:', error);
    process.exit(1);
  }
}

bootstrap();
