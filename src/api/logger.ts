import chalk from 'chalk';
import { from, Subject } from 'rxjs';
import { filter, map, mergeMap, share } from 'rxjs/operators';

import { insertLog } from './db/log';

export interface LogMessageType {
  message: string;
  type: 'info' | 'warning' | 'error';
  notify: boolean;
}

export let logger: Subject<LogMessageType> = new Subject();

logger
  .pipe(
    filter((msg: LogMessageType) => !!msg.message && msg.message !== ''),
    mergeMap((msg: LogMessageType) => {
      msg.message = typeof msg.message === 'object' ? JSON.stringify(msg.message) : msg.message;
      let message = { message: msg.message, type: msg.type, notify: msg.notify };
      return from(insertLog(colorizeMessage(message)));
    }),
    map((msg: any) => {
      let time = getDateTime();
      let message = [
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
