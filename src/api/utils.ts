import * as path from 'path';
import { readFileSync } from 'fs';
import * as request from 'request';
import { CommandType, CommandTypePriority } from './config';
import { Observable } from 'rxjs';
import { Readable, Writable } from 'stream';
import * as badgen from 'badgen';


export interface JobProcess {
  build_id?: number;
  job_id?: number;
  status?: 'queued' | 'running' | 'cancelled' | 'errored' | 'success';
  image_name?: string;
  log?: string;
  commands?: { command: string, type: CommandType }[];
  cache?: string[];
  repo_name?: string;
  branch?: string;
  env?: string[];
  job?: Observable<any>;
  exposed_ports?: string;
  debug?: boolean;
}

export function getAbstruseVersion(): string {
  try {
    const pkgJson = JSON.parse(readFileSync(path.resolve(__dirname, '../../package.json')).toString());
    return pkgJson.version;
  } catch (e) {
    console.log(e);
    return 'unknown';
  }
}

export function getHumanSize(bytes: number, decimals = 2): string {
  if (!bytes) {
    return '0 Bytes';
  }

  const sizes: string[] = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
  const k = 1000;
  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(decimals))} ${sizes[i]}`;
}

export function generateRandomId(): string {
  return Math.random().toString(36).substring(7);
}

export function getHttpJsonResponse(url: string, optHeaders: any = {}): Promise<any> {
  return new Promise((resolve, reject) => {
    const headers = Object.assign({}, { 'User-Agent': 'abstruse' }, optHeaders);
    const options = { url, headers };

    request(options, (err, resp, body) => {
      if (err) {
        reject(err);
      } else {
        resolve(JSON.parse(body));
      }
    });
  });
}

export function generateBadgeHtml(status: string): string {
  let color = null;
  if (status === 'failing') {
    color = 'red';
  } else if (status === 'running') {
    color = 'yellow';
  } else if (status === 'queued') {
    color = 'grey';
  } else if (status === 'unknown') {
    status = 'none';
    color = 'black';
  } else {
    color = 'green';
  }

  return badgen({
    subject: 'abstruse',
    status,
    color
  });
}

export function getBitBucketAccessToken(clientCredentials: string): Promise<any> {
  return new Promise((resolve, reject) => {
    let options = {
      url: `https://${clientCredentials}@bitbucket.org/site/oauth2/access_token`,
      method: 'POST',
      formData: { grant_type: 'client_credentials' }
    };

    request(options, (err, response, body) => {
      if (err) {
        reject(err);
      } else {
        if (response.statusCode < 300 && response.statusCode >= 200) {
          resolve(JSON.parse(body));
        } else {
          reject({
            statusCode: response.statusCode,
            response: body
          });
        }
      }
    });
  });
}

export function prepareCommands(proc: JobProcess, allowed: CommandType[]): any {
  let commands = proc.commands.filter(command => allowed.findIndex(c => c === command.type) !== -1);
  return commands.sort((a, b) => {
    if (CommandTypePriority[a.type] > CommandTypePriority[b.type]) {
      return 1;
    } else if (CommandTypePriority[a.type] < CommandTypePriority[b.type]) {
      return -1;
    }
    return proc.commands.indexOf(a) - proc.commands.indexOf(b);
  });
}

export function demuxStream(source: Readable, destination: Writable): void {
  let header = null;

  source
    .on('readable', () => {
      header = header || source.read(8);
      while (header) {
        const payload = source.read(header.readUInt32BE(4));
        if (!payload) {
          break;
        }

        try {
          destination.write(payload);
        } catch (e) {
          console.log(e);
          break;
        }
        header = source.read(8);
      }
    })
    .on('end', () => destination.end());
}
