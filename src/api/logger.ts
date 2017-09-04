import { red, green, blue, magenta, cyan, yellow, white } from 'chalk';
import { insertLog } from './db/log';

export function info(msg: string): void {
  const time = getDateTime();
  insertLog({ message: msg, type: 'info' })
    .then(() => console.log(`${green('[' + time + ']')} ${white(msg)}`));
}

export function error(msg: string | any): void {
  const time = getDateTime();
  insertLog({ message: msg, type: 'error' })
    .then(() => console.log(`${green('[' + time + ']')} ${red(msg)}`));
}

export function warning(msg: string): void {
  const time = getDateTime();
  insertLog({ message: msg, type: 'warning' })
    .then(() => console.log(`${green('[' + time + ']')} ${yellow(msg)}`));
}

function getDateTime(): string {
  return new Date().toISOString().replace(/T/, ' ').replace(/\..+/, '');
}
