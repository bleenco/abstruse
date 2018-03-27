import { Injectable, Provider } from '@angular/core';

@Injectable()
export class ConfigService {
  port: number;
  wsport: number;
  url: string;
  wsurl: string;

  constructor() {
    const wssProto = location.protocol === 'https:' ? 'wss' : 'ws';
    const proto = location.protocol;
    const port = location.port === '4200' ? 6500 : location.port;
    const token = localStorage.getItem('abs-token') || null;

    this.url = `${proto}//${location.hostname}:${port}`;
    if (token) {
      this.wsurl = `${wssProto}://${location.hostname}:${port}/?token=${token}`;
    } else {
      this.wsurl = `${wssProto}://${location.hostname}:${port}`;
    }
  }
}

export const ConfigServiceProvider: Provider = {
  provide: ConfigService, useClass: ConfigService
};
