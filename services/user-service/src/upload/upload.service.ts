import { Injectable } from '@nestjs/common';
import { v2 as cloudinary } from 'cloudinary';
import { Readable } from 'stream';

@Injectable()
export class UploadService {
  constructor() {
    cloudinary.config({
      cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
      api_key: process.env.CLOUDINARY_API_KEY,
      api_secret: process.env.CLOUDINARY_API_SECRET,
    });
  }

  async uploadImage(
    file: Express.Multer.File,
    folder: string = 'pronet',
  ): Promise<{ url: string; publicId: string }> {
    try {
      // Validate file buffer exists
      if (!file.buffer) {
        throw new Error('File buffer is missing');
      }

      // Check if Cloudinary is configured
      if (!process.env.CLOUDINARY_CLOUD_NAME || !process.env.CLOUDINARY_API_KEY) {
        console.warn('Cloudinary not configured, using placeholder image');
        return {
          url: `https://ui-avatars.com/api/?name=${encodeURIComponent(file.originalname)}&size=200`,
          publicId: 'placeholder',
        };
      }

      console.log('Starting Cloudinary upload to folder:', folder);

      return new Promise((resolve, reject) => {
        const uploadStream = cloudinary.uploader.upload_stream(
          {
            folder,
            resource_type: 'auto',
            transformation: [
              { quality: 'auto', fetch_format: 'auto' },
            ],
          },
          (error, result) => {
            if (error) {
              console.error('Cloudinary upload error:', error);
              return reject(new Error(`Cloudinary upload failed: ${error.message}`));
            }
            if (!result) {
              return reject(new Error('Cloudinary upload returned no result'));
            }
            console.log('Cloudinary upload successful:', result.secure_url);
            resolve({
              url: result.secure_url,
              publicId: result.public_id,
            });
          },
        );

        try {
          const bufferStream = new Readable();
          bufferStream.push(file.buffer);
          bufferStream.push(null);
          bufferStream.pipe(uploadStream);
        } catch (streamError) {
          console.error('Stream error:', streamError);
          reject(new Error(`Failed to create upload stream: ${streamError.message}`));
        }
      });
    } catch (error) {
      console.error('Upload service error:', error);
      throw new Error(`Upload failed: ${error.message}`);
    }
  }

  async uploadProfilePicture(file: Express.Multer.File): Promise<string> {
    const result = await this.uploadImage(file, 'pronet/profiles');
    return result.url;
  }

  async uploadCommunityImage(file: Express.Multer.File): Promise<string> {
    const result = await this.uploadImage(file, 'pronet/communities');
    return result.url;
  }

  async uploadPostImage(file: Express.Multer.File): Promise<string> {
    const result = await this.uploadImage(file, 'pronet/posts');
    return result.url;
  }

  async deleteImage(publicId: string): Promise<void> {
    await cloudinary.uploader.destroy(publicId);
  }
}
