import React, { createContext, useContext, useEffect, useRef, useState } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { getGoogleRedirectResult } from '@/lib/auth';
import type { AuthUser } from '@/lib/auth';

interface AuthContextValue {
  user: AuthUser | null;
  loading: boolean;
}

const AuthContext = createContext<AuthContextValue>({
  user: null,
  loading: true,
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);
  const redirectHandled = useRef(false);

  useEffect(() => {
    let unsubscribe: (() => void) | undefined;
    let cancelled = false;

    (async () => {
      // リダイレクト戻り時: getRedirectResult は「最初の1回だけ」結果を返す。二重呼び出しを防ぐ
      if (!redirectHandled.current) {
        redirectHandled.current = true;
        try {
          const redirectUser = await getGoogleRedirectResult();
          if (redirectUser) {
            setUser(redirectUser);
            setLoading(false);
          }
        } catch {
          redirectHandled.current = false;
        }
      }

      if (cancelled) return;
      unsubscribe = onAuthStateChanged(auth, (u) => {
        if (cancelled) return;
        setUser(u ?? null);
        setLoading(false);
      });
    })();

    return () => {
      cancelled = true;
      unsubscribe?.();
    };
  }, []);

  return (
    <AuthContext.Provider value={{ user, loading }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
