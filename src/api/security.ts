import { compare, hash } from 'bcrypt';
import * as express from 'express';
import { existsSync, readFileSync } from 'fs-extra';
import { sign, verify } from 'jwt-then';
import * as nodeRsa from 'node-rsa';
import { RSA } from 'rsa-compat-ssl';
import { Observable } from 'rxjs';

import { getUser } from './db/user';
import { writeFile } from './fs';
import { config, getFilePath } from './setup';

export function generatePassword(plain: string): Promise<string> {
  return hash(plain, 12);
}

export function comparePassword(plain: string, hashed: string): Promise<boolean> {
  return compare(plain, hashed);
}

export function generateJwt(data: any): Promise<string> {
  delete data.password;

  return sign(data, config.jwtSecret);
}

export interface IAbstruseJWT {
  id: number;
  email: string;
  admin: boolean;
}

export async function decodeJwt(token: string): Promise<IAbstruseJWT | false> {
  try {
    return <IAbstruseJWT> await verify(token, config.jwtSecret);
  } catch (err) {
    return false;
  }
}

export async function checkApiRequestAuth(req: express.Request): Promise<void> {
  let token = req.get('abstruse-ci-token');

  if (!token) {
    throw new Error('Authentication failed.');
  }

  const decoded = <{ id: number }> await verify(token, config.jwtSecret);

  const user = await getUser(decoded.id);

  if (!user) {
    throw new Error('Authentication failed.');
  }
}

export function encrypt(str: string): string {
  let publicKeyPath = getFilePath(config.publicKey);

  if (!existsSync(publicKeyPath)) {
    return null;
  }

  let key = readFileSync(publicKeyPath, 'utf8').toString();
  let rsa = new nodeRsa(key);

  return rsa.encrypt(str, 'base64');
}

export function decrypt(str: string): string {
  let privateKeyPath = getFilePath(config.privateKey);

  if (!existsSync(privateKeyPath)) {
    return null;
  }

  let key = readFileSync(privateKeyPath, 'utf8').toString();
  let rsa = new nodeRsa(key);

  return rsa.decrypt(str, 'utf8');
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
            .catch(error => {
              observer.error(error);
              observer.complete();
            });
        }
      });
    }
  });
}
