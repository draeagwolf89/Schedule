import { useState } from 'react';
import { RestaurantSelector } from './components/RestaurantSelector';
import { EmployeeList } from './components/EmployeeList';
import { ScheduleManager } from './components/ScheduleManager';
import { StaffView } from './components/StaffView';
import { Users, Calendar, Eye, Settings } from 'lucide-react';
import type { Restaurant } from './lib/types';

type TabType = 'employees' | 'schedule';
type ViewMode = 'admin' | 'staff';

function App() {
  const [selectedRestaurant, setSelectedRestaurant] = useState<Restaurant | null>(null);
  const [activeTab, setActiveTab] = useState<TabType>('schedule');
  const [viewMode, setViewMode] = useState<ViewMode>('admin');

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <header className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold text-gray-900 mb-2">Restaurant Scheduler</h1>
              <p className="text-gray-600">
                {viewMode === 'admin' ? 'Manage your restaurants, employees, and schedules all in one place' : 'View your staff schedule'}
              </p>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setViewMode('admin')}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors ${
                  viewMode === 'admin'
                    ? 'bg-orange-600 text-white'
                    : 'bg-white text-gray-600 hover:bg-gray-100 border border-gray-300'
                }`}
              >
                <Settings className="w-4 h-4" />
                Admin
              </button>
              <button
                onClick={() => setViewMode('staff')}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors ${
                  viewMode === 'staff'
                    ? 'bg-orange-600 text-white'
                    : 'bg-white text-gray-600 hover:bg-gray-100 border border-gray-300'
                }`}
              >
                <Eye className="w-4 h-4" />
                Staff View
              </button>
            </div>
          </div>
        </header>

        <div className="space-y-6">
          {viewMode === 'admin' ? (
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
              <RestaurantSelector
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
