import { Injectable, Provider } from '@angular/core';

@Injectable()
export class ConfigService {
  port: number;
  wsport: number;
  url: string;
  wsurl: string;

  constructor() {
    let wssProto = location.protocol === 'https:' ? 'wss' : 'ws';
    let proto = location.protocol;
    let port = location.port === '8000' ? 6500 : location.port;
    this.url = `${proto}//${location.hostname}:${port}`;
    this.wsurl = `${wssProto}://${location.hostname}:${port}`;
  }
}

export const ConfigServiceProvider: Provider = {
  provide: ConfigService, useClass: ConfigService
};
