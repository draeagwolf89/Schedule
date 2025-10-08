import { useState } from 'react';
import { RestaurantSelector } from './components/RestaurantSelector';
import { EmployeeList } from './components/EmployeeList';
import { ScheduleManager } from './components/ScheduleManager';
import type { Restaurant } from './lib/types';

function App() {
  const [selectedRestaurant, setSelectedRestaurant] = useState<Restaurant | null>(null);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <header className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Restaurant Scheduler</h1>
          <p className="text-gray-600">Manage your restaurants, employees, and schedules all in one place</p>
        </header>

        <div className="space-y-6">
          <RestaurantSelector
            selectedRestaurant={selectedRestaurant}
            onSelectRestaurant={setSelectedRestaurant}
          />

          {selectedRestaurant && (
            <>
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-1">
                  <EmployeeList restaurant={selectedRestaurant} />
                </div>
                <div className="lg:col-span-2">
                  <ScheduleManager restaurant={selectedRestaurant} />
                </div>
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

export default App;
