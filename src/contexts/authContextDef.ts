import { createContext } from "react";
import type { AuthState, User, LoginCredentials } from "@/types/auth";

export interface AuthContextType extends AuthState {
  login: (credentials: LoginCredentials) => Promise<User>;
  logout: () => void;
}

export const AuthContext = createContext<AuthContextType | null>(null);
