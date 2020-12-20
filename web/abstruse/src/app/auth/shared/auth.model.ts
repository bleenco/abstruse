export const AUTH_TOKEN_KEY = 'abstruse-auth-data';
export const TIMEOUT_FACTOR = 0.75;

export interface Login {
  email: string;
  password: string;
}

export interface UserData {
  id: number;
  email: string;
  name: string;
  lastname: string;
  role: string;
  avatar: string;
}

export interface TokenResponse {
  token: string;
}
