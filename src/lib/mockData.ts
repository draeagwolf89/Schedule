import type { Restaurant, Employee, Shift } from './types';

export const mockRestaurants: Restaurant[] = [
  {
    id: '1',
    name: 'The Golden Fork',
    address: '123 Main St, Downtown',
    phone: '(555) 123-4567',
    createdAt: new Date().toISOString(),
  },
  {
    id: '2',
    name: 'Seaside Grill',
    address: '456 Ocean Ave, Beachfront',
    phone: '(555) 987-6543',
    createdAt: new Date().toISOString(),
  },
];

export const mockEmployees: Employee[] = [
  {
    id: '1',
    restaurantId: '1',
    name: 'Sarah Johnson',
    email: 'sarah.j@example.com',
    phone: '(555) 111-2222',
    position: 'Server',
    hourlyRate: 15.50,
    createdAt: new Date().toISOString(),
  },
  {
    id: '2',
    restaurantId: '1',
    name: 'Mike Chen',
    email: 'mike.c@example.com',
    phone: '(555) 333-4444',
    position: 'Chef',
    hourlyRate: 22.00,
    createdAt: new Date().toISOString(),
  },
  {
    id: '3',
    restaurantId: '1',
    name: 'Emily Rodriguez',
    email: 'emily.r@example.com',
    phone: '(555) 555-6666',
    position: 'Bartender',
    hourlyRate: 16.00,
    createdAt: new Date().toISOString(),
  },
];

export const mockShifts: Shift[] = [
  {
    id: '1',
    restaurantId: '1',
    employeeId: '1',
    date: new Date().toISOString().split('T')[0],
    startTime: '10:00',
    endTime: '18:00',
    position: 'Server',
    notes: 'Morning shift',
    createdAt: new Date().toISOString(),
  },
  {
    id: '2',
    restaurantId: '1',
    employeeId: '2',
    date: new Date().toISOString().split('T')[0],
    startTime: '09:00',
    endTime: '17:00',
    position: 'Chef',
    notes: 'Prep and lunch service',
    createdAt: new Date().toISOString(),
  },
];
