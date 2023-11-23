import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { AuthController } from './auth.controller';
import { User, UserDevices } from './auth.entity';

@Module({
  imports: [TypeOrmModule.forFeature([User, UserDevices])],
  controllers: [AuthController],
  providers: [],
})
export class AuthModule {}
