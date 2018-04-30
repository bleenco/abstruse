import * as path from 'path';
import { readFileSync } from 'fs';
import * as request from 'request';
import { CommandType, CommandTypePriority } from './config';
import { Observable } from 'rxjs';


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
    let pkgJson = JSON.parse(readFileSync(path.resolve(__dirname, '../../package.json')).toString());
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

  let sizes: string[] = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
  let k = 1000;
  let i = Math.floor(Math.log(bytes) / Math.log(k));

  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(decimals))} ${sizes[i]}`;
}

export function generateRandomId(): string {
  return Math.random().toString(36).substring(7);
}

export function getHttpJsonResponse(url: string): Promise<any> {
  return new Promise((resolve, reject) => {
    let options = {
      url: url,
      headers: {
        'User-Agent': 'request'
      }
    };

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
  let background = null;
  if (status === 'failing') {
    background = '#f03e3e';
  } else if (status === 'running') {
    background = '#ffd43b';
  } else if (status === 'queued') {
    background = '#ffd43b';
  } else if (status === 'unknown') {
    status = 'none';
    background = '#3A7EE1';
  } else {
    background = '#39B54A';
  }

  return `
    <svg xmlns="http://www.w3.org/2000/svg" width="100" height="20" style="shape-rendering:
      geometricPrecision; image-rendering:optimizeQuality; fill-rule:evenodd;
      clip-rule:evenodd">
      <linearGradient id="b" x2="0" y2="100%">
        <stop offset="0" stop-color="#bbb" stop-opacity=".1"></stop>
        <stop offset="1" stop-opacity=".1"></stop>
      </linearGradient>
      <mask id="a">
        <rect width="100" height="20" rx="3" fill="#fff"></rect>
      </mask>
      <g mask="url(#a)">
        <path fill="#333" d="M0 0h50v20H0z"></path>
        <path fill="${background}" d="M50 0h50v20H50z"></path>
        <path fill="url(#b)" d="M0 0h100v20H0z"></path>
      </g>
      <g fill="#fff" font-family="Verdana,Geneva,sans-serif" font-size="10">
        <text x="4" y="15" fill="#010101" fill-opacity=".3">abstruse</text>
        <text x="4" y="14">abstruse</text>
        <text x="53" y="15" fill="#010101" fill-opacity=".3">${status}</text>
        <text x="53" y="14">${status}</text>
      </g>
    </svg>
  `;
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
