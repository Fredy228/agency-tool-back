import {
  Body,
  Controller,
  Get,
  HttpCode,
  Patch,
  Post,
  Req,
  Res,
  UseGuards,
  UsePipes,
} from '@nestjs/common';
import { Request, Response } from 'express';
import * as dotenv from 'dotenv';
import AuthGoogle from './google.guard';
import * as process from 'process';

dotenv.config();

import { LoginAuthDto, RegisterAuthDto } from './auth.dto';
import { AuthService } from './auth.service';

import { BodyValidationPipe } from '../../pipe/validator-body.pipe';
import {
  userCodeSchema,
  userCreateSchema,
  userEmailSchema,
  userPasswordSchema,
} from '../../joi-schema/userSchema';
import { User, UserDevices } from '../../entity/user.entity';

const CLIENT_URL = process.env.CLIENT_URL;
const MAX_AGE = 7 * 24 * 60 * 60 * 1000;

@Controller('api/auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('/register')
  @HttpCode(201)
  @UsePipes(new BodyValidationPipe(userCreateSchema))
  async register(
    @Req()
    req: Request,
    @Body() registerBody: RegisterAuthDto,
    @Res({ passthrough: true }) res: Response,
  ) {
    const userAgent = req['useragent'];
    const createdUser = await this.authService.signUpCredentials({
      ...registerBody,
      userAgent,
    });
    res.cookie('refreshToken', createdUser.refreshToken, {
      httpOnly: true,
      maxAge: MAX_AGE,
    });
    return createdUser;
  }

  @Post('/login')
  @HttpCode(200)
  async login(
    @Req()
    req: Request,
    @Body() loginBody: LoginAuthDto,
    @Res({ passthrough: true }) res: Response,
  ) {
    const userAgent = req['useragent'];
    const foundUser = await this.authService.signInCredentials({
      ...loginBody,
      userAgent,
    });
    console.log('toooken', foundUser.refreshToken);
    res.cookie('refreshToken', foundUser.refreshToken, {
      httpOnly: true,
      maxAge: MAX_AGE,
    });
    return foundUser;
  }

  @Get('google')
  @HttpCode(200)
  @UseGuards(AuthGoogle)
  googleLogin() {
    return;
  }

  @Get('google/callback')
  @HttpCode(200)
  @UseGuards(AuthGoogle)
  async googleLoginCallback(
    @Req()
    req: Request & {
      user: Pick<User, 'firstName' | 'lastName' | 'image' | 'email'>;
    },
    @Res({ passthrough: true }) res: Response,
  ) {
    const userAgent = req['useragent'];
    console.log('user', req.user);
    const foundUser = await this.authService.authGoogle(req.user, userAgent);

    res.cookie('refreshToken', foundUser.refreshToken, {
      httpOnly: true,
      maxAge: MAX_AGE,
    });
    res.redirect(`${CLIENT_URL}/welcome?token=${foundUser.accessToken}`);
  }

  @Get('/refresh')
  @HttpCode(200)
  async refreshToken(
    @Req()
    req: Request & {
      user: User;
      currentDevice: UserDevices;
    },
    @Res({ passthrough: true }) res: Response,
  ) {
    const tokens = await this.authService.refreshToken(
      req.user,
      req.currentDevice,
    );
    res.cookie('refreshToken', tokens.refreshToken, {
      httpOnly: true,
      maxAge: MAX_AGE,
    });
    return tokens;
  }

  @Get('/logout')
  @HttpCode(204)
  async logOut(
    @Req() req: Request & { user: User; currentDevice: UserDevices },
  ) {
    return this.authService.logout(req.currentDevice);
  }

  @Get('/verification')
  @HttpCode(204)
  async sendVerificationCode(@Req() req: Request & { user: User }) {
    return this.authService.sendVerificationCode(req.user);
  }

  @Post('/verification')
  @HttpCode(204)
  @UsePipes(new BodyValidationPipe(userCodeSchema))
  async checkVerificationCode(
    @Req() req: Request & { user: User },
    @Body() body: { code: string },
  ) {
    return this.authService.checkVerificationCode(req.user, body.code);
  }

  @Post('/forgot-pass')
  @HttpCode(204)
  @UsePipes(new BodyValidationPipe(userEmailSchema))
  async sendForgotCode(@Body() body: { email: string }) {
    return this.authService.sendForgotCode(body.email);
  }

  @Patch('/forgot-pass')
  @HttpCode(204)
  @UsePipes(
    new BodyValidationPipe(userCodeSchema),
    new BodyValidationPipe(userPasswordSchema),
    new BodyValidationPipe(userEmailSchema),
  )
  async resetPassword(
    @Body() body: { code: string; password: string; email: string },
  ) {
    return this.authService.resetPassword(body.code, body.password, body.email);
  }
}
