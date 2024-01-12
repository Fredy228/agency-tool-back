import { MiddlewareConsumer, Module, RequestMethod } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User, UserDevices } from '../../entity/user.entity';
import { UserService } from './user.service';
import { UserController } from './user.controller';
import { ProtectAuthMiddleware } from '../../middlewares/protect-auth.middleware';

@Module({
  imports: [TypeOrmModule.forFeature([User, UserDevices])],
  controllers: [UserController],
  providers: [UserService],
})
export class UserModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(ProtectAuthMiddleware).forRoutes({
      path: '/api/user',
      method: RequestMethod.GET,
    });
  }
}
