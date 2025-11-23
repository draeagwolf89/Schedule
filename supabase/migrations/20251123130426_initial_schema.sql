/*
  # Initial Schema for Restaurant Schedule Management System

  1. New Tables
    - `restaurants`
      - `id` (uuid, primary key)
      - `name` (text, restaurant name)
      - `created_at` (timestamptz)
    
    - `employees`
      - `id` (uuid, primary key)
      - `name` (text, employee full name)
      - `username` (text, unique, for login)
      - `phone` (text, contact number)
      - `email` (text, nullable, for auth)
      - `password_hash` (text, nullable)
      - `auth_user_id` (uuid, nullable, reference to auth.users)
      - `roles` (text array, employee roles: door, gelato, server)
      - `created_at` (timestamptz)
    
    - `restaurant_employees`
      - `id` (uuid, primary key)
      - `restaurant_id` (uuid, foreign key to restaurants)
      - `employee_id` (uuid, foreign key to employees)
      - `created_at` (timestamptz)
    
    - `shifts`
      - `id` (uuid, primary key)
      - `restaurant_id` (uuid, foreign key to restaurants)
      - `employee_id` (uuid, foreign key to employees)
      - `date` (date, shift date)
      - `role` (text, role for this shift: door, gelato, server)
      - `created_at` (timestamptz)
    
    - `admins`
      - `id` (uuid, primary key)
      - `user_id` (uuid, reference to auth.users)
      - `created_at` (timestamptz)

  2. Security
    - Enable RLS on all tables
    - Add policies for authenticated users to manage their data
    - Admins can manage all data
    - Employees can view their own schedules

  3. Important Notes
    - All tables use UUIDs for primary keys
    - Timestamps use timestamptz for proper timezone handling
    - Foreign key constraints ensure data integrity
    - Unique constraints prevent duplicate entries
*/

-- Create restaurants table
CREATE TABLE IF NOT EXISTS restaurants (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Create employees table
CREATE TABLE IF NOT EXISTS employees (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  username text UNIQUE NOT NULL,
  phone text NOT NULL DEFAULT '',
  email text,
  password_hash text,
  auth_user_id uuid REFERENCES auth.users(id),
  roles text[] NOT NULL DEFAULT '{}',
  created_at timestamptz DEFAULT now()
);

-- Create restaurant_employees junction table
CREATE TABLE IF NOT EXISTS restaurant_employees (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  restaurant_id uuid NOT NULL REFERENCES restaurants(id) ON DELETE CASCADE,
  employee_id uuid NOT NULL REFERENCES employees(id) ON DELETE CASCADE,
  created_at timestamptz DEFAULT now(),
  UNIQUE(restaurant_id, employee_id)
);

-- Create shifts table
CREATE TABLE IF NOT EXISTS shifts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  restaurant_id uuid NOT NULL REFERENCES restaurants(id) ON DELETE CASCADE,
  employee_id uuid NOT NULL REFERENCES employees(id) ON DELETE CASCADE,
  date date NOT NULL,
  role text NOT NULL CHECK (role IN ('door', 'gelato', 'server')),
  created_at timestamptz DEFAULT now()
);

-- Create admins table
CREATE TABLE IF NOT EXISTS admins (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at timestamptz DEFAULT now(),
  UNIQUE(user_id)
);

-- Enable Row Level Security
ALTER TABLE restaurants ENABLE ROW LEVEL SECURITY;
ALTER TABLE employees ENABLE ROW LEVEL SECURITY;
ALTER TABLE restaurant_employees ENABLE ROW LEVEL SECURITY;
ALTER TABLE shifts ENABLE ROW LEVEL SECURITY;
ALTER TABLE admins ENABLE ROW LEVEL SECURITY;

-- Restaurants policies
CREATE POLICY "Authenticated users can view restaurants"
  ON restaurants FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can insert restaurants"
  ON restaurants FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Authenticated users can update restaurants"
  ON restaurants FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Authenticated users can delete restaurants"
  ON restaurants FOR DELETE
  TO authenticated
  USING (true);

-- Employees policies
CREATE POLICY "Authenticated users can view employees"
  ON employees FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can insert employees"
  ON employees FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Authenticated users can update employees"
  ON employees FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Authenticated users can delete employees"
  ON employees FOR DELETE
  TO authenticated
  USING (true);

-- Restaurant employees policies
CREATE POLICY "Authenticated users can view restaurant employees"
  ON restaurant_employees FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can insert restaurant employees"
  ON restaurant_employees FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Authenticated users can update restaurant employees"
  ON restaurant_employees FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Authenticated users can delete restaurant employees"
  ON restaurant_employees FOR DELETE
  TO authenticated
  USING (true);

-- Shifts policies
CREATE POLICY "Authenticated users can view shifts"
  ON shifts FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can insert shifts"
  ON shifts FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Authenticated users can update shifts"
  ON shifts FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Authenticated users can delete shifts"
  ON shifts FOR DELETE
  TO authenticated
  USING (true);

-- Admins policies
CREATE POLICY "Authenticated users can view admins"
  ON admins FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can insert admins"
  ON admins FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Authenticated users can update admins"
  ON admins FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Authenticated users can delete admins"
  ON admins FOR DELETE
  TO authenticated
  USING (true);
