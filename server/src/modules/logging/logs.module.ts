import { Module } from '@nestjs/common';
import { LogsController } from './logs.controller';
import { MaintainerrLogConfigService, MaintainerrLogger } from './logs.service';
import winston from 'winston';
import chalk from 'chalk';
import path from 'path';
import DailyRotateFile from 'winston-daily-rotate-file';
import { LogSettingsService } from '../settings/settings.service';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { EventEmitterTransport } from './winston/eventEmitterTransport';

const dataDir =
  process.env.NODE_ENV === 'production'
    ? '/opt/data'
    : path.join(__dirname, '../../../../data');

@Module({
  imports: [],
  providers: [
    MaintainerrLogger,
    MaintainerrLogConfigService,
    {
      provide: winston.Logger,
      inject: [LogSettingsService, EventEmitter2],
      useFactory: async (
        settings: LogSettingsService,
        eventEmitter: EventEmitter2,
      ) => {
        const logSettings = await settings.get();
        const logLevel =
          process.env.DEBUG == 'true' ? 'silly' : logSettings.level;
        const maxSize = `${logSettings.max_size}m`;
        const maxFiles = `${logSettings.max_files}d`;

        const dailyRotateFileTransport = new DailyRotateFile({
          filename: path.join(dataDir, 'logs/maintainerr-%DATE%.log'),
          datePattern: 'YYYY-MM-DD',
          zippedArchive: true,
          maxSize: maxSize,
          maxFiles: maxFiles,
          format: winston.format.combine(
            winston.format.timestamp({ format: 'DD/MM/YYYY HH:mm:ss' }),
            winston.format.printf(({ level, message, timestamp, context }) => {
              return `[maintainerr]  |  ${timestamp}  [${level.toUpperCase()}] [${context}] ${message}`;
            }),
          ),
        });

        return winston.createLogger({
          level: logLevel,
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
            dailyRotateFileTransport,
            new EventEmitterTransport(eventEmitter),
          ],
        });
      },
    },
  ],
  exports: [MaintainerrLogger, MaintainerrLogConfigService],
  controllers: [LogsController],
})
export class LogsModule {}
