const mysql = require('mysql2/promise');
const dotenv = require('dotenv');

dotenv.config();

// MySQL configuration
const config = {
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '3306'),
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || 'sagar123',
  database: process.env.DB_NAME || 'gearguard',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  enableKeepAlive: true,
  keepAliveInitialDelay: 0,
};

let pool = null;

const initDatabase = async () => {
  try {
    console.log("DB_PASSWORD =", process.env.DB_PASSWORD);

    // First, create database if it doesn't exist
    const tempConfig = { ...config };
    delete tempConfig.database;
    const tempConnection = await mysql.createConnection(tempConfig);
    
    await tempConnection.query(`CREATE DATABASE IF NOT EXISTS ${config.database}`);
    await tempConnection.end();
    
    // Create connection pool
    pool = mysql.createPool(config);
    console.log('✅ Connected to MySQL database');

    // Create tables
    await createTables();
    console.log('✅ Database tables created');

    // Seed initial data
    await seedInitialData();
    console.log('✅ Initial data seeded');

    return pool;
  } catch (err) {
    console.error('Database initialization error:', err);
    throw err;
  }
};

const createTables = async () => {
  const queries = [
    // Departments table
    `CREATE TABLE IF NOT EXISTS departments (
      id INT AUTO_INCREMENT PRIMARY KEY,
      name VARCHAR(255) NOT NULL UNIQUE,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci`,

    // Users/Employees table
    `CREATE TABLE IF NOT EXISTS users (
      id INT AUTO_INCREMENT PRIMARY KEY,
      name VARCHAR(255) NOT NULL,
      email VARCHAR(255) UNIQUE NOT NULL,
      password VARCHAR(255) NOT NULL,
      role VARCHAR(50) DEFAULT 'employee',
      department_id INT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (department_id) REFERENCES departments(id) ON DELETE SET NULL
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci`,

    // Maintenance Teams table
    `CREATE TABLE IF NOT EXISTS teams (
      id INT AUTO_INCREMENT PRIMARY KEY,
      name VARCHAR(255) NOT NULL UNIQUE,
      description TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci`,

    // Team Members (junction table)
    `CREATE TABLE IF NOT EXISTS team_members (
      id INT AUTO_INCREMENT PRIMARY KEY,
      team_id INT NOT NULL,
      user_id INT NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (team_id) REFERENCES teams(id) ON DELETE CASCADE,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
      UNIQUE KEY unique_team_user (team_id, user_id)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci`,

    // Equipment Categories table
    `CREATE TABLE IF NOT EXISTS equipment_categories (
      id INT AUTO_INCREMENT PRIMARY KEY,
      name VARCHAR(255) NOT NULL UNIQUE,
      description TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci`,

    // Work Centers table
    `CREATE TABLE IF NOT EXISTS work_centers (
      id INT AUTO_INCREMENT PRIMARY KEY,
      name VARCHAR(255) NOT NULL UNIQUE,
      cost DECIMAL(10, 2) DEFAULT 0,
      qty INT DEFAULT 0,
      alternative_information TEXT,
      cost_per_hour DECIMAL(10, 2) DEFAULT 0,
      capacity_unit VARCHAR(50),
      capacity_period VARCHAR(50),
      cost_target DECIMAL(10, 2) DEFAULT 0,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci`,

    // Equipment table (with all fields from architecture)
    `CREATE TABLE IF NOT EXISTS equipment (
      id INT AUTO_INCREMENT PRIMARY KEY,
      name VARCHAR(255) NOT NULL,
      component VARCHAR(255),
      serial_number VARCHAR(255) UNIQUE,
      category VARCHAR(255),
      company VARCHAR(255),
      used_by VARCHAR(255),
      maintenance_type VARCHAR(100),
      purchase_date DATE,
      warranty_expiry DATE,
      assigned_date DATE,
      location VARCHAR(255),
      used_in VARCHAR(255),
      work_order VARCHAR(255),
      department_id INT,
      assigned_to_user_id INT,
      employee_id INT,
      maintenance_team_id INT NOT NULL,
      default_technician_id INT,
      status VARCHAR(50) DEFAULT 'active',
      notes TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      FOREIGN KEY (department_id) REFERENCES departments(id) ON DELETE SET NULL,
      FOREIGN KEY (assigned_to_user_id) REFERENCES users(id) ON DELETE SET NULL,
      FOREIGN KEY (employee_id) REFERENCES users(id) ON DELETE SET NULL,
      FOREIGN KEY (maintenance_team_id) REFERENCES teams(id),
      FOREIGN KEY (default_technician_id) REFERENCES users(id) ON DELETE SET NULL
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci`,

    // Maintenance Requests table (updated with work_center_id and additional fields)
    `CREATE TABLE IF NOT EXISTS maintenance_requests (
      id INT AUTO_INCREMENT PRIMARY KEY,
      subject VARCHAR(255) NOT NULL,
      description TEXT,
      request_type ENUM('Corrective', 'Preventive') NOT NULL,
      maintenance_type VARCHAR(100),
      equipment_id INT NOT NULL,
      maintenance_team_id INT NOT NULL,
      assigned_technician_id INT,
      work_center_id INT,
      workplace VARCHAR(255),
      scheduled_date DATE,
      start_date DATE,
      end_date DATE,
      duration_hours DECIMAL(10,2),
      cost DECIMAL(10,2),
      stage ENUM('New', 'In Progress', 'Repaired', 'Scrap') DEFAULT 'New',
      status VARCHAR(50) DEFAULT 'Open',
      priority ENUM('Low', 'Medium', 'High', 'Urgent') DEFAULT 'Medium',
      is_overdue BOOLEAN DEFAULT FALSE,
      created_by_user_id INT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      completed_at DATETIME,
      FOREIGN KEY (equipment_id) REFERENCES equipment(id),
      FOREIGN KEY (maintenance_team_id) REFERENCES teams(id),
      FOREIGN KEY (assigned_technician_id) REFERENCES users(id) ON DELETE SET NULL,
      FOREIGN KEY (work_center_id) REFERENCES work_centers(id) ON DELETE SET NULL,
      FOREIGN KEY (created_by_user_id) REFERENCES users(id) ON DELETE SET NULL
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci`,

    // Create indexes
    `CREATE INDEX IF NOT EXISTS idx_equipment_department ON equipment(department_id)`,
    `CREATE INDEX IF NOT EXISTS idx_equipment_user ON equipment(assigned_to_user_id)`,
    `CREATE INDEX IF NOT EXISTS idx_equipment_employee ON equipment(employee_id)`,
    `CREATE INDEX IF NOT EXISTS idx_requests_equipment ON maintenance_requests(equipment_id)`,
    `CREATE INDEX IF NOT EXISTS idx_requests_team ON maintenance_requests(maintenance_team_id)`,
    `CREATE INDEX IF NOT EXISTS idx_requests_stage ON maintenance_requests(stage)`,
    `CREATE INDEX IF NOT EXISTS idx_requests_scheduled ON maintenance_requests(scheduled_date)`,
    `CREATE INDEX IF NOT EXISTS idx_requests_work_center ON maintenance_requests(work_center_id)`,
  ];

  // Execute queries sequentially
  for (const query of queries) {
    try {
      await pool.query(query);
    } catch (err) {
      // Ignore errors for existing objects
      if (!err.message.includes('already exists') && !err.message.includes('Duplicate')) {
        console.error('Error creating table/index:', err.message);
      }
    }
  }
};

