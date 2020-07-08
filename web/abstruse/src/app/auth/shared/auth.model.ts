export const AUTH_TOKEN_DATA = 'abstruse-auth-data';
export const TIMEOUT_FACTOR = 0.75;

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
    accessToken: string;
    refreshToken: string;
    storedAt: number;
  };
}

export interface TokenResponse {
  accessToken: string;
  refreshToken: string;
}
