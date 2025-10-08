/*
  # Restructure Employees as Shared Entities

  ## Overview
  This migration transforms employees from restaurant-specific entities to shared entities
  that can work across multiple restaurants.

  ## Changes

  ### 1. Create employee_restaurants junction table
  - `id` (uuid, primary key) - Unique identifier
  - `employee_id` (uuid, foreign key) - Links to employees table
  - `restaurant_id` (uuid, foreign key) - Links to restaurants table
  - `primary_location` (boolean) - Indicates if this is the employee's primary restaurant
  - `created_at` (timestamptz) - Record creation timestamp

  ### 2. Migrate existing data
  - Move existing employee-restaurant relationships to junction table
  - Remove restaurant_id from employees table
  - Update foreign key constraints

  ## Security
  - Enable RLS on new junction table
  - Add permissive policy for development

  ## Important Notes
  1. Preserves all existing employee and shift data
  2. Employees can now work at multiple restaurants
  3. Backward compatible with existing shifts
  4. Uses unique constraint to prevent duplicate employee-restaurant pairs
*/

-- Create the junction table for employee-restaurant relationships
CREATE TABLE IF NOT EXISTS employee_restaurants (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  employee_id uuid NOT NULL REFERENCES employees(id) ON DELETE CASCADE,
  restaurant_id uuid NOT NULL REFERENCES restaurants(id) ON DELETE CASCADE,
  primary_location boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  UNIQUE(employee_id, restaurant_id)
);

-- Create index for better query performance
CREATE INDEX IF NOT EXISTS idx_employee_restaurants_employee_id ON employee_restaurants(employee_id);
CREATE INDEX IF NOT EXISTS idx_employee_restaurants_restaurant_id ON employee_restaurants(restaurant_id);

-- Migrate existing employee-restaurant relationships to junction table
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'employees' AND column_name = 'restaurant_id'
  ) THEN
    -- Copy existing relationships to junction table
    INSERT INTO employee_restaurants (employee_id, restaurant_id, primary_location)
    SELECT id, restaurant_id, true
    FROM employees
    WHERE restaurant_id IS NOT NULL
    ON CONFLICT (employee_id, restaurant_id) DO NOTHING;
    
    -- Drop the foreign key constraint
    ALTER TABLE employees DROP CONSTRAINT IF EXISTS employees_restaurant_id_fkey;
    
    -- Remove restaurant_id column from employees table
    ALTER TABLE employees DROP COLUMN IF EXISTS restaurant_id;
  END IF;
END $$;

-- Enable Row Level Security on junction table
ALTER TABLE employee_restaurants ENABLE ROW LEVEL SECURITY;

-- Create permissive policy for junction table (public access for now)
CREATE POLICY "Allow all access to employee_restaurants"
  ON employee_restaurants FOR ALL
  USING (true)
  WITH CHECK (true);

-- Drop the old index if it exists
DROP INDEX IF EXISTS idx_employees_restaurant_id;