import { execSilent } from '../utils/process';

export default function() {
  return Promise.resolve()
    .then(() => execSilent('npm',  ['run', 'build:prod']));
}
