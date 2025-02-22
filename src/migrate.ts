import * as tsConfigPaths from 'tsconfig-paths';
tsConfigPaths.register();

import { NestFactory } from '@nestjs/core';
import { Sequelize } from 'sequelize';
import { getConnectionToken } from '@nestjs/sequelize';
import { migrator } from '@core/shared/infra/db/sequelize/migrator';
import { MigrationsModule } from 'src/nest-modules/database-module/migrations.module';

async function bootstrap() {
  const app = await NestFactory.createApplicationContext(MigrationsModule, {
    logger: ['error'],
  });

  const sequelize = app.get<Sequelize>(getConnectionToken());

  migrator(sequelize).runAsCLI();
}
bootstrap();
