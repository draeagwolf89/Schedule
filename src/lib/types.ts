export type Database = {
  public: {
    Tables: {
      restaurants: {
        Row: {
          id: string;
          name: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          created_at?: string;
        };
      };
      employees: {
        Row: {
          id: string;
          name: string;
          username: string;
          phone: string;
          email: string | null;
          password_hash: string | null;
          auth_user_id: string | null;
          roles: ('door' | 'gelato' | 'server')[];
          created_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          username: string;
          phone?: string;
          email?: string | null;
          password_hash?: string | null;
          auth_user_id?: string | null;
          roles: ('door' | 'gelato' | 'server')[];
          created_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          username?: string;
          phone?: string;
          email?: string | null;
          password_hash?: string | null;
          auth_user_id?: string | null;
          roles?: ('door' | 'gelato' | 'server')[];
          created_at?: string;
        };
      };
      restaurant_employees: {
        Row: {
          id: string;
          restaurant_id: string;
          employee_id: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          restaurant_id: string;
          employee_id: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          restaurant_id?: string;
          employee_id?: string;
          created_at?: string;
        };
      };
      shifts: {
        Row: {
          id: string;
          restaurant_id: string;
          employee_id: string;
          date: string;
          role: 'door' | 'gelato' | 'server';
          created_at: string;
        };
        Insert: {
          id?: string;
          restaurant_id: string;
          employee_id: string;
          date: string;
          role: 'door' | 'gelato' | 'server';
          created_at?: string;
        };
        Update: {
          id?: string;
          restaurant_id?: string;
          employee_id?: string;
          date?: string;
          role?: 'door' | 'gelato' | 'server';
          created_at?: string;
        };
      };
      admins: {
        Row: {
          id: string;
          user_id: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          created_at?: string;
        };
      };
    };
  };
};

export type Restaurant = Database['public']['Tables']['restaurants']['Row'];
export type Employee = Database['public']['Tables']['employees']['Row'];
export type RestaurantEmployee = Database['public']['Tables']['restaurant_employees']['Row'];
export type Shift = Database['public']['Tables']['shifts']['Row'];
