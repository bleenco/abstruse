import * as jwt from 'jsonwebtoken';
import * as express from 'express';
import { getUser } from './db/user';
import * as nodeRsa from 'node-rsa';
import { RSA } from 'rsa-compat-ssl';
import { getFilePath, config } from './setup';
import { existsSync, writeFile } from './fs';
import { readFileSync } from 'fs';
import { Observable } from 'rxjs';
import * as bcrypt from 'bcrypt';

export function generatePassword(plain: string): Promise<string> {
  return bcrypt.hash(plain, 12);
}

export function comparePassword(plain: string, hash: string): Promise<boolean> {
  return bcrypt.compare(plain, hash);
}

export function generateJwt(data: any): Promise<string> {
  return new Promise((resolve, reject) => {
    delete data.password;

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
    const decoded = jwt.verify(token, config.jwtSecret);
    return decoded;
  } catch (err) {
    return false;
  }
}

export function decodeToken(token: string): Promise<boolean | any> {
  return new Promise((resolve) => {
    if (!token || token === '') {
      resolve(false);
    } else {
      jwt.verify(token, config.jwtSecret, (err, decoded: any) => {
        if (err) {
          resolve(false);
        } else {
          resolve(decoded);
        }
      });
    }
  });
}

// TODO: remove this (deprecated)
export function checkApiRequestAuth(req: express.Request): Promise<void> {
  return new Promise((resolve, reject) => {
    const token = req.get('abstruse-ci-token');
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
  const publicKeyPath = getFilePath(config.publicKey);
  if (existsSync(publicKeyPath)) {
    const key = readFileSync(publicKeyPath, 'utf8').toString();
    const rsa = new nodeRsa(key);

    return rsa.encrypt(str, 'base64');
  } else {
    return null;
  }
}

export function decrypt(str: string): string {
  const privateKeyPath = getFilePath(config.privateKey);
  if (existsSync(privateKeyPath)) {
    const key = readFileSync(privateKeyPath, 'utf8').toString();
    const rsa = new nodeRsa(key);

    return rsa.decrypt(str, 'utf8');
  } else {
    return null;
  }
}

export async function generateKeys(): Promise<void | string> {
  return Promise.resolve()
    .then(() => {
      const publicKeyPath = getFilePath(config.publicKey);
      const privateKeyPath = getFilePath(config.privateKey);

      if (existsSync(publicKeyPath) && existsSync(privateKeyPath)) {
        return Promise.resolve();
      } else {
        const bitlen = 4096;
        const exp = 65537;
        const options = { public: true, pem: true, internal: true };
        const msg = '[encrypt]: RSA keys successfully generated';

        RSA.generateKeypair(bitlen, exp, options, (err, keypair) => {
          if (err) {
            return Promise.reject(err);
          } else {
            return writeFile(publicKeyPath, keypair.publicKeyPem)
              .then(() => writeFile(privateKeyPath, keypair.privateKeyPem))
              .then(() => msg)
              .catch(error => Promise.reject(error));
          }
        });
      }
    });
}
