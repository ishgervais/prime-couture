import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import crypto from 'crypto';

@Injectable()
export class FilesService {
  constructor(private config: ConfigService) {}

  getUploadSignature(folder = 'prime-couture') {
    const timestamp = Math.round(new Date().getTime() / 1000);
    const paramsToSign = `folder=${folder}&timestamp=${timestamp}`;
    const apiSecret = this.config.get<string>('CLOUDINARY_API_SECRET', '');
    const signature = crypto.createHash('sha1').update(paramsToSign + apiSecret).digest('hex');

    return {
      timestamp,
      folder,
      signature,
      apiKey: this.config.get<string>('CLOUDINARY_API_KEY'),
      cloudName: this.config.get<string>('CLOUDINARY_CLOUD_NAME'),
    };
  }
}
