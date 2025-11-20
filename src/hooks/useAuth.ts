import { useContext } from 'react';
import { AuthContext } from '@/context/auth-types';
import type { AuthContextType } from '@/context/auth-types';

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
