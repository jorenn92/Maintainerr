import {
  forwardRef,
  Inject,
  Injectable,
  LoggerService,
  LogLevel,
} from '@nestjs/common';
import winston from 'winston';
import { LogSettingsService } from '../settings/settings.service';
import DailyRotateFile from 'winston-daily-rotate-file';
import { LogSettings } from './dtos/logSettings.dto';

@Injectable()
export class MaintainerrLogger implements LoggerService {
  constructor(private readonly logger: winston.Logger) {}

  log(message: string, ...optionalParams: any[]) {
    this.logger.log('info', message, this.getContextMetaData(optionalParams));
  }

  error(error: Error, ...optionalParams: any[]) {
    this.logger.error({
      ...error,
      ...this.getContextMetaData(optionalParams, true),
    });
  }

  warn(message: string, ...optionalParams: any[]) {
    this.logger.warn(message, this.getContextMetaData(optionalParams));
  }

  debug(message: string, ...optionalParams: any[]) {
    this.logger.debug(message, this.getContextMetaData(optionalParams));
  }

  verbose(message: string, ...optionalParams: any[]) {
    this.logger.verbose(message, this.getContextMetaData(optionalParams));
  }

  fatal(message: string, ...optionalParams: any[]) {
    this.logger.error(message, this.getContextMetaData(optionalParams));
  }

  private getContextMetaData(optionalParams: any[], isError = false) {
    const meta = this.extractMeta(optionalParams, isError);
    return meta;
  }

  private extractMeta(optionalParams: any[], isError = false): any {
    const meta: any = {};
    if (!optionalParams) {
      return undefined;
    }

    const context = optionalParams.pop(); // last argument is expected to be the context,
    if (context) {
      meta.context = context;
    }

    if (isError) {
      // with error logs we can also expect the second to last argument (if exists, to be the error stack).
      const stack = optionalParams.pop(); // one before last argument is expected to be the context;
      if (stack) {
        meta.stack = stack;
      }
    }

    return Object.keys(meta).length ? meta : undefined;
  }
}

@Injectable()
export class MaintainerrLogConfigService {
  constructor(
    private readonly logger: winston.Logger,
    @Inject(forwardRef(() => LogSettingsService))
    private readonly settings: LogSettingsService,
  ) {}

  public async update(settings: LogSettings) {
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
