import { HttpStatus, Injectable, NestMiddleware } from '@nestjs/common';
import { NextFunction, Request, Response } from 'express';
import { JwtService } from '@nestjs/jwt';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';

import { CustomException } from '../services/custom-exception';
import { User } from '../entity/user.entity';

@Injectable()
export class CheckUserMiddleware implements NestMiddleware {
  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
    private jwtService: JwtService,
  ) {}

  async use(req: Request & { user?: User }, _: Response, next: NextFunction) {
    const token =
      req.headers.authorization?.startsWith('Bearer') &&
      req.headers.authorization.split(' ')[1];

    if (!token) return next();

    const decodedToken = await this.jwtService.verify(token);

    const currentUser = await this.usersRepository.findOneBy({
      id: decodedToken.id,
    });

    if (!currentUser)
      throw new CustomException(HttpStatus.UNAUTHORIZED, 'Not authorized');

    req.user = currentUser;

    next();
  }
}
