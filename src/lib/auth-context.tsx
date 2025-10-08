import { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from './supabase';
import type { User } from '@supabase/supabase-js';

interface AuthContextType {
  user: User | null;
  isAdmin: boolean;
  employeeId: string | null;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  isAdmin: false,
  employeeId: null,
  loading: true,
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [employeeId, setEmployeeId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      (async () => {
        setUser(session?.user ?? null);
        if (session?.user) {
          await checkUserRole(session.user.id);
        }
        setLoading(false);
      })();
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      (async () => {
        setUser(session?.user ?? null);
        if (session?.user) {
          await checkUserRole(session.user.id);
        } else {
          setIsAdmin(false);
          setEmployeeId(null);
        }
        setLoading(false);
      })();
    });

    return () => subscription.unsubscribe();
  }, []);

  const checkUserRole = async (userId: string) => {
    const { data: adminData } = await supabase
      .from('admins')
      .select('id')
      .eq('user_id', userId)
      .maybeSingle();

    if (adminData) {
      setIsAdmin(true);
      setEmployeeId(null);
      return;
    }

    const { data: employeeData } = await supabase
      .from('employees')
      .select('id')
      .eq('auth_user_id', userId)
      .maybeSingle();

    if (employeeData) {
      setIsAdmin(false);
      setEmployeeId(employeeData.id);
    } else {
      setIsAdmin(false);
      setEmployeeId(null);
    }
  };

  return (
    <AuthContext.Provider value={{ user, isAdmin, employeeId, loading }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
