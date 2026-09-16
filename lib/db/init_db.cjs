const { Client } = require('pg');

async function main() {
  const client = new Client({
    user: 'postgres',
    host: 'localhost',
    database: 'postgres',
    password: 'root@123',
    port: 5432,
  });

  await client.connect();
  const res = await client.query("SELECT 1 FROM pg_database WHERE datname = 'nyaya_db'");
  if (res.rows.length === 0) {
    await client.query('CREATE DATABASE nyaya_db');
    console.log('SUCCESS: Created database nyaya_db');
  } else {
    console.log('INFO: Database nyaya_db already exists');
  }
  await client.end();
}

main().catch(err => {
  console.error('Error creating database:', err);
  process.exit(1);
});
