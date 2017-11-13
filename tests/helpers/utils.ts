import { resolve } from 'path';
import { readFile } from '../../src/api/fs';
import { Config } from '../../src/api/config';
import * as yaml from 'yamljs';
import * as request from 'request';

export function readConfig(configName: string): Promise<Config> {
  return readFile(resolve(__dirname, `../unit/configs/${configName}`))
    .then(config => yaml.parse(config));
}

export function sendRequest(data: any, uri: string, header?: any): Promise<void> {
  return new Promise((resolve, reject) => {
    let options = {
      url: `http://localhost:6500/${uri}`,
      method: 'POST',
      json: data,
      headers: header
    };

    request(options, (err, response, body) => {
      if (err) {
        reject(err);
      } else {
        if (response.statusCode === 200) {
          resolve(body);
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

export function sendGetRequest(data: any, uri: string, header?: any): Promise<void> {
  return new Promise((resolve, reject) => {
    let options = {
      url: `http://localhost:6500/${uri}`,
      method: 'GET',
      json: data,
      headers: header
    };

    request(options, (err, response, body) => {
      if (err) {
        reject(err);
      } else {
        if (response.statusCode === 200) {
          resolve(body);
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

export function delay(ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms));
}
