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

async function addMissingColumns() {
  let connection;
  try {
    connection = await mysql.createConnection(config);
    console.log('✅ Connected to database');

    // Function to check if column exists
    const columnExists = async (table, column) => {
      try {
        const [rows] = await connection.query(
          `SELECT COUNT(*) as count 
           FROM INFORMATION_SCHEMA.COLUMNS 
           WHERE TABLE_SCHEMA = ? AND TABLE_NAME = ? AND COLUMN_NAME = ?`,
          [config.database, table, column]
        );
        return rows[0].count > 0;
      } catch (error) {
        return false;
      }
    };

    // Add columns to maintenance_requests table
    console.log('\n📋 Checking maintenance_requests table...');
    
    const requestsColumns = [
      { name: 'maintenance_type', type: 'VARCHAR(100)', after: 'request_type' },
      { name: 'work_center_id', type: 'INT', after: 'assigned_technician_id' },
      { name: 'workplace', type: 'VARCHAR(255)', after: 'work_center_id' },
      { name: 'start_date', type: 'DATE', after: 'scheduled_date' },
      { name: 'end_date', type: 'DATE', after: 'start_date' },
      { name: 'cost', type: 'DECIMAL(10,2)', after: 'duration_hours' },
      { name: 'status', type: "VARCHAR(50) DEFAULT 'Open'", after: 'stage' },
    ];

    for (const col of requestsColumns) {
      const exists = await columnExists('maintenance_requests', col.name);
      if (!exists) {
        try {
          await connection.query(
            `ALTER TABLE maintenance_requests 
             ADD COLUMN ${col.name} ${col.type} ${col.after ? `AFTER ${col.after}` : ''}`
          );
          console.log(`✅ Added column: maintenance_requests.${col.name}`);
        } catch (error) {
          console.error(`❌ Error adding ${col.name}:`, error.message);
        }
      } else {
        console.log(`ℹ️  Column already exists: maintenance_requests.${col.name}`);
      }
    }

    // Add foreign key for work_center_id if it doesn't exist
    try {
      const [fkRows] = await connection.query(
        `SELECT COUNT(*) as count 
         FROM INFORMATION_SCHEMA.KEY_COLUMN_USAGE 
         WHERE TABLE_SCHEMA = ? AND TABLE_NAME = 'maintenance_requests' 
         AND CONSTRAINT_NAME = 'fk_requests_work_center'`,
        [config.database]
      );
      
      if (fkRows[0].count === 0) {
        await connection.query(
          `ALTER TABLE maintenance_requests 
           ADD CONSTRAINT fk_requests_work_center 
           FOREIGN KEY (work_center_id) REFERENCES work_centers(id) ON DELETE SET NULL`
        );
        console.log('✅ Added foreign key: fk_requests_work_center');
      } else {
        console.log('ℹ️  Foreign key already exists: fk_requests_work_center');
      }
    } catch (error) {
      if (error.code === 'ER_CANNOT_ADD_FOREIGN') {
        console.log('⚠️  Cannot add foreign key (work_centers table may not exist yet)');
      } else {
        console.log('ℹ️  Foreign key constraint:', error.message);
      }
    }

    // Add columns to equipment table
    console.log('\n📋 Checking equipment table...');
    
    const equipmentColumns = [
      { name: 'component', type: 'VARCHAR(255)', after: 'name' },
      { name: 'company', type: 'VARCHAR(255)', after: 'category' },
      { name: 'used_by', type: 'VARCHAR(255)', after: 'company' },
      { name: 'maintenance_type', type: 'VARCHAR(100)', after: 'used_by' },
      { name: 'assigned_date', type: 'DATE', after: 'warranty_expiry' },
      { name: 'used_in', type: 'VARCHAR(255)', after: 'location' },
      { name: 'work_order', type: 'VARCHAR(255)', after: 'used_in' },
      { name: 'employee_id', type: 'INT', after: 'assigned_to_user_id' },
    ];

    for (const col of equipmentColumns) {
      const exists = await columnExists('equipment', col.name);
      if (!exists) {
        try {
          await connection.query(
            `ALTER TABLE equipment 
             ADD COLUMN ${col.name} ${col.type} ${col.after ? `AFTER ${col.after}` : ''}`
          );
          console.log(`✅ Added column: equipment.${col.name}`);
        } catch (error) {
          console.error(`❌ Error adding ${col.name}:`, error.message);
        }
      } else {
        console.log(`ℹ️  Column already exists: equipment.${col.name}`);
      }
    }

    // Add foreign key for employee_id if it doesn't exist
    try {
      const [fkRows] = await connection.query(
        `SELECT COUNT(*) as count 
         FROM INFORMATION_SCHEMA.KEY_COLUMN_USAGE 
         WHERE TABLE_SCHEMA = ? AND TABLE_NAME = 'equipment' 
         AND CONSTRAINT_NAME = 'fk_equipment_employee'`,
        [config.database]
      );
      
      if (fkRows[0].count === 0) {
        await connection.query(
          `ALTER TABLE equipment 
           ADD CONSTRAINT fk_equipment_employee 
           FOREIGN KEY (employee_id) REFERENCES users(id) ON DELETE SET NULL`
        );
        console.log('✅ Added foreign key: fk_equipment_employee');
      } else {
        console.log('ℹ️  Foreign key already exists: fk_equipment_employee');
      }
    } catch (error) {
      console.log('ℹ️  Foreign key constraint:', error.message);
    }

    console.log('\n✅ Migration completed successfully!');
    console.log('🔄 Please restart your server to apply changes.\n');
    
  } catch (error) {
    console.error('❌ Migration error:', error.message);
    throw error;
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}

// Run migration
addMissingColumns()
  .then(() => {
    console.log('🎉 All done!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('💥 Migration failed:', error);
    process.exit(1);
  });

