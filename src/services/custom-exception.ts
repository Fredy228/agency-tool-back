import { HttpException, HttpStatus } from '@nestjs/common';
import { StatusEnum } from '../enum/error/StatusEnum';

export class CustomException extends HttpException {
  constructor(status: HttpStatus, message: string) {
    super(message, status);
  }
}
