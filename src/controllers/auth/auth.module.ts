import { MiddlewareConsumer, Module, RequestMethod } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PassportModule } from '@nestjs/passport';

import { AuthController } from './auth.controller';
import { User, UserDevices } from '../../entity/user.entity';
import { AuthService } from './auth.service';
import { ProtectRefreshMiddleware } from '../../middlewares/protect-refresh.middleware';
import { UserAgentMiddleware } from '../../middlewares/user-agent.middleware';
import { GoogleStrategy } from './google.strategy';
import { AuthMiddlewareService } from '../../services/auth-middleware.service';
import { ProtectAuthMiddleware } from '../../middlewares/protect-auth.middleware';

@Module({
  imports: [
    TypeOrmModule.forFeature([User, UserDevices]),
    PassportModule.register({
      defaultStrategy: 'google',
      prompt: 'select_account',
    }),
  ],
  controllers: [AuthController],
  providers: [AuthService, GoogleStrategy, AuthMiddlewareService],
  exports: [PassportModule],
})
export class AuthModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(ProtectRefreshMiddleware).forRoutes(
      {
        path: '/api/auth/refresh',
        method: RequestMethod.GET,
      },
      {
        path: '/api/auth/logout',
        method: RequestMethod.GET,
      },
    );

    consumer.apply(ProtectAuthMiddleware).forRoutes(
      {
        path: '/api/auth/verification',
        method: RequestMethod.GET,
      },
      {
        path: '/api/auth/verification',
        method: RequestMethod.POST,
      },
    );

    consumer.apply(UserAgentMiddleware).forRoutes(
      {
        path: '/api/auth/google/callback',
        method: RequestMethod.GET,
      },
      {
        path: '/api/auth/register',
        method: RequestMethod.POST,
      },
      {
        path: '/api/auth/login',
        method: RequestMethod.POST,
      },
    );
  }
}
