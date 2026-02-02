import { Controller, All, Req, Res, UseInterceptors, UploadedFile } from '@nestjs/common';
import { Request, Response } from 'express';
import { FileInterceptor } from '@nestjs/platform-express';
import { ProxyService } from './proxy.service';

@Controller()
export class ProxyController {
  constructor(private readonly proxyService: ProxyService) {}

  // Handle file upload requests
  @All('upload*')
  @UseInterceptors(FileInterceptor('file'))
  async proxyFileUpload(
    @Req() req: Request,
    @Res() res: Response,
    @UploadedFile() file: Express.Multer.File,
  ) {
    if (file) {
      req['file'] = file;
      console.log('File intercepted in gateway:', file.originalname, file.size);
    }
    return this.proxyService.forward(req, res, 'users');
  }

  // Forward all other requests to user service
  @All('*')
  async proxyToUserService(@Req() req: Request, @Res() res: Response) {
    // Skip health check
    if (req.url === '/health' || req.url === '/') {
      return;
    }
    
    // For OAuth routes, don't proxy - redirect directly to user service
    if (req.url.startsWith('/api/auth/google')) {
      const userServiceUrl = process.env.USER_SERVICE_URL || 'http://localhost:3001';
      const redirectUrl = `${userServiceUrl}${req.url}`;
      console.log(`Redirecting OAuth request to: ${redirectUrl}`);
      return res.redirect(redirectUrl);
    }
    
    return this.proxyService.forward(req, res, 'users');
  }
}
