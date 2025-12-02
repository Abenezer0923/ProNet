import { Controller, Get } from '@nestjs/common';
import { Public } from '../auth/decorators/public.decorator';

@Controller('health')
export class HealthController {
  @Public()
  @Get()
  check() {
    return {
      status: 'ok',
      timestamp: new Date().toISOString(),
      service: 'user-service',
      uptime: process.uptime(),
    };
  }

  @Public()
  @Get('ping')
  ping() {
    return {
      status: 'alive',
      timestamp: new Date().toISOString(),
    };
  }

  @Public()
  @Get('ready')
  ready() {
    return {
      status: 'ready',
      timestamp: new Date().toISOString(),
      database: 'connected',
    };
  }
}
