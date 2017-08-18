import { red, green, blue, magenta, cyan, yellow, white } from 'chalk';

export function info(msg: string): void {
  const time = getDateTime();
  console.log(`${green('[' + time + ']')} ${white(msg)}`);
}

export function error(msg: string | any): void {
  const time = getDateTime();
  if (typeof msg !== 'string') {
    msg = JSON.stringify(msg);
  }

  console.log(`${green('[' + time + ']')} ${red(msg)}`);
}

export function warning(msg: string): void {
  const time = getDateTime();
  console.log(`${green('[' + time + ']')} ${yellow(msg)}`);
}

function getDateTime(): string {
  return new Date().toISOString().replace(/T/, ' ').replace(/\..+/, '');
}
