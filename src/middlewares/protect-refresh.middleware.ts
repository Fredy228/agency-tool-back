import { Injectable, NestMiddleware } from '@nestjs/common';
import { NextFunction, Request, Response } from 'express';
import { JwtService } from '@nestjs/jwt';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';

import { CustomException } from '../services/custom-exception';
import { StatusEnum } from '../enum/error/StatusEnum';
import { User, UserDevices } from '../entity/user.entity';

@Injectable()
export class ProtectRefreshMiddleware implements NestMiddleware {
  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
    private jwtService: JwtService,
  ) {}

  async use(
    req: Request & { user?: User; currentDevice: UserDevices },
    _: Response,
    next: NextFunction,
  ) {
    const token =
      req.headers.authorization?.startsWith('Bearer') &&
      req.headers.authorization.split(' ')[1];

    if (!token)
      throw new CustomException(StatusEnum.UNAUTHORIZED, 'Not authorized');

    const decodedToken = await this.jwtService.verify(token);

    const currentUser = await this.usersRepository.findOne({
      where: { id: decodedToken.id },
      relations: ['devices'],
    });
    if (!currentUser)
      throw new CustomException(StatusEnum.UNAUTHORIZED, 'Not authorized');

    const currentDevice = currentUser.devices.find(
      (i) => i.refreshToken === token,
    );
    if (!currentDevice)
      throw new CustomException(StatusEnum.UNAUTHORIZED, 'Not authorized');

    req.user = currentUser;
    req.currentDevice = currentDevice;

    next();
  }
}
