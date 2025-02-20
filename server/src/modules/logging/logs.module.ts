import { Module } from '@nestjs/common';
import { LogsController } from './logs.controller';
import { LogSettingsService, MaintainerrLogger } from './logs.service';
import winston from 'winston';
import chalk from 'chalk';
import path from 'path';
import DailyRotateFile from 'winston-daily-rotate-file';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { EventEmitterTransport } from './winston/eventEmitterTransport';
import { formatLogMessage } from './logFormatting';
import { Repository } from 'typeorm';
import { LogSettings } from './entities/logSettings.entities';
import { getRepositoryToken, TypeOrmModule } from '@nestjs/typeorm';

const dataDir =
  process.env.NODE_ENV === 'production'
    ? '/opt/data'
    : path.join(__dirname, '../../../../data');

@Module({
  imports: [TypeOrmModule.forFeature([LogSettings])],
  providers: [
    MaintainerrLogger,
    LogSettingsService,
    {
      provide: winston.Logger,
      inject: [getRepositoryToken(LogSettings), EventEmitter2],
      useFactory: async (
        logSettingsRepo: Repository<LogSettings>,
        eventEmitter: EventEmitter2,
      ) => {
        const logSettings = await logSettingsRepo.findOne({ where: {} });
        const logLevel =
          process.env.DEBUG == 'true' ? 'debug' : logSettings.level;
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
            winston.format.printf(
              ({ level, message, timestamp, context, stack }) => {
                return `[maintainerr]  |  ${timestamp}  [${level.toUpperCase()}] [${context}] ${formatLogMessage(message, stack)}`;
              },
            ),
          ),
        });

        return winston.createLogger({
          level: logLevel,
          levels: {
            fatal: 0,
            error: 1,
            warn: 2,
            info: 3,
            verbose: 4,
            debug: 5,
          },
          format: winston.format.combine(
            winston.format.timestamp({ format: 'DD/MM/YYYY HH:mm:ss' }),
            winston.format.printf(
              ({ level, message, timestamp, context, stack }) => {
                const coloredTimestamp = chalk.white(timestamp);

                const colouredMessage = (message) => {
                  return level === 'debug' || level === 'verbose'
                    ? chalk.gray(message)
                    : level === 'error' || level === 'fatal'
                      ? chalk.red(message)
                      : level === 'warn'
                        ? chalk.yellow(message)
                        : level === 'info'
                          ? chalk.green(message)
                          : chalk.cyan(message);
                };

                const formattedLevel = `[${level.toUpperCase()}]`;

                return `${chalk.green(`[maintainerr] |`)} ${coloredTimestamp}  ${colouredMessage(formattedLevel)} ${chalk.blue(`[${context}]`)} ${colouredMessage(formatLogMessage(message, stack))}}`;
              },
            ),
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
  exports: [MaintainerrLogger, LogSettingsService],
  controllers: [LogsController],
})
export class LogsModule {}
