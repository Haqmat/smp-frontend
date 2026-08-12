import React, { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import { authHandlers } from '../mocks/handlers';
import { setTokens, clearTokens, getAccessToken } from '../api/client';
import type { User } from '../types/api';

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (credentials: { username?: string; phone?: string; password: string }) => Promise<{ user: User }>;
  logout: () => Promise<void>;
  updateUser: (user: User) => void;
  changePassword: (data: { current_password: string; new_password: string; confirm_password: string }) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check if user data exists in session
    const storedUser = sessionStorage.getItem('user');
    if (storedUser) {
      try {
        const userData = JSON.parse(storedUser);
        setUser(userData);
      } catch {
        sessionStorage.removeItem('user');
      }
    }
    setIsLoading(false);
  }, []);

  const login = async (credentials: { username?: string; phone?: string; password: string }) => {
    const response = await authHandlers.login(credentials);
    setTokens(response.access_token, response.refresh_token);
    setUser(response.user);
    sessionStorage.setItem('user', JSON.stringify(response.user));
    sessionStorage.setItem('refreshToken', response.refresh_token);
    return { user: response.user };
  };

  const logout = async () => {
    const refreshToken = sessionStorage.getItem('refreshToken');
    if (refreshToken) {
      await authHandlers.logout();
    }
    clearTokens();
    setUser(null);
    sessionStorage.removeItem('user');
    sessionStorage.removeItem('refreshToken');
  };

  const updateUser = (updatedUser: User) => {
    setUser(updatedUser);
    sessionStorage.setItem('user', JSON.stringify(updatedUser));
  };

  const changePassword = async (/* data: { current_password: string; new_password: string; confirm_password: string } */) => {
    // Mock API call - in real implementation, this would call the API
    await new Promise(resolve => setTimeout(resolve, 500));
    // Update user's first_login flag
    if (user) {
      const updatedUser = { ...user, is_first_login: false };
      updateUser(updatedUser);
    }
  };

  const isAuthenticated = !!user && !!getAccessToken();

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated,
        isLoading,
        login,
        logout,
        updateUser,
        changePassword,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};