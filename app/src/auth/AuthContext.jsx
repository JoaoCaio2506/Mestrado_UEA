import { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '../lib/supabaseClient';

export const AuthContext = createContext({
  session: null,
  loading: true,
  passwordRecovery: false,
  clearPasswordRecovery: () => {},
});

export function AuthProvider({ children }) {
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);
  // Set when the user arrives via the "reset password" e-mail link — Supabase
  // hands them a valid session at that point, so without this flag RootGate
  // would drop them straight into the dashboard instead of letting them pick
  // a new password first.
  const [passwordRecovery, setPasswordRecovery] = useState(false);

  useEffect(() => {
    if (!supabase) {
      setLoading(false);
      return;
    }
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
      setLoading(false);
    });
    const { data: listener } = supabase.auth.onAuthStateChange((event, newSession) => {
      setSession(newSession);
      if (event === 'PASSWORD_RECOVERY') setPasswordRecovery(true);
    });
    return () => listener.subscription.unsubscribe();
  }, []);

  return (
    <AuthContext.Provider
      value={{ session, loading, passwordRecovery, clearPasswordRecovery: () => setPasswordRecovery(false) }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
