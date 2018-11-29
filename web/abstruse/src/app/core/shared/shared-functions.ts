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
  return `/api`;
}

export function getWebSocketURL(): string {
  const secure = location.protocol === 'https:' ? true : false;
  const port = location.port === '4200' || location.port === '6500' ? ':6500' : '';

  if (secure) {
    return `wss://${location.hostname}${port}`;
  } else {
    return `ws://${location.hostname}${port}`;
  }
}

export function getAvatars(): string[] {
  return Array.from(new Array(30), (x, i) => `/avatars/predefined/avatar_${i + 1}.svg`);
}
