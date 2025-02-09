import { NestFactory } from '@nestjs/core';
import { AppModule } from './app/app.module';
import { WinstonModule } from 'nest-winston';
import winston from 'winston';
import DailyRotateFile from 'winston-daily-rotate-file';
import chalk from 'chalk';
import path from 'path';
import * as fs from 'fs';
import { ConfigService } from '@nestjs/config';

const dataDir =
  process.env.NODE_ENV === 'production'
    ? process.env.DATA_DIR
    : path.join(__dirname, '../../data');

const appDir =
  process.env.NODE_ENV === 'production'
    ? process.env.APP_DIR
    : path.join(__dirname, '../../');

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    // Winston logger config
    logger: WinstonModule.createLogger({
      level:
        process.env.NODE_ENV !== 'production' || process.env.DEBUG == 'true'
          ? 'silly'
          : 'info',
      format: winston.format.combine(
        // winston.format.colorize(),
        winston.format.timestamp({ format: 'DD/MM/YYYY HH:mm:ss' }),
        // winston.format.timestamp(),
        winston.format.printf(({ level, message, timestamp, context }) => {
          const coloredTimestamp = chalk.white(timestamp);
          level = `[${level.toUpperCase()}]`;
          const coloredLevel =
            level === '[DEBUG]'
              ? chalk.gray(level)
              : level === '[ERROR]'
                ? chalk.red(level)
                : level === '[WARN]'
                  ? chalk.yellow(level)
                  : level === '[INFO]'
                    ? chalk.green(level)
                    : chalk.cyan(level);

          const coloredMessage =
            level === '[DEBUG]'
              ? chalk.gray(message)
              : level === '[ERROR]'
                ? chalk.red(message)
                : level === '[WARN]'
                  ? chalk.yellow(message)
                  : level === '[INFO]'
                    ? chalk.green(message)
                    : chalk.cyan(message);
          return `${chalk.green(`[maintainerr] |`)} ${coloredTimestamp}  ${coloredLevel} ${chalk.blue(`[${context}]`)} ${coloredMessage}`;
        }),
      ),
      transports: [
        new winston.transports.Console(),
        new DailyRotateFile({
          filename: path.join(dataDir, 'logs/maintainerr-%DATE%.log'),
          datePattern: 'YYYY-MM-DD',
          zippedArchive: true,
          maxSize: '20m',
          maxFiles: '7d',
          format: winston.format.combine(
            winston.format.timestamp({ format: 'DD/MM/YYYY HH:mm:ss' }),
            winston.format.printf(({ level, message, timestamp, context }) => {
              return `[maintainerr]  |  ${timestamp}  [${level.toUpperCase()}] [${context}] ${message}`;
            }),
          ),
        }) as winston.transport,
      ],
    }),
  });
  // End Winston logger config

  app.enableCors({ origin: true });

  const configService = app.get(ConfigService);
  const apiPort = configService.get<number>('API_PORT');

  await app.listen(apiPort);
}

function createDataDirectoryStructure() {
  // Validate that APP_DIR is correct
  if (!fs.existsSync(path.join(appDir, 'server'))) {
    console.error(
      `Could not locate the server app folder in: ${appDir}. Please make sure APP_DIR is set correctly.`,
    );
    process.exit(1);
  }

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
    console.error(
      `Could not create or access (files in) the data directory: ${dataDir}. Please make sure the necessary permissions are set. Refer to the documentation for more information: https://docs.maintainerr.info/latest/Installation/`,
    );
    process.exit(1);
  }
}

createDataDirectoryStructure();
bootstrap();
