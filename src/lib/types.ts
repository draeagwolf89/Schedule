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
          position: string;
          phone: string;
          email: string;
          auth_user_id: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          position: string;
          phone: string;
          email: string;
          auth_user_id?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          position?: string;
          phone?: string;
          email?: string;
          auth_user_id?: string | null;
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
          start_time: string;
          end_time: string;
          shift_type: 'AM' | 'PM';
          created_at: string;
        };
        Insert: {
          id?: string;
          restaurant_id: string;
          employee_id: string;
          date: string;
          start_time: string;
          end_time: string;
          shift_type: 'AM' | 'PM';
          created_at?: string;
        };
        Update: {
          id?: string;
          restaurant_id?: string;
          employee_id?: string;
          date?: string;
          start_time?: string;
          end_time?: string;
          shift_type?: 'AM' | 'PM';
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
