/*
  # Add Authentication to Employees

  1. Add auth_user_id to employees table
    - Links employee to Supabase auth user
    - Unique constraint to ensure one employee per auth user

  2. Update RLS Policies
    - restaurants: Admins can manage all, authenticated users can view assigned restaurants
    - employees: Admins can manage all, staff can view their own profile
    - employee_restaurants: Admins can manage all, staff can view their own assignments
    - shifts: Admins can manage all, staff can view shifts at their assigned restaurants

  3. Security
    - Restrictive RLS policies ensure staff only see their own data
    - Admin users (no employee link) have full access
*/

-- Add auth_user_id column to employees table
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'employees' AND column_name = 'auth_user_id'
  ) THEN
    ALTER TABLE employees ADD COLUMN auth_user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL;
    CREATE UNIQUE INDEX IF NOT EXISTS idx_employees_auth_user_id ON employees(auth_user_id) WHERE auth_user_id IS NOT NULL;
  END IF;
END $$;

-- Drop existing permissive policies
DROP POLICY IF EXISTS "Allow all access to restaurants" ON restaurants;
DROP POLICY IF EXISTS "Allow all access to employees" ON employees;
DROP POLICY IF EXISTS "Allow all access to employee_restaurants" ON employee_restaurants;
DROP POLICY IF EXISTS "Allow all access to shifts" ON shifts;

-- Restaurants: Admins can manage all, staff can view their assigned restaurants
CREATE POLICY "Admins can manage all restaurants"
  ON restaurants FOR ALL
  TO authenticated
  USING (
    NOT EXISTS (
      SELECT 1 FROM employees WHERE employees.auth_user_id = auth.uid()
    )
  )
  WITH CHECK (
    NOT EXISTS (
      SELECT 1 FROM employees WHERE employees.auth_user_id = auth.uid()
    )
  );

CREATE POLICY "Staff can view assigned restaurants"
  ON restaurants FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM employees e
      JOIN employee_restaurants er ON er.employee_id = e.id
      WHERE e.auth_user_id = auth.uid()
      AND er.restaurant_id = restaurants.id
    )
  );

-- Employees: Admins can manage all, staff can view their own profile
CREATE POLICY "Admins can manage all employees"
  ON employees FOR ALL
  TO authenticated
  USING (
    NOT EXISTS (
      SELECT 1 FROM employees WHERE employees.auth_user_id = auth.uid()
    )
  )
  WITH CHECK (
    NOT EXISTS (
      SELECT 1 FROM employees WHERE employees.auth_user_id = auth.uid()
    )
  );

CREATE POLICY "Staff can view own profile"
  ON employees FOR SELECT
  TO authenticated
  USING (auth_user_id = auth.uid());

-- Employee Restaurants: Admins can manage all, staff can view their own assignments
CREATE POLICY "Admins can manage all employee_restaurants"
  ON employee_restaurants FOR ALL
  TO authenticated
  USING (
    NOT EXISTS (
      SELECT 1 FROM employees WHERE employees.auth_user_id = auth.uid()
    )
  )
  WITH CHECK (
    NOT EXISTS (
      SELECT 1 FROM employees WHERE employees.auth_user_id = auth.uid()
    )
  );

CREATE POLICY "Staff can view own restaurant assignments"
  ON employee_restaurants FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM employees
      WHERE employees.id = employee_restaurants.employee_id
      AND employees.auth_user_id = auth.uid()
    )
  );

-- Shifts: Admins can manage all, staff can view shifts at their assigned restaurants
CREATE POLICY "Admins can manage all shifts"
  ON shifts FOR ALL
  TO authenticated
  USING (
    NOT EXISTS (
      SELECT 1 FROM employees WHERE employees.auth_user_id = auth.uid()
    )
  )
  WITH CHECK (
    NOT EXISTS (
      SELECT 1 FROM employees WHERE employees.auth_user_id = auth.uid()
    )
  );

CREATE POLICY "Staff can view shifts at assigned restaurants"
  ON shifts FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM employees e
      JOIN employee_restaurants er ON er.employee_id = e.id
      WHERE e.auth_user_id = auth.uid()
      AND er.restaurant_id = shifts.restaurant_id
    )
  );
