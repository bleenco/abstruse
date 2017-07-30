import { Injectable, Provider } from '@angular/core';

@Injectable()
export class ConfigService {
  port: number;
  wsport: number;
  url: string;
  wsurl: string;

  constructor() {
    let proto = location.protocol === 'https:' ? 'wss' : 'ws';
    this.wsurl = `${proto}://${location.hostname}:6501`;

    proto = location.protocol;
    let port = location.port === '8000' ? 6500 : location.port;
    this.url = `${proto}//${location.hostname}:${port}`;
  }
}

export const ConfigServiceProvider: Provider = {
  provide: ConfigService, useClass: ConfigService
};
