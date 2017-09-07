import * as jwt from 'jsonwebtoken';
import * as crypto from 'crypto';
import * as express from 'express';
import { getUser } from './db/user';
import * as nodeRsa from 'node-rsa';
import { getFilePath, getConfig } from './utils';
import { existsSync, exists, writeFile } from './fs';
import { readFileSync } from 'fs';
import { logger, LogMessageType } from './logger';

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

export function generatePublicKey(): Promise<void> {
  return new Promise((resolve, reject) => {
    const config: any = getConfig();
    const publicKeyPath = getFilePath(config.publicKey);

    if (existsSync(publicKeyPath)) {
      return resolve();
    } else {
      const msg: LogMessageType = {
        message: '[encrypt]: generating RSA public key...',
        type: 'info',
        notify: false
      };
      logger.next(msg);

      const key = new nodeRsa({b: 4096});
      const publicKey = key.exportKey('public').toString();

      writeFile(publicKeyPath, publicKey)
        .then(() => {
          const msg: LogMessageType = {
            message: '[encrypt]: RSA public key successfully generated',
            type: 'info',
            notify: false
          };
          logger.next(msg);

          resolve();
        })
        .catch(err => reject(err));
    }
  });
}

export function generatePrivateKey(): Promise<void> {
  return new Promise((resolve, reject) => {
    const config: any = getConfig();
    const privateKeyPath = getFilePath(config.privateKey);

    if (existsSync(privateKeyPath)) {
      return resolve();
    } else {
      const msg: LogMessageType = {
        message: '[encrypt]: generating RSA private key...',
        type: 'info',
        notify: false
      };
      logger.next(msg);

      const key = new nodeRsa({b: 4096});
      const privateKey = key.exportKey('private').toString();

      writeFile(privateKeyPath, privateKey)
        .then(() => {
          const msg: LogMessageType = {
            message: '[encrypt]: RSA private key successfully generated',
            type: 'info',
            notify: false
          };
          logger.next(msg);

          resolve();
        })
        .catch(err => reject(err));
    }
  });
}
