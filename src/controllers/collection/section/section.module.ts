import { MiddlewareConsumer, Module, RequestMethod } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from '../../../entity/user.entity';
import {
  Collection,
  CollectionSection,
} from '../../../entity/collection.entity';
import { ProtectAuthMiddleware } from '../../../middlewares/protect-auth.middleware';
import { SectionController } from './section.controller';
import { AuthMiddlewareService } from '../../../services/auth-middleware.service';
import { SectionService } from './section.service';
import { FolderModule } from '../folder/folder.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([User, Collection, CollectionSection]),
    FolderModule,
  ],
  controllers: [SectionController],
  providers: [SectionService, AuthMiddlewareService],
})
export class SectionModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(ProtectAuthMiddleware).forRoutes(
      {
        path: 'api/collection/section/:idCollection',
        method: RequestMethod.POST,
      },
      {
        path: 'api/collection/section/:idSection',
        method: RequestMethod.PATCH,
      },
      {
        path: 'api/collection/section/:idSection',
        method: RequestMethod.DELETE,
      },
    );
  }
}
