# Authentication System - GearGuard

## Overview

Complete authentication system has been added to GearGuard with login, signup, and protected routes.

## Backend Changes

### 1. Database Schema Update
- **Users table** now includes `password` field (hashed with bcrypt)
- Password is required and stored securely

### 2. Authentication Routes (`routes/auth.js`)
- `POST /api/auth/register` - Register new user
  - Requires: name, email, password
  - Optional: role, department_id
  - Returns: JWT token and user data
  
- `POST /api/auth/login` - Login user
  - Requires: email, password
  - Returns: JWT token and user data
  
- `GET /api/auth/me` - Get current user (protected)
  - Requires: Bearer token in Authorization header
  - Returns: Current user information

### 3. Authentication Middleware (`middleware/auth.js`)
- `authenticateToken` - JWT verification middleware
- Can be used to protect any route

### 4. JWT Configuration
- Uses `jsonwebtoken` library
- Token expires in 7 days
- Secret key: Set via `JWT_SECRET` environment variable (default provided)

## Frontend Changes

### 1. Authentication Context (`context/AuthContext.tsx`)
- Provides global authentication state
- Methods: `login`, `register`, `logout`
- Stores token and user in localStorage
- Auto-verifies token on app load

### 2. Login Page (`pages/Login.tsx`)
- Email and password fields
- "Forgot password?" link (placeholder)
- Link to signup page
- Redirects to dashboard on success

### 3. Sign Up Page (`pages/SignUp.tsx`)
- Name, email, password, confirm password fields
- Role selection (Employee, Technician, Manager)
- Password validation
- Link to login page
- Redirects to dashboard on success

### 4. Protected Routes
- All main routes are now protected
- Unauthenticated users redirected to `/login`
- Authenticated users redirected from login/signup to dashboard

### 5. Updated Navbar
- Shows user avatar with first letter of name
- User menu with name, email, and logout option
- Role chip display
- Logout functionality

### 6. API Integration
- Axios interceptor adds JWT token to all requests
- Token stored in localStorage
- Automatic token refresh on app load

## Usage

### Registering a New User

1. Navigate to `/signup`
2. Fill in:
   - Name
   - Email
   - Password (min 6 characters)
   - Confirm Password
   - Role (optional)
3. Click "Sign Up"
4. Automatically logged in and redirected to dashboard

### Logging In

1. Navigate to `/login`
2. Enter email and password
3. Click "Sign In"
4. Redirected to dashboard

### Logging Out

1. Click on user avatar in navbar
2. Click "Logout" in dropdown menu
3. Redirected to login page

## Security Features

- ✅ Passwords hashed with bcrypt (10 salt rounds)
- ✅ JWT tokens with expiration
- ✅ Protected routes require authentication
- ✅ Token stored securely in localStorage
- ✅ Automatic token verification
- ✅ Password validation (min 6 characters)

## Environment Variables

Create a `.env` file in the root directory:

```env
JWT_SECRET=your_super_secret_key_here_change_in_production
PORT=5000
```

## Testing

### Create Test User
1. Start backend: `npm start`
2. Start frontend: `cd frontend && npm start`
3. Navigate to `http://localhost:3000/signup`
4. Create an account
5. You'll be automatically logged in

### Test Protected Routes
1. Try accessing `/equipment` without logging in
2. Should redirect to `/login`
3. After login, can access all routes

## Notes

- Existing users in database need to register again (password field added)
- Forgot password functionality is placeholder (can be implemented later)
- Token expires after 7 days (user needs to login again)
- All API requests automatically include JWT token

## Future Enhancements

- [ ] Password reset functionality
- [ ] Email verification
- [ ] Remember me option
- [ ] Refresh token mechanism
- [ ] Role-based access control (RBAC)
- [ ] Session management

