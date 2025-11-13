import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  
  // Enable validation
  app.useGlobalPipes(new ValidationPipe({
    whitelist: true,
    transform: true,
  }));
  
  // Enable CORS
  app.enableCors({
    origin: [
      'http://localhost:3000',
      'http://localhost:3100',
      'https://pronet-api-gateway.onrender.com',
      'https://*.onrender.com',
    ],
    credentials: true,
  });

  const port = process.env.PORT || 3001;
  await app.listen(port);
  
  console.log(`🚀 User Service running on http://localhost:${port}`);
  console.log(`📊 Database: ${process.env.DATABASE_HOST}:${process.env.DATABASE_PORT}`);
  console.log(`📦 Database Name: ${process.env.DATABASE_NAME}`);
}

bootstrap();
