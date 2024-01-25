import { NestFactory } from '@nestjs/core';
import { AppModule } from './app/app.module';
import { WinstonModule } from 'nest-winston';
import winston from 'winston';
import DailyRotateFile from 'winston-daily-rotate-file';
import chalk from 'chalk';
import path from 'path';
import * as fs from 'fs';

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
          filename: path.join(
            __dirname,
            `../../data/logs/maintainerr-%DATE%.log`,
          ),
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
  app.enableCors();
  await app.listen(3001);
}

function createDataDirectoryStructure(): void {
  const dir = path.join(__dirname, `../../data/logs`);

  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, {
      recursive: true,
      mode: 0o777,
    });
    console.log(`Data directory structure created.`);
  }
}

createDataDirectoryStructure();
bootstrap();
