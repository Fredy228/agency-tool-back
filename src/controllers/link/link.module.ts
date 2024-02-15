import { MiddlewareConsumer, Module, RequestMethod } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Organization } from '../../entity/organization.entity';
import { User } from '../../entity/user.entity';
import { ProtectAuthMiddleware } from '../../middlewares/protect-auth.middleware';
import { Dashboard } from '../../entity/dashboard.entity';
import { AuthMiddlewareService } from '../../services/auth-middleware.service';
import { Link } from '../../entity/link.entity';
import { LinkService } from './link.service';
import { LinkController } from './link.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Organization, User, Dashboard, Link])],
  controllers: [LinkController],
  providers: [AuthMiddlewareService, LinkService],
})
export class LinkModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(ProtectAuthMiddleware).forRoutes(
      {
        path: '/api/link/:idDashboard',
        method: RequestMethod.POST,
      },
      {
        path: '/api/link/:idLink',
        method: RequestMethod.DELETE,
      },
      {
        path: '/api/link/:idLink',
        method: RequestMethod.PATCH,
      },
    );
  }
}
