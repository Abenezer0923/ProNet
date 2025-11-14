import {
  Controller,
  Post,
  UseGuards,
  UseInterceptors,
  UploadedFile,
  BadRequestException,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { UploadService } from './upload.service';

@Controller('upload')
@UseGuards(JwtAuthGuard)
export class UploadController {
  constructor(private readonly uploadService: UploadService) {}

  @Post('profile-picture')
  @UseInterceptors(FileInterceptor('file'))
  async uploadProfilePicture(@UploadedFile() file: Express.Multer.File) {
    if (!file) {
      throw new BadRequestException('No file uploaded');
    }

    this.validateImage(file);
    const url = await this.uploadService.uploadProfilePicture(file);
    return { url };
  }

  @Post('community-image')
  @UseInterceptors(FileInterceptor('file'))
  async uploadCommunityImage(@UploadedFile() file: Express.Multer.File) {
    if (!file) {
      throw new BadRequestException('No file uploaded');
    }

    this.validateImage(file, 10);
    const url = await this.uploadService.uploadCommunityImage(file);
    return { url };
  }

  @Post('post-image')
  @UseInterceptors(FileInterceptor('file'))
  async uploadPostImage(@UploadedFile() file: Express.Multer.File) {
    if (!file) {
      throw new BadRequestException('No file uploaded');
    }

    this.validateImage(file);
    const url = await this.uploadService.uploadPostImage(file);
    return { url };
  }

  private validateImage(file: Express.Multer.File, maxSizeMB: number = 5) {
    const allowedMimeTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
    
    if (!allowedMimeTypes.includes(file.mimetype)) {
      throw new BadRequestException('Invalid file type. Only JPEG, PNG, GIF, and WebP are allowed');
    }

    const maxSize = maxSizeMB * 1024 * 1024; // Convert MB to bytes
    if (file.size > maxSize) {
      throw new BadRequestException(`File size must be less than ${maxSizeMB}MB`);
    }
  }
}
