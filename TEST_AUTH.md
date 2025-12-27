# Testing Authentication API

## Start the Server

```bash
npm start
```

## Test Endpoints

### 1. Test Route (GET)
```bash
curl http://localhost:5000/api/auth/test
```
Should return: `{"message":"Auth route is working!"}`

### 2. Register User (POST)
```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"name":"Test User","email":"test@example.com","password":"password123"}'
```

### 3. Login (POST)
```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password123"}'
```

### 4. Get Current User (GET - requires token)
```bash
curl http://localhost:5000/api/auth/me \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

## PowerShell Commands

### Test Route
```powershell
Invoke-WebRequest -Uri 'http://localhost:5000/api/auth/test' -Method GET
```

### Register
```powershell
$body = @{name='Test User';email='test@example.com';password='password123'} | ConvertTo-Json
Invoke-WebRequest -Uri 'http://localhost:5000/api/auth/register' -Method POST -Body $body -ContentType 'application/json'
```

### Login
```powershell
$body = @{email='test@example.com';password='password123'} | ConvertTo-Json
Invoke-WebRequest -Uri 'http://localhost:5000/api/auth/login' -Method POST -Body $body -ContentType 'application/json'
```

