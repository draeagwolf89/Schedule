import { useEffect, useState } from 'react';
import { Calendar, ChevronLeft, ChevronRight } from 'lucide-react';
import { supabase } from '../lib/supabase';
import type { Employee, Restaurant, Shift } from '../lib/types';

interface StaffViewProps {
  restaurant: Restaurant;
}

interface ShiftWithEmployee extends Shift {
  employee: Employee;
}

export function StaffView({ restaurant }: StaffViewProps) {
  const [shifts, setShifts] = useState<ShiftWithEmployee[]>([]);
  const [currentMonth, setCurrentMonth] = useState(new Date());

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

  const previousMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1));
  };

  const nextMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1));
  };

  const thisMonth = () => {
    setCurrentMonth(new Date());
  };

  const monthDates = getMonthDates();
  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const currentMonthNumber = currentMonth.getMonth();

  return (
    <div className="bg-white rounded-lg shadow-sm p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-semibold text-gray-800 flex items-center gap-2">
          <Calendar className="w-5 h-5" />
          {restaurant.name} - Staff Schedule
        </h2>
      </div>

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
              className={`
                border rounded-lg overflow-hidden min-h-[140px] flex flex-col
                ${isCurrentMonth ? 'bg-white' : 'bg-gray-50 opacity-50'}
                ${isToday ? 'border-2 border-blue-500' : 'border-gray-200'}
              `}
            >
              <div className={`px-2 py-1 text-center text-sm font-medium flex-shrink-0 ${
                isToday ? 'bg-blue-600 text-white' : isCurrentMonth ? 'text-gray-700' : 'text-gray-400'
              }`}>
                {date.getDate()}
              </div>
              <div className="p-1 flex-1 overflow-y-auto">
                {(() => {
                  const serverShifts = dayShifts.filter(s => s.shift_type === 'SERVER');
                  const doorShifts = dayShifts.filter(s => s.shift_type === 'DOOR');
                  const gelatoShifts = dayShifts.filter(s => s.shift_type === 'GELATO');

                  return (
                    <div className="space-y-2">
                      {serverShifts.length > 0 && (
                        <div>
                          <div className="text-[9px] font-semibold text-blue-700 uppercase mb-0.5">Servers</div>
                          <div className="flex flex-wrap gap-1">
                            {serverShifts.map((shift) => (
                              <div
                                key={shift.id}
                                className="bg-blue-50 border border-blue-200 rounded px-1.5 py-0.5 text-[10px]"
                              >
                                <div className="font-medium text-gray-800">{shift.employee.name}</div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {doorShifts.length > 0 && (
                        <div>
                          <div className="text-[9px] font-semibold text-green-700 uppercase mb-0.5">Door</div>
                          <div className="flex flex-wrap gap-1">
                            {doorShifts.map((shift) => (
                              <div
                                key={shift.id}
                                className="bg-green-50 border border-green-200 rounded px-1.5 py-0.5 text-[10px]"
                              >
                                <div className="font-medium text-gray-800">{shift.employee.name}</div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {gelatoShifts.length > 0 && (
                        <div>
                          <div className="text-[9px] font-semibold text-purple-700 uppercase mb-0.5">Gelato</div>
                          <div className="flex flex-wrap gap-1">
                            {gelatoShifts.map((shift) => (
                              <div
                                key={shift.id}
                                className="bg-purple-50 border border-purple-200 rounded px-1.5 py-0.5 text-[10px]"
                              >
                                <div className="font-medium text-gray-800">{shift.employee.name}</div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })()}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
