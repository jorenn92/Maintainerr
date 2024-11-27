import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Sse,
  StreamableFile,
} from '@nestjs/common';
import {
  concat,
  from,
  map,
  Observable,
  mergeAll,
  switchMap,
  fromEvent,
} from 'rxjs';
import { LogEvent } from './log-event';
import path from 'path';
import readLastLines from 'read-last-lines';
import { createReadStream, readdir } from 'fs';
import { readdir as readdirp, stat } from 'fs/promises';
import mime from 'mime-types';
import { LogSettings } from './dtos/logSettings.dto';
import { MaintainerrLogConfigService } from './logs.service';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { LogFile } from './dtos/logFile.dto';

const logsDirectory = path.join(__dirname, `../../../../data/logs`);

@Controller('/api/logs')
export class LogsController {
  constructor(
    private readonly logSettingsService: MaintainerrLogConfigService,
    private readonly eventEmitter: EventEmitter2,
  ) {}

  @Sse('stream')
  stream(): Observable<MessageEvent> {
    const currentLogFile = new Promise<string | undefined>(
      (resolve, reject) => {
        readdir(logsDirectory, (err, files) => {
          if (err) {
            reject(err);
          } else {
            const currentLogFile = files
              .filter((x) => x.endsWith('.log'))
              .sort()
              .reverse()?.[0];
            const filePath = path.join(logsDirectory, currentLogFile);
            resolve(filePath);
          }
        });
      },
    );

    const currentLogFileRecentLines = from(currentLogFile).pipe(
      switchMap((file) =>
        from(readLastLines.read(file, 200).then((x) => [...x.split('\r\n')])),
      ),
    );

    // TODO The UI seems to stop receiving after a few mins?
    const tailLogs = fromEvent(this.eventEmitter, 'log').pipe(
      map((info: any) => {
        return {
          date: strToDate(info.timestamp),
          level: info.level,
          message: info.message,
        };
      }),
    );

    return concat(
      from(currentLogFileRecentLines).pipe(
        mergeAll(),
        map((data: string) => {
          const logEvent = parseLine(data);
          const event = new MessageEvent('log', { data: logEvent });
          return event;
        }),
      ),
      from(tailLogs).pipe(
        map((data) => {
          const message = `${data.message}${data.message instanceof Error ? `\n${data.message.stack}` : ''}`;

          const event = new MessageEvent('log', {
            data: {
              date: data.date,
              level: data.level,
              message: message,
            },
          });

          return event;
        }),
      ),
    );
  }

  @Get('files')
  async getFiles() {
    const files = (await readdirp(logsDirectory))
      .filter((x) => x.endsWith('.log') || x.endsWith('.log.gz'))
      .sort();
    const response: LogFile[] = [];

    for (const file of files) {
      const stat2 = await stat(path.join(logsDirectory, file));
      response.push({
        name: file,
        size: stat2.size,
      });
    }

    return response;
  }

  @Get('files/:file')
  async getFile(@Param('file') file: String) {
    const sanitizedFile = file.replace(/^(\.\.(\/|\\|$))+/, '');
    const filePath = path.join(logsDirectory, sanitizedFile);
    const fileMimeType = mime.lookup(filePath);
    const fileStream = createReadStream(filePath);

    return new StreamableFile(fileStream, {
      type: fileMimeType,
      disposition: `attachment; filename="${file}"`,
    });
  }

  @Get('settings')
  async getLogSettings() {
    return await this.logSettingsService.get();
  }

  @Post('settings')
  async setLogSettings(@Body() payload: LogSettings) {
    const validLogLevels = [
      'error',
      'warn',
      'info',
      'verbose',
      'debug',
      'silly',
    ];

    if (!validLogLevels.includes(payload.level)) {
      return {
        status: 'NOK',
        code: 0,
        message: 'Invalid log level',
      };
    }

    return await this.logSettingsService.update(payload);
  }
}

function strToDate(dtStr) {
  if (!dtStr) return null;
  let dateParts = dtStr.split('/');
  let timeParts = dateParts[2].split(' ')[1].split(':');
  dateParts[2] = dateParts[2].split(' ')[0];
  return new Date(
    +dateParts[2],
    dateParts[1] - 1,
    +dateParts[0],
    timeParts[0],
    timeParts[1],
    timeParts[2],
  );
}

const parseLine = (line: string): LogEvent => {
  const regex =
    /\[(?<context>[^\]]+)\]  \|  (?<timestamp>[^\[]+)  \[(?<level>[^\]]+)\] \[(?<label>[^\]]+)\] (?<message>.+)/;

  const match = line.match(regex);

  if (!match) {
    return null;
  }

  const date = strToDate(match.groups.timestamp);
  const level = match.groups.level;
  const message = match.groups.message;
  return {
    date,
    level,
    message,
  };
};
