import { useState } from 'react';
import { LogIn, Shield } from 'lucide-react';
import { supabase } from '../lib/supabase';

type LoginMode = 'employee' | 'admin';

export function LoginPage() {
  const [mode, setMode] = useState<LoginMode>('employee');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleEmployeeLogin = async () => {
    const { data: employee, error: lookupError } = await supabase
      .from('employees')
      .select('*')
      .eq('username', username.trim())
      .maybeSingle();

    if (lookupError || !employee) {
      setError('Invalid username or password');
      setLoading(false);
      return;
    }

    const passwordHash = btoa(password);
    if (employee.password_hash !== passwordHash) {
      setError('Invalid username or password');
      setLoading(false);
      return;
    }

    localStorage.setItem('employee_id', employee.id);
    localStorage.setItem('employee_username', employee.username);
    window.location.reload();
  };

  const handleAdminLogin = async () => {
    const { error: signInError } = await supabase.auth.signInWithPassword({
      email: username.trim(),
      password: password,
    });

    if (signInError) {
      setError('Invalid email or password');
      setLoading(false);
      return;
    }

    window.location.reload();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    if (mode === 'employee') {
      await handleEmployeeLogin();
    } else {
      await handleAdminLogin();
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center px-4">
      <div className="bg-white rounded-lg shadow-lg p-8 max-w-md w-full">
        <div className="flex items-center justify-center mb-6">
          <div className={`${mode === 'admin' ? 'bg-blue-600' : 'bg-orange-600'} rounded-full p-3`}>
            {mode === 'admin' ? (
              <Shield className="w-8 h-8 text-white" />
            ) : (
              <LogIn className="w-8 h-8 text-white" />
            )}
          </div>
        </div>

        <div className="flex gap-2 mb-6">
          <button
            type="button"
            onClick={() => {
              setMode('employee');
              setError('');
              setUsername('');
              setPassword('');
            }}
            className={`flex-1 py-2 px-4 rounded-lg font-medium transition-colors ${
              mode === 'employee'
                ? 'bg-orange-600 text-white'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            Employee
          </button>
          <button
            type="button"
            onClick={() => {
              setMode('admin');
              setError('');
              setUsername('');
              setPassword('');
            }}
            className={`flex-1 py-2 px-4 rounded-lg font-medium transition-colors ${
              mode === 'admin'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            Admin
          </button>
        </div>

        <h1 className="text-2xl font-bold text-gray-900 text-center mb-2">
          {mode === 'admin' ? 'Admin Login' : 'Staff Login'}
        </h1>
        <p className="text-gray-600 text-center mb-8">
          {mode === 'admin' ? 'Manage restaurants and schedules' : 'Sign in to view your schedule'}
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {mode === 'admin' ? 'Email' : 'Username'}
            </label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              placeholder={mode === 'admin' ? 'Enter your email' : 'Enter your username'}
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              placeholder="Enter your password"
              required
            />
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className={`w-full text-white py-2 px-4 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium ${
              mode === 'admin'
                ? 'bg-blue-600 hover:bg-blue-700'
                : 'bg-orange-600 hover:bg-orange-700'
            }`}
          >
            {loading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>
      </div>
    </div>
  );
}
