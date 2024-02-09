import { MiddlewareConsumer, Module, RequestMethod } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ProtectAuthMiddleware } from '../../middlewares/protect-auth.middleware';
import { Organization } from '../../entity/organization.entity';
import { OrganizationController } from './organization.controller';
import { OrganizationService } from './organization.service';
import { User } from '../../entity/user.entity';
import { AuthMiddlewareService } from '../../services/auth-middleware.service';

@Module({
  imports: [TypeOrmModule.forFeature([Organization, User])],
  controllers: [OrganizationController],
  providers: [OrganizationService, AuthMiddlewareService],
})
export class OrganizationModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(ProtectAuthMiddleware).forRoutes(
      {
        path: '/api/organization',
        method: RequestMethod.POST,
      },
      {
        path: '/api/organization',
        method: RequestMethod.GET,
      },
      {
        path: '/api/organization',
        method: RequestMethod.PATCH,
      },
    );
  }
}
