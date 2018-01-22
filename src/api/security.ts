import * as jwt from 'jsonwebtoken';
import * as crypto from 'crypto';
import * as express from 'express';
import { getUser } from './db/user';
import * as nodeRsa from 'node-rsa';
import { RSA } from 'rsa-compat';
import { getFilePath, config } from './setup';
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
    jwt.sign(data, config.jwtSecret, {}, (err: jwt.JsonWebTokenError, token: string) => {
      if (err) {
        reject(err);
      }

      resolve(token);
    });
  });
}

export function decodeJwt(token: string): any {
  try {
    let decoded = jwt.verify(token, config.jwtSecret);
    return decoded;
  } catch (err) {
    return false;
  }
}

export function calculateMd5(str: string): string {
  return crypto.createHash('md5').update(str).digest('hex');
}

export function checkApiRequestAuth(req: express.Request): Promise<void> {
  return new Promise((resolve, reject) => {
    let token = req.get('abstruse-ci-token');
    if (!token) {
      reject('Authentication failed.');
    } else {
      jwt.verify(token, config.jwtSecret, (err, decoded: any) => {
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

export function encrypt(str: string): string {
  let publicKeyPath = getFilePath(config.publicKey);
  if (existsSync(publicKeyPath)) {
    let key = readFileSync(publicKeyPath, 'utf8').toString();
    let rsa = new nodeRsa(key);

    return rsa.encrypt(str, 'base64');
  } else {
    return null;
  }
}

export function decrypt(str: string): string {
  let privateKeyPath = getFilePath(config.privateKey);
  if (existsSync(privateKeyPath)) {
    let key = readFileSync(privateKeyPath, 'utf8').toString();
    let rsa = new nodeRsa(key);

    return rsa.decrypt(str, 'utf8');
  } else {
    return null;
  }
}

export function generateKeys(): Observable<string> {
  return new Observable(observer => {
    let publicKeyPath = getFilePath(config.publicKey);
    let privateKeyPath = getFilePath(config.privateKey);

    if (existsSync(publicKeyPath) && existsSync(privateKeyPath)) {
      observer.complete();
    } else {
      let bitlen = 4096;
      let exp = 65537;
      let options = { public: true, pem: true, internal: true };

      RSA.generateKeypair(bitlen, exp, options, (err, keypair) => {
        if (err) {
          observer.error(err);
          observer.complete();
        } else {
          writeFile(publicKeyPath, keypair.publicKeyPem)
            .then(() => writeFile(privateKeyPath, keypair.privateKeyPem))
            .then(() => {
              observer.next('[encrypt]: RSA public and private key successfully generated');
              observer.complete();
            })
            .catch(err => {
              observer.error(err);
              observer.complete();
            });
        }
      });
    }
  });
}
