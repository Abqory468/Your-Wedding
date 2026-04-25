import React, { createContext, useContext, useEffect, useState } from 'react';
import { storageService } from '../services/storageService';
import { UserProfile } from '../types';

interface AuthContextType {
  user: UserProfile | null;
  loading: boolean;
  login: (email: string) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType>({ 
  user: null, 
  loading: true,
  login: () => {},
  logout: () => {}
});

export const useAuth = () => useContext(AuthContext);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const currentUser = storageService.getCurrentUser();
    setUser(currentUser);
    setLoading(false);
  }, []);

  const login = (email: string) => {
    const profile = storageService.register(email);
    storageService.setCurrentUser(profile);
    setUser(profile);
  };

  const logout = () => {
    storageService.setCurrentUser(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};
