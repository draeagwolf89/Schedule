import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  'https://rvgrluxwxwkldmalocdx.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJ2Z3JsdXh3eHdrbGRtYWxvY2R4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTk4OTQzNjMsImV4cCI6MjA3NTQ3MDM2M30.CMJikfbYnPGlYOv_Mf30ACRPwxjdqGkCp2Er1g4WDOg'
);

async function createAdmin() {
  try {
    const { data, error } = await supabase.auth.signUp({
      email: 'vinieolii@gmail.com',
      password: 'terracina129',
      options: {
        emailRedirectTo: undefined,
      }
    });

    if (error) {
      console.error('Error creating admin:', error.message);
      return;
    }

    console.log('Admin user created successfully!');
    console.log('Email:', data.user?.email);
    console.log('User ID:', data.user?.id);
    console.log('\nYou can now log in with:');
    console.log('Email: vinieolii@gmail.com');
    console.log('Password: terracina129');
  } catch (err) {
    console.error('Unexpected error:', err);
  }
}

createAdmin();
