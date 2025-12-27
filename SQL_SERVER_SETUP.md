# SQL Server Setup Guide for GearGuard

## Prerequisites

1. **Install SQL Server**
   - Download and install SQL Server Express or Full Edition
   - Download SQL Server Management Studio (SSMS)

2. **Create Database**
   - Open SSMS
   - Connect to your SQL Server instance
   - Create a new database named `GearGuard`

## Configuration

1. **Create `.env` file** in the project root:

```env
DB_SERVER=localhost
DB_PORT=1433
DB_USER=sa
DB_PASSWORD=YourPassword123
DB_NAME=GearGuard
DB_ENCRYPT=false
DB_TRUST_CERT=true
JWT_SECRET=your_secret_key_here
PORT=5000
```

2. **Update SQL Server Authentication**
   - Open SSMS
   - Right-click on server → Properties → Security
   - Enable "SQL Server and Windows Authentication mode"
   - Restart SQL Server service

3. **Create Login and User** (Optional but recommended):
   ```sql
   -- Create login
   CREATE LOGIN gearguard_user WITH PASSWORD = 'YourPassword123';
   
   -- Use GearGuard database
   USE GearGuard;
   
   -- Create user
   CREATE USER gearguard_user FOR LOGIN gearguard_user;
   
   -- Grant permissions
   ALTER ROLE db_owner ADD MEMBER gearguard_user;
   ```

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
   - Connect to SQL Server
   - Create all tables
   - Create indexes
   - Seed initial data (departments and teams)

## Verify Setup

1. **Check tables in SSMS:**
   - Open SSMS
   - Connect to your server
   - Expand Databases → GearGuard → Tables
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
   ```

## Connection String Format

The connection uses the following format:
```
Server: DB_SERVER:DB_PORT
Database: DB_NAME
User: DB_USER
Password: DB_PASSWORD
```

## Troubleshooting

### Connection Issues

1. **Enable TCP/IP:**
   - Open SQL Server Configuration Manager
   - SQL Server Network Configuration → Protocols for [Instance]
   - Enable TCP/IP
   - Restart SQL Server service

2. **Check Firewall:**
   - Allow port 1433 through Windows Firewall

3. **Verify Connection:**
   ```sql
   -- Test connection in SSMS
   SELECT @@VERSION;
   ```

### Authentication Errors

1. **Check SQL Server Authentication:**
   - Server Properties → Security → Enable SQL Server Authentication

2. **Verify Credentials:**
   - Test login in SSMS with the same credentials

### Database Not Found

1. **Create Database:**
   ```sql
   CREATE DATABASE GearGuard;
   ```

2. **Check Database Name:**
   - Ensure DB_NAME in .env matches the actual database name

## Security Notes

- Change default passwords in production
- Use Windows Authentication if possible
- Enable encryption for production
- Set DB_TRUST_CERT=false in production
- Use strong JWT_SECRET

## Viewing Data in SSMS

After running the application, you can:

1. **View all tables:**
   - Expand Tables folder in SSMS
   - Right-click table → Select Top 1000 Rows

2. **Query data:**
   ```sql
   SELECT * FROM users;
   SELECT * FROM equipment;
   SELECT * FROM maintenance_requests;
   ```

3. **Monitor activity:**
   - View → Object Explorer Details
   - Check table sizes and row counts

