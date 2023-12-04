import {
  Body,
  Controller,
  Get,
  HttpCode,
  Post,
  Req,
  UsePipes,
} from '@nestjs/common';
import { Request } from 'express';

// import { UserAgent } from 'express-useragent';

import { LoginAuthDto, RegisterAuthDto } from './auth.dto';
import { UserService } from './auth.service';

import { BodyValidationPipe } from '../../pipe/validator-body.pipe';
import { userCreateSchema } from '../../joi-schema/userSchema';
import { CustomException } from '../../services/custom-exception';
import { StatusEnum } from '../../enum/error/StatusEnum';
import { User, UserDevices } from './auth.entity';

@Controller('api/auth')
export class AuthController {
  constructor(private readonly userService: UserService) {}

  @Post('/register')
  @HttpCode(201)
  @UsePipes(new BodyValidationPipe(userCreateSchema))
  async register(@Body() registerBody: RegisterAuthDto) {
    return this.userService.signUpCredentials(registerBody);
  }

  @Post('/login')
  @HttpCode(200)
  async login(@Body() loginBody: LoginAuthDto) {
    return this.userService.signInCredentials(loginBody);
  }

  @Get('/google')
  @HttpCode(200)
  async authGoogle(@Req() req: Request) {
    const token =
      req.headers.authorization?.startsWith('Bearer') &&
      req.headers.authorization.split(' ')[1];

    if (!token) {
      throw new CustomException(StatusEnum.UNAUTHORIZED, 'Not authorized');
    }

    return this.userService.authGoogle(token);
  }

  @Get('/refresh')
  @HttpCode(200)
  async refreshToken(
    @Req() req: Request & { user: User; currentDevice: UserDevices },
  ) {
    return this.userService.refreshToken(req.user, req.currentDevice);
  }
}
