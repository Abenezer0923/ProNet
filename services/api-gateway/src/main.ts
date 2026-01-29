import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import * as express from 'express';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Set global prefix to match user service
  app.setGlobalPrefix('api');

  // Increase payload size limit for file uploads
  app.use(express.json({ limit: '50mb' }));
  app.use(express.urlencoded({ limit: '50mb', extended: true }));

  // Enable CORS with specific origins to prevent reflection issues
  // and ensure headers are always sent.
  app.enableCors({
    origin: [
      'http://localhost:3000',
      'http://localhost:3100',
      'https://pro-net-ten.vercel.app',
      'https://pro-net-git-main-abenezers-projects-0923.vercel.app', // Add other vercel preview branches if needed
      /\.vercel\.app$/, // Allow all vercel subdomains
    ],
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  });

  const port = process.env.PORT || 3000;
  await app.listen(port);

  console.log(`🚀 API Gateway running on http://localhost:${port}`);
}

bootstrap();
