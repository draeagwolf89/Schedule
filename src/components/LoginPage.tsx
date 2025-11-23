import { useState } from 'react';
import { LogIn } from 'lucide-react';
import { supabase } from '../lib/supabase';

export function LoginPage() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const trimmedUsername = username.trim();

    const { data: employee, error: employeeLookupError } = await supabase
      .from('employees')
      .select('*')
      .eq('username', trimmedUsername)
      .maybeSingle();

    if (!employeeLookupError && employee) {
      const passwordHash = btoa(password);
      if (employee.password_hash === passwordHash) {
        localStorage.setItem('employee_id', employee.id);
        localStorage.setItem('employee_username', employee.username);
        window.location.reload();
        return;
      }
    }

    const isEmail = trimmedUsername.includes('@');
    if (isEmail) {
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email: trimmedUsername,
        password: password,
      });

      if (!signInError) {
        localStorage.removeItem('employee_id');
        localStorage.removeItem('employee_username');
        window.location.reload();
        return;
      }
    }

    setError('Invalid username or password');
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center px-4">
      <div className="bg-white rounded-lg shadow-lg p-8 max-w-md w-full">
        <div className="flex items-center justify-center mb-6">
          <div className="bg-orange-600 rounded-full p-3">
            <LogIn className="w-8 h-8 text-white" />
          </div>
        </div>

        <h1 className="text-2xl font-bold text-gray-900 text-center mb-2">
          Welcome Back
        </h1>
        <p className="text-gray-600 text-center mb-8">
          Sign in to access your account
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Username or Email
            </label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              placeholder="Enter your username or email"
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
            className="w-full bg-orange-600 hover:bg-orange-700 text-white py-2 px-4 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium"
          >
            {loading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>
      </div>
    </div>
  );
}
