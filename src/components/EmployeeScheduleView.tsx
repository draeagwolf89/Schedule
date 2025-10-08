import { useEffect, useState } from 'react';
import { Calendar, Clock } from 'lucide-react';
import { supabase } from '../lib/supabase';
import type { Shift, Employee, Restaurant } from '../lib/types';

interface EmployeeScheduleViewProps {
  employeeId: string;
}

interface ShiftWithDetails extends Shift {
  restaurant: Restaurant;
}

export function EmployeeScheduleView({ employeeId }: EmployeeScheduleViewProps) {
  const [shifts, setShifts] = useState<ShiftWithDetails[]>([]);
  const [employee, setEmployee] = useState<Employee | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadEmployeeData();
    loadShifts();
  }, [employeeId]);

  const loadEmployeeData = async () => {
    const { data, error } = await supabase
      .from('employees')
      .select('*')
      .eq('id', employeeId)
      .single();

    if (error) {
      console.error('Error loading employee:', error);
      return;
    }

    setEmployee(data);
  };

  const loadShifts = async () => {
    setLoading(true);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const { data, error } = await supabase
      .from('shifts')
      .select(`
        *,
        restaurant:restaurants(*)
      `)
      .eq('employee_id', employeeId)
      .gte('date', today.toISOString().split('T')[0])
      .order('date', { ascending: true });

    if (error) {
      console.error('Error loading shifts:', error);
      setLoading(false);
      return;
    }

    setShifts(data as ShiftWithDetails[]);
    setLoading(false);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const getRoleLabel = (role: string) => {
    const roleMap: Record<string, string> = {
      door: 'Door',
      gelato: 'Gelato',
      server: 'Server',
    };
    return roleMap[role] || role;
  };

  const getRoleColor = (role: string) => {
    const colorMap: Record<string, string> = {
      door: 'bg-blue-100 text-blue-700',
      gelato: 'bg-pink-100 text-pink-700',
      server: 'bg-green-100 text-green-700',
    };
    return colorMap[role] || 'bg-gray-100 text-gray-700';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-500">Loading your schedule...</div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
        <h1 className="text-2xl font-bold text-gray-800 mb-2">
          Welcome, {employee?.name || 'Employee'}!
        </h1>
        <p className="text-gray-600">Here's your upcoming schedule</p>
      </div>

      {shifts.length === 0 ? (
        <div className="bg-white rounded-lg shadow-sm p-12 text-center">
          <Calendar className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500 text-lg">No upcoming shifts scheduled</p>
          <p className="text-gray-400 text-sm mt-2">
            Check back later or contact your manager
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {shifts.map((shift) => (
            <div
              key={shift.id}
              className="bg-white rounded-lg shadow-sm p-6 hover:shadow-md transition-shadow"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <Clock className="w-5 h-5 text-gray-400" />
                    <h3 className="text-lg font-semibold text-gray-800">
                      {formatDate(shift.date)}
                    </h3>
                  </div>
                  <div className="ml-8">
                    <p className="text-gray-600 mb-2">
                      <span className="font-medium">Restaurant:</span>{' '}
                      {shift.restaurant.name}
                    </p>
                    <div className="flex items-center gap-2">
                      <span className="text-gray-600 font-medium">Role:</span>
                      <span
                        className={`px-3 py-1 rounded-full text-sm font-medium ${getRoleColor(
                          shift.role
                        )}`}
                      >
                        {getRoleLabel(shift.role)}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
