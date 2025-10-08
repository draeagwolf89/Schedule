import { useEffect, useState } from 'react';
import { Plus, Users, Trash2 } from 'lucide-react';
import { supabase } from '../lib/supabase';
import type { Employee, Restaurant } from '../lib/types';

interface EmployeeListProps {
  restaurant: Restaurant;
}

type Role = 'door' | 'gelato' | 'server';

const ROLES: { value: Role; label: string }[] = [
  { value: 'door', label: 'Door' },
  { value: 'gelato', label: 'Gelato' },
  { value: 'server', label: 'Server' }
];

export function EmployeeList({ restaurant }: EmployeeListProps) {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [allRestaurants, setAllRestaurants] = useState<Restaurant[]>([]);
  const [showAddForm, setShowAddForm] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    password: '',
    roles: [] as Role[],
    selectedRestaurants: [restaurant.id] as string[]
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadEmployees();
    loadAllRestaurants();
  }, [restaurant.id]);

  const loadEmployees = async () => {
    const { data, error } = await supabase
      .from('restaurant_employees')
      .select('employee:employees(*)')
      .eq('restaurant_id', restaurant.id);

    if (error) {
      console.error('Error loading employees:', error);
      return;
    }

    const employeeList = data?.map(re => re.employee).filter(Boolean) || [];
    setEmployees(employeeList as Employee[]);
  };

  const loadAllRestaurants = async () => {
    const { data, error } = await supabase
      .from('restaurants')
      .select('*')
      .order('name');

    if (error) {
      console.error('Error loading restaurants:', error);
      return;
    }

    setAllRestaurants(data || []);
  };

  const handleAddEmployee = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim() || formData.roles.length === 0) {
      alert('Please provide a name and select at least one role');
      return;
    }

    if (formData.selectedRestaurants.length === 0) {
      alert('Please select at least one restaurant');
      return;
    }

    if (!formData.password || formData.password.length < 6) {
      alert('Please provide a password with at least 6 characters');
      return;
    }

    setLoading(true);

    // Generate a unique email from the name
    const emailUsername = formData.name.toLowerCase().replace(/\s+/g, '-');
    const timestamp = Date.now();
    const generatedEmail = `${emailUsername}-${timestamp}@employee.local`;

    const { data: authData, error: authError } = await supabase.auth.signUp({
      email: generatedEmail,
      password: formData.password,
      options: {
        emailRedirectTo: undefined,
        data: {
          name: formData.name,
        },
      },
    });

    if (authError) {
      alert(`Error creating account: ${authError.message}`);
      setLoading(false);
      return;
    }

    if (!authData.user) {
      alert('Failed to create user account');
      setLoading(false);
      return;
    }

    const { data: newEmployee, error: employeeError } = await supabase
      .from('employees')
      .insert([{
        name: formData.name,
        email: generatedEmail,
        roles: formData.roles,
        auth_user_id: authData.user.id
      }])
      .select()
      .single();

    if (employeeError) {
      console.error('Error adding employee:', employeeError);
      setLoading(false);
      return;
    }

    const restaurantLinks = formData.selectedRestaurants.map(restaurantId => ({
      employee_id: newEmployee.id,
      restaurant_id: restaurantId
    }));

    const { error: linkError } = await supabase
      .from('restaurant_employees')
      .insert(restaurantLinks);

    setLoading(false);

    if (linkError) {
      console.error('Error linking employee to restaurants:', linkError);
      return;
    }

    if (formData.selectedRestaurants.includes(restaurant.id)) {
      setEmployees([...employees, newEmployee]);
    }
    setFormData({ name: '', password: '', roles: [], selectedRestaurants: [restaurant.id] });
    setShowAddForm(false);
  };

  const handleRemoveEmployee = async (id: string) => {
    if (!confirm('Remove this employee from this restaurant?')) return;

    const { error } = await supabase
      .from('restaurant_employees')
      .delete()
      .eq('employee_id', id)
      .eq('restaurant_id', restaurant.id);

    if (error) {
      console.error('Error removing employee:', error);
      return;
    }

    setEmployees(employees.filter(emp => emp.id !== id));
  };

  const toggleRole = (role: Role) => {
    setFormData(prev => ({
      ...prev,
      roles: prev.roles.includes(role)
        ? prev.roles.filter(r => r !== role)
        : [...prev.roles, role]
    }));
  };

  const toggleRestaurant = (restaurantId: string) => {
    setFormData(prev => ({
      ...prev,
      selectedRestaurants: prev.selectedRestaurants.includes(restaurantId)
        ? prev.selectedRestaurants.filter(id => id !== restaurantId)
        : [...prev.selectedRestaurants, restaurantId]
    }));
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
              type="password"
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              placeholder="Password (min 6 characters)"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              required
              minLength={6}
            />

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Restaurants (select all where employee works)
              </label>
              <div className="flex flex-wrap gap-2 mb-2">
                {allRestaurants.map(rest => (
                  <button
                    key={rest.id}
                    type="button"
                    onClick={() => toggleRestaurant(rest.id)}
                    className={`px-4 py-2 rounded-lg border transition-colors ${
                      formData.selectedRestaurants.includes(rest.id)
                        ? 'bg-blue-600 text-white border-blue-600'
                        : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                    }`}
                  >
                    {rest.name}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Roles (select all that apply)
              </label>
              <div className="flex gap-2 mb-2">
                {ROLES.map(role => (
                  <button
                    key={role.value}
                    type="button"
                    onClick={() => toggleRole(role.value)}
                    className={`px-4 py-2 rounded-lg border transition-colors ${
                      formData.roles.includes(role.value)
                        ? 'bg-red-600 text-white border-red-600'
                        : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                    }`}
                  >
                    {role.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex gap-2 mt-6">
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
              {employee.roles && employee.roles.length > 0 && (
                <div className="flex gap-1 mt-1">
                  {employee.roles.map(role => (
                    <span
                      key={role}
                      className="px-2 py-0.5 text-xs bg-green-100 text-green-700 rounded"
                    >
                      {ROLES.find(r => r.value === role)?.label}
                    </span>
                  ))}
                </div>
              )}
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
