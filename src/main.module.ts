import { TypeOrmModule } from '@nestjs/typeorm';
import { Module } from '@nestjs/common';
import databaseConfig from './database/database.config';
import { AuthModule } from './controllers/auth/auth.module';
import * as process from 'process';
import { JwtModule } from '@nestjs/jwt';
import { UserModule } from './controllers/user/user.module';
import { OrganizationModule } from './controllers/organization/organization.module';

@Module({
  imports: [
    TypeOrmModule.forRoot(databaseConfig),
    JwtModule.register({
      global: true,
      secret: process.env.JWT_SECRET,
      signOptions: { expiresIn: '3d' },
    }),
    AuthModule,
    UserModule,
    OrganizationModule,
  ],
})
export class MainModule {}
