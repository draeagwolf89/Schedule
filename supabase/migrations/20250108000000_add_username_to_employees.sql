/*
  # Add username to employees table

  1. Changes
    - Add `username` column to `employees` table
    - Username will be unique and used for login identification
    - Email field will be kept for auth purposes but generated from username

  2. Notes
    - Username is required and unique
    - Existing employees will need username values set
*/

-- Add username column to employees table
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'employees' AND column_name = 'username'
  ) THEN
    ALTER TABLE employees ADD COLUMN username text;
  END IF;
END $$;

-- Update existing employees to have username derived from email
UPDATE employees
SET username = split_part(email, '@', 1)
WHERE username IS NULL;

-- Add unique constraint
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conname = 'employees_username_key'
  ) THEN
    ALTER TABLE employees ADD CONSTRAINT employees_username_key UNIQUE (username);
  END IF;
END $$;

-- Make username NOT NULL after populating existing records
ALTER TABLE employees ALTER COLUMN username SET NOT NULL;