const seedInitialData = async () => {
  try {
    // Check if data already exists
    const [rows] = await pool.query('SELECT COUNT(*) as count FROM departments');
    if (rows[0].count > 0) {
      return; // Data already seeded
    }

    // Insert departments
    await pool.query(`
      INSERT INTO departments (name) VALUES 
        ('Production'), ('IT'), ('Maintenance'), ('Administration'), ('Logistics')
    `);

    // Insert teams
    await pool.query(`
      INSERT INTO teams (name, description) VALUES 
        ('Mechanics', 'Mechanical maintenance team'),
        ('Electricians', 'Electrical maintenance team'),
        ('IT Support', 'IT equipment support team'),
        ('General Maintenance', 'General maintenance tasks')
    `);

    // Insert equipment categories
    await pool.query(`
      INSERT INTO equipment_categories (name, description) VALUES 
        ('Motors', 'Electric motors and motorized equipment'),
        ('Robots', 'Robotic systems and automation equipment'),
        ('Databases', 'Database servers and storage systems'),
        ('Sensors', 'Sensor equipment and monitoring devices')
    `);

    // Insert sample work centers
    await pool.query(`
      INSERT INTO work_centers (name, cost, qty, cost_per_hour, capacity_unit, capacity_period, cost_target) VALUES 
        ('Assembly 1', 1000.00, 5, 50.00, 'units', 'day', 800.00),
        ('Ball 1', 800.00, 3, 40.00, 'units', 'day', 600.00)
    `);

    console.log('✅ Sample data seeded (departments, teams, categories, and work centers)');
  } catch (err) {
    // Ignore duplicate key errors
    if (!err.message.includes('Duplicate') && !err.message.includes('UNIQUE')) {
      console.error('Error seeding data:', err.message);
    }
  }
};

const getDatabase = () => {
  if (!pool) {
    throw new Error('Database not initialized. Call initDatabase() first.');
  }
  return pool;
};

const closeDatabase = async () => {
  try {
    if (pool) {
      await pool.end();
      console.log('Database connection closed');
    }
  } catch (err) {
    console.error('Error closing database:', err);
  }
};

module.exports = {
  initDatabase,
  getDatabase,
  closeDatabase,
};
