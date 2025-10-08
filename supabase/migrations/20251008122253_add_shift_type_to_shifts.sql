/*
  # Add Shift Type to Shifts Table

  ## Overview
  Adds a shift_type column to the shifts table to track different station assignments
  (DOOR, GELATO, or SERVER) for employees during their shifts.

  ## Changes
  1. Add shift_type column to shifts table
    - Type: text
    - Default: 'SERVER'
    - Not null
  2. This allows restaurants to assign employees to specific stations/roles for each shift

  ## Important Notes
  - Default value is 'SERVER' for existing and new records
  - Valid values: 'SERVER', 'DOOR', 'GELATO'
  - This is used to differentiate station assignments on the schedule
*/

-- Add shift_type column to shifts table
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'shifts' AND column_name = 'shift_type'
  ) THEN
    ALTER TABLE shifts ADD COLUMN shift_type text DEFAULT 'SERVER' NOT NULL;
  END IF;
END $$;