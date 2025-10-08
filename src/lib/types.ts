export interface Database {
  public: {
    Tables: {
      restaurants: {
        Row: {
          id: string;
          name: string;
          address: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          address?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          address?: string;
          created_at?: string;
          updated_at?: string;
        };
      };
      employees: {
        Row: {
          id: string;
          restaurant_id: string;
          name: string;
          email: string;
          phone: string;
          role: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          restaurant_id: string;
          name: string;
          email?: string;
          phone?: string;
          role?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          restaurant_id?: string;
          name?: string;
          email?: string;
          phone?: string;
          role?: string;
          created_at?: string;
          updated_at?: string;
        };
      };
      shifts: {
        Row: {
          id: string;
          restaurant_id: string;
          employee_id: string;
          shift_date: string;
          start_time: string;
          end_time: string;
          notes: string;
          shift_type: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          restaurant_id: string;
          employee_id: string;
          shift_date: string;
          start_time: string;
          end_time: string;
          notes?: string;
          shift_type?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          restaurant_id?: string;
          employee_id?: string;
          shift_date?: string;
          start_time?: string;
          end_time?: string;
          notes?: string;
          shift_type?: string;
          created_at?: string;
          updated_at?: string;
        };
      };
    };
  };
}

export type Restaurant = Database['public']['Tables']['restaurants']['Row'];
export type Employee = Database['public']['Tables']['employees']['Row'];
export type Shift = Database['public']['Tables']['shifts']['Row'];
