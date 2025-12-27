# MySQL Setup Guide for GearGuard

## Prerequisites

1. **Install MySQL**
   - Download MySQL from https://dev.mysql.com/downloads/mysql/
   - Install MySQL Server
   - Install MySQL Workbench (optional, for GUI management)

2. **Start MySQL Service**
   - Windows: MySQL should start automatically, or start from Services
   - Verify: `mysql --version` in command prompt

## Configuration

1. **Create `.env` file** in the project root:

```env
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=your_mysql_password
DB_NAME=gearguard
JWT_SECRET=gearguard_secret_key_change_in_production_2024
PORT=5000
```

2. **Create Database** (Option 1 - Command Line):
   ```bash
   mysql -u root -p
   ```
   Then in MySQL prompt:
   ```sql
   CREATE DATABASE gearguard;
   EXIT;
   ```

3. **Create Database** (Option 2 - MySQL Workbench):
   - Open MySQL Workbench
   - Connect to your MySQL server
   - Right-click → Create Schema
   - Name: `gearguard`
   - Click Apply

## Installation

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Start the server:**
   ```bash
   npm start
   ```

   The server will automatically:
   - Connect to MySQL
   - Create the database if it doesn't exist
   - Create all tables
   - Create indexes
   - Seed initial data (departments and teams)

## Verify Setup

1. **Check tables in MySQL Workbench:**
   - Open MySQL Workbench
   - Connect to your server
   - Expand gearguard database → Tables
   - You should see:
     - departments
     - users
     - teams
     - team_members
     - equipment
     - maintenance_requests

2. **Test API:**
   ```bash
   curl http://localhost:5000/api/health
   curl http://localhost:5000/api/auth/test
   ```

## Viewing Data in MySQL Workbench

1. **View tables:**
   - Right-click table → Select Rows - Limit 1000

2. **Query data:**
   ```sql
   USE gearguard;
   SELECT * FROM users;
   SELECT * FROM equipment;
   SELECT * FROM maintenance_requests;
   ```

3. **Monitor activity:**
   - Server Status → Client Connections
   - Performance → Dashboard

## Troubleshooting

### Connection Issues

1. **Check MySQL is running:**
   ```bash
   # Windows
   net start MySQL80
   
   # Or check services
   services.msc → MySQL80
   ```

2. **Verify credentials:**
   ```bash
   mysql -u root -p
   # Enter your password
   ```

3. **Check port:**
   - Default MySQL port is 3306
   - Verify in MySQL Workbench → Server Status

### Authentication Errors

1. **Reset root password** (if needed):
   ```sql
   ALTER USER 'root'@'localhost' IDENTIFIED BY 'new_password';
   FLUSH PRIVILEGES;
   ```

2. **Create new user** (recommended):
   ```sql
   CREATE USER 'gearguard'@'localhost' IDENTIFIED BY 'your_password';
   GRANT ALL PRIVILEGES ON gearguard.* TO 'gearguard'@'localhost';
   FLUSH PRIVILEGES;
   ```
   
   Then update `.env`:
   ```env
   DB_USER=gearguard
   DB_PASSWORD=your_password
   ```

### Database Not Found

1. **Create database manually:**
   ```sql
   CREATE DATABASE gearguard CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
   ```

2. **Check database name:**
   - Ensure DB_NAME in .env matches actual database name

## Security Notes

- Change default root password
- Create dedicated database user
- Use strong passwords
- Don't commit .env file to git
- Use environment variables in production

## MySQL Features Used

- **InnoDB Engine**: For foreign keys and transactions
- **UTF8MB4**: Full Unicode support
- **AUTO_INCREMENT**: For primary keys
- **ENUM**: For constrained values (stage, priority, request_type)
- **Foreign Keys**: For referential integrity
- **Indexes**: For performance optimization

## Connection String Format

```
Host: DB_HOST
Port: DB_PORT
User: DB_USER
Password: DB_PASSWORD
Database: DB_NAME
```

## All Routes Updated

✅ `routes/auth.js` - MySQL
✅ `routes/equipment.js` - MySQL
✅ `routes/teams.js` - MySQL
✅ `routes/requests.js` - MySQL
✅ `routes/users.js` - MySQL
✅ `routes/departments.js` - MySQL

All routes now use async/await with mysql2 promise-based API!

