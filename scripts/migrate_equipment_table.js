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

async function migrateEquipmentTable() {
  let connection;
  try {
    connection = await mysql.createConnection(config);
    console.log('✅ Connected to database');

    // Add missing columns to equipment table
    const alterQueries = [
      `ALTER TABLE equipment 
       ADD COLUMN IF NOT EXISTS component VARCHAR(255) AFTER name`,
      
      `ALTER TABLE equipment 
       ADD COLUMN IF NOT EXISTS company VARCHAR(255) AFTER category`,
      
      `ALTER TABLE equipment 
       ADD COLUMN IF NOT EXISTS used_by VARCHAR(255) AFTER company`,
      
      `ALTER TABLE equipment 
       ADD COLUMN IF NOT EXISTS maintenance_type VARCHAR(100) AFTER used_by`,
      
      `ALTER TABLE equipment 
       ADD COLUMN IF NOT EXISTS assigned_date DATE AFTER warranty_expiry`,
      
      `ALTER TABLE equipment 
       ADD COLUMN IF NOT EXISTS used_in VARCHAR(255) AFTER location`,
      
      `ALTER TABLE equipment 
       ADD COLUMN IF NOT EXISTS work_order VARCHAR(255) AFTER used_in`,
      
      `ALTER TABLE equipment 
       ADD COLUMN IF NOT EXISTS employee_id INT AFTER assigned_to_user_id,
       ADD CONSTRAINT IF NOT EXISTS fk_equipment_employee 
       FOREIGN KEY (employee_id) REFERENCES users(id) ON DELETE SET NULL`,
    ];

    for (const query of alterQueries) {
      try {
        if (query.includes('FOREIGN KEY')) {
          // Handle foreign key separately
          const parts = query.split('ADD CONSTRAINT');
          const columnPart = parts[0];
          const fkPart = parts[1];
          
          try {
            await connection.query(columnPart);
            console.log('✅ Column added');
          } catch (colError) {
            if (colError.code === 'ER_DUP_FIELDNAME') {
              console.log('ℹ️  Column already exists');
            } else {
              throw colError;
            }
          }
          
          // Try to add foreign key
          if (fkPart) {
            const fkQuery = `ALTER TABLE equipment ${fkPart}`;
            try {
              await connection.query(fkQuery);
              console.log('✅ Foreign key added');
            } catch (fkError) {
              if (fkError.code === 'ER_DUP_KEYNAME') {
                console.log('ℹ️  Foreign key already exists');
              } else {
                console.log('⚠️  Could not add foreign key:', fkError.message);
              }
            }
          }
        } else {
          await connection.query(query);
          console.log('✅ Column added successfully');
        }
      } catch (error) {
        if (error.code === 'ER_DUP_FIELDNAME') {
          console.log('ℹ️  Column already exists, skipping...');
        } else {
          console.error('⚠️  Error:', error.message);
        }
      }
    }

    console.log('✅ Equipment table migration completed!');
  } catch (error) {
    console.error('❌ Migration error:', error.message);
  } finally {
    if (connection) {
      await connection.end();
      console.log('✅ Database connection closed');
    }
  }
}

migrateEquipmentTable()
  .then(() => {
    console.log('🎉 Migration script completed!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('💥 Migration failed:', error);
    process.exit(1);
  });

