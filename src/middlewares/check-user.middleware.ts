import { Injectable, NestMiddleware } from '@nestjs/common';
import { NextFunction, Request, Response } from 'express';
import { User } from '../entity/user.entity';
import { AuthMiddlewareService } from '../services/auth-middleware.service';

@Injectable()
export class CheckUserMiddleware implements NestMiddleware {
  constructor(private readonly authMiddlewareService: AuthMiddlewareService) {}

  async use(req: Request & { user?: User }, _: Response, next: NextFunction) {
    const token = this.authMiddlewareService.checkAccessToken(
      req.headers.authorization,
    );

    if (!token) return next();

    req.user = await this.authMiddlewareService.findUser(token);

    next();
  }
}
