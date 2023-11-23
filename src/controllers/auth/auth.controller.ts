import { Body, Controller, HttpCode, Post, UsePipes } from '@nestjs/common';

import { LoginAuthDto, RegisterAuthDto } from './auth.dto';
import { UserService } from './auth.service';

import { BodyValidationPipe } from '../../pipe/validator-body.pipe';
import { userCreateSchema } from '../../joi-schema/userSchema';

@Controller('api/auth')
export class AuthController {
  constructor(private readonly userService: UserService) {}

  @Post('/register')
  @HttpCode(200)
  @UsePipes(new BodyValidationPipe(userCreateSchema))
  async register(@Body() registerBody: RegisterAuthDto) {
    return this.userService.signUpCredentials(registerBody);
  }

  @Post('/login')
  @HttpCode(200)
  async login(@Body() loginBody: LoginAuthDto) {
    return this.userService.signInCredentials(loginBody);
  }
}
