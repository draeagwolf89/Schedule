import { useEffect, useState } from 'react';
import { Plus, Users, Trash2 } from 'lucide-react';
import { supabase } from '../lib/supabase';
import type { Employee, Restaurant } from '../lib/types';

interface EmployeeListProps {
  restaurant: Restaurant;
}

export function EmployeeList({ restaurant }: EmployeeListProps) {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [showAddForm, setShowAddForm] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    role: 'server'
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadEmployees();
  }, [restaurant.id]);

  const loadEmployees = async () => {
    const { data, error } = await supabase
      .from('employees')
      .select('*')
      .eq('restaurant_id', restaurant.id)
      .order('name');

    if (error) {
      console.error('Error loading employees:', error);
      return;
    }

    setEmployees(data || []);
  };

  const handleAddEmployee = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) return;

    setLoading(true);
    const { data, error } = await supabase
      .from('employees')
      .insert([{ ...formData, restaurant_id: restaurant.id }])
      .select()
      .single();

    setLoading(false);

    if (error) {
      console.error('Error adding employee:', error);
      return;
    }

    setEmployees([...employees, data]);
    setFormData({ name: '', email: '', phone: '', role: 'server' });
    setShowAddForm(false);
  };

  const handleDeleteEmployee = async (id: string) => {
    if (!confirm('Are you sure you want to delete this employee?')) return;

    const { error } = await supabase
      .from('employees')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error deleting employee:', error);
      return;
    }

    setEmployees(employees.filter(emp => emp.id !== id));
  };

  return (
    <div className="bg-white rounded-lg shadow-sm p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-semibold text-gray-800 flex items-center gap-2">
          <Users className="w-5 h-5" />
          Employees
        </h2>
        <button
          onClick={() => setShowAddForm(!showAddForm)}
          className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
        >
          <Plus className="w-4 h-4" />
          Add Employee
        </button>
      </div>

      {showAddForm && (
        <form onSubmit={handleAddEmployee} className="mb-4 p-4 bg-gray-50 rounded-lg">
          <div className="space-y-3">
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="Employee name"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              required
            />
            <input
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              placeholder="Email (optional)"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
            />
            <input
              type="tel"
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              placeholder="Phone (optional)"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
            />
            <select
              value={formData.role}
              onChange={(e) => setFormData({ ...formData, role: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
            >
              <option value="server">Server</option>
              <option value="cook">Cook</option>
              <option value="manager">Manager</option>
              <option value="host">Host</option>
              <option value="bartender">Bartender</option>
            </select>
            <div className="flex gap-2">
              <button
                type="submit"
                disabled={loading}
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 transition-colors"
              >
                {loading ? 'Adding...' : 'Add'}
              </button>
              <button
                type="button"
                onClick={() => setShowAddForm(false)}
                className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </form>
      )}

      <div className="space-y-2">
        {employees.map((employee) => (
          <div
            key={employee.id}
            className="flex items-center justify-between px-4 py-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
          >
            <div>
              <div className="font-medium text-gray-800">{employee.name}</div>
              <div className="text-sm text-gray-500">
                {employee.role}
                {employee.email && ` • ${employee.email}`}
                {employee.phone && ` • ${employee.phone}`}
              </div>
            </div>
            <button
              onClick={() => handleDeleteEmployee(employee.id)}
              className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
              title="Delete employee"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        ))}
        {employees.length === 0 && !showAddForm && (
          <p className="text-gray-500 text-center py-4">No employees yet. Add your first one!</p>
        )}
      </div>
    </div>
  );
}
