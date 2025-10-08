export interface Restaurant {
  id: string;
  name: string;
  address: string;
  phone: string;
  createdAt: string;
}

export interface Employee {
  id: string;
  restaurantId: string;
  name: string;
  email: string;
  phone: string;
  position: string;
  hourlyRate: number;
  createdAt: string;
}

export interface Shift {
  id: string;
  restaurantId: string;
  employeeId: string;
  date: string;
  startTime: string;
  endTime: string;
  position: string;
  notes?: string;
  createdAt: string;
}
