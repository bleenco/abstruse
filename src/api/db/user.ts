import { User } from './model';
import { addRepositoryPermissions } from './permission';
import { generatePassword, comparePassword, generateJwt } from '../security';

export function getUser(id: number): Promise<any> {
  return new Promise((resolve, reject) => {
    new User({ id: id }).fetch({ withRelated: ['access_tokens', 'permissions.repository'] })
      .then(user => {
        if (!user) {
          reject(user);
        } else {
          let result = user.toJSON();
          delete result.password;
          result.access_tokens = result.access_tokens.map(token => {
            delete token.token;
            return token;
          });

          resolve(result);
        }
      });
  });
}

export function getUsers(): Promise<any> {
  return new Promise((resolve, reject) => {
    new User()
      .fetchAll()
      .then(users => {
        if (!users) {
          reject(users);
        } else {
          let data = users.toJSON();
          data = data.map(user => {
            delete user.password;
            return user;
          });

          resolve(data);
        }
      });
  });
}

export function updateUser(data: any): Promise<any> {
  return new Promise((resolve, reject) => {
    delete data.access_tokens;

    new User({ id: data.id }).save(data, { method: 'update', require: false })
      .then(user => {
        if (!user) {
          reject(user);
        } else {
          resolve(user.toJSON());
        }
      });
  });
}

export function updateUserPassword(data: any): Promise<any> {
  return new Promise((resolve, reject) => {
    generatePassword(data.password).then(generatedPassword => {
      let userData = { password: generatedPassword };
      new User({ id: data.id }).save(userData, { method: 'update', require: false })
        .then(user => {
          if (!user) {
            reject(user);
          } else {
            resolve(user.toJSON());
          }
        });
    });
  });
}

export function login(data: any): Promise<boolean | string> {
  return new Promise(resolve => {
    new User({ email: data.email }).fetch().then(user => {
      if (!user) {
        resolve(false);
      } else {
        user = user.toJSON();
        comparePassword(data.password, user.password).then(passwordOk => {
          if (!passwordOk) {
            resolve(false);
          } else {
            generateJwt(user).then(jwt => resolve(jwt));
          }
        });
      }
    }).catch(err => resolve(false));
  });
}

export function getUserJwt(user: any): Promise<string> {
  return generateJwt(user);
}

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

export function createUser(data: any): Promise<boolean> {
  return new Promise((resolve, reject) => {
    generatePassword(data.password).then(encrypted => {
      data.password = encrypted;
      delete data.confirmPassword;

      new User(data).save().then(result => {
        if (!result) {
          reject(result);
        }
        let user = result.toJSON();

        return addRepositoryPermissions(user.id)
          .then(() => resolve(true))
          .catch(err => reject(err));
      });
    })
    .catch(err => {
      console.error(err);
      reject();
    });
  });
}
