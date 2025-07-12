const { databaseAPI } = require('./lib/api');

async function init() {
  console.log('Initializing database...');
  const success = await databaseAPI.initializeDatabase();
  console.log('Database initialization successful:', success);
}

init();

