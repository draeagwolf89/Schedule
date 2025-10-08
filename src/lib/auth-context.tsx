import { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from './supabase';

interface AuthContextType {
  user: { id: string; username: string } | null;
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
  const [user, setUser] = useState<{ id: string; username: string } | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [employeeId, setEmployeeId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    const storedEmployeeId = localStorage.getItem('employee_id');
    const storedUsername = localStorage.getItem('employee_username');

    if (storedEmployeeId && storedUsername) {
      setUser({ id: storedEmployeeId, username: storedUsername });
      await checkUserRole(storedEmployeeId);
    } else {
      const { data: { user: supabaseUser } } = await supabase.auth.getUser();
      if (supabaseUser) {
        setUser({ id: supabaseUser.id, username: supabaseUser.email || '' });
        await checkUserRole(supabaseUser.id);
      }
    }

    setLoading(false);
  };

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

    setIsAdmin(false);
    setEmployeeId(userId);
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
