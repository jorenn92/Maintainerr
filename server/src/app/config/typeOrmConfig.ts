import { TypeOrmModuleOptions } from '@nestjs/typeorm';

const ormConfig: TypeOrmModuleOptions = {
  type: 'sqlite',
  logging: false,
  database:
    process.env.NODE_ENV === 'production'
      ? '/opt/data/maintainerr.sqlite'
      : '../data/maintainerr.sqlite',
  subscribers: ['./**/*.subscriber{.ts,.js}'],
  migrations:
    process.env.NODE_ENV === 'production'
      ? ['/opt/app/server/database/migrations/**/*{.js,.ts}'] // TODO: Update this path for the archives
      : ['./dist/database/migrations/**/*{.js,.ts}'],
  autoLoadEntities: true,
  migrationsRun: true,
};
export default ormConfig;
