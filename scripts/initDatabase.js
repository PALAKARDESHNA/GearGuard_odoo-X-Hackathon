// Database initialization script
// This is a standalone script to initialize the database
const db = require('../config/database');

db.initDatabase()
  .then(() => {
    console.log('✅ Database initialized successfully');
    process.exit(0);
  })
  .catch((err) => {
    console.error('❌ Failed to initialize database:', err);
    process.exit(1);
  });

