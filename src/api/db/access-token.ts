import { AccessToken } from './model';
import { authorization, TokenConfig, InstallationAuthorizationType } from '../ghe';

export interface AccessTokenType {
  id: number;
  token: string;
  is_integration: boolean;
  integration_key: string;
  integration_id: string;
  installation_id: string;
  expires_at: Date;
  users_id: number;
  description: string;
}

export function verifyAccessToken(api: string, token: AccessTokenType): Promise<InstallationAuthorizationType> {
  if (token !== null &&
    typeof token !== 'undefined' &&
    typeof token.integration_key !== 'undefined' &&
    typeof token.integration_id !== 'undefined' &&
    token.is_integration) {
    const config: TokenConfig = {
      token: token.token,
      key: token.integration_key,
      issuer: token.integration_id,
      installation: token.installation_id,
      expires_at: token.expires_at,
    };
    return authorization(api, config);
  }
  const authorizationType: InstallationAuthorizationType = {
    token: token ? token.token : null,
    expires_at: null,
  };
  return Promise.resolve(authorizationType);
}

export function getAccessTokens(): Promise<any> {
  return new Promise((resolve, reject) => {
    new AccessToken().fetchAll({ withRelated: ['user'] })
      .then(tokens => {
        if (!tokens) {
          reject(tokens);
        }

        const result = tokens.toJSON().map(token => {
          delete token.token;
          delete token.integration_key;
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

export function updateAccessToken(id: number, token: string, expires_at: Date): Promise<any> {
  return new Promise((resolve, reject) => {
    new AccessToken({ id: id }).save({ token: token, expires_at: expires_at })
      .then(() => resolve(true))
      .catch(err => reject(err));
  });
}
