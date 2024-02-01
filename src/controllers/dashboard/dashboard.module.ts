import { MiddlewareConsumer, Module, RequestMethod } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Organization } from '../../entity/organization.entity';
import { User } from '../../entity/user.entity';
import { ProtectAuthMiddleware } from '../../middlewares/protect-auth.middleware';
import { Dashboard } from '../../entity/dashboard.entity';
import { DashboardController } from './dashboard.controller';
import { DashboardService } from './dashboard.service';
import { CheckUserMiddleware } from '../../middlewares/check-user.middleware';

@Module({
  imports: [TypeOrmModule.forFeature([Organization, User, Dashboard])],
  controllers: [DashboardController],
  providers: [DashboardService],
})
export class DashboardModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(ProtectAuthMiddleware).forRoutes(
      {
        path: '/api/dashboard',
        method: RequestMethod.POST,
      },
      {
        path: '/api/dashboard',
        method: RequestMethod.GET,
      },
      {
        path: '/api/dashboard/:idDashboard',
        method: RequestMethod.DELETE,
      },
    );

    consumer.apply(CheckUserMiddleware).forRoutes({
      path: '/api/dashboard/:idDashboard',
      method: RequestMethod.GET,
    });
  }
}
