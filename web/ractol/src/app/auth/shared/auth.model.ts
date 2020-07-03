export const AUTH_TOKEN_KEY = 'ractol-auth-token';

export interface Login {
  email: string;
  password: string;
  remember: boolean;
}

export interface Credentials {
  email: string;
  name: string;
  avatar: string;
  admin: boolean;
  token: string;
}
