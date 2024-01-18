import { TypeOrmModuleOptions } from '@nestjs/typeorm';
import * as dotenv from 'dotenv';
import * as process from 'process';

import { User, UserDevices } from '../entity/user.entity';
import { Organization } from '../entity/organization.entity';

dotenv.config();

const config: TypeOrmModuleOptions = {
  type: 'mysql',
  host: process.env.DB_HOST,
  port: Number(process.env.DB_PORT),
  username: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  entities: [User, UserDevices, Organization],
  synchronize: process.env.PRODUCTION !== 'true', // В режиме разработки можно устанавливать в true, но в продакшене лучше false
  logging: process.env.PRODUCTION !== 'true',
};

export default config;
