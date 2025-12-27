const mysql = require('mysql2/promise');
const dotenv = require('dotenv');

dotenv.config();

const config = {
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '3306'),
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'gearguard',
};

async function migrateRequestsTable() {
  let connection;
  try {
    connection = await mysql.createConnection(config);
    console.log('✅ Connected to database');

    // Check if columns exist and add them if they don't
    const alterQueries = [
      // Check and add maintenance_type
      `ALTER TABLE maintenance_requests 
       ADD COLUMN IF NOT EXISTS maintenance_type VARCHAR(100) AFTER request_type`,
      
      // Check and add work_center_id
      `ALTER TABLE maintenance_requests 
       ADD COLUMN IF NOT EXISTS work_center_id INT AFTER assigned_technician_id,
       ADD CONSTRAINT IF NOT EXISTS fk_requests_work_center 
       FOREIGN KEY (work_center_id) REFERENCES work_centers(id) ON DELETE SET NULL`,
      
      // Check and add workplace
      `ALTER TABLE maintenance_requests 
       ADD COLUMN IF NOT EXISTS workplace VARCHAR(255) AFTER work_center_id`,
      
      // Check and add start_date
      `ALTER TABLE maintenance_requests 
       ADD COLUMN IF NOT EXISTS start_date DATE AFTER scheduled_date`,
      
      // Check and add end_date
      `ALTER TABLE maintenance_requests 
       ADD COLUMN IF NOT EXISTS end_date DATE AFTER start_date`,
      
      // Check and add cost
      `ALTER TABLE maintenance_requests 
       ADD COLUMN IF NOT EXISTS cost DECIMAL(10,2) AFTER duration_hours`,
      
      // Check and add status
      `ALTER TABLE maintenance_requests 
       ADD COLUMN IF NOT EXISTS status VARCHAR(50) DEFAULT 'Open' AFTER stage`,
    ];

    // MySQL doesn't support IF NOT EXISTS for ALTER TABLE ADD COLUMN
    // So we'll check first, then add if needed
    for (const query of alterQueries) {
      try {
        // Try to add column - will fail if it exists
        await connection.query(query);
        console.log('✅ Column added successfully');
      } catch (error) {
        if (error.code === 'ER_DUP_FIELDNAME' || error.code === 'ER_DUP_KEYNAME') {
          console.log('ℹ️  Column already exists, skipping...');
        } else {
          // For foreign key, try without the constraint first
          if (query.includes('FOREIGN KEY')) {
            try {
              // Try adding column without foreign key first
              const columnQuery = query.split('ADD CONSTRAINT')[0];
              await connection.query(columnQuery);
              console.log('✅ Column added, adding foreign key...');
              // Then add foreign key separately
              const fkQuery = `ALTER TABLE maintenance_requests 
                ADD CONSTRAINT fk_requests_work_center 
                FOREIGN KEY (work_center_id) REFERENCES work_centers(id) ON DELETE SET NULL`;
              try {
                await connection.query(fkQuery);
                console.log('✅ Foreign key added');
              } catch (fkError) {
                if (fkError.code === 'ER_DUP_KEYNAME') {
                  console.log('ℹ️  Foreign key already exists');
                } else {
                  throw fkError;
                }
              }
            } catch (colError) {
              if (colError.code === 'ER_DUP_FIELDNAME') {
                console.log('ℹ️  Column already exists');
              } else {
                throw colError;
              }
            }
          } else {
            throw error;
          }
        }
      }
    }

    console.log('✅ Migration completed successfully!');
  } catch (error) {
    console.error('❌ Migration error:', error.message);
    if (error.code === 'ER_DUP_FIELDNAME') {
      console.log('ℹ️  Some columns may already exist. This is okay.');
    } else {
      throw error;
    }
  } finally {
    if (connection) {
      await connection.end();
      console.log('✅ Database connection closed');
    }
  }
}

// Run migration
migrateRequestsTable()
  .then(() => {
    console.log('🎉 Migration script completed!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('💥 Migration failed:', error);
    process.exit(1);
  });

