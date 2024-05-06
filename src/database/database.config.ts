import { TypeOrmModuleOptions } from '@nestjs/typeorm';
import * as dotenv from 'dotenv';
import * as process from 'process';

import { User, UserDevices } from '../entity/user.entity';
import {
  CollectionScreen,
  CustomScreen,
  Organization,
} from '../entity/organization.entity';
import { Dashboard } from '../entity/dashboard.entity';
import { Link } from '../entity/link.entity';
import { Collection } from '../entity/collection.entity';
import { ScreenCollection, ScreenDashboard } from '../entity/screens.entity';
import {
  CollectionFolder,
  CollectionSection,
} from '../entity/collection-details.entity';

dotenv.config();

const config: TypeOrmModuleOptions = {
  type: 'mysql',
  host: process.env.DB_HOST,
  port: Number(process.env.DB_PORT),
  username: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  entities: [
    User,
    UserDevices,
    Organization,
    CustomScreen,
    CollectionScreen,
    Dashboard,
    Link,
    Collection,
    ScreenDashboard,
    ScreenCollection,
    CollectionSection,
    CollectionFolder,
  ],
  synchronize: process.env.PRODUCTION !== 'true', // В режиме разработки можно устанавливать в true, но в продакшене лучше false
  logging: process.env.PRODUCTION !== 'true',
};

export default config;
