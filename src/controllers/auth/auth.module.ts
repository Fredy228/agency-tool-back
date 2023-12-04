import { MiddlewareConsumer, Module, RequestMethod } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { AuthController } from './auth.controller';
import { User, UserDevices } from './auth.entity';
import { UserService } from './auth.service';
import { ProtectRefreshMiddleware } from '../../middlewares/protect-refresh.middleware';

@Module({
  imports: [TypeOrmModule.forFeature([User, UserDevices])],
  controllers: [AuthController],
  providers: [UserService],
})
export class AuthModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(ProtectRefreshMiddleware).forRoutes({
      path: '/api/auth/refresh',
      method: RequestMethod.GET,
    });
  }
}
