import { useEffect, useState } from 'react';
import { Plus, Users, Trash2, Link2Off } from 'lucide-react';
import { supabase } from '../lib/supabase';
import type { Employee, Restaurant } from '../lib/types';

interface EmployeeListProps {
  restaurant: Restaurant;
}

export function EmployeeList({ restaurant }: EmployeeListProps) {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [allEmployees, setAllEmployees] = useState<Employee[]>([]);
  const [showAddForm, setShowAddForm] = useState(false);
  const [showLinkForm, setShowLinkForm] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    role: 'server'
  });
  const [selectedEmployeeId, setSelectedEmployeeId] = useState('');
  const [loading, setLoading] = useState(false);
  const [employeeLocations, setEmployeeLocations] = useState<Record<string, number>>({});

  useEffect(() => {
    loadEmployees();
    loadAllEmployees();
    loadEmployeeLocations();
  }, [restaurant.id]);

  const loadEmployees = async () => {
    const { data, error } = await supabase
      .from('employee_restaurants')
      .select('employee:employees(*)')
      .eq('restaurant_id', restaurant.id);

    if (error) {
      console.error('Error loading employees:', error);
      return;
    }

    const employeeList = data?.map(er => er.employee).filter(Boolean) || [];
    setEmployees(employeeList as Employee[]);
  };

  const loadAllEmployees = async () => {
    const { data, error } = await supabase
      .from('employees')
      .select('*')
      .order('name');

    if (error) {
      console.error('Error loading all employees:', error);
      return;
    }

    setAllEmployees(data || []);
  };

  const loadEmployeeLocations = async () => {
    const { data, error } = await supabase
      .from('employee_restaurants')
      .select('employee_id');

    if (error) {
      console.error('Error loading employee locations:', error);
      return;
    }

    const locationCounts: Record<string, number> = {};
    data?.forEach(er => {
      locationCounts[er.employee_id] = (locationCounts[er.employee_id] || 0) + 1;
    });
    setEmployeeLocations(locationCounts);
  };

  const handleAddEmployee = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) return;

    setLoading(true);

    const { data: newEmployee, error: employeeError } = await supabase
      .from('employees')
      .insert([formData])
      .select()
      .single();

    if (employeeError) {
      console.error('Error adding employee:', employeeError);
      setLoading(false);
      return;
    }

    const { error: linkError } = await supabase
      .from('employee_restaurants')
      .insert([{
        employee_id: newEmployee.id,
        restaurant_id: restaurant.id,
        primary_location: true
      }]);

    setLoading(false);

    if (linkError) {
      console.error('Error linking employee to restaurant:', linkError);
      return;
    }

    setEmployees([...employees, newEmployee]);
    setAllEmployees([...allEmployees, newEmployee]);
    setFormData({ name: '', email: '', phone: '', role: 'server' });
    setShowAddForm(false);
  };

  const handleLinkEmployee = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedEmployeeId) return;

    setLoading(true);

    const { error } = await supabase
      .from('employee_restaurants')
      .insert([{
        employee_id: selectedEmployeeId,
        restaurant_id: restaurant.id,
        primary_location: false
      }]);

    setLoading(false);

    if (error) {
      if (error.code === '23505') {
        alert('This employee is already linked to this restaurant.');
      } else {
        console.error('Error linking employee:', error);
      }
      return;
    }

    await loadEmployees();
    setSelectedEmployeeId('');
    setShowLinkForm(false);
  };

  const handleRemoveEmployee = async (id: string) => {
    const locationCount = employeeLocations[id] || 0;
    const isOnlyLocation = locationCount === 1;

    let confirmMessage = '';
    if (isOnlyLocation) {
      confirmMessage = 'This employee only works at this location. This will permanently delete the employee from the system. Continue?';
    } else {
      confirmMessage = `This employee works at ${locationCount} location(s). Remove from this restaurant only?`;
    }

    if (!confirm(confirmMessage)) return;

    const { error: unlinkError } = await supabase
      .from('employee_restaurants')
      .delete()
      .eq('employee_id', id)
      .eq('restaurant_id', restaurant.id);

    if (unlinkError) {
      console.error('Error removing employee:', unlinkError);
      return;
    }

    if (isOnlyLocation) {
      const { error: deleteError } = await supabase
        .from('employees')
        .delete()
        .eq('id', id);

      if (deleteError) {
        console.error('Error deleting employee:', deleteError);
      }
      setAllEmployees(allEmployees.filter(emp => emp.id !== id));
    }

    setEmployees(employees.filter(emp => emp.id !== id));
    await loadEmployeeLocations();
  };

  return (
    <div className="bg-white rounded-lg shadow-sm p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-semibold text-gray-800 flex items-center gap-2">
          <Users className="w-5 h-5" />
          Employees
        </h2>
        <div className="flex gap-2">
          <button
            onClick={() => {
              setShowAddForm(!showAddForm);
              setShowLinkForm(false);
            }}
            className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
          >
            <Plus className="w-4 h-4" />
            New Employee
          </button>
          <button
            onClick={() => {
              setShowLinkForm(!showLinkForm);
              setShowAddForm(false);
            }}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Plus className="w-4 h-4" />
            Link Existing
          </button>
        </div>
      </div>

      {showLinkForm && (
        <form onSubmit={handleLinkEmployee} className="mb-4 p-4 bg-blue-50 rounded-lg">
          <h3 className="text-sm font-semibold text-gray-700 mb-3">Link Existing Employee</h3>
          <div className="space-y-3">
            <select
              value={selectedEmployeeId}
              onChange={(e) => setSelectedEmployeeId(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              required
            >
              <option value="">Select an employee</option>
              {allEmployees
                .filter(emp => !employees.find(e => e.id === emp.id))
                .map(emp => (
                  <option key={emp.id} value={emp.id}>
                    {emp.name} ({emp.role})
                  </option>
                ))}
            </select>
            <div className="flex gap-2">
              <button
                type="submit"
                disabled={loading}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors"
              >
                {loading ? 'Linking...' : 'Link'}
              </button>
              <button
                type="button"
                onClick={() => setShowLinkForm(false)}
                className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </form>
      )}

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
        {employees.map((employee) => {
          const locationCount = employeeLocations[employee.id] || 1;
          const isMultiLocation = locationCount > 1;

          return (
            <div
              key={employee.id}
              className="flex items-center justify-between px-4 py-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
            >
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-medium text-gray-800">{employee.name}</span>
                  {isMultiLocation && (
                    <span className="flex items-center gap-1 px-2 py-0.5 bg-blue-100 text-blue-700 text-xs rounded-full">
                      <Link2Off className="w-3 h-3" />
                      {locationCount} locations
                    </span>
                  )}
                </div>
                <div className="text-sm text-gray-500">
                  {employee.role}
                  {employee.email && ` • ${employee.email}`}
                  {employee.phone && ` • ${employee.phone}`}
                </div>
              </div>
              <button
                onClick={() => handleRemoveEmployee(employee.id)}
                className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                title={isMultiLocation ? 'Remove from this restaurant' : 'Delete employee'}
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          );
        })}
        {employees.length === 0 && !showAddForm && (
          <p className="text-gray-500 text-center py-4">No employees yet. Add your first one!</p>
        )}
      </div>
    </div>
  );
}
