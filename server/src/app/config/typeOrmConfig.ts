import { TypeOrmModuleOptions } from '@nestjs/typeorm';
import path from 'path';

const dataDir = process.env.DATA_DIR;
const appDir = process.env.APP_DIR;

const ormConfig: TypeOrmModuleOptions = {
  type: 'sqlite',
  logging: false,
  database:
    process.env.NODE_ENV === 'production'
      ? path.join(dataDir, 'maintainerr.sqlite')
      : '../data/maintainerr.sqlite',
  subscribers: ['./**/*.subscriber{.ts,.js}'],
  migrations:
    process.env.NODE_ENV === 'production'
      ? [path.join(appDir, 'server/database/migrations/**/*{.js,.ts}')]
      : ['./dist/database/migrations/**/*{.js,.ts}'],
  autoLoadEntities: true,
  migrationsRun: true,
};
export default ormConfig;
