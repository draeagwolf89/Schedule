import { useEffect, useState } from 'react';
import { Calendar, Trash2, ChevronLeft, ChevronRight, X } from 'lucide-react';
import { supabase } from '../lib/supabase';
import type { Employee, Restaurant, Shift } from '../lib/types';

interface ScheduleManagerProps {
  restaurant: Restaurant;
}

interface ShiftWithEmployee extends Shift {
  employee: Employee;
}

export function ScheduleManager({ restaurant }: ScheduleManagerProps) {
  const [shifts, setShifts] = useState<ShiftWithEmployee[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [showAddForm, setShowAddForm] = useState(false);
  const [selectedDate, setSelectedDate] = useState<string>('');
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [formData, setFormData] = useState({
    employee_id: '',
    shift_date: '',
    start_time: '09:00',
    end_time: '17:00',
    notes: ''
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadEmployees();
  }, [restaurant.id]);

  useEffect(() => {
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
      .from('employees')
      .select('*')
      .eq('restaurant_id', restaurant.id)
      .order('name');

    if (error) {
      console.error('Error loading employees:', error);
      return;
    }

    setEmployees(data || []);
    if (data && data.length > 0 && !formData.employee_id) {
      setFormData(prev => ({ ...prev, employee_id: data[0].id }));
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
      .select('*, employee:employees(*)')
      .eq('restaurant_id', restaurant.id)
      .gte('shift_date', formatDate(startDate))
      .lte('shift_date', formatDate(endDate))
      .order('shift_date')
      .order('start_time');

    if (error) {
      console.error('Error loading shifts:', error);
      return;
    }

    setShifts(data as ShiftWithEmployee[] || []);
  };

  const handleAddShift = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.employee_id || !formData.shift_date) return;

    setLoading(true);
    const { data, error } = await supabase
      .from('shifts')
      .insert([{ ...formData, restaurant_id: restaurant.id }])
      .select('*, employee:employees(*)')
      .single();

    setLoading(false);

    if (error) {
      console.error('Error adding shift:', error);
      return;
    }

    if (data) {
      setShifts([...shifts, data as ShiftWithEmployee]);
    }

    setFormData({
      employee_id: employees[0]?.id || '',
      shift_date: '',
      start_time: '09:00',
      end_time: '17:00',
      notes: ''
    });
    setShowAddForm(false);
    setSelectedDate('');
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
    setSelectedDate(dateStr);
    setFormData({
      ...formData,
      shift_date: dateStr,
      employee_id: employees[0]?.id || formData.employee_id
    });
    setShowAddForm(true);
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
      </div>

      {showAddForm && employees.length > 0 && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <form onSubmit={handleAddShift} className="bg-white rounded-lg p-6 max-w-md w-full relative">
            <button
              type="button"
              onClick={() => {
                setShowAddForm(false);
                setSelectedDate('');
              }}
              className="absolute top-4 right-4 p-1 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
            <h3 className="text-lg font-semibold mb-4">Add Shift</h3>
            <div className="space-y-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Employee</label>
                <select
                  value={formData.employee_id}
                  onChange={(e) => setFormData({ ...formData, employee_id: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  required
                >
                  {employees.map((emp) => (
                    <option key={emp.id} value={emp.id}>
                      {emp.name} ({emp.role})
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
                <input
                  type="date"
                  value={formData.shift_date}
                  onChange={(e) => setFormData({ ...formData, shift_date: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  required
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Start Time</label>
                  <input
                    type="time"
                    value={formData.start_time}
                    onChange={(e) => setFormData({ ...formData, start_time: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">End Time</label>
                  <input
                    type="time"
                    value={formData.end_time}
                    onChange={(e) => setFormData({ ...formData, end_time: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                    required
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Notes (optional)</label>
                <textarea
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  rows={2}
                />
              </div>
            </div>
            <div className="flex gap-2 mt-6">
              <button
                type="submit"
                disabled={loading}
                className="flex-1 px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 disabled:opacity-50 transition-colors"
              >
                {loading ? 'Adding...' : 'Add Shift'}
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowAddForm(false);
                  setSelectedDate('');
                }}
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
              const dayShifts = shifts.filter(shift => shift.shift_date === dateStr);
              const isToday = formatDate(new Date()) === dateStr;
              const isCurrentMonth = date.getMonth() === currentMonthNumber;

              return (
                <div
                  key={dateStr}
                  onClick={() => handleDateClick(date)}
                  className={`
                    border rounded-lg overflow-hidden min-h-[120px] cursor-pointer transition-all
                    ${isCurrentMonth ? 'bg-white hover:bg-blue-50 hover:border-blue-300' : 'bg-gray-50 opacity-50'}
                    ${isToday ? 'border-2 border-blue-500' : 'border-gray-200'}
                  `}
                >
                  <div className={`px-2 py-1 text-center text-sm font-medium ${
                    isToday ? 'bg-blue-600 text-white' : isCurrentMonth ? 'text-gray-700' : 'text-gray-400'
                  }`}>
                    {date.getDate()}
                  </div>
                  <div className="p-1 space-y-1 overflow-y-auto max-h-[88px]">
                    {dayShifts.map((shift) => (
                      <div
                        key={shift.id}
                        onClick={(e) => e.stopPropagation()}
                        className="bg-orange-50 border border-orange-200 rounded px-2 py-1 text-xs relative group"
                      >
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteShift(shift.id);
                          }}
                          className="absolute top-0 right-0 p-0.5 text-red-600 hover:bg-red-100 rounded opacity-0 group-hover:opacity-100 transition-opacity"
                          title="Delete shift"
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                        <div className="font-medium text-gray-800 truncate pr-4">{shift.employee.name}</div>
                        <div className="text-gray-600 text-[10px]">
                          {shift.start_time.substring(0, 5)}-{shift.end_time.substring(0, 5)}
                        </div>
                      </div>
                    ))}
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
