import * as jwt from 'jsonwebtoken';
import * as crypto from 'crypto';
import * as express from 'express';
import { getUser } from './db/user';

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
