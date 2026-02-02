import { Injectable, OnModuleInit } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';

@Injectable()
export class KeepAliveService implements OnModuleInit {
  private readonly serviceUrl = process.env.RENDER_EXTERNAL_URL || process.env.SERVICE_URL;
  private readonly isProduction = process.env.NODE_ENV === 'production';
  private readonly isRender = !!process.env.RENDER;

  onModuleInit() {
    if (this.isRender && this.serviceUrl) {
      console.log('🔄 Keep-alive service initialized for Render');
      console.log(`📍 Service URL: ${this.serviceUrl}`);
    }
  }

  // Ping every 14 minutes to prevent Render free tier spin-down
  @Cron('*/14 * * * *') // Every 14 minutes
  async keepAlive() {
    // Only run on Render in production
    if (!this.isRender || !this.isProduction || !this.serviceUrl) {
      return;
    }

    try {
      const response = await fetch(`${this.serviceUrl}/api/health`, {
        method: 'GET',
        headers: {
          'User-Agent': 'KeepAlive-Service',
        },
      });

      if (response.ok) {
        console.log('✅ Keep-alive ping successful');
      } else {
        console.warn(`⚠️  Keep-alive ping returned status: ${response.status}`);
      }
    } catch (error) {
      console.error('❌ Keep-alive ping failed:', error.message);
    }
  }

  // Additional ping during peak hours (9 AM - 9 PM UTC)
  @Cron('*/10 9-21 * * *') // Every 10 minutes during peak hours
  async keepAlivePeakHours() {
    if (!this.isRender || !this.isProduction || !this.serviceUrl) {
      return;
    }

    try {
      await fetch(`${this.serviceUrl}/api/health`, {
        method: 'GET',
        headers: {
          'User-Agent': 'KeepAlive-Peak-Service',
        },
      });
      console.log('✅ Peak hours keep-alive ping');
    } catch (error) {
      // Silent fail during peak hours
    }
  }
}
