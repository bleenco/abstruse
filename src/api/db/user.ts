import { User } from './model';
import { generatePassword, comparePassword, generateJwt } from '../security';

export function usersExists(): Promise<boolean> {
  return new Promise(resolve => {
    User.fetchAll().then(result => {
      if (result.length) {
        resolve(true);
      } else {
        resolve(false);
      }
    }).catch(err => resolve(false));
  });
}

export function registerUser(data: any): Promise<boolean> {
  return new Promise((resolve, reject) => {
    generatePassword(data.password).then(encrypted => {
      data.password = encrypted;
      new User(data).save().then(result => {
        if (!result) {
          reject(result);
        }

        resolve(true);
      });
    })
    .catch(err => {
      console.error(err);
      reject();
    });
  });
}
