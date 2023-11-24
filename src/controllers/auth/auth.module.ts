import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { AuthController } from './auth.controller';
import { User, UserDevices } from './auth.entity';
import { UserService } from './auth.service';

@Module({
  imports: [TypeOrmModule.forFeature([User, UserDevices])],
  controllers: [AuthController],
  providers: [UserService],
})
export class AuthModule {}
