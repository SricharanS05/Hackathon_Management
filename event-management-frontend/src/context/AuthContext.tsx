import React, { createContext, useContext, useState, useEffect } from 'react';
import { decodeToken, isTokenExpired } from '@/utils/jwt';

interface AuthUser {
  email: string;
  role: 'ADMIN' | 'ORGANIZER' | 'STUDENT';
  name: string;
}

interface AuthContextType {
  user: AuthUser | null;
  token: string | null;
  login: (token: string) => void;
  logout: () => void;
  isAuthenticated: boolean;
  isLoading: boolean;
  profilePicture: string | null;
  updateProfilePicture: (pic: string | null) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [token, setToken] = useState<string | null>(() => localStorage.getItem('jwt_token'));
  const [user, setUser] = useState<AuthUser | null>(null);
  const [profilePicture, setProfilePicture] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (token) {
      if (isTokenExpired(token)) {
        localStorage.removeItem('jwt_token');
        setToken(null);
        setUser(null);
        setProfilePicture(null);
      } else {
        const decoded = decodeToken(token);
        if (decoded && decoded.email && decoded.role) {
          const email = decoded.email;
          setUser({
            email,
            role: decoded.role as 'ADMIN' | 'ORGANIZER' | 'STUDENT',
            name: decoded.name || 'User',
          });
          setProfilePicture(localStorage.getItem(`profile_pic_${email}`));
        } else {
          localStorage.removeItem('jwt_token');
          setToken(null);
          setUser(null);
          setProfilePicture(null);
        }
      }
    } else {
      setUser(null);
      setProfilePicture(null);
    }
    setIsLoading(false);
  }, [token]);

  const login = (newToken: string) => {
    localStorage.setItem('jwt_token', newToken);
    setToken(newToken);
  };

  const logout = () => {
    localStorage.removeItem('jwt_token');
    setToken(null);
    setUser(null);
    setProfilePicture(null);
  };

  const updateProfilePicture = (pic: string | null) => {
    if (user) {
      if (pic) {
        localStorage.setItem(`profile_pic_${user.email}`, pic);
      } else {
        localStorage.removeItem(`profile_pic_${user.email}`);
      }
      setProfilePicture(pic);
    }
  };

  const isAuthenticated = !!token && !isTokenExpired(token);

  return (
    <AuthContext.Provider value={{ 
      user, 
      token, 
      login, 
      logout, 
      isAuthenticated, 
      isLoading,
      profilePicture,
      updateProfilePicture
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
