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
          delete token.bitbucket_oauth_secret;
          delete token.user.password;
          return token;
        });

        resolve(result);
      });
  });
}

export async function insertAccessToken(data: any): Promise<any> {
  const token = await new AccessToken().save(data, { method: 'insert' });

  if (!token) {
    throw token;
  } else {
    return token.toJSON();
  }
}

export async function removeAccessToken(id: number): Promise<any> {
  await new AccessToken({ id: id }).destroy();
  return true;
}
