# 🔄 GearGuard Workflow Steps

## Overview
GearGuard follows a structured workflow for equipment maintenance management with role-based access control.

---

## 📋 Main Workflows

### 1. Equipment Registration Workflow (Manager Only)

```
Step 1: Manager logs in
   ↓
Step 2: Navigate to Equipment → Add Equipment
   ↓
Step 3: Fill equipment details:
   - Name, Component, Serial Number
   - Category, Company, Used By
   - Maintenance Type
   - Purchase Date, Assigned Date
   - Department, Location
   - Maintenance Team (Required)
   - Default Technician
   - Work Order, Used In
   ↓
Step 4: Save Equipment
   ↓
Step 5: Equipment appears in Equipment List
   ↓
Step 6: System tracks equipment status
```

**Key Points:**
- Only Managers can create/edit/delete equipment
- Equipment must be assigned to a maintenance team
- Default technician can be pre-assigned
- Work centers can be linked for cost tracking

---

### 2. Maintenance Request Creation Workflow (All Users)

```
Step 1: User logs in (Employee/Technician/Manager)
   ↓
Step 2: Navigate to Equipment or Kanban Board
   ↓
Step 3: Click "Create Request" or "New Request"
   ↓
Step 4: Fill request form:
   - Subject (Required)
   - Description
   - Request Type: Corrective or Preventive
   - Equipment (Required)
   - Priority: Low/Medium/High/Urgent
   - Scheduled Date (for Preventive)
   - Work Center (Optional)
   - Workplace (if no work center)
   ↓
Step 5: System Auto-Fills:
   - Maintenance Team (from equipment)
   - Default Technician (from equipment)
   ↓
Step 6: Submit Request
   ↓
Step 7: Request appears in Kanban as "New"
```

**Key Points:**
- All authenticated users can create requests
- Auto-fill reduces errors and speeds up creation
- Work center selection enables cost tracking
- Conditional logic: Work center OR workplace field

---

### 3. Request Processing Workflow (Technician/Manager)

```
Step 1: Technician/Manager logs in
   ↓
Step 2: Navigate to Kanban Board
   ↓
Step 3: View requests in "New" column
   ↓
Step 4: Click on request card to see details:
   - Equipment information
   - Priority and type
   - Description
   - Assigned technician
   ↓
Step 5: Assign Technician (if not assigned)
   ↓
Step 6: Drag request to "In Progress"
   ↓
Step 7: Work on maintenance task
   ↓
Step 8: Update request:
   - Add duration hours
   - Update status
   - Add notes
   ↓
Step 9: Move to "Repaired" when complete
   OR
   Move to "Scrap" if equipment is beyond repair
   ↓
Step 10: System automatically:
   - Sets completed_at timestamp
   - Updates equipment status (if Scrap)
   - Calculates cost (if work center used)
```

**Key Points:**
- Only Technicians and Managers can update requests
- Employees can view but not modify
- Drag-and-drop makes status updates quick
- System tracks duration and cost automatically

---

### 4. Preventive Maintenance Workflow (Manager/Technician)

```
Step 1: Manager/Technician navigates to Calendar
   ↓
Step 2: View scheduled preventive maintenance
   ↓
Step 3: Click on calendar date to create request
   OR
   Click "Schedule Maintenance" button
   ↓
Step 4: Fill form with:
   - Request Type: Preventive
   - Equipment
   - Scheduled Date
   - Maintenance Type
   ↓
Step 5: Submit
   ↓
Step 6: Request appears on calendar
   ↓
Step 7: On scheduled date:
   - Request visible in Kanban
   - Technician can start work
   - Follow normal processing workflow
```

**Key Points:**
- Calendar view for visual scheduling
- Preventive requests have scheduled dates
- Helps plan maintenance in advance
- Reduces unexpected breakdowns

---

### 5. Reporting Workflow (Manager Only)

```
Step 1: Manager logs in
   ↓
Step 2: Navigate to Reports
   ↓
Step 3: View different report types:
   
   a) Pivot Reports:
      - By Team: Shows requests per team
      - By Category: Shows requests per equipment category
      - Breakdown by stage (New, In Progress, Repaired, Scrap)
   
   b) Duration Report:
      - Work Center analysis
      - Duration in hours
      - Cost tracking
      - Performance metrics
   ↓
Step 4: Analyze data:
   - Identify frequently failing equipment
   - Track team performance
   - Monitor costs
   - Plan preventive maintenance
   ↓
Step 5: Make data-driven decisions
```

