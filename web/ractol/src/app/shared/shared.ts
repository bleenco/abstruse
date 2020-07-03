export const AUTH_TOKEN_KEY = 'ractol-auth-token';
export const API_URL = '/api/v1/';

export interface JSONResponse {
  status?: number;
  data: any;
}

export function throwIfAlreadyLoaded(parentModule: any, moduleName: string) {
  if (parentModule) {
    throw new Error(`${moduleName} has already been loaded. Import Core modules in the AppModule only.`);
  }
}
