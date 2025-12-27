# Migration to SQL Server - Complete Guide

## Steps Completed

✅ Updated `package.json` - Replaced `sqlite3` with `mssql`
✅ Updated `config/database.js` - Complete SQL Server implementation
✅ Updated `routes/auth.js` - SQL Server queries
✅ Created `.env.example` - SQL Server configuration template
✅ Created `SQL_SERVER_SETUP.md` - Setup instructions

## Next Steps

You need to:

1. **Install the new package:**
   ```bash
   npm install
   ```

2. **Create `.env` file** with your SQL Server credentials:
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

3. **Create the database in SSMS:**
   - Open SQL Server Management Studio
   - Connect to your server
   - Right-click "Databases" → New Database
   - Name it "GearGuard"
   - Click OK

4. **Start the server:**
   ```bash
   npm start
   ```

   The server will automatically create all tables!

## Remaining Route Updates

The following routes still need to be updated to use SQL Server:
- `routes/equipment.js`
- `routes/teams.js`
- `routes/requests.js`
- `routes/users.js`
- `routes/departments.js`

These will be updated in the next step. For now, the authentication should work!

## Testing

1. Test the connection:
   ```bash
   curl http://localhost:5000/api/auth/test
   ```

2. Register a user:
   ```bash
   curl -X POST http://localhost:5000/api/auth/register \
     -H "Content-Type: application/json" \
     -d '{"name":"Test User","email":"test@test.com","password":"test123"}'
   ```

3. Check in SSMS:
   - Open SSMS
   - Navigate to GearGuard database → Tables
   - Right-click "users" → Select Top 1000 Rows
   - You should see your registered user!

