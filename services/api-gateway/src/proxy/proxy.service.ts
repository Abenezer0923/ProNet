import { Injectable } from '@nestjs/common';
import { Request, Response } from 'express';
import axios from 'axios';
import * as FormData from 'form-data';

@Injectable()
export class ProxyService {
  private serviceUrls = {
    users: process.env.USER_SERVICE_URL || 'http://localhost:3001',
  };

  async forward(req: Request, res: Response, service: string) {
    try {
      const serviceUrl = this.serviceUrls[service];
      const url = `${serviceUrl}${req.url}`;

      console.log(`Forwarding ${req.method} ${req.url} to ${url}`);
      console.log(`Content-Type: ${req.headers['content-type']}`);

      // Check if this is a multipart/form-data request (file upload)
      const isMultipart = req.headers['content-type']?.includes('multipart/form-data');

      let requestData;
      let requestHeaders = { ...req.headers };
      delete requestHeaders.host;

      if (isMultipart && req['file']) {
        // Handle file upload - recreate FormData
        console.log('Handling file upload, file:', req['file']?.originalname);
        const formData = new FormData();
        formData.append('file', req['file'].buffer, {
          filename: req['file'].originalname,
          contentType: req['file'].mimetype,
        });
        
        requestData = formData;
        requestHeaders = {
          ...requestHeaders,
          ...formData.getHeaders(),
        };
      } else if (isMultipart) {
        // Multipart but no file parsed yet - stream the raw body
        console.log('Streaming multipart data');
        requestData = req;
      } else {
        // Regular JSON request
        requestData = req.body;
      }

      const response = await axios({
        method: req.method,
        url,
        data: requestData,
        headers: requestHeaders,
        maxBodyLength: Infinity,
        maxContentLength: Infinity,
      });

      res.status(response.status).json(response.data);
    } catch (error) {
      console.error(`Proxy error for ${req.url}:`, error.message);
      if (error.response) {
        console.error('Error response:', error.response.data);
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
