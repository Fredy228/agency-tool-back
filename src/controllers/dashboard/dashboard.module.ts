import { MiddlewareConsumer, Module, RequestMethod } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CustomScreen, Organization } from '../../entity/organization.entity';
import { User } from '../../entity/user.entity';
import { ProtectAuthMiddleware } from '../../middlewares/protect-auth.middleware';
import { Dashboard } from '../../entity/dashboard.entity';
import { DashboardController } from './dashboard.controller';
import { DashboardService } from './dashboard.service';
import { CheckUserMiddleware } from '../../middlewares/check-user.middleware';
import { AuthMiddlewareService } from '../../services/auth-middleware.service';
import { ImageService } from '../../services/image.service';
import { ScreenDashboard } from '../../entity/screens.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Organization,
      User,
      Dashboard,
      ScreenDashboard,
      CustomScreen,
    ]),
  ],
  controllers: [DashboardController],
  providers: [DashboardService, AuthMiddlewareService, ImageService],
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
      {
        path: '/api/dashboard/:idDashboard',
        method: RequestMethod.PATCH,
      },
      {
        path: '/api/dashboard/logo/:idDashboard',
        method: RequestMethod.DELETE,
      },
    );

    consumer.apply(CheckUserMiddleware).forRoutes({
      path: '/api/dashboard/:idDashboard',
      method: RequestMethod.GET,
    });
  }
}
