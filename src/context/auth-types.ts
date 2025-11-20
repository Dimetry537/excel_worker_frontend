import { createContext } from 'react';

export interface UserRead {
  id: number;
  username: string;
  is_active: boolean;
  roles: Array<{ id: number; name: string }>;
}

export interface AuthContextType {
  user: UserRead | null;
  loading: boolean;
  login: (username: string, password: string) => Promise<void>;
  logout: () => void;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);
