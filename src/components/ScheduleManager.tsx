import { useEffect, useState } from 'react';
import { Calendar, Trash2, ChevronLeft, ChevronRight, X } from 'lucide-react';
import { supabase } from '../lib/supabase';
import type { Employee, Restaurant, Shift } from '../lib/types';

interface ScheduleManagerProps {
  restaurant: Restaurant;
}

type Role = 'door' | 'gelato' | 'server';

const ROLES: { value: Role; label: string; color: string }[] = [
  { value: 'door', label: 'Door', color: 'bg-blue-50 border-blue-200 text-blue-800' },
  { value: 'gelato', label: 'Gelato', color: 'bg-pink-50 border-pink-200 text-pink-800' },
  { value: 'server', label: 'Server', color: 'bg-green-50 border-green-200 text-green-800' }
];

export function ScheduleManager({ restaurant }: ScheduleManagerProps) {
  const [shifts, setShifts] = useState<Shift[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [showAddForm, setShowAddForm] = useState(false);
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [formData, setFormData] = useState({
    employee_id: '',
    date: '',
    role: 'server' as Role
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadEmployees();
    loadShifts();
  }, [restaurant.id, currentMonth]);

  function formatDate(date: Date): string {
    return date.toISOString().split('T')[0];
  }

  function getMonthDates(): Date[] {
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();

    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);

    const startDate = new Date(firstDay);
    startDate.setDate(startDate.getDate() - firstDay.getDay());

    const endDate = new Date(lastDay);
    endDate.setDate(endDate.getDate() + (6 - lastDay.getDay()));

    const dates: Date[] = [];
    const current = new Date(startDate);

    while (current <= endDate) {
      dates.push(new Date(current));
      current.setDate(current.getDate() + 1);
    }

    return dates;
  }

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
    if (employeeList && employeeList.length > 0 && !formData.employee_id) {
      setFormData(prev => ({ ...prev, employee_id: employeeList[0].id }));
    }
  };

  const loadShifts = async () => {
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);

    const startDate = new Date(firstDay);
    startDate.setDate(startDate.getDate() - firstDay.getDay());

    const endDate = new Date(lastDay);
    endDate.setDate(endDate.getDate() + (6 - lastDay.getDay()));

    const { data, error } = await supabase
      .from('shifts')
      .select('*')
      .eq('restaurant_id', restaurant.id)
      .gte('date', formatDate(startDate))
      .lte('date', formatDate(endDate))
      .order('date');

    if (error) {
      console.error('Error loading shifts:', error);
      return;
    }

    setShifts(data || []);
  };

  const handleAddShift = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.employee_id || !formData.date) return;

    const selectedEmployee = employees.find(emp => emp.id === formData.employee_id);
    if (selectedEmployee && !selectedEmployee.roles.includes(formData.role)) {
      alert(`This employee is not assigned the ${ROLES.find(r => r.value === formData.role)?.label} role. Please select a role they are assigned to.`);
      return;
    }

    const { data: existingShift } = await supabase
      .from('shifts')
      .select('*, restaurant:restaurants(name)')
      .eq('employee_id', formData.employee_id)
      .eq('date', formData.date)
      .maybeSingle();

    if (existingShift) {
      const restaurantName = (existingShift as any).restaurant?.name || 'another restaurant';
      alert(`${selectedEmployee?.name} is already scheduled at ${restaurantName} on this day. Employees can only work one shift per day across all restaurants.`);
      return;
    }

    setLoading(true);
    const { data, error } = await supabase
      .from('shifts')
      .insert([{ ...formData, restaurant_id: restaurant.id }])
      .select()
      .single();

    setLoading(false);

    if (error) {
      if (error.code === '23505') {
        alert('This employee already has a shift on this day. Employees can only work one shift per day across all restaurants.');
      } else {
        console.error('Error adding shift:', error);
        alert('Error adding shift. Please try again.');
      }
      return;
    }

    if (data) {
      setShifts([...shifts, data]);
    }

    setFormData({
      employee_id: employees[0]?.id || '',
      date: '',
      role: 'server'
    });
    setShowAddForm(false);
  };

  const handleDeleteShift = async (id: string) => {
    if (!confirm('Are you sure you want to delete this shift?')) return;

    const { error } = await supabase
      .from('shifts')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error deleting shift:', error);
      return;
    }

    setShifts(shifts.filter(shift => shift.id !== id));
  };

  const previousMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1));
  };

  const nextMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1));
  };

  const thisMonth = () => {
    setCurrentMonth(new Date());
  };

  const handleDateClick = (date: Date) => {
    if (employees.length === 0) return;
    const dateStr = formatDate(date);
    setFormData({
      ...formData,
      date: dateStr,
      employee_id: employees[0]?.id || formData.employee_id
    });
    setShowAddForm(true);
  };

  const getRoleColor = (role: Role) => {
    return ROLES.find(r => r.value === role)?.color || 'bg-gray-50 border-gray-200 text-gray-800';
  };

  const getAvailableRolesForEmployee = (employeeId: string): Role[] => {
    const employee = employees.find(e => e.id === employeeId);
    return employee?.roles || [];
  };

  const monthDates = getMonthDates();
  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const currentMonthNumber = currentMonth.getMonth();

  return (
    <div className="bg-white rounded-lg shadow-sm p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-semibold text-gray-800 flex items-center gap-2">
          <Calendar className="w-5 h-5" />
          Schedule
        </h2>
        <div className="flex gap-4 text-xs">
          {ROLES.map(role => (
            <div key={role.value} className="flex items-center gap-2">
              <div className={`w-3 h-3 rounded border ${role.color}`}></div>
              <span className="text-gray-600">{role.label}</span>
            </div>
          ))}
        </div>
      </div>

      {showAddForm && employees.length > 0 && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <form onSubmit={handleAddShift} className="bg-white rounded-lg p-6 max-w-md w-full relative">
            <button
              type="button"
              onClick={() => setShowAddForm(false)}
              className="absolute top-4 right-4 p-1 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
            <h3 className="text-lg font-semibold mb-4">Add Shift</h3>
            <div className="space-y-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
                <input
                  type="date"
                  value={formData.date}
                  onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Employee</label>
                <select
                  value={formData.employee_id}
                  onChange={(e) => {
                    const newEmployeeId = e.target.value;
                    const availableRoles = getAvailableRolesForEmployee(newEmployeeId);
                    setFormData({
                      ...formData,
                      employee_id: newEmployeeId,
                      role: availableRoles.length > 0 ? availableRoles[0] : 'server'
                    });
                  }}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  required
                >
                  {employees.map((emp) => (
                    <option key={emp.id} value={emp.id}>
                      {emp.name} ({emp.roles.map(r => ROLES.find(role => role.value === r)?.label).join(', ')})
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Role</label>
                <select
                  value={formData.role}
                  onChange={(e) => setFormData({ ...formData, role: e.target.value as Role })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  required
                >
                  {getAvailableRolesForEmployee(formData.employee_id).map((role) => {
                    const roleInfo = ROLES.find(r => r.value === role);
                    return (
                      <option key={role} value={role}>
                        {roleInfo?.label}
                      </option>
                    );
                  })}
                </select>
              </div>
            </div>
            <div className="flex gap-2 mt-6">
              <button
                type="submit"
                disabled={loading}
                className="flex-1 px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {loading ? 'Adding...' : 'Add Shift'}
              </button>
              <button
                type="button"
                onClick={() => setShowAddForm(false)}
                className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {employees.length === 0 && (
        <p className="text-gray-500 text-center py-8">
          Add employees first before creating shifts.
        </p>
      )}

      {employees.length > 0 && (
        <>
          <div className="flex items-center justify-between mb-6">
            <button
              onClick={previousMonth}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              title="Previous month"
            >
              <ChevronLeft className="w-6 h-6" />
            </button>
            <div className="text-center">
              <div className="text-2xl font-semibold text-gray-800">
                {currentMonth.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
              </div>
              <button
                onClick={thisMonth}
                className="text-sm text-blue-600 hover:text-blue-700 mt-1"
              >
                Go to current month
              </button>
            </div>
            <button
              onClick={nextMonth}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              title="Next month"
            >
              <ChevronRight className="w-6 h-6" />
            </button>
          </div>

          <div className="grid grid-cols-7 gap-2">
            {dayNames.map((day) => (
              <div key={day} className="text-center font-semibold text-gray-600 py-2 text-sm">
                {day}
              </div>
            ))}

            {monthDates.map((date) => {
              const dateStr = formatDate(date);
              const dayShifts = shifts.filter(shift => shift.date === dateStr);
              const isToday = formatDate(new Date()) === dateStr;
              const isCurrentMonth = date.getMonth() === currentMonthNumber;

              const roleShifts = {
                door: dayShifts.filter(s => s.role === 'door'),
                gelato: dayShifts.filter(s => s.role === 'gelato'),
                server: dayShifts.filter(s => s.role === 'server')
              };

              return (
                <div
                  key={dateStr}
                  onClick={() => handleDateClick(date)}
                  className={`
                    border rounded-lg overflow-hidden min-h-[140px] cursor-pointer transition-all flex flex-col
                    ${isCurrentMonth ? 'bg-white hover:bg-blue-50 hover:border-blue-300' : 'bg-gray-50 opacity-50'}
                    ${isToday ? 'border-2 border-blue-500' : 'border-gray-200'}
                  `}
                >
                  <div className={`px-2 py-1 text-center text-sm font-medium flex-shrink-0 ${
                    isToday ? 'bg-blue-600 text-white' : isCurrentMonth ? 'text-gray-700' : 'text-gray-400'
                  }`}>
                    {date.getDate()}
                  </div>
                  <div className="p-1 flex-1 overflow-y-auto space-y-1">
                    {ROLES.map(role => {
                      const shifts = roleShifts[role.value];
                      return shifts.map((shift) => {
                        const employee = employees.find(e => e.id === shift.employee_id);
                        return (
                          <div
                            key={shift.id}
                            onClick={(e) => e.stopPropagation()}
                            className={`${getRoleColor(shift.role)} border rounded px-1.5 py-0.5 text-[10px] relative group`}
                          >
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleDeleteShift(shift.id);
                              }}
                              className="absolute -top-1 -right-1 p-0.5 bg-white text-red-600 hover:bg-red-100 rounded-full opacity-0 group-hover:opacity-100 transition-opacity shadow-sm"
                              title="Delete shift"
                            >
                              <Trash2 className="w-2.5 h-2.5" />
                            </button>
                            <div className="font-medium">{employee?.name}</div>
                            <div className="uppercase text-[9px] font-semibold">{ROLES.find(r => r.value === shift.role)?.label}</div>
                          </div>
                        );
                      });
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
}
