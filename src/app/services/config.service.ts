import { Injectable, Provider } from '@angular/core';

@Injectable()
export class ConfigService {
  port: number;
  wsport: number;
  wsurl: string;

  constructor() {
    this.wsurl = `ws://${location.hostname}:6501`;
  }
}

export const ConfigServiceProvider: Provider = {
  provide: ConfigService, useClass: ConfigService
};
