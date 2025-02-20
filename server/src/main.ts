import { NestFactory } from '@nestjs/core';
import { AppModule } from './app/app.module';
import path from 'path';
import * as fs from 'fs';
import { MaintainerrLogger } from './modules/logging/logs.service';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { patchNestJsSwagger } from 'nestjs-zod';
import metadata from './metadata';

const dataDir =
  process.env.NODE_ENV === 'production'
    ? '/opt/data'
    : path.join(__dirname, '../../data');

patchNestJsSwagger();

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    bufferLogs: true,
  });

  await SwaggerModule.loadPluginMetadata(metadata);

  const config = new DocumentBuilder().setTitle('Maintainerr').build();
  const documentFactory = () => SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/swagger', app, documentFactory);

  app.useLogger(app.get(MaintainerrLogger));
  app.enableCors({ origin: true });

  const apiPort = process.env.API_PORT || 3001;
  await app.listen(apiPort);
}

function createDataDirectoryStructure() {
  try {
    // Check if data directory has read and write permissions
    fs.accessSync(dataDir, fs.constants.R_OK | fs.constants.W_OK);

    // create logs dir
    const dir = path.join(dataDir, 'logs');
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, {
        recursive: true,
        mode: 0o777,
      });
    }

    // if db already exists, check r/w permissions
    const db = path.join(dataDir, 'maintainerr.sqlite');
    if (fs.existsSync(db)) {
      fs.accessSync(db, fs.constants.R_OK | fs.constants.W_OK);
    }
  } catch (err) {
    console.warn(
      `THE CONTAINER NO LONGER OPERATES WITH PRIVILEGED USER PERMISSIONS. PLEASE UPDATE YOUR CONFIGURATION ACCORDINGLY: https://github.com/jorenn92/Maintainerr/releases/tag/v2.0.0`,
    );
    console.error(
      'Could not create or access (files in) the data directory. Please make sure the necessary permissions are set',
    );
    process.exit(0);
  }
}

createDataDirectoryStructure();
bootstrap();
