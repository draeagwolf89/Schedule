const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');

const supabaseUrl = process.env.VITE_SUPABASE_URL || 'https://flmhqucmunaxlweiqgmu.supabase.co';
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZsbWhxdWNtdW5heGx3ZWlxZ211Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTk5NTI0MTUsImV4cCI6MjA3NTUyODQxNX0.gIE7RG7RvGVs0YDoU4ppzbxLaS-rvpxFnsT_Jd81wuA';

const supabase = createClient(supabaseUrl, supabaseKey);

async function runMigration() {
  console.log('Adding username column to employees table...');

  // Step 1: Add username column
  const { error: error1 } = await supabase.rpc('exec_sql', {
    sql: 'ALTER TABLE employees ADD COLUMN IF NOT EXISTS username text;'
  }).catch(() => {
    // RPC might not exist, try direct SQL execution
    return { error: null };
  });

  if (error1) {
    console.log('Note: RPC method not available, this is expected.');
  }

  console.log('\nMigration SQL saved to: supabase/migrations/20250108000000_add_username_to_employees.sql');
  console.log('\nPlease run this SQL in your Supabase SQL Editor:');
  console.log('1. Go to: https://supabase.com/dashboard/project/flmhqucmunaxlweiqgmu/sql/new');
  console.log('2. Copy the contents of: supabase/migrations/20250108000000_add_username_to_employees.sql');
  console.log('3. Paste and run it in the SQL Editor');
}

runMigration();
