import { MiddlewareConsumer, Module, RequestMethod } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User, UserDevices } from '../../entity/user.entity';
import { UserService } from './user.service';
import { UserController } from './user.controller';
import { ProtectRefreshMiddleware } from '../../middlewares/protect-refresh.middleware';

@Module({
  imports: [TypeOrmModule.forFeature([User, UserDevices])],
  controllers: [UserController],
  providers: [UserService],
})
export class UserModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(ProtectRefreshMiddleware).forRoutes({
      path: '/api/user',
      method: RequestMethod.GET,
    });
  }
}
