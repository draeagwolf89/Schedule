import { createClient } from '@supabase/supabase-js';
import { readFileSync } from 'fs';
import { config } from 'dotenv';

config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY;

const supabase = createClient(supabaseUrl, supabaseAnonKey);

const migrationSQL = readFileSync('./supabase/migrations/20250108000000_add_username_to_employees.sql', 'utf8');

// Remove comments and execute
const cleanSQL = migrationSQL.replace(/\/\*[\s\S]*?\*\//g, '').trim();

const { data, error } = await supabase.rpc('exec_sql', { sql: cleanSQL });

if (error) {
  console.error('Migration error:', error);
  process.exit(1);
} else {
  console.log('Migration completed successfully');
}
