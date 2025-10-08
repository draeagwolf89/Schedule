import { useState, useEffect } from 'react';
import { RestaurantSelector } from './components/RestaurantSelector';
import { StaffRestaurantSelector } from './components/StaffRestaurantSelector';
import { EmployeeList } from './components/EmployeeList';
import { ScheduleManager } from './components/ScheduleManager';
import { StaffView } from './components/StaffView';
import { LoginPage } from './components/LoginPage';
import { Users, Calendar, LogOut } from 'lucide-react';
import type { Restaurant } from './lib/types';
import { getCurrentUser, isAdmin, signOut, onAuthStateChange } from './lib/auth';
import type { AuthUser } from './lib/auth';

type TabType = 'employees' | 'schedule';

function App() {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isAdminUser, setIsAdminUser] = useState(false);
  const [loading, setLoading] = useState(true);
  const [selectedRestaurant, setSelectedRestaurant] = useState<Restaurant | null>(null);
  const [activeTab, setActiveTab] = useState<TabType>('schedule');

  useEffect(() => {
    checkAuth();
    const { data: { subscription } } = onAuthStateChange((authUser) => {
      setUser(authUser);
      if (authUser) {
        checkIsAdmin();
      } else {
        setIsAdminUser(false);
        setLoading(false);
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const checkAuth = async () => {
    const currentUser = await getCurrentUser();
    setUser(currentUser);
    if (currentUser) {
      await checkIsAdmin();
    }
    setLoading(false);
  };

  const checkIsAdmin = async () => {
    const adminStatus = await isAdmin();
    setIsAdminUser(adminStatus);
  };

  const handleLogout = async () => {
    await signOut();
    setUser(null);
    setIsAdminUser(false);
    setSelectedRestaurant(null);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center">
        <div className="text-gray-600 text-lg">Loading...</div>
      </div>
    );
  }

  if (!user) {
    return <LoginPage onLogin={checkAuth} />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <header className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold text-gray-900 mb-2">Restaurant Scheduler</h1>
              <p className="text-gray-600">
                {isAdminUser ? 'Manage your restaurants, employees, and schedules all in one place' : 'View your schedule'}
              </p>
            </div>
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
            >
              <LogOut className="w-4 h-4" />
              Sign Out
            </button>
          </div>
        </header>

        <div className="space-y-6">
          {isAdminUser ? (
            <>
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
            </>
          ) : (
            <>
              <StaffRestaurantSelector
                selectedRestaurant={selectedRestaurant}
                onSelectRestaurant={setSelectedRestaurant}
              />

              {selectedRestaurant ? (
                <StaffView restaurant={selectedRestaurant} />
              ) : (
                <div className="bg-white rounded-lg shadow-sm p-12 text-center">
                  <p className="text-gray-500 text-lg">
                    Select a restaurant to view the schedule
                  </p>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export default App;
