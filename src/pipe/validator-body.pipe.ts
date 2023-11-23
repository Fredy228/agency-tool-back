import { ArgumentMetadata, Injectable, PipeTransform } from '@nestjs/common';
import { ArraySchema, ObjectSchema } from 'joi';

import { CustomException } from '../services/custom-exception';
import { StatusEnum } from '../enum/error/StatusEnum';

@Injectable()
export class BodyValidationPipe implements PipeTransform {
  constructor(private schema: ObjectSchema | ArraySchema) {}

  transform(value: any, metadata: ArgumentMetadata) {
    if (metadata.type !== 'body') {
      return value;
    }

    const { error } = this.schema.validate(value);
    console.log(error);
    if (error) {
      throw new CustomException(StatusEnum.BAD_REQUEST, error.message);
    }
    return value;
  }
}
