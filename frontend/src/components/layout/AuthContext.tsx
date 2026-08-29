'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { User, DocumentItem } from '@/types';
import { api } from '@/lib/api';
import { DEMO_USER, DEMO_DOCUMENTS } from '@/lib/demoData';

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isDemo: boolean;
  activeDocument: DocumentItem | null;
  setActiveDocument: (doc: DocumentItem | null) => void;
  login: (email: string, pass: string) => Promise<void>;
  register: (email: string, pass: string, name?: string) => Promise<void>;
  demoLogin: () => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  isLoading: true,
  isDemo: false,
  activeDocument: null,
  setActiveDocument: () => {},
  login: async () => {},
  register: async () => {},
  demoLogin: async () => {},
  logout: () => {},
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isDemo, setIsDemo] = useState(false);
  const [activeDocument, setActiveDocument] = useState<DocumentItem | null>(null);

  useEffect(() => {
    async function loadUser() {
      try {
        const token = api.getToken();
        if (token) {
          const u = await api.getMe();
          setUser(u);
          setIsDemo(api.isDemo());
          const docs = await api.getDocuments();
          if (docs.length > 0) {
            setActiveDocument(docs[0]);
          }
        }
      } catch (err) {
        console.error('Session load error:', err);
      } finally {
        setIsLoading(false);
      }
    }
    loadUser();
  }, []);

  const login = async (email: string, pass: string) => {
    setIsLoading(true);
    try {
      const res = await api.login(email, pass);
      setUser(res.user);
      setIsDemo(api.isDemo());
      const docs = await api.getDocuments();
      if (docs.length > 0) setActiveDocument(docs[0]);
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (email: string, pass: string, name?: string) => {
    setIsLoading(true);
    try {
      const res = await api.register(email, pass, name);
      setUser(res.user);
      setIsDemo(api.isDemo());
      const docs = await api.getDocuments();
      if (docs.length > 0) setActiveDocument(docs[0]);
    } finally {
      setIsLoading(false);
    }
  };

  const demoLogin = async () => {
    setIsLoading(true);
    try {
      const res = await api.demoLogin();
      setUser(res.user);
      setIsDemo(true);
      setActiveDocument(DEMO_DOCUMENTS[0]);
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    api.logout();
    setUser(null);
    setIsDemo(false);
    setActiveDocument(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        isDemo,
        activeDocument,
        setActiveDocument,
        login,
        register,
        demoLogin,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
