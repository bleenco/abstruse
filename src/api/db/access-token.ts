import { AccessToken } from './model';

export function getAccessTokens(): Promise<any> {
  return new Promise((resolve, reject) => {
    new AccessToken().fetchAll({ withRelated: ['user'] })
      .then(tokens => {
        if (!tokens) {
          reject(tokens);
        }

        const result = tokens.toJSON().map(token => {
          delete token.token;
          delete token.user.password;
          return token;
        });

        resolve(result);
      });
  });
}

export function insertAccessToken(data: any): Promise<any> {
  return new Promise((resolve, reject) => {
    new AccessToken().save(data, { method: 'insert' })
      .then(token => !token ? reject(token) : resolve(token.toJSON()));
  });
}

export function removeAccessToken(id: number): Promise<any> {
  return new Promise((resolve, reject) => {
    new AccessToken({ id: id }).destroy()
      .then(() => resolve(true))
      .catch(() => reject());
  });
}
