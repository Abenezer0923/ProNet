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
      const isMultipart =
        req.headers['content-type']?.includes('multipart/form-data');

      let requestData: any;
      let requestHeaders: any = { ...req.headers };
      delete requestHeaders.host;
      delete requestHeaders['content-length']; // Let axios calculate this

      if (isMultipart && req['file']) {
        // Handle file upload - recreate FormData
        console.log('Handling file upload, file:', req['file']?.originalname);
        const formData = new FormData();

        // Append the file buffer as a stream
        formData.append('file', req['file'].buffer, {
          filename: req['file'].originalname,
          contentType: req['file'].mimetype,
          knownLength: req['file'].size,
        });

        requestData = formData;

        // Use FormData's headers (includes proper boundary)
        requestHeaders = {
          ...req.headers,
          ...formData.getHeaders(),
          authorization: req.headers.authorization, // Preserve auth
        };
        delete requestHeaders.host;
        delete requestHeaders['content-length'];

        console.log('FormData headers:', formData.getHeaders());
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
        timeout: 60000, // 60 second timeout for uploads
        validateStatus: () => true, // Accept all status codes, handle them ourselves
      });

      // Log response for debugging
      console.log(`Response status: ${response.status}`);

      // Forward headers from the backend to the client
      // We exclude specific headers that might cause conflicts or are hop-by-hop
      const excludedHeaders = [
        'host',
        'connection',
        'content-length',
        'transfer-encoding',
        'access-control-allow-origin',
        'access-control-allow-methods',
        'access-control-allow-headers',
        'access-control-allow-credentials',
      ];

      Object.keys(response.headers).forEach((key) => {
        if (!excludedHeaders.includes(key.toLowerCase())) {
          res.setHeader(key, response.headers[key]);
        }
      });

      res.status(response.status).send(response.data);
    } catch (error) {
      console.error(`Proxy error for ${req.url}:`, error.message);
      console.error('Error stack:', error.stack);
      if (error.response) {
        console.error('Error response status:', error.response.status);
        console.error('Error response data:', error.response.data);
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
