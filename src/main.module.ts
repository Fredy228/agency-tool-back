import { TypeOrmModule } from '@nestjs/typeorm';
import { Module } from '@nestjs/common';
import databaseConfig from './database/database.config';
import { AuthModule } from './controllers/auth/auth.module';
import * as process from 'process';
import * as dotenv from 'dotenv';
import { JwtModule } from '@nestjs/jwt';
import { MailerModule } from '@nestjs-modules/mailer';
import { PugAdapter } from '@nestjs-modules/mailer/dist/adapters/pug.adapter';

import { UserModule } from './controllers/user/user.module';
import { OrganizationModule } from './controllers/organization/organization.module';
import { DashboardModule } from './controllers/dashboard/dashboard.module';
import { LinkModule } from './controllers/link/link.module';
import { CollectionModule } from './controllers/collection/collection.module';
import { CustomScreensModule } from './controllers/custom-screens/custom-screens.module';

dotenv.config();

@Module({
  imports: [
    TypeOrmModule.forRoot(databaseConfig),
    JwtModule.register({
      global: true,
      secret: process.env.JWT_SECRET,
      signOptions: { expiresIn: '7d' },
    }),
    MailerModule.forRoot({
      transport: {
        host: process.env.SMTP_DOMAIN,
        port: Number(process.env.SMTP_PORT),
        secure: false,
        auth: {
          user: process.env.SMTP_USER,
          pass: process.env.SMTP_PASS,
        },
      },
      defaults: {
        from: '"nest-modules" <modules@nestjs.com>',
      },
      template: {
        dir: process.cwd() + '/templates/',
        adapter: new PugAdapter(),
        options: {
          strict: true,
        },
      },
    }),
    AuthModule,
    UserModule,
    OrganizationModule,
    DashboardModule,
    LinkModule,
    CollectionModule,
    CustomScreensModule,
  ],
  providers: [],
})
export class MainModule {}

//`smtps://${process.env.SMTP_USER}:${process.env.SMTP_PASS}@${process.env.SMTP_DOMAIN}`
