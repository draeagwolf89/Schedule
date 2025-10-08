import { useEffect, useState } from 'react';
import { Plus, Calendar, Trash2, ChevronLeft, ChevronRight } from 'lucide-react';
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
  const [currentWeekStart, setCurrentWeekStart] = useState(getWeekStart(new Date()));
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
    loadShifts();
  }, [restaurant.id, currentWeekStart]);

  function getWeekStart(date: Date): Date {
    const d = new Date(date);
    const day = d.getDay();
    const diff = d.getDate() - day;
    return new Date(d.setDate(diff));
  }

  function formatDate(date: Date): string {
    return date.toISOString().split('T')[0];
  }

  function getWeekDates(): Date[] {
    const dates: Date[] = [];
    for (let i = 0; i < 7; i++) {
      const date = new Date(currentWeekStart);
      date.setDate(currentWeekStart.getDate() + i);
      dates.push(date);
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
    const weekEnd = new Date(currentWeekStart);
    weekEnd.setDate(weekEnd.getDate() + 7);

    const { data, error } = await supabase
      .from('shifts')
      .select('*, employee:employees(*)')
      .eq('restaurant_id', restaurant.id)
      .gte('shift_date', formatDate(currentWeekStart))
      .lt('shift_date', formatDate(weekEnd))
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
    const { error } = await supabase
      .from('shifts')
      .insert([{ ...formData, restaurant_id: restaurant.id }]);

    setLoading(false);

    if (error) {
      console.error('Error adding shift:', error);
      return;
    }

    await loadShifts();
    setFormData({
      employee_id: employees[0]?.id || '',
      shift_date: '',
      start_time: '09:00',
      end_time: '17:00',
      notes: ''
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

  const previousWeek = () => {
    const newDate = new Date(currentWeekStart);
    newDate.setDate(newDate.getDate() - 7);
    setCurrentWeekStart(newDate);
  };

  const nextWeek = () => {
    const newDate = new Date(currentWeekStart);
    newDate.setDate(newDate.getDate() + 7);
    setCurrentWeekStart(newDate);
  };

  const thisWeek = () => {
    setCurrentWeekStart(getWeekStart(new Date()));
  };

  const weekDates = getWeekDates();
  const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

  return (
    <div className="bg-white rounded-lg shadow-sm p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-semibold text-gray-800 flex items-center gap-2">
          <Calendar className="w-5 h-5" />
          Schedule
        </h2>
        <button
          onClick={() => setShowAddForm(!showAddForm)}
          className="flex items-center gap-2 px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors"
        >
          <Plus className="w-4 h-4" />
          Add Shift
        </button>
      </div>

      {showAddForm && employees.length > 0 && (
        <form onSubmit={handleAddShift} className="mb-6 p-4 bg-gray-50 rounded-lg">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <select
              value={formData.employee_id}
              onChange={(e) => setFormData({ ...formData, employee_id: e.target.value })}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              required
            >
              <option value="">Select employee</option>
              {employees.map((emp) => (
                <option key={emp.id} value={emp.id}>
                  {emp.name} ({emp.role})
                </option>
              ))}
            </select>
            <input
              type="date"
              value={formData.shift_date}
              onChange={(e) => setFormData({ ...formData, shift_date: e.target.value })}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              required
            />
            <input
              type="time"
              value={formData.start_time}
              onChange={(e) => setFormData({ ...formData, start_time: e.target.value })}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              required
            />
            <input
              type="time"
              value={formData.end_time}
              onChange={(e) => setFormData({ ...formData, end_time: e.target.value })}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              required
            />
          </div>
          <textarea
            value={formData.notes}
            onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
            placeholder="Notes (optional)"
            className="w-full mt-3 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
            rows={2}
          />
          <div className="flex gap-2 mt-3">
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 disabled:opacity-50 transition-colors"
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
      )}

      {employees.length === 0 && (
        <p className="text-gray-500 text-center py-8">
          Add employees first before creating shifts.
        </p>
      )}

      {employees.length > 0 && (
        <>
          <div className="flex items-center justify-between mb-4">
            <button
              onClick={previousWeek}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <div className="text-center">
              <div className="text-lg font-medium text-gray-800">
                {weekDates[0].toLocaleDateString('en-US', { month: 'long', day: 'numeric' })} -{' '}
                {weekDates[6].toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
              </div>
              <button
                onClick={thisWeek}
                className="text-sm text-blue-600 hover:text-blue-700 mt-1"
              >
                Go to current week
              </button>
            </div>
            <button
              onClick={nextWeek}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-7 gap-3">
            {weekDates.map((date, index) => {
              const dateStr = formatDate(date);
              const dayShifts = shifts.filter(shift => shift.shift_date === dateStr);
              const isToday = formatDate(new Date()) === dateStr;

              return (
                <div key={dateStr} className="border rounded-lg overflow-hidden">
                  <div className={`px-3 py-2 text-center font-medium ${isToday ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700'}`}>
                    <div className="text-sm">{dayNames[index]}</div>
                    <div className="text-lg">{date.getDate()}</div>
                  </div>
                  <div className="p-2 space-y-2 min-h-[100px]">
                    {dayShifts.map((shift) => (
                      <div
                        key={shift.id}
                        className="bg-orange-50 border border-orange-200 rounded p-2 text-xs relative group"
                      >
                        <button
                          onClick={() => handleDeleteShift(shift.id)}
                          className="absolute top-1 right-1 p-1 text-red-600 hover:bg-red-100 rounded opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                        <div className="font-medium text-gray-800">{shift.employee.name}</div>
                        <div className="text-gray-600">
                          {shift.start_time.substring(0, 5)} - {shift.end_time.substring(0, 5)}
                        </div>
                        {shift.notes && (
                          <div className="text-gray-500 mt-1 italic">{shift.notes}</div>
                        )}
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
