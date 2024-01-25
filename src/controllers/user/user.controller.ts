import { Controller, Get, HttpCode, Req } from '@nestjs/common';
import { UserService } from './user.service';
import { Request } from 'express';
import { User, UserDevices } from '../../entity/user.entity';

@Controller('api/user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Get('/')
  @HttpCode(200)
  async getMe(
    @Req() req: Request & { user: User; currentDevice: UserDevices },
  ): Promise<User & { currentDevice: UserDevices }> {
    return this.userService.getUser(req.user, req.currentDevice);
  }
}
