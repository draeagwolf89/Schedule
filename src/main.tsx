import { StrictMode, useState, useEffect } from 'react';
import { createRoot } from 'react-dom/client';
import { LoginPage } from './components/LoginPage';
import { getCurrentUser, isAdmin, signOut, onAuthStateChange } from './lib/auth';
import App from './App.tsx';
import './index.css';

function Root() {
  const [user, setUser] = useState<any>(null);
  const [userIsAdmin, setUserIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkUser();

    const { data: { subscription } } = onAuthStateChange(async (user) => {
      setUser(user);
      if (user) {
        const adminStatus = await isAdmin();
        setUserIsAdmin(adminStatus);
      } else {
        setUserIsAdmin(false);
      }
      setLoading(false);
    });

    return () => {
      subscription?.unsubscribe();
    };
  }, []);

  const checkUser = async () => {
    const currentUser = await getCurrentUser();
    setUser(currentUser);
    if (currentUser) {
      const adminStatus = await isAdmin();
      setUserIsAdmin(adminStatus);
    }
    setLoading(false);
  };

  const handleLogin = async () => {
    await checkUser();
  };

  const handleLogout = async () => {
    await signOut();
    setUser(null);
    setUserIsAdmin(false);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center">
        <div className="text-gray-600">Loading...</div>
      </div>
    );
  }

  if (!user) {
    return <LoginPage onLogin={handleLogin} />;
  }

  if (!userIsAdmin) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center px-4">
        <div className="bg-white rounded-lg shadow-lg p-8 max-w-md w-full text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Staff View Coming Soon</h1>
          <p className="text-gray-600 mb-6">
            The staff view for viewing your schedule will be available soon.
          </p>
          <button
            onClick={handleLogout}
            className="px-6 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors"
          >
            Sign Out
          </button>
        </div>
      </div>
    );
  }

  return <App />;
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <Root />
  </StrictMode>
);
