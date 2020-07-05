export const AUTH_TOKEN_DATA = 'ractol-auth-data';
export const TIMEOUT_FACTOR = 0.003;

export interface Login {
  email: string;
  password: string;
}

export interface UserData {
  email: string;
  name: string;
  avatar: string;
  role: string;
  lastLogin: Date;
  tokens: {
    token: string;
    refreshToken: string;
    storedAt: number;
  };
}

export interface TokenResponse {
  token: string;
  refreshToken: string;
}
