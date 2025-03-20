require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

// Get the Supabase URL and key from the .env.local file
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

// Run the script
async function run() {
  try {
    console.log('Testing connection to Supabase...');
    const { data, error } = await supabase.auth.getSession();
    
    if (error) {
      console.error('Error connecting to Supabase:', error.message);
      return;
    }
    
    console.log('Connected to Supabase successfully!');
    console.log('\nWARNING: We need to create tables in Supabase.');
    console.log('Please follow these steps:');
    console.log('1. Go to your Supabase dashboard: https://app.supabase.com/project/jjccofelynyxckfaxbge');
    console.log('2. Go to the SQL Editor');
    console.log('3. Create a new query');
    console.log('4. Copy the SQL from the migration files in db/migrations/');
    console.log('5. Run the SQL query');
    console.log('\nAlternatively, you can try running the app and see if it works without migrations.');
  } catch (error) {
    console.error('Error:', error.message);
  }
}

run(); 