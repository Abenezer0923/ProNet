import { Module } from '@nestjs/common';
import { MulterModule } from '@nestjs/platform-express';
import { ProxyController } from './proxy.controller';
import { ProxyService } from './proxy.service';
import { memoryStorage } from 'multer';

@Module({
  imports: [
    MulterModule.register({
      storage: memoryStorage(),
      limits: {
        fileSize: 15 * 1024 * 1024, // 15MB
      },
    }),
  ],
  controllers: [ProxyController],
  providers: [ProxyService],
})
export class ProxyModule {}
