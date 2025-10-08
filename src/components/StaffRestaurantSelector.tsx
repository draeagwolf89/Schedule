import { useEffect, useState } from 'react';
import { Store } from 'lucide-react';
import { supabase } from '../lib/supabase';
import type { Restaurant } from '../lib/types';
import { getCurrentUser } from '../lib/auth';

interface StaffRestaurantSelectorProps {
  selectedRestaurant: Restaurant | null;
  onSelectRestaurant: (restaurant: Restaurant) => void;
}

export function StaffRestaurantSelector({ selectedRestaurant, onSelectRestaurant }: StaffRestaurantSelectorProps) {
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadAssignedRestaurants();
  }, []);

  const loadAssignedRestaurants = async () => {
    const user = await getCurrentUser();
    if (!user) {
      setLoading(false);
      return;
    }

    const { data: employee } = await supabase
      .from('employees')
      .select('id')
      .eq('auth_user_id', user.id)
      .maybeSingle();

    if (!employee) {
      setLoading(false);
      return;
    }

    const { data, error } = await supabase
      .from('employee_restaurants')
      .select('restaurant:restaurants(*)')
      .eq('employee_id', employee.id);

    if (error) {
      console.error('Error loading assigned restaurants:', error);
      setLoading(false);
      return;
    }

    const restaurantList = data?.map(er => er.restaurant).filter(Boolean) as Restaurant[];
    setRestaurants(restaurantList || []);

    if (restaurantList && restaurantList.length > 0 && !selectedRestaurant) {
      onSelectRestaurant(restaurantList[0]);
    }

    setLoading(false);
  };

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-sm p-4">
        <div className="text-gray-500 text-center">Loading...</div>
      </div>
    );
  }

  if (restaurants.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-sm p-4">
        <div className="text-gray-500 text-center">
          No restaurant assignments found. Please contact your manager.
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-sm p-4">
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2 text-gray-700 font-medium">
          <Store className="w-4 h-4" />
          Restaurant:
        </div>

        <select
          value={selectedRestaurant?.id || ''}
          onChange={(e) => {
            const restaurant = restaurants.find(r => r.id === e.target.value);
            if (restaurant) onSelectRestaurant(restaurant);
          }}
          className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        >
          <option value="">Select a restaurant</option>
          {restaurants.map((restaurant) => (
            <option key={restaurant.id} value={restaurant.id}>
              {restaurant.name}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
}
