import { Controller, All, Req, Res } from '@nestjs/common';
import { Request, Response } from 'express';
import { ProxyService } from './proxy.service';

@Controller()
export class ProxyController {
  constructor(private readonly proxyService: ProxyService) {}

  // Forward all requests to user service
  @All('*')
  async proxyToUserService(@Req() req: Request, @Res() res: Response) {
    // Skip health check
    if (req.url === '/health' || req.url === '/') {
      return;
    }
    return this.proxyService.forward(req, res, 'users');
  }
}
