import type { Restaurant, Employee, RestaurantEmployee, Shift, User } from './types';

const STORAGE_KEYS = {
  RESTAURANTS: 'restaurants',
  EMPLOYEES: 'employees',
  RESTAURANT_EMPLOYEES: 'restaurantEmployees',
  SHIFTS: 'shifts',
  CURRENT_USER: 'currentUser',
  USERS: 'users',
};

function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

function getFromStorage<T>(key: string): T[] {
  const data = localStorage.getItem(key);
  return data ? JSON.parse(data) : [];
}

function saveToStorage<T>(key: string, data: T[]): void {
  localStorage.setItem(key, JSON.stringify(data));
}

export const storage = {
  restaurants: {
    getAll: (): Restaurant[] => getFromStorage<Restaurant>(STORAGE_KEYS.RESTAURANTS),

    create: (restaurant: Omit<Restaurant, 'id' | 'createdAt'>): Restaurant => {
      const restaurants = getFromStorage<Restaurant>(STORAGE_KEYS.RESTAURANTS);
      const newRestaurant: Restaurant = {
        ...restaurant,
        id: generateId(),
        createdAt: new Date().toISOString(),
      };
      restaurants.push(newRestaurant);
      saveToStorage(STORAGE_KEYS.RESTAURANTS, restaurants);
      return newRestaurant;
    },

    update: (id: string, updates: Partial<Restaurant>): Restaurant | null => {
      const restaurants = getFromStorage<Restaurant>(STORAGE_KEYS.RESTAURANTS);
      const index = restaurants.findIndex(r => r.id === id);
      if (index === -1) return null;

      restaurants[index] = { ...restaurants[index], ...updates };
      saveToStorage(STORAGE_KEYS.RESTAURANTS, restaurants);
      return restaurants[index];
    },

    delete: (id: string): boolean => {
      const restaurants = getFromStorage<Restaurant>(STORAGE_KEYS.RESTAURANTS);
      const filtered = restaurants.filter(r => r.id !== id);
      if (filtered.length === restaurants.length) return false;

      saveToStorage(STORAGE_KEYS.RESTAURANTS, filtered);
      return true;
    },
  },

  employees: {
    getAll: (): Employee[] => getFromStorage<Employee>(STORAGE_KEYS.EMPLOYEES),

    getByRestaurant: (restaurantId: string): Employee[] => {
      const restaurantEmployees = getFromStorage<RestaurantEmployee>(STORAGE_KEYS.RESTAURANT_EMPLOYEES);
      const employees = getFromStorage<Employee>(STORAGE_KEYS.EMPLOYEES);
      const employeeIds = restaurantEmployees
        .filter(re => re.restaurantId === restaurantId)
        .map(re => re.employeeId);
      return employees.filter(e => employeeIds.includes(e.id));
    },

    create: (employee: Omit<Employee, 'id' | 'createdAt'>): Employee => {
      const employees = getFromStorage<Employee>(STORAGE_KEYS.EMPLOYEES);
      const newEmployee: Employee = {
        ...employee,
        id: generateId(),
        createdAt: new Date().toISOString(),
      };
      employees.push(newEmployee);
      saveToStorage(STORAGE_KEYS.EMPLOYEES, employees);
      return newEmployee;
    },

    update: (id: string, updates: Partial<Employee>): Employee | null => {
      const employees = getFromStorage<Employee>(STORAGE_KEYS.EMPLOYEES);
      const index = employees.findIndex(e => e.id === id);
      if (index === -1) return null;

      employees[index] = { ...employees[index], ...updates };
      saveToStorage(STORAGE_KEYS.EMPLOYEES, employees);
      return employees[index];
    },

    delete: (id: string): boolean => {
      const employees = getFromStorage<Employee>(STORAGE_KEYS.EMPLOYEES);
      const filtered = employees.filter(e => e.id !== id);
      if (filtered.length === employees.length) return false;

      saveToStorage(STORAGE_KEYS.EMPLOYEES, filtered);
      return true;
    },
  },

  restaurantEmployees: {
    assign: (restaurantId: string, employeeId: string): RestaurantEmployee => {
      const restaurantEmployees = getFromStorage<RestaurantEmployee>(STORAGE_KEYS.RESTAURANT_EMPLOYEES);
      const newAssignment: RestaurantEmployee = {
        id: generateId(),
        restaurantId,
        employeeId,
        createdAt: new Date().toISOString(),
      };
      restaurantEmployees.push(newAssignment);
      saveToStorage(STORAGE_KEYS.RESTAURANT_EMPLOYEES, restaurantEmployees);
      return newAssignment;
    },

    unassign: (restaurantId: string, employeeId: string): boolean => {
      const restaurantEmployees = getFromStorage<RestaurantEmployee>(STORAGE_KEYS.RESTAURANT_EMPLOYEES);
      const filtered = restaurantEmployees.filter(
        re => !(re.restaurantId === restaurantId && re.employeeId === employeeId)
      );
      if (filtered.length === restaurantEmployees.length) return false;

      saveToStorage(STORAGE_KEYS.RESTAURANT_EMPLOYEES, filtered);
      return true;
    },
  },

  shifts: {
    getAll: (): Shift[] => getFromStorage<Shift>(STORAGE_KEYS.SHIFTS),

    getByRestaurant: (restaurantId: string): Shift[] => {
      const shifts = getFromStorage<Shift>(STORAGE_KEYS.SHIFTS);
      return shifts.filter(s => s.restaurantId === restaurantId);
    },

    getByEmployee: (employeeId: string): Shift[] => {
      const shifts = getFromStorage<Shift>(STORAGE_KEYS.SHIFTS);
      return shifts.filter(s => s.employeeId === employeeId);
    },

    create: (shift: Omit<Shift, 'id' | 'createdAt'>): Shift => {
      const shifts = getFromStorage<Shift>(STORAGE_KEYS.SHIFTS);
      const newShift: Shift = {
        ...shift,
        id: generateId(),
        createdAt: new Date().toISOString(),
      };
      shifts.push(newShift);
      saveToStorage(STORAGE_KEYS.SHIFTS, shifts);
      return newShift;
    },

    update: (id: string, updates: Partial<Shift>): Shift | null => {
      const shifts = getFromStorage<Shift>(STORAGE_KEYS.SHIFTS);
      const index = shifts.findIndex(s => s.id === id);
      if (index === -1) return null;

      shifts[index] = { ...shifts[index], ...updates };
      saveToStorage(STORAGE_KEYS.SHIFTS, shifts);
      return shifts[index];
    },

    delete: (id: string): boolean => {
      const shifts = getFromStorage<Shift>(STORAGE_KEYS.SHIFTS);
      const filtered = shifts.filter(s => s.id !== id);
      if (filtered.length === shifts.length) return false;

      saveToStorage(STORAGE_KEYS.SHIFTS, filtered);
      return true;
    },
  },
};

