import * as jwt from 'jsonwebtoken';
import { addMinutes, subMinutes, isAfter, parse } from 'date-fns';
import { getHttpJsonResponse } from './utils';

export interface TokenConfig {
  token: string;
  expires_at: Date;
  issuer: string;
  installation: string;
  key: string;
}
export interface RawInstallationAuthorizationType {
  token: string;
  expires_at: string;
}
export interface InstallationAuthorizationType {
  token: string;
  expires_at: Date;
}

// isValid from date-fns hangs
// when the date is null...
function isDateValid(date: Date) {
  return date && !isNaN(date.valueOf());
}


export function sign(options: TokenConfig): Promise<string> {
  return new Promise((resolve, reject) => {
    return jwt.sign({ }, options.key, {
      issuer: options.issuer.toString(),
      expiresIn: '10m',
      algorithm: 'RS256',
    }, (err: Error, token: string) => {
      if (err) {
        reject(err);
      } else {
        resolve(token);
      }
    });
  });
}

export function authorization(api: string, appConfig: TokenConfig): Promise<InstallationAuthorizationType> {
  if (!appConfig.token || !isDateValid(appConfig.expires_at) || isAfter(new Date(), subMinutes(appConfig.expires_at, 30))) {
    return sign(appConfig).then((authToken) => (
      getHttpJsonResponse(`${api}/installations/${appConfig.installation}/access_tokens`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${authToken}`,
          Accept: 'application/vnd.github.machine-man-preview+json',
        },
      }).then((auth: RawInstallationAuthorizationType) => ({
        token: auth.token,
        expires_at: parse(auth.expires_at),
      }))
    ));
  }
  return Promise.resolve({
    token: appConfig.token,
    expires_at: appConfig.expires_at,
  });
}
