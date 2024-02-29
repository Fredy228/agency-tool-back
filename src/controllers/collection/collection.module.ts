import { MiddlewareConsumer, Module, RequestMethod } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Organization } from '../../entity/organization.entity';
import { User } from '../../entity/user.entity';
import { ProtectAuthMiddleware } from '../../middlewares/protect-auth.middleware';
import { Dashboard } from '../../entity/dashboard.entity';
import { AuthMiddlewareService } from '../../services/auth-middleware.service';
import { CollectionService } from './collection.service';
import { CollectionController } from './collection.controller';
import { Collection } from '../../entity/collection.entity';
import { CheckUserMiddleware } from '../../middlewares/check-user.middleware';
import { ImageService } from '../../services/image.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([Organization, User, Dashboard, Collection]),
  ],
  controllers: [CollectionController],
  providers: [CollectionService, AuthMiddlewareService, ImageService],
})
export class CollectionModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(ProtectAuthMiddleware).forRoutes(
      {
        path: '/api/collection/:idDashboard',
        method: RequestMethod.POST,
      },
      {
        path: '/api/collection/:idCollection',
        method: RequestMethod.DELETE,
      },
      {
        path: '/api/collection/:idCollection',
        method: RequestMethod.PATCH,
      },
    );

    consumer.apply(CheckUserMiddleware).forRoutes({
      path: '/api/collection/:idCollection',
      method: RequestMethod.GET,
    });
  }
}
