import { insertLog } from './db/log';
import { Subject, from } from 'rxjs';
import { filter, mergeMap, share, map } from 'rxjs/operators';
import chalk from 'chalk';

export interface LogMessageType {
  message: string;
  type: 'info' | 'warning' | 'error';
  notify: boolean;
}

export let logger: Subject<LogMessageType> = new Subject();

logger
  .pipe(
    filter((msg: LogMessageType) => !!msg.message && msg.message !== ''),
    map((msg: LogMessageType) => {
      if (msg.message === Object(msg.message)) {
        msg.message = JSON.stringify(msg.message);
      }
      return msg;
    }),
    mergeMap((msg: LogMessageType) => {
      msg.message = typeof msg.message === 'object' ? JSON.stringify(msg.message) : msg.message;
      const message = { message: msg.message, type: msg.type, notify: msg.notify };
      return from(insertLog(colorizeMessage(message)));
    }),
    map((msg: any) => {
      const time = getDateTime();
      const message = [
        chalk.white('['),
        chalk.bgBlack(chalk.white(time)), chalk.white(']'), ': ', colorizeMessage(msg.message)
      ].join('');
      console.log(message);
    }),
    share()
  )
  .subscribe();

function colorizeMessage(msg: LogMessageType): LogMessageType {
  if (msg.type === 'info') {
    msg.message = msg.message.replace(/\[(.*)\]/, chalk.yellow('[') +
      chalk.green('$1') + chalk.yellow(']'));
  } else if (msg.type === 'error') {
    msg.message = msg.message.replace(/\[(.*)\]/, chalk.yellow('[') +
      chalk.red('$1') + chalk.yellow(']'));
  } else if (msg.type === 'warning') {
    msg.message = msg.message.replace(/\[(.*)\]/, chalk.yellow('[') +
      chalk.yellow('$1') + chalk.yellow(']'));
  }

  return msg;
}

function getDateTime(): string {
  return new Date().toISOString().replace(/T/, ' ').replace(/\..+/, '');
}
