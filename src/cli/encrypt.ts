import * as nodeRsa from 'node-rsa';
import { getHttpJsonResponse } from './utils';

export function encrypt(str: string, server: string): Promise<any> {
  return getHttpJsonResponse(`${server}/api/keys/public`)
    .then(response => {
      if (response) {
        let key = response.key;
        let rsa = new nodeRsa();
        rsa.importKey(key, 'public');
        let encrypted = rsa.encrypt(str, 'base64');

        return encrypted;
      }

      return null;
    }).catch(err => Promise.reject(err));
}

export function decrypt(str: string, privateKey: string): Promise<any> {
  return new Promise((resolve, reject) => {
    let rsa = new nodeRsa();
    rsa.importKey(privateKey, 'private');
    let decrypted = rsa.decrypt(str, 'utf8');

    resolve(decrypted);
  });
}
