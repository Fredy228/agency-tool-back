import { Controller, Get, HttpCode, Req } from '@nestjs/common';
import { UserService } from './user.service';
import { Request } from 'express';
import { User } from '../../entity/user.entity';

@Controller('api/user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Get('/')
  @HttpCode(200)
  async getMe(@Req() req: Request & { user: User }): Promise<User> {
    return this.userService.getUser(req.user);
  }
}
