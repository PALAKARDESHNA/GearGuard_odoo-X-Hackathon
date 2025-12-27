# Role-Based Access Control (RBAC) - GearGuard

## Overview

GearGuard now implements comprehensive role-based access control with three user roles: **Manager**, **Technician**, and **Employee**.

## User Roles & Permissions

### 👔 Manager
**Full Access** - Can perform all operations

- ✅ View all equipment, teams, requests, users, departments
- ✅ Create, edit, delete equipment
- ✅ Create, edit, delete teams
- ✅ Create, edit, delete maintenance requests
- ✅ Assign technicians to requests
- ✅ View reports and analytics
- ✅ Manage users (create, edit, delete)
- ✅ Manage departments (create, edit, delete)
- ✅ Delete requests

### 🔧 Technician
**Maintenance Operations** - Can manage maintenance work

- ✅ View all equipment, teams, requests
- ✅ View equipment details
- ✅ View teams
- ✅ Create maintenance requests
- ✅ Update maintenance requests (change stage, duration, etc.)
- ✅ Assign themselves or others to requests
- ✅ View calendar
- ❌ Cannot create/edit/delete equipment
- ❌ Cannot create/edit/delete teams
- ❌ Cannot delete requests
- ❌ Cannot view reports
- ❌ Cannot manage users or departments

### 👤 Employee
**Basic Access** - Can create requests and view their work

- ✅ View all equipment, teams, requests
- ✅ View equipment details
- ✅ View teams
- ✅ Create maintenance requests
- ✅ View calendar
- ❌ Cannot update requests (only view)
- ❌ Cannot assign technicians
- ❌ Cannot create/edit/delete equipment
- ❌ Cannot create/edit/delete teams
- ❌ Cannot delete requests
- ❌ Cannot view reports
- ❌ Cannot manage users or departments

## Backend Implementation

### Middleware (`middleware/roles.js`)

```javascript
// Check for specific roles
const isManager = authorize('manager');
const isTechnician = authorize('technician', 'manager');
const isEmployee = authorize('employee', 'technician', 'manager');
const isManagerOrTechnician = authorize('manager', 'technician');
```

### Protected Routes

**Equipment Routes:**
- `GET /api/equipment` - All authenticated users
- `GET /api/equipment/:id` - All authenticated users
- `POST /api/equipment` - Manager only
- `PUT /api/equipment/:id` - Manager only
- `DELETE /api/equipment/:id` - Manager only

**Teams Routes:**
- `GET /api/teams` - All authenticated users
- `GET /api/teams/:id` - All authenticated users
- `POST /api/teams` - Manager only
- `PUT /api/teams/:id` - Manager only
- `DELETE /api/teams/:id` - Manager only

**Requests Routes:**
- `GET /api/requests` - All authenticated users
- `POST /api/requests` - Employee, Technician, Manager
- `PUT /api/requests/:id` - Technician, Manager
- `POST /api/requests/:id/assign` - Technician, Manager
- `DELETE /api/requests/:id` - Manager only
- `GET /api/requests/reports/pivot` - Manager only

**Users Routes:**
- `GET /api/users` - Manager only
- `GET /api/users/:id` - Manager or own profile
- `POST /api/users` - Manager only
- `PUT /api/users/:id` - Manager or own profile (limited)
- `DELETE /api/users/:id` - Manager only

**Departments Routes:**
- `GET /api/departments` - All authenticated users
- `POST /api/departments` - Manager only
- `PUT /api/departments/:id` - Manager only
- `DELETE /api/departments/:id` - Manager only

## Frontend Implementation

### Role Hook (`hooks/useRole.ts`)

Provides easy access to role-based permissions:

```typescript
const {
  isManager,
  isTechnician,
  isEmployee,
  canCreateEquipment,
  canEditEquipment,
  canCreateRequest,
  canUpdateRequest,
  canViewReports,
  // ... etc
} = useRole();
```

### UI Features

1. **Conditional Rendering:**
   - Buttons only show if user has permission
   - Menu items hidden based on role
   - Forms disabled for unauthorized actions

2. **Protected Pages:**
   - Reports page redirects non-managers
   - Equipment edit/delete buttons hidden for non-managers

3. **Drag & Drop:**
   - Only technicians and managers can move requests in Kanban
   - Employees can view but not modify

## Testing Roles

### Create Test Users

1. **Manager:**
   ```bash
   POST /api/auth/register
   {
     "name": "Manager User",
     "email": "manager@test.com",
     "password": "password123",
     "role": "manager"
   }
   ```

2. **Technician:**
   ```bash
   POST /api/auth/register
   {
     "name": "Technician User",
     "email": "tech@test.com",
     "password": "password123",
     "role": "technician"
   }
   ```

3. **Employee:**
   ```bash
   POST /api/auth/register
   {
     "name": "Employee User",
     "email": "employee@test.com",
     "password": "password123",
     "role": "employee"
   }
   ```

## Security Notes

- ✅ All routes require authentication (JWT token)
- ✅ Role checks happen on both frontend and backend
- ✅ Backend validates roles even if frontend is bypassed
- ✅ Users can only view their own profile (unless manager)
- ✅ Password never returned in API responses

## Permission Matrix

| Feature | Employee | Technician | Manager |
|---------|----------|------------|---------|
| View Equipment | ✅ | ✅ | ✅ |
| Create Equipment | ❌ | ❌ | ✅ |
| Edit Equipment | ❌ | ❌ | ✅ |
| Delete Equipment | ❌ | ❌ | ✅ |
| View Teams | ✅ | ✅ | ✅ |
| Manage Teams | ❌ | ❌ | ✅ |
| Create Requests | ✅ | ✅ | ✅ |
| Update Requests | ❌ | ✅ | ✅ |
| Assign Requests | ❌ | ✅ | ✅ |
| Delete Requests | ❌ | ❌ | ✅ |
| View Reports | ❌ | ❌ | ✅ |
| Manage Users | ❌ | ❌ | ✅ |
| Manage Departments | ❌ | ❌ | ✅ |

## Future Enhancements

- [ ] Department-based permissions
- [ ] Custom role creation
- [ ] Permission inheritance
- [ ] Audit logs for role changes
- [ ] Role-based dashboard views

