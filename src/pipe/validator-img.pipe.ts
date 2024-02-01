import {
  ArgumentMetadata,
  HttpStatus,
  Injectable,
  PipeTransform,
} from '@nestjs/common';
import { CustomException } from '../services/custom-exception';

type TFileImg = {
  [key: string]: Array<Express.Multer.File>;
};
@Injectable()
export class ImageValidatorPipe implements PipeTransform {
  constructor(private options: { maxSize: number }) {}

  transform(files: TFileImg, { type }: ArgumentMetadata) {
    if (['query', 'body', 'param'].includes(type)) {
      return files;
    }

    console.log('__files', files);
    if (!files) return files;

    for (const key in files) {
      if (Object.prototype.hasOwnProperty.call(files, key)) {
        files[key].forEach((item: Express.Multer.File) => {
          if (item.mimetype.split('/')[0] !== 'image')
            throw new CustomException(
              HttpStatus.BAD_REQUEST,
              `Only images can be uploaded`,
            );

          if (
            !['png', 'jpg', 'jpeg', 'webp', 'svg'].includes(
              item.mimetype.split('/')[1],
            )
          )
            throw new CustomException(
              HttpStatus.BAD_REQUEST,
              `Invalid image format`,
            );

          if (item.size / (1024 * 1024) > this.options.maxSize)
            throw new CustomException(
              HttpStatus.BAD_REQUEST,
              `The file is too large. Maximum size ${this.options.maxSize} MB`,
            );
        });
      }
    }

    return files;
  }
}
