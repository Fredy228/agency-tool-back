import { TypeOrmModule } from '@nestjs/typeorm';
import { Module } from '@nestjs/common';
import databaseConfig from './database/database.config';
import { AuthModule } from './controllers/auth/auth.module';

@Module({
  imports: [TypeOrmModule.forRoot(databaseConfig), AuthModule],
})
export class MainModule {}
