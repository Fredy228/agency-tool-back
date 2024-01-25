import {
  Body,
  Controller,
  Get,
  HttpCode,
  Patch,
  Post,
  Req,
  UsePipes,
} from '@nestjs/common';
import { Request } from 'express';

import { LoginAuthDto, RegisterAuthDto } from './auth.dto';
import { AuthService } from './auth.service';

import { BodyValidationPipe } from '../../pipe/validator-body.pipe';
import { userCreateSchema } from '../../joi-schema/userSchema';
import { CustomException } from '../../services/custom-exception';
import { StatusEnum } from '../../enum/error/StatusEnum';
import { User, UserDevices } from '../../entity/user.entity';

@Controller('api/auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('/register')
  @HttpCode(201)
  @UsePipes(new BodyValidationPipe(userCreateSchema))
  async register(@Body() registerBody: RegisterAuthDto) {
    return this.authService.signUpCredentials(registerBody);
  }

  @Post('/login')
  @HttpCode(200)
  async login(@Body() loginBody: LoginAuthDto) {
    return this.authService.signInCredentials(loginBody);
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

    return this.authService.authGoogle(token);
  }

  @Get('/refresh')
  @HttpCode(200)
  async refreshToken(
    @Req() req: Request & { user: User; currentDevice: UserDevices },
  ) {
    return this.authService.refreshToken(req.user, req.currentDevice);
  }

  @Get('/logout')
  @HttpCode(204)
  async logOut(
    @Req() req: Request & { user: User; currentDevice: UserDevices },
  ) {
    return this.authService.logout(req.currentDevice);
  }

  @Patch('/user-agent')
  @HttpCode(200)
  async userAgent(
    @Req() req: Request & { user: User; currentDevice: UserDevices },
  ) {
    const userAgent = req['useragent'];
    return this.authService.userAgent(req.currentDevice, userAgent);
  }
}
