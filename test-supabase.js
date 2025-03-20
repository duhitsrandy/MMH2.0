require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

// Get the Supabase URL and key from the Supabase dashboard
// Project Settings > API
const SUPABASE_URL = 'https://jjccofelynyxckfaxbge.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpqY2NvZmVseW55eGNrZmF4YmdlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDE3ODk0ODgsImV4cCI6MjA1NzM2NTQ4OH0.ICS9UHpoFRvjkKZ4JbnR008n5WyzBuG9_oOIOCkp-S8';

async function testSupabase() {
  try {
    console.log('Creating Supabase client...');
    const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);
    
    console.log('Testing connection...');
    // Since we don't have any tables yet, let's just check if we can connect
    const { data, error } = await supabase.auth.getSession();
    
    if (error) {
      console.error('Error:', error.message);
    } else {
      console.log('Connected successfully!');
      console.log('Session:', data);
      
      // Let's also update our .env.local file with the Supabase URL and key
      console.log('\nAdd these to your .env.local file:');
      console.log('NEXT_PUBLIC_SUPABASE_URL=' + SUPABASE_URL);
      console.log('NEXT_PUBLIC_SUPABASE_ANON_KEY=' + SUPABASE_KEY);
    }
  } catch (error) {
    console.error('Error:', error.message);
  }
}

testSupabase(); 