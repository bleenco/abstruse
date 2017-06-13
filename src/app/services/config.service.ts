import { Injectable, Provider } from '@angular/core';

@Injectable()
export class ConfigService {
  port: number;
  wsport: number;
  wsurl: string;

  constructor() {
    let proto = location.protocol === 'https:' ? 'wss' : 'ws';
    this.wsurl = `${proto}://${location.hostname}:6501`;
  }
}

export const ConfigServiceProvider: Provider = {
  provide: ConfigService, useClass: ConfigService
};
