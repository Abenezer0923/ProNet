import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { ProxyModule } from './proxy/proxy.module';

@Module({
  imports: [ProxyModule],
  controllers: [AppController],
})
export class AppModule {}
