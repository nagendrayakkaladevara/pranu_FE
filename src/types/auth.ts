export type UserRole = "ADMIN" | "LECTURER" | "STUDENT";

export interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface AuthTokens {
  access: {
    token: string;
    expires: string;
  };
}

export interface LoginResponse {
  user: User;
  tokens: AuthTokens;
}

export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}

export interface LoginCredentials {
  email: string;
  password: string;
}
