export interface LoginRequest {
  username: string;
  password: string;
}

export interface LoginResponse {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
  user?: User;
}

export interface User {
  id: string;
  name: string;
  email: string;
}

export interface AuthError {
  message: string;
  statusCode?: number;
}