**Key Points:**
- Only Managers can access reports
- Multiple report types available
- Visual charts and tables
- Export capabilities (can be added)

---

### 6. Team Management Workflow (Manager Only)

```
Step 1: Manager logs in
   ↓
Step 2: Navigate to Teams
   ↓
Step 3: Create Team:
   - Team Name
   - Description
   ↓
Step 4: Add Team Members:
   - Select users (technicians)
   - Add multiple members
   ↓
Step 5: Save Team
   ↓
Step 6: Team available for:
   - Equipment assignment
   - Request routing
   - Performance tracking
```

**Key Points:**
- Teams group technicians by specialty
- Equipment assigned to teams
- Requests auto-routed to team
- Team performance in reports

---

### 7. User Management Workflow (Manager Only)

```
Step 1: Manager logs in
   ↓
Step 2: Navigate to Users (if available)
   ↓
Step 3: Create User:
   - Name, Email
   - Role: Manager/Technician/Employee
   - Department
   ↓
Step 4: User receives credentials
   ↓
Step 5: User can:
   - Register themselves (if allowed)
   - Login with credentials
   - Access features based on role
```

**Key Points:**
- Managers control user access
- Role determines permissions
- Self-registration can be enabled
- Department-based organization

---

## 🔐 Role-Based Access Matrix

### Manager 👔
- ✅ All CRUD operations
- ✅ View all reports
- ✅ Manage users and teams
- ✅ Delete requests
- ✅ Full system access

### Technician 🔧
- ✅ View equipment and teams
- ✅ Create requests
- ✅ Update requests (drag & drop)
- ✅ Assign technicians
- ❌ Cannot manage equipment/teams
- ❌ Cannot view reports

### Employee 👤
- ✅ View equipment and teams
- ✅ Create requests
- ✅ View calendar
- ❌ Cannot update requests
- ❌ Cannot assign technicians
- ❌ Cannot manage resources

---

## 🔄 Request Lifecycle

```
[New]
  ↓ (Technician assigns & starts)
[In Progress]
  ↓ (Work completed)
[Repaired] ✅
  OR
  ↓ (Equipment beyond repair)
[Scrap] ❌
```

**Status Transitions:**
- New → In Progress: When technician starts work
- In Progress → Repaired: When maintenance successful
- In Progress → Scrap: When equipment cannot be repaired
- Any → Scrap: Marks equipment as unusable

---

## 📊 Data Flow

```
User Action
   ↓
Frontend (React)
   ↓
API Request (Axios)
   ↓
Backend (Express.js)
   ↓
Authentication Check (JWT)
   ↓
Role Authorization (RBAC)
   ↓
Database Query (MySQL)
   ↓
Response
   ↓
Frontend Update
```

---

## 🎯 Key Workflow Features

1. **Auto-Fill Logic**: Reduces manual entry errors
2. **Drag & Drop**: Intuitive status updates
3. **Real-time Updates**: Immediate visibility
4. **Role-Based UI**: Users see only what they can do
5. **Cost Tracking**: Work center integration
6. **Overdue Detection**: Automatic flagging
7. **Calendar Integration**: Visual scheduling
8. **Comprehensive Reports**: Data-driven insights

---

## 💡 Best Practices

1. **Equipment Setup**: Complete all fields for better tracking
2. **Request Details**: Provide clear descriptions
3. **Status Updates**: Keep requests current
4. **Team Assignment**: Assign appropriate teams
5. **Regular Reports**: Review weekly/monthly
6. **Preventive Maintenance**: Schedule proactively
7. **Cost Tracking**: Use work centers consistently

---

## 🚀 Quick Start Workflow

**For New Users:**
1. Manager creates teams
2. Manager adds equipment
3. Manager creates users
4. Employees create requests
5. Technicians process requests
6. Manager reviews reports

**For Daily Operations:**
1. Employees report issues → Create requests
2. Technicians work on requests → Update status
3. Manager monitors → Reviews reports
4. Preventive maintenance → Scheduled on calendar

