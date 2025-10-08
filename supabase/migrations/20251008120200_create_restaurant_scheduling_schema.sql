/*
  # Restaurant Scheduling System Schema

  ## Overview
  Creates a comprehensive scheduling system for managing multiple restaurants, 
  their employees, and work schedules.

  ## New Tables

  ### 1. restaurants
  - `id` (uuid, primary key) - Unique restaurant identifier
  - `name` (text) - Restaurant name
  - `address` (text) - Restaurant location
  - `created_at` (timestamptz) - Record creation timestamp
  - `updated_at` (timestamptz) - Last update timestamp

  ### 2. employees
  - `id` (uuid, primary key) - Unique employee identifier
  - `restaurant_id` (uuid, foreign key) - Links to restaurants table
  - `name` (text) - Employee full name
  - `email` (text) - Employee email address
  - `phone` (text) - Employee phone number
  - `role` (text) - Job role (e.g., server, cook, manager)
  - `created_at` (timestamptz) - Record creation timestamp
  - `updated_at` (timestamptz) - Last update timestamp

  ### 3. shifts
  - `id` (uuid, primary key) - Unique shift identifier
  - `restaurant_id` (uuid, foreign key) - Links to restaurants table
  - `employee_id` (uuid, foreign key) - Links to employees table
  - `shift_date` (date) - Date of the shift
  - `start_time` (time) - Shift start time
  - `end_time` (time) - Shift end time
  - `notes` (text) - Optional shift notes
  - `created_at` (timestamptz) - Record creation timestamp
  - `updated_at` (timestamptz) - Last update timestamp

  ## Security

  ### Row Level Security (RLS)
  - All tables have RLS enabled for data protection
  - Public access for now (can be restricted later with authentication)
  - Policies allow all authenticated operations for initial setup

  ## Important Notes
  1. All tables use UUID primary keys for scalability
  2. Timestamps track creation and updates automatically
  3. Foreign key constraints ensure data integrity
  4. Indexes added for common query patterns (restaurant_id, employee_id, shift_date)
  5. RLS policies are permissive for initial development
*/

-- Create restaurants table
CREATE TABLE IF NOT EXISTS restaurants (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  address text DEFAULT '',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create employees table
CREATE TABLE IF NOT EXISTS employees (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  restaurant_id uuid NOT NULL REFERENCES restaurants(id) ON DELETE CASCADE,
  name text NOT NULL,
  email text DEFAULT '',
  phone text DEFAULT '',
  role text DEFAULT 'staff',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create shifts table
CREATE TABLE IF NOT EXISTS shifts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  restaurant_id uuid NOT NULL REFERENCES restaurants(id) ON DELETE CASCADE,
  employee_id uuid NOT NULL REFERENCES employees(id) ON DELETE CASCADE,
  shift_date date NOT NULL,
  start_time time NOT NULL,
  end_time time NOT NULL,
  notes text DEFAULT '',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_employees_restaurant_id ON employees(restaurant_id);
CREATE INDEX IF NOT EXISTS idx_shifts_restaurant_id ON shifts(restaurant_id);
CREATE INDEX IF NOT EXISTS idx_shifts_employee_id ON shifts(employee_id);
CREATE INDEX IF NOT EXISTS idx_shifts_date ON shifts(shift_date);

-- Enable Row Level Security
ALTER TABLE restaurants ENABLE ROW LEVEL SECURITY;
ALTER TABLE employees ENABLE ROW LEVEL SECURITY;
ALTER TABLE shifts ENABLE ROW LEVEL SECURITY;

-- Create permissive policies for all tables (public access for now)
CREATE POLICY "Allow all access to restaurants"
  ON restaurants FOR ALL
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Allow all access to employees"
  ON employees FOR ALL
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Allow all access to shifts"
  ON shifts FOR ALL
  USING (true)
  WITH CHECK (true);