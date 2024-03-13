import { Injectable } from '@nestjs/common';
import * as sharp from 'sharp';
import { OptionImageType } from '../types/images-type';

@Injectable()
export class ImageService {
  async optimize(file: Express.Multer.File, option: OptionImageType) {
    return await sharp(file.buffer)
      .resize(option)
      .toFormat('webp')
      .webp({ quality: 90 })
      .toBuffer();
  }
}
