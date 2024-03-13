import { MiddlewareConsumer, Module, RequestMethod } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import {
  CollectionScreen,
  CustomScreen,
  Organization,
} from '../../entity/organization.entity';
import { User } from '../../entity/user.entity';
import { AuthMiddlewareService } from '../../services/auth-middleware.service';
import { ImageService } from '../../services/image.service';
import { ProtectAuthMiddleware } from '../../middlewares/protect-auth.middleware';
import { CustomScreensService } from './custom-screens.service';
import { CustomScreensController } from './custom-screens.controller';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Organization,
      User,
      CustomScreen,
      CollectionScreen,
    ]),
  ],
  controllers: [CustomScreensController],
  providers: [CustomScreensService, AuthMiddlewareService, ImageService],
})
export class CustomScreensModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(ProtectAuthMiddleware).forRoutes(
      {
        path: '/api/custom-screens/dashboard',
        method: RequestMethod.POST,
      },
      {
        path: '/api/custom-screens/dashboard',
        method: RequestMethod.GET,
      },
      {
        path: '/api/custom-screens/dashboard/:idScreen',
        method: RequestMethod.DELETE,
      },
      {
        path: '/api/custom-screens/collection',
        method: RequestMethod.POST,
      },
      {
        path: '/api/custom-screens/collection',
        method: RequestMethod.GET,
      },
      {
        path: '/api/custom-screens/collection/:idScreen',
        method: RequestMethod.DELETE,
      },
    );
  }
}
