import { useEffect, useState } from 'react';
import { Plus, Store } from 'lucide-react';
import { storage } from '../lib/storage';
import type { Restaurant } from '../lib/types';

interface RestaurantSelectorProps {
  selectedRestaurant: Restaurant | null;
  onSelectRestaurant: (restaurant: Restaurant) => void;
}

export function RestaurantSelector({ selectedRestaurant, onSelectRestaurant }: RestaurantSelectorProps) {
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newRestaurantName, setNewRestaurantName] = useState('');
  const [newRestaurantAddress, setNewRestaurantAddress] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadRestaurants();
  }, []);

  const loadRestaurants = () => {
    const data = storage.restaurants.getAll();
    const sorted = data.sort((a, b) => a.name.localeCompare(b.name));
    setRestaurants(sorted);
    if (sorted.length > 0 && !selectedRestaurant) {
      onSelectRestaurant(sorted[0]);
    }
  };

  const handleAddRestaurant = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newRestaurantName.trim()) return;

    setLoading(true);
    const newRestaurant = storage.restaurants.create({ name: newRestaurantName });
    setLoading(false);

    setRestaurants([...restaurants, newRestaurant]);
    onSelectRestaurant(newRestaurant);
    setNewRestaurantName('');
    setNewRestaurantAddress('');
    setShowAddForm(false);
  };

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

        <button
          onClick={() => setShowAddForm(!showAddForm)}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors whitespace-nowrap"
        >
          <Plus className="w-4 h-4" />
          Add
        </button>
      </div>

      {showAddForm && (
        <form onSubmit={handleAddRestaurant} className="mt-4 p-4 bg-gray-50 rounded-lg">
          <div className="space-y-3">
            <input
              type="text"
              value={newRestaurantName}
              onChange={(e) => setNewRestaurantName(e.target.value)}
              placeholder="Restaurant name"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              required
            />
            <input
              type="text"
              value={newRestaurantAddress}
              onChange={(e) => setNewRestaurantAddress(e.target.value)}
              placeholder="Address (optional)"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            <div className="flex gap-2">
              <button
                type="submit"
                disabled={loading}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors"
              >
                {loading ? 'Adding...' : 'Add'}
              </button>
              <button
                type="button"
                onClick={() => setShowAddForm(false)}
                className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </form>
      )}
    </div>
  );
}
