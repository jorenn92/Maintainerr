import { Injectable, LoggerService } from '@nestjs/common';
import winston from 'winston';
import DailyRotateFile from 'winston-daily-rotate-file';
import { LogSettingDto } from '@maintainerr/contracts';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import {
  DEFAULT_LOG_LEVEL,
  DEFAULT_LOG_MAX_FILES,
  DEFAULT_LOG_MAX_SIZE,
  LogSettings,
} from './entities/logSettings.entities';

@Injectable()
export class LogSettingsService {
  constructor(
    private readonly logger: winston.Logger,
    @InjectRepository(LogSettings)
    private readonly logSettingsRepo: Repository<LogSettings>,
  ) {}

  public async get(): Promise<LogSettingDto> {
    const logSetting = await this.logSettingsRepo.findOne({ where: {} });

    if (!logSetting) {
      this.logger.warn(
        'Using default log settings as none were found. This is normal on first boot.',
      );

      return {
        level: DEFAULT_LOG_LEVEL,
        max_size: DEFAULT_LOG_MAX_SIZE,
        max_files: DEFAULT_LOG_MAX_FILES,
      };
    } else {
      return {
        level: logSetting.level,
        max_size: logSetting.max_size,
        max_files: logSetting.max_files,
      };
    }
  }

  public async update(settings: LogSettingDto): Promise<void> {
    this.logger.level = settings.level;

    const rotateTransport = this.logger.transports.find(
      (x): x is DailyRotateFile => x instanceof DailyRotateFile,
    );

    if (rotateTransport) {
      rotateTransport.options.maxFiles = settings.max_files;
      rotateTransport.options.maxSize = `${settings.max_size}m`;
    }

    const logSetting = await this.logSettingsRepo.findOne({ where: {} });

    const data = {
      ...logSetting,
      log_level: settings.level,
      log_max_size: settings.max_size,
      log_max_files: settings.max_files,
    };

    await this.logSettingsRepo.save(data);
  }
}

@Injectable()
export class MaintainerrLogger implements LoggerService {
  private context?: string;

  constructor(private readonly logger: winston.Logger) {}

  public setContext(context: string) {
    this.context = context;
  }

  public log(message: any, context?: string): any {
    context = context || this.context;

    if (!!message && typeof message === 'object') {
      const { message: msg, level = 'info', ...meta } = message;

      return this.logger.log(level, msg as string, { context, ...meta });
    }

    return this.logger.info(message, { context });
  }

  public fatal(message: any, trace?: string, context?: string): any {
    context = context || this.context;

    if (message instanceof Error) {
      const { message: msg, stack, ...meta } = message;

      return this.logger.log({
        level: 'fatal',
        message: msg,
        context,
        stack: [trace || stack],
        error: message,
        ...meta,
      });
    }

    if (!!message && typeof message === 'object') {
      const { message: msg, ...meta } = message;

      return this.logger.log({
        level: 'fatal',
        message: msg,
        context,
        stack: [trace],
        ...meta,
      });
    }

    return this.logger.log({
      level: 'fatal',
      message,
      context,
      stack: [trace],
    });
  }

  public error(message: any, trace?: string, context?: string): any {
    context = context || this.context;

    if (message instanceof Error) {
      const { message: msg, stack, ...meta } = message;

      return this.logger.error(msg, {
        context,
        stack: [trace || stack],
        error: message,
        ...meta,
      });
    }

    if (!!message && typeof message == 'object') {
      const { message: msg, ...meta } = message;

      return this.logger.error(msg as string, {
        context,
        stack: [trace],
        ...meta,
      });
    }

    return this.logger.error(message, { context, stack: [trace] });
  }

  public warn(message: any, context?: string): any {
    context = context || this.context;

    if (!!message && typeof message === 'object') {
      const { message: msg, ...meta } = message;

      return this.logger.warn(msg as string, { context, ...meta });
    }

    return this.logger.warn(message, { context });
  }

  public debug?(message: any, context?: string): any {
    context = context || this.context;

    if (!!message && typeof message === 'object') {
      const { message: msg, ...meta } = message;

      return this.logger.debug(msg as string, { context, ...meta });
    }

    return this.logger.debug(message, { context });
  }

  public verbose?(message: any, context?: string): any {
    context = context || this.context;

    if (!!message && typeof message === 'object') {
      const { message: msg, ...meta } = message;

      return this.logger.verbose(msg as string, { context, ...meta });
    }

    return this.logger.verbose(message, { context });
  }
}
