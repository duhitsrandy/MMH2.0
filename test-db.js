require('dotenv').config({ path: '.env.local' });
const { Client } = require('pg');

const client = new Client({
  connectionString: process.env.DATABASE_URL
});

async function testConnection() {
  try {
    console.log('Connecting to database...');
    console.log('Connection string:', process.env.DATABASE_URL);
    await client.connect();
    console.log('Connected to database successfully!');
    
    const result = await client.query('SELECT NOW()');
    console.log('Database time:', result.rows[0].now);
    
    await client.end();
  } catch (error) {
    console.error('Error connecting to database:', error);
  }
}

testConnection(); 