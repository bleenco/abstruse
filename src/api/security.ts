import * as jwt from 'jsonwebtoken';
import * as crypto from 'crypto';
import * as express from 'express';
import { getUser } from './db/user';
import * as nodeRsa from 'node-rsa';
import { getFilePath, getConfig } from './utils';
import { existsSync, exists, writeFile } from './fs';
import { readFileSync } from 'fs';
import { logger, LogMessageType } from './logger';
import { Observable } from 'rxjs';

export function generatePassword(plain: string): Promise<string> {
  return new Promise((resolve, reject) => {
    resolve(calculateMd5(plain));
  });
}

export function comparePassword(plain: string, hash: string): Promise<boolean> {
  return generatePassword(plain)
    .then(calculated => hash === calculated);
}

export function generateJwt(data: any): Promise<string> {
  return new Promise((resolve, reject) => {
    jwt.sign(data, 'abstruseSecret4321!!', {}, (err: jwt.JsonWebTokenError, token: string) => {
      if (err) {
        reject(err);
      }

      resolve(token);
    });
  });
}

export function calculateMd5(str: string): string {
  return crypto.createHash('md5').update(str).digest('hex');
}

export function checkApiRequestAuth(req: express.Request): Promise<void> {
  return new Promise((resolve, reject) => {
    const token = req.get('abstruse-ci-token');
    if (!token) {
      reject('Authentication failed.');
    } else {
      jwt.verify(token, 'abstruseSecret4321!!', (err, decoded: any) => {
        if (err) {
          reject('Authentication failed.');
        } else {
          getUser(decoded.id)
            .then(user => {
              if (!user) {
                reject('Authentication failed');
              } else {
                resolve();
              }
            });
        }
      });
    }
  });
}

export function decrypt(str: string, config: any): string {
  const privateKeyPath = getFilePath(config.privateKey);
  if (existsSync(privateKeyPath)) {
    const key = readFileSync(privateKeyPath, 'utf8').toString();
    const rsa = new nodeRsa();
    rsa.importKey(key, 'private');
    const decrypted = rsa.decrypt(str, 'utf8');

    return decrypted;
  } else {
    return null;
  }
}

export function generatePublicKey(): Observable<string> {
  return new Observable(observer => {
    const config: any = getConfig();
    const publicKeyPath = getFilePath(config.publicKey);

    if (existsSync(publicKeyPath)) {
      observer.complete();
    } else {
      observer.next(`[encrypt]: generating RSA public key...`);

      const key = new nodeRsa({b: 4096});
      const publicKey = key.exportKey('public').toString();

      writeFile(publicKeyPath, publicKey)
        .then(() => {
          observer.next('[encrypt]: RSA public key successfully generated');
          observer.complete();
        })
        .catch(err => {
          observer.error(err);
          observer.complete();
        });
    }
  });
}

export function generatePrivateKey(): Observable<string> {
  return new Observable(observer => {
    const config: any = getConfig();
    const privateKeyPath = getFilePath(config.privateKey);

    if (existsSync(privateKeyPath)) {
      observer.complete();
    } else {
      observer.next('[encrypt]: generating RSA private key...');

      const key = new nodeRsa({b: 4096});
      const privateKey = key.exportKey('private').toString();

      writeFile(privateKeyPath, privateKey)
        .then(() => {
          observer.next('[encrypt]: RSA private key successfully generated');
          observer.complete();
        })
        .catch(err => {
          observer.error(err);
          observer.complete();
        });
    }
  });
}
