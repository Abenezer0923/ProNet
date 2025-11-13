import { Controller, All, Req, Res } from '@nestjs/common';
import { Request, Response } from 'express';
import { ProxyService } from './proxy.service';

@Controller('api')
export class ProxyController {
  constructor(private readonly proxyService: ProxyService) {}

  @All('users/*')
  async proxyToUserService(@Req() req: Request, @Res() res: Response) {
    return this.proxyService.forward(req, res, 'users');
  }
}
