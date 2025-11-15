import { Injectable } from '@nestjs/common';
import { Request, Response } from 'express';
import axios from 'axios';

@Injectable()
export class ProxyService {
  private serviceUrls = {
    users: process.env.USER_SERVICE_URL || 'http://localhost:3001',
  };

  async forward(req: Request, res: Response, service: string) {
    try {
      const serviceUrl = this.serviceUrls[service];
      // Forward the exact path to the service with /api prefix
      const url = `${serviceUrl}/api${req.url}`;

      console.log(`Forwarding ${req.method} ${req.url} to ${url}`);

      const response = await axios({
        method: req.method,
        url,
        data: req.body,
        headers: {
          ...req.headers,
          host: undefined,
        },
      });

      res.status(response.status).json(response.data);
    } catch (error) {
      console.error(`Proxy error for ${req.url}:`, error.message);
      if (error.response) {
        res.status(error.response.status).json(error.response.data);
      } else {
        res.status(500).json({
          message: 'Service unavailable',
          error: error.message,
        });
      }
    }
  }
}
