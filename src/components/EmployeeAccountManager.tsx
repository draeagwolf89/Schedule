import { useState, useEffect } from 'react';
import { UserPlus, Key, Mail } from 'lucide-react';
import { supabase } from '../lib/supabase';
import type { Employee } from '../lib/types';

export function EmployeeAccountManager() {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [selectedEmployee, setSelectedEmployee] = useState<string>('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  useEffect(() => {
    loadEmployeesWithoutAccounts();
  }, []);

  const loadEmployeesWithoutAccounts = async () => {
    const { data, error } = await supabase
      .from('employees')
      .select('*')
      .is('auth_user_id', null);

    if (error) {
      console.error('Error loading employees:', error);
      return;
    }

    setEmployees(data || []);
  };

  const generateRandomPassword = () => {
    const length = 12;
    const charset = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*';
    let password = '';
    for (let i = 0; i < length; i++) {
      password += charset.charAt(Math.floor(Math.random() * charset.length));
    }
    setPassword(password);
  };

  const handleCreateAccount = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedEmployee || !password) {
      setMessage({ type: 'error', text: 'Please select an employee and provide a password' });
      return;
    }

    const employee = employees.find(emp => emp.id === selectedEmployee);
    if (!employee) {
      setMessage({ type: 'error', text: 'Employee not found' });
      return;
    }

    setLoading(true);
    setMessage(null);

    const { data: authData, error: authError } = await supabase.auth.signUp({
      email: employee.email,
      password: password,
      options: {
        data: {
          name: employee.name,
        },
      },
    });

    if (authError) {
      setMessage({ type: 'error', text: `Error creating account: ${authError.message}` });
      setLoading(false);
      return;
    }

    if (!authData.user) {
      setMessage({ type: 'error', text: 'Failed to create user account' });
      setLoading(false);
      return;
    }

    const { error: updateError } = await supabase
      .from('employees')
      .update({ auth_user_id: authData.user.id })
      .eq('id', selectedEmployee);

    setLoading(false);

    if (updateError) {
      setMessage({ type: 'error', text: `Error linking account: ${updateError.message}` });
      return;
    }

    setMessage({
      type: 'success',
      text: `Account created successfully for ${employee.name}. Email: ${employee.email}, Password: ${password}`,
    });

    setEmployees(employees.filter(emp => emp.id !== selectedEmployee));
    setSelectedEmployee('');
    setPassword('');
  };

  return (
    <div className="bg-white rounded-lg shadow-sm p-6">
      <h2 className="text-xl font-semibold text-gray-800 flex items-center gap-2 mb-4">
        <UserPlus className="w-5 h-5" />
        Create Employee Accounts
      </h2>

      {employees.length === 0 ? (
        <p className="text-gray-500 text-center py-8">
          All employees have accounts created
        </p>
      ) : (
        <form onSubmit={handleCreateAccount} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Select Employee
            </label>
            <select
              value={selectedEmployee}
              onChange={(e) => setSelectedEmployee(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              required
            >
              <option value="">Choose an employee...</option>
              {employees.map((employee) => (
                <option key={employee.id} value={employee.id}>
                  {employee.name} ({employee.email})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <Key className="w-4 h-4 inline mr-1" />
              Password
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter password or generate one"
                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              />
              <button
                type="button"
                onClick={generateRandomPassword}
                className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
              >
                Generate
              </button>
            </div>
          </div>

          {message && (
            <div
              className={`p-4 rounded-lg ${
                message.type === 'success'
                  ? 'bg-green-50 text-green-800 border border-green-200'
                  : 'bg-red-50 text-red-800 border border-red-200'
              }`}
            >
              <div className="flex items-start gap-2">
                {message.type === 'success' ? (
                  <Mail className="w-5 h-5 flex-shrink-0 mt-0.5" />
                ) : (
                  <span className="text-lg">⚠️</span>
                )}
                <p className="text-sm">{message.text}</p>
              </div>
            </div>
          )}

          <button
            type="submit"
            disabled={loading || !selectedEmployee || !password}
            className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors"
          >
            {loading ? 'Creating Account...' : 'Create Account'}
          </button>
        </form>
      )}
    </div>
  );
}
