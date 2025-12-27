# Role-Based Access Control Summary

## Quick Reference

### Manager 👔
**Full System Access**
- ✅ All CRUD operations on Equipment, Teams, Users, Departments
- ✅ Create, update, delete maintenance requests
- ✅ Assign technicians
- ✅ View reports and analytics
- ✅ Manage all users

### Technician 🔧
**Maintenance Operations**
- ✅ View all equipment and teams
- ✅ Create maintenance requests
- ✅ Update maintenance requests (drag & drop in Kanban)
- ✅ Assign technicians to requests
- ✅ View calendar
- ❌ Cannot manage equipment, teams, or users
- ❌ Cannot view reports

### Employee 👤
**Basic User**
- ✅ View all equipment and teams
- ✅ Create maintenance requests
- ✅ View calendar
- ❌ Cannot update requests (view-only in Kanban)
- ❌ Cannot assign technicians
- ❌ Cannot manage any resources

## Backend Protection

All routes are protected with:
1. **Authentication** - JWT token required
2. **Authorization** - Role-based middleware checks

## Frontend Protection

1. **Conditional Rendering** - Buttons/actions hidden based on role
2. **Protected Routes** - Reports page redirects non-managers
3. **Disabled Actions** - Drag & drop disabled for employees
4. **Role Hook** - Easy permission checks with `useRole()`

## Testing

Login with different roles to see different features:
- Manager: Full access to everything
- Technician: Can work on requests but not manage resources
- Employee: Can only create requests and view data

