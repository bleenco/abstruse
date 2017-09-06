import { red, green, blue, magenta, cyan, yellow, white, bgWhite, black, bgBlack } from 'chalk';
import { insertLog } from './db/log';
import { Subject, Observable } from 'rxjs';

export interface LogMessageType {
  message: string;
  type: 'info' | 'warning' | 'error';
  notify: boolean;
}

export const logger: Subject<LogMessageType> = new Subject();

logger
  .filter((msg: LogMessageType) => !!msg.message && msg.message !== '')
  .mergeMap((msg: LogMessageType) => {
    const message = { message: msg.message, type: msg.type, notify: msg.notify };
    return Observable.fromPromise(insertLog(colorizeMessage(message)));
  })
  .map((msg: any) => {
    const time = getDateTime();
    const message = [
      white('['), bgBlack(white(time)), white(']'), ': ', colorizeMessage(msg.message)
    ].join('');
    console.log(message);
  })
  .share()
  .subscribe();

function colorizeMessage(msg: LogMessageType): LogMessageType {
  if (msg.type === 'info') {
    msg.message = msg.message.replace(/\[(.*)\]/, yellow('[') + green('$1') + yellow(']'));
  } else if (msg.type === 'error') {
    msg.message = msg.message.replace(/\[(.*)\]/, yellow('[') + red('$1') + yellow(']'));
  } else if (msg.type === 'warning') {
    msg.message = msg.message.replace(/\[(.*)\]/, yellow('[') + yellow('$1') + yellow(']'));
  }

  return msg;
}

function getDateTime(): string {
  return new Date().toISOString().replace(/T/, ' ').replace(/\..+/, '');
}
