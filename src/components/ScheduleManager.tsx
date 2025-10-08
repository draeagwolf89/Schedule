import { useEffect, useState } from 'react';
import { Calendar, Trash2, ChevronLeft, ChevronRight, X } from 'lucide-react';
import { storage } from '../lib/storage';
import type { Employee, Restaurant, Shift } from '../lib/types';

interface ScheduleManagerProps {
  restaurant: Restaurant;
}

export function ScheduleManager({ restaurant }: ScheduleManagerProps) {
  const [shifts, setShifts] = useState<Shift[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [showAddForm, setShowAddForm] = useState(false);
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [formData, setFormData] = useState({
    employeeId: '',
    date: '',
    startTime: '09:00',
    endTime: '17:00',
    shiftType: 'AM' as 'AM' | 'PM'
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
      current.setDate(current.setDate(current.getDate() + 1));
    }

    return dates;
  }

  const loadEmployees = () => {
    const data = storage.employees.getByRestaurant(restaurant.id);
    setEmployees(data);
    if (data.length > 0 && !formData.employeeId) {
      setFormData(prev => ({ ...prev, employeeId: data[0].id }));
    }
  };

  const loadShifts = () => {
    const data = storage.shifts.getByRestaurant(restaurant.id);
    setShifts(data);
  };

  const handleAddShift = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.employeeId || !formData.date) return;

    setLoading(true);
    const newShift = storage.shifts.create({
      restaurantId: restaurant.id,
      employeeId: formData.employeeId,
      date: formData.date,
      startTime: formData.startTime,
      endTime: formData.endTime,
      shiftType: formData.shiftType
    });
    setLoading(false);

    setShifts([...shifts, newShift]);
    setFormData({
      employeeId: employees[0]?.id || '',
      date: '',
      startTime: '09:00',
      endTime: '17:00',
      shiftType: 'AM'
    });
    setShowAddForm(false);
  };

  const handleDeleteShift = (id: string) => {
    if (!confirm('Are you sure you want to delete this shift?')) return;

    storage.shifts.delete(id);
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
      employeeId: employees[0]?.id || formData.employeeId
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
              onClick={() => setShowAddForm(false)}
              className="absolute top-4 right-4 p-1 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
            <h3 className="text-lg font-semibold mb-4">Add Shift</h3>
            <div className="space-y-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Employee</label>
                <select
                  value={formData.employeeId}
                  onChange={(e) => setFormData({ ...formData, employeeId: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  required
                >
                  {employees.map((emp) => (
                    <option key={emp.id} value={emp.id}>
                      {emp.name} ({emp.position})
                    </option>
                  ))}
                </select>
              </div>
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
                <label className="block text-sm font-medium text-gray-700 mb-1">Shift Type</label>
                <select
                  value={formData.shiftType}
                  onChange={(e) => setFormData({ ...formData, shiftType: e.target.value as 'AM' | 'PM' })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  required
                >
                  <option value="AM">AM</option>
                  <option value="PM">PM</option>
                </select>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Start Time</label>
                  <input
                    type="time"
                    value={formData.startTime}
                    onChange={(e) => setFormData({ ...formData, startTime: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">End Time</label>
                  <input
                    type="time"
                    value={formData.endTime}
                    onChange={(e) => setFormData({ ...formData, endTime: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                    required
                  />
                </div>
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

              return (
                <div
                  key={dateStr}
                  onClick={() => handleDateClick(date)}
                  className={`
                    border rounded-lg overflow-hidden min-h-[120px] cursor-pointer transition-all flex flex-col
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
                    {dayShifts.map((shift) => {
                      const employee = employees.find(e => e.id === shift.employeeId);
                      return (
                        <div
                          key={shift.id}
                          onClick={(e) => e.stopPropagation()}
                          className={`${
                            shift.shiftType === 'AM' ? 'bg-blue-50 border-blue-200' : 'bg-orange-50 border-orange-200'
                          } border rounded px-1.5 py-0.5 text-[10px] relative group`}
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
                          <div className="font-medium text-gray-800">{employee?.name}</div>
                          <div className="text-gray-600">{shift.shiftType}</div>
                        </div>
                      );
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
