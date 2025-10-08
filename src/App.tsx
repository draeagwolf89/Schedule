import { useState } from 'react';
import { RestaurantSelector } from './components/RestaurantSelector';
import { EmployeeList } from './components/EmployeeList';
import { ScheduleManager } from './components/ScheduleManager';
import { EmployeeScheduleView } from './components/EmployeeScheduleView';
import { LoginPage } from './components/LoginPage';
import { AuthProvider, useAuth } from './lib/auth-context';
import { Users, Calendar, LogOut } from 'lucide-react';
import { supabase } from './lib/supabase';
import type { Restaurant } from './lib/types';

type TabType = 'employees' | 'schedule';

function AppContent() {
  const { user, isAdmin, employeeId, loading } = useAuth();
  const [selectedRestaurant, setSelectedRestaurant] = useState<Restaurant | null>(null);
  const [activeTab, setActiveTab] = useState<TabType>('schedule');

  const handleLogout = async () => {
    localStorage.removeItem('employee_id');
    localStorage.removeItem('employee_username');
    await supabase.auth.signOut();
    window.location.reload();
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center">
        <div className="text-gray-500">Loading...</div>
      </div>
    );
  }

  if (!user) {
    return <LoginPage />;
  }

  if (!isAdmin && employeeId) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
        <div className="max-w-7xl mx-auto px-4 py-8">
          <header className="mb-8 flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold text-gray-900 mb-2">My Schedule</h1>
              <p className="text-gray-600">View your upcoming shifts</p>
            </div>
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
            >
              <LogOut className="w-4 h-4" />
              Logout
            </button>
          </header>
          <EmployeeScheduleView employeeId={employeeId} />
        </div>
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center">
        <div className="bg-white rounded-lg shadow-lg p-8 max-w-md">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Access Denied</h2>
          <p className="text-gray-600 mb-6">
            You don't have permission to access this page.
          </p>
          <button
            onClick={handleLogout}
            className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Logout
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <header className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold text-gray-900 mb-2">Restaurant Scheduler</h1>
            <p className="text-gray-600">Manage your restaurants, employees, and schedules all in one place</p>
          </div>
          <button
            onClick={handleLogout}
            className="flex items-center gap-2 px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
          >
            <LogOut className="w-4 h-4" />
            Logout
          </button>
        </header>

        <div className="space-y-6">
          <RestaurantSelector
            selectedRestaurant={selectedRestaurant}
            onSelectRestaurant={setSelectedRestaurant}
          />

          {selectedRestaurant && (
            <>
              <div className="bg-white rounded-lg shadow-sm border-b">
                <div className="flex gap-1 p-2">
                  <button
                    onClick={() => setActiveTab('employees')}
                    className={`flex items-center gap-2 px-6 py-3 rounded-lg font-medium transition-colors ${
                      activeTab === 'employees'
                        ? 'bg-orange-600 text-white'
                        : 'text-gray-600 hover:bg-gray-100'
                    }`}
                  >
                    <Users className="w-4 h-4" />
                    Employees
                  </button>
                  <button
                    onClick={() => setActiveTab('schedule')}
                    className={`flex items-center gap-2 px-6 py-3 rounded-lg font-medium transition-colors ${
                      activeTab === 'schedule'
                        ? 'bg-orange-600 text-white'
                        : 'text-gray-600 hover:bg-gray-100'
                    }`}
                  >
                    <Calendar className="w-4 h-4" />
                    Schedule
                  </button>
                </div>
              </div>

              <div>
                {activeTab === 'employees' && (
                  <EmployeeList restaurant={selectedRestaurant} />
                )}
                {activeTab === 'schedule' && (
                  <ScheduleManager restaurant={selectedRestaurant} />
                )}
              </div>
            </>
          )}

          {!selectedRestaurant && (
            <div className="bg-white rounded-lg shadow-sm p-12 text-center">
              <p className="text-gray-500 text-lg">
                Select or create a restaurant to get started
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

export default App;