export const auth = {
  getCurrentUser: (): User | null => {
    const userJson = localStorage.getItem(STORAGE_KEYS.CURRENT_USER);
    return userJson ? JSON.parse(userJson) : null;
  },

  signIn: (email: string, password: string): User | null => {
    const users = getFromStorage<Employee>(STORAGE_KEYS.EMPLOYEES);
    const user = users.find(u => u.email === email && u.password === password);

    if (!user) {
      const adminEmail = 'admin@admin.com';
      const adminPassword = 'admin123';

      if (email === adminEmail && password === adminPassword) {
        const adminUser: User = {
          id: 'admin',
          email: adminEmail,
          isAdmin: true,
        };
        localStorage.setItem(STORAGE_KEYS.CURRENT_USER, JSON.stringify(adminUser));
        return adminUser;
      }

      return null;
    }

    const currentUser: User = {
      id: user.id,
      email: user.email,
      isAdmin: false,
    };
    localStorage.setItem(STORAGE_KEYS.CURRENT_USER, JSON.stringify(currentUser));
    return currentUser;
  },

  signOut: (): void => {
    localStorage.removeItem(STORAGE_KEYS.CURRENT_USER);
  },

  isAdmin: (): boolean => {
    const user = auth.getCurrentUser();
    return user?.isAdmin ?? false;
  },
};
