import { insertLog } from './db/log';
import { Subject, from } from 'rxjs';
import { filter, mergeMap, share, map } from 'rxjs/operators';
import chalk from 'chalk';

export interface LogMessageType {
  message: string;
  type: 'info' | 'warning' | 'error';
  notify: boolean;
}

export const logger: Subject<LogMessageType> = new Subject();

logger
  .pipe(
    filter((msg: LogMessageType) => !!msg.message && msg.message !== ''),
    mergeMap((msg: LogMessageType) => from(insertLog(colorizeMessage(msg)))),
    map((msg: LogMessageType) => {
      const time = getDateTime();
      const message = [
        chalk.white('['),
        chalk.bgBlack(chalk.white(time)),
        chalk.white(']'),
        ': ',
        msg.message
      ].join('');
      console.log(message);
    }),
    share()
  )
  .subscribe();

function colorizeMessage(msg: LogMessageType): LogMessageType {
  if (typeof msg.message !== 'string') {
    msg.message = `[${msg.type}]: ${(<LogMessageType>msg).message.toString()}`;
  }

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
