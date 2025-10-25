// EM: src/context/AuthContext.tsx
import React, { createContext, useState, useContext, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface AuthContextType {
  adminKey: string | null;
  isAuthenticated: boolean;
  login: (key: string) => Promise<boolean>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// CHAVE SECRETA DE VERIFICAÇÃO (apenas para o app saber se o formato é válido)
const CORRECT_ADMIN_KEY = 'ivertondelive'; // Use a mesma chave da Lambda!

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [adminKey, setAdminKey] = useState<string | null>(null);

  const login = async (key: string): Promise<boolean> => {
    if (key === CORRECT_ADMIN_KEY) {
      await AsyncStorage.setItem('adminKey', key);
      setAdminKey(key);
      return true;
    }
    return false;
  };

  const logout = async () => {
    await AsyncStorage.removeItem('adminKey');
    setAdminKey(null);
  };

  return (
    <AuthContext.Provider value={{ adminKey, isAuthenticated: !!adminKey, login, logout }}>
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