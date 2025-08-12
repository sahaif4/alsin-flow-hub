import React, { createContext, useState, useContext, useEffect, ReactNode } from 'react';
import { jwtDecode } from 'jwt-decode';
import api from '../services/api';
import { User, UserRole } from '../types/user';

interface AuthContextType {
  isAuthenticated: boolean;
  user: User | null;
  token: string | null;
  login: (token: string) => void;
  logout: () => void;
  isLoading: boolean;
}

// Define a type for the decoded token payload
interface DecodedToken {
  sub: string; // Subject (email)
  role: UserRole;
  exp: number; // Expiration time
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(() => localStorage.getItem('authToken'));
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const initializeAuth = async () => {
      if (token) {
        try {
          const decoded = jwtDecode<DecodedToken>(token);

          // Check if token is expired
          if (decoded.exp * 1000 < Date.now()) {
            logout();
          } else {
            // In a more secure app, you'd fetch user data from a /users/me endpoint
            // to ensure the user data is fresh and the user hasn't been deactivated.
            // For now, we trust the token's payload.
            setUser({
              email: decoded.sub,
              role: decoded.role,
              // These are placeholder values as they are not in the token.
              // A /users/me endpoint would provide these.
              id: 0,
              full_name: 'Authenticated User',
              created_at: new Date().toISOString(),
            });
          }
        } catch (error) {
          console.error("Invalid token:", error);
          logout(); // Clear invalid token
        }
      }
      setIsLoading(false);
    };

    initializeAuth();
  }, [token]);

  const login = (newToken: string) => {
    localStorage.setItem('authToken', newToken);
    setToken(newToken);
  };

  const logout = () => {
    localStorage.removeItem('authToken');
    setToken(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ isAuthenticated: !!user, user, token, login, logout, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
