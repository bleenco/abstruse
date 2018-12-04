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

  if (secure) {
    return `wss://${location.hostname}/ws`;
  } else {
    return `ws://${location.hostname}/ws`;
  }
}

export function getAvatars(): string[] {
  return Array.from(new Array(30), (x, i) => `/avatars/predefined/avatar_${i + 1}.svg`);
}

export function hexToRGB(hex: string, alpha: number = 1) {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);

  return `rgba(${r},${g},${b},${alpha})`;
}
