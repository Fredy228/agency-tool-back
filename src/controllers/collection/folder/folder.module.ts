import { MiddlewareConsumer, Module, RequestMethod } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from '../../../entity/user.entity';
import {
  CollectionFolder,
  CollectionSection,
} from '../../../entity/collection.entity';
import { AuthMiddlewareService } from '../../../services/auth-middleware.service';
import { ProtectAuthMiddleware } from '../../../middlewares/protect-auth.middleware';
import { FolderService } from './folder.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([User, CollectionSection, CollectionFolder]),
  ],
  controllers: [],
  providers: [FolderService, AuthMiddlewareService],
})
export class FolderModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(ProtectAuthMiddleware).forRoutes(
      {
        path: 'api/collection/folder/:idSection',
        method: RequestMethod.POST,
      },
      {
        path: 'api/collection/folder/:idFolder',
        method: RequestMethod.PATCH,
      },
      {
        path: 'api/collection/folder/:idFolder',
        method: RequestMethod.DELETE,
      },
    );
  }
}
