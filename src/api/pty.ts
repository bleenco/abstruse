import * as os from 'os';
const pty = require('node-pty');

export class PtyInstance {
  shell: string;
  args: string[];
  user: any;
  path: string;

  constructor() {
    this.user = os.userInfo({ encoding: 'utf8' });
    switch (os.platform()) {
      case 'win32':
        this.shell = 'powershell.exe';
        this.args = [];
        break;
      case 'darwin':
        this.shell = 'login';
        this.args = ['-fp', this.user.username];
        break;
      case 'linux':
        this.shell = '/bin/bash';
        this.args = [];
        break;
    }
  }

  create() {
    return pty.spawn(this.shell, this.args, {
      name: 'xterm-color',
      cols: 80,
      rows: 30,
      cwd: process.env.HOME,
      env: process.env
    });
  }
}
