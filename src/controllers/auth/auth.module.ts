import { MiddlewareConsumer, Module, RequestMethod } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { AuthController } from './auth.controller';
import { User, UserDevices } from '../../entity/user.entity';
import { AuthService } from './auth.service';
import { ProtectRefreshMiddleware } from '../../middlewares/protect-refresh.middleware';
import { UserAgentMiddleware } from '../../middlewares/user-agent.middleware';

@Module({
  imports: [TypeOrmModule.forFeature([User, UserDevices])],
  controllers: [AuthController],
  providers: [AuthService],
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
      {
        path: '/api/auth/user-agent',
        method: RequestMethod.PATCH,
      },
    );

    consumer.apply(UserAgentMiddleware).forRoutes({
      path: '/api/auth/user-agent',
      method: RequestMethod.PATCH,
    });
  }
}
