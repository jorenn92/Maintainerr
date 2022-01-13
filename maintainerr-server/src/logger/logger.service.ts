import { Injectable } from '@nestjs/common';
import * as winston from 'winston';
import 'winston-daily-rotate-file';
import path from 'path';
import fs from 'fs';

@Injectable()
export class LoggerService {
  public logger: winston.Logger;

  constructor() {
    this.logger = this.getOrCreateLogger();
  }
  getOrCreateLogger(): winston.Logger {
    if (this.logger) {
      return this.logger;
    } else {
      this.removeOldLog();
      return this.createLogger();
    }
  }

  private removeOldLog(): void {
    const OLD_LOG_FILE = path.join(__dirname, '../config/logs/maintainerr.log');

    // Migrate away from old log
    if (fs.existsSync(OLD_LOG_FILE)) {
      const file = fs.lstatSync(OLD_LOG_FILE);

      if (!file.isSymbolicLink()) {
        fs.unlinkSync(OLD_LOG_FILE);
      }
    }
  }

  private hformat = winston.format.printf(
    ({ level, label, message, timestamp, ...metadata }) => {
      let msg = `${timestamp} [${level}]${
        label ? `[${label}]` : ''
      }: ${message} `;
      if (Object.keys(metadata).length > 0) {
        msg += JSON.stringify(metadata);
      }
      return msg;
    },
  );
  private createLogger(): winston.Logger {
    return winston.createLogger({
      level: process.env.LOG_LEVEL || 'debug',
      format: winston.format.combine(
        winston.format.splat(),
        winston.format.timestamp(),
        this.hformat,
      ),
      transports: [
        new winston.transports.Console({
          format: winston.format.combine(
            winston.format.colorize(),
            winston.format.splat(),
            winston.format.timestamp(),
            this.hformat,
          ),
        }),
        new winston.transports.DailyRotateFile({
          filename: process.env.CONFIG_DIRECTORY
            ? `${process.env.CONFIG_DIRECTORY}/logs/maintainerr-%DATE%.log`
            : path.join(__dirname, '../config/logs/maintainerr-%DATE%.log'),
          datePattern: 'YYYY-MM-DD',
          zippedArchive: true,
          maxSize: '20m',
          maxFiles: '7d',
          createSymlink: true,
          symlinkName: 'maintainerr.log',
        }),
      ],
    });
  }
}
