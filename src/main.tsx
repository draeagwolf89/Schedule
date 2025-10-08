import { StrictMode, useState, useEffect } from 'react';
import { createRoot } from 'react-dom/client';
import { LoginPage } from './components/LoginPage';
import { auth } from './lib/storage';
import App from './App.tsx';
import './index.css';

function Root() {
  const [user, setUser] = useState(auth.getCurrentUser());

  const handleLogin = () => {
    setUser(auth.getCurrentUser());
  };

  const handleLogout = () => {
    auth.signOut();
    setUser(null);
  };

  if (!user) {
    return <LoginPage onLogin={handleLogin} />;
  }

  if (!user.isAdmin) {
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
