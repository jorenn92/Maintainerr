import { forwardRef, Inject, Injectable, LoggerService } from '@nestjs/common';
import winston from 'winston';
import { LogSettingsService } from '../settings/settings.service';
import DailyRotateFile from 'winston-daily-rotate-file';
import { LogSettingDto } from '@maintainerr/contracts';

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

@Injectable()
export class MaintainerrLogConfigService {
  constructor(
    private readonly logger: winston.Logger,
    @Inject(forwardRef(() => LogSettingsService))
    private readonly settings: LogSettingsService,
  ) {}

  public async update(settings: LogSettingDto) {
    this.logger.level = settings.level;
    const rotateTransport = this.logger.transports.find(
      (x): x is DailyRotateFile => x instanceof DailyRotateFile,
    );

    if (rotateTransport) {
      rotateTransport.options.maxFiles = settings.max_files;
      rotateTransport.options.maxSize = `${settings.max_size}m`;
    }

    return this.settings.update(settings);
  }

  public async get() {
    return this.settings.get();
  }

  public getLogger() {
    return this.logger;
  }
}
