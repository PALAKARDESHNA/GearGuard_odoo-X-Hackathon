# Setting Up MySQL Password for GearGuard

## The Error
```
Access denied for user 'root'@'localhost' (using password: NO)
```

This means MySQL requires a password but the `.env` file doesn't have one set.

## Solution Options

### Option 1: Set MySQL Root Password (Recommended)

1. **Open MySQL Command Line:**
   ```bash
   mysql -u root
   ```

2. **Set password:**
   ```sql
   ALTER USER 'root'@'localhost' IDENTIFIED BY 'YourPassword123';
   FLUSH PRIVILEGES;
   EXIT;
   ```

3. **Update `.env` file:**
   ```env
   DB_PASSWORD=YourPassword123
   ```

### Option 2: Create New MySQL User (More Secure)

1. **Login to MySQL:**
   ```bash
   mysql -u root -p
   ```

2. **Create user and database:**
   ```sql
   CREATE DATABASE gearguard;
   CREATE USER 'gearguard'@'localhost' IDENTIFIED BY 'YourPassword123';
   GRANT ALL PRIVILEGES ON gearguard.* TO 'gearguard'@'localhost';
   FLUSH PRIVILEGES;
   EXIT;
   ```

3. **Update `.env` file:**
   ```env
   DB_USER=gearguard
   DB_PASSWORD=YourPassword123
   DB_NAME=gearguard
   ```

### Option 3: If MySQL Has No Password (Not Recommended)

If your MySQL installation has no password for root:

1. **Update `.env` file:**
   ```env
   DB_PASSWORD=
   ```
   (Leave it empty)

2. **Or remove the password line entirely**

## Quick Fix Steps

1. **Edit `.env` file** in the project root
2. **Add your MySQL password:**
   ```env
   DB_PASSWORD=your_actual_mysql_password
   ```

3. **Save the file**

4. **Restart the server:**
   ```bash
   npm start
   ```

## Verify MySQL Connection

Test your MySQL connection manually:

```bash
mysql -u root -p
# Enter your password when prompted
```

If this works, use the same password in `.env`.

## Common Issues

### "Access denied" even with correct password
- Check if MySQL service is running
- Verify the username is correct
- Try creating a new user (Option 2)

### "Can't connect to MySQL server"
- Start MySQL service:
  ```bash
  # Windows
  net start MySQL80
  # Or check Services panel
  ```

### Forgot MySQL root password
- Follow MySQL password reset procedure for your OS
- Or create a new user (Option 2)

## After Setting Password

1. Update `.env` with your password
2. Run: `npm start`
3. Server should connect successfully!

