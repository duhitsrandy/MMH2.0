const { Client } = require('pg');

// Your Supabase project reference
const projectRef = 'anaioupxjmpocduflchh';
const password = 'jinsym-8xujCe-keqbiz';

// Different connection string formats to try
const connectionStrings = [
  // Format 1: Direct connection
  `postgresql://postgres:${password}@db.${projectRef}.supabase.co:5432/postgres`,
  
  // Format 2: Direct connection with schema
  `postgresql://postgres:${password}@db.${projectRef}.supabase.co:5432/postgres?schema=public`,
  
  // Format 3: Connection pooling
  `postgresql://postgres:${password}@${projectRef}.pooler.supabase.co:5432/postgres`,
  
  // Format 4: Connection pooling with project reference in username
  `postgresql://postgres.${projectRef}:${password}@aws-0-us-west-1.pooler.supabase.com:5432/postgres`,
  
  // Format 5: Connection pooling with different port
  `postgresql://postgres:${password}@db.${projectRef}.supabase.co:6543/postgres`,
];

async function testConnections() {
  for (let i = 0; i < connectionStrings.length; i++) {
    const connectionString = connectionStrings[i];
    console.log(`\nTesting connection string ${i + 1}:`);
    console.log(connectionString);
    
    const client = new Client({ connectionString });
    
    try {
      await client.connect();
      console.log('✅ Connected successfully!');
      
      const result = await client.query('SELECT NOW()');
      console.log('Database time:', result.rows[0].now);
      
      await client.end();
    } catch (error) {
      console.error('❌ Connection failed:', error.message);
    }
  }
}

testConnections(); 