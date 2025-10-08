export interface Restaurant {
  id: string;
  name: string;
  createdAt: string;
}

export interface Employee {
  id: string;
  name: string;
  position: string;
  phone: string;
  email: string;
  password?: string;
  createdAt: string;
}

export interface RestaurantEmployee {
  id: string;
  restaurantId: string;
  employeeId: string;
  createdAt: string;
}

export interface Shift {
  id: string;
  restaurantId: string;
  employeeId: string;
  date: string;
  startTime: string;
  endTime: string;
  shiftType: 'AM' | 'PM';
  createdAt: string;
}

export interface User {
  id: string;
  email: string;
  isAdmin: boolean;
}
