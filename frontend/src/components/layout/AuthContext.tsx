'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { User, DocumentItem } from '@/types';
import { api } from '@/lib/api';
import { DEMO_USER, DEMO_DOCUMENTS } from '@/lib/demoData';

interface AuthContextType {
  user: User;
  isLoading: boolean;
  activeDocument: DocumentItem | null;
  setActiveDocument: (doc: DocumentItem | null) => void;
}

const AuthContext = createContext<AuthContextType>({
  user: DEMO_USER,
  isLoading: false,
  activeDocument: DEMO_DOCUMENTS[0],
  setActiveDocument: () => {},
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user] = useState<User>(DEMO_USER);
  const [isLoading, setIsLoading] = useState(false);
  const [activeDocument, setActiveDocument] = useState<DocumentItem | null>(DEMO_DOCUMENTS[0]);

  useEffect(() => {
    async function loadDocs() {
      try {
        const docs = await api.getDocuments();
        if (docs.length > 0) {
          setActiveDocument(docs[0]);
        }
      } catch (e) {
        console.error(e);
      }
    }
    loadDocs();
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        activeDocument,
        setActiveDocument,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
