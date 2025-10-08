import { useEffect, useState } from 'react';
import { Plus, Users, Trash2 } from 'lucide-react';
import { storage } from '../lib/storage';
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
    position: 'server',
    password: ''
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadEmployees();
  }, [restaurant.id]);

  const loadEmployees = () => {
    const data = storage.employees.getByRestaurant(restaurant.id);
    setEmployees(data);
  };

  const handleAddEmployee = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) return;

    setLoading(true);

    const newEmployee = storage.employees.create(formData);
    storage.restaurantEmployees.assign(restaurant.id, newEmployee.id);

    setLoading(false);

    setEmployees([...employees, newEmployee]);
    setFormData({ name: '', email: '', phone: '', position: 'server', password: '' });
    setShowAddForm(false);
  };

  const handleRemoveEmployee = (id: string) => {
    if (!confirm('Remove this employee from this restaurant?')) return;

    storage.restaurantEmployees.unassign(restaurant.id, id);
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
          New Employee
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
              placeholder="Email"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              required
            />
            <input
              type="tel"
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              placeholder="Phone"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              required
            />
            <input
              type="password"
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              placeholder="Password"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              required
            />
            <select
              value={formData.position}
              onChange={(e) => setFormData({ ...formData, position: e.target.value })}
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
                {employee.position}
                {employee.email && ` • ${employee.email}`}
                {employee.phone && ` • ${employee.phone}`}
              </div>
            </div>
            <button
              onClick={() => handleRemoveEmployee(employee.id)}
              className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
              title="Remove from this restaurant"
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
