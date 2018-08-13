import { Observable, of } from 'rxjs';

export function throwIfAlreadyLoaded(parentModule: any, moduleName: string) {
  if (parentModule) {
    throw new Error(`${moduleName} has already been loaded. Import Core modules in the AppModule only.`);
  }
}

export function handleError<T>(operation = 'operation', result?: T) {
  return (error: any): Observable<T> => {
    console.error(error);
    return of(result as T);
  };
}

export function getURL(): string {
  const secure = location.protocol === 'https:' ? true : false;
  const port = location.port === '4200' || location.port === '6500' ? '6500' : '';

  return secure ? `https://${location.hostname}:${port}` : `http://${location.hostname}:${port}`;
}

export function getAPIURL(): string {
  const secure = location.protocol === 'https:' ? true : false;
  const port = location.port === '4200' || location.port === '6500' ? ':6500' : '';

  return secure ? `https://${location.hostname}${port}/api` : `http://${location.hostname}${port}/api`;
}

export function getWebSocketURL(): string {
  const secure = location.protocol === 'https:' ? true : false;
  const token = localStorage.getItem('bh-token') || null;
  const port = location.port === '4200' || location.port === '6500' ? '6500' : '';

  if (secure) {
    return token ? `wss://${location.hostname}:${port}/ws?token=${token}` : `wss://${location.hostname}:${port}/ws`;
  } else {
    return token ? `ws://${location.hostname}:${port}/ws?token=${token}` : `ws://${location.hostname}:${port}/ws`;
  }
}

export function getAvatars(): string[] {
  return Array.from(new Array(31), (x, i) => `/avatars/predefined/avatar_${i + 1}.svg`);
}
