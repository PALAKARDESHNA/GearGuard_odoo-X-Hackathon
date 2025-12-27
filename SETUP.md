# GearGuard - Complete Setup Guide

## Prerequisites

- Node.js (v14 or higher)
- npm or yarn

## Backend Setup

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Initialize database:**
   ```bash
   npm run init-db
   ```
   This will create the SQLite database with all tables and seed initial data.

3. **Start the server:**
   ```bash
   npm start
   ```
   Or for development with auto-reload:
   ```bash
   npm run dev
   ```

   The backend API will be available at `http://localhost:5000`

## Frontend Setup

1. **Navigate to frontend directory:**
   ```bash
   cd frontend
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Start the development server:**
   ```bash
   npm start
   ```

   The frontend will be available at `http://localhost:3000`

## API Endpoints

### Equipment
- `GET /api/equipment` - List all equipment
- `GET /api/equipment/:id` - Get equipment details
- `GET /api/equipment/:id/requests` - Get requests for equipment (smart button)
- `POST /api/equipment` - Create equipment
- `PUT /api/equipment/:id` - Update equipment
- `DELETE /api/equipment/:id` - Delete equipment

### Teams
- `GET /api/teams` - List all teams
- `GET /api/teams/:id` - Get team details
- `POST /api/teams` - Create team
- `PUT /api/teams/:id` - Update team
- `POST /api/teams/:id/members` - Add member to team
- `DELETE /api/teams/:id/members/:userId` - Remove member from team

### Maintenance Requests
- `GET /api/requests` - List all requests (supports filters: equipment_id, team_id, stage, request_type)
- `GET /api/requests/calendar` - Get preventive requests for calendar
- `GET /api/requests/:id` - Get request details
- `POST /api/requests` - Create request (auto-fills team from equipment)
- `PUT /api/requests/:id` - Update request
- `POST /api/requests/:id/assign` - Assign technician
- `GET /api/requests/reports/pivot?group_by=team` - Get pivot report by team
- `GET /api/requests/reports/pivot?group_by=equipment_category` - Get pivot report by category

### Users & Departments
- `GET /api/users` - List all users
- `GET /api/departments` - List all departments

## Features Implemented

✅ **Equipment Management**
- Track equipment with serial numbers, categories, locations
- Assign to departments and employees
- Link to maintenance teams
- Smart button showing open requests count

✅ **Maintenance Teams**
- Create specialized teams (Mechanics, Electricians, IT Support)
- Assign technicians to teams
- Team-based request assignment

✅ **Maintenance Requests**
- Corrective (Breakdown) and Preventive (Routine) types
- Auto-fill team and technician from equipment
- Stage workflow: New → In Progress → Repaired/Scrap
- Overdue detection
- Duration tracking

✅ **Kanban Board**
- Drag & drop between stages
- Visual indicators for overdue requests
- Technician avatars
- Priority and type badges

✅ **Calendar View**
- Display preventive maintenance
- Click to schedule new requests
- Color-coded by stage

✅ **Reports**
- Pivot reports by team or equipment category
- Bar charts showing request distribution
- Summary statistics

✅ **Smart Features**
- Auto-fill logic when creating requests
- Equipment smart button with request count
- Scrap logic marks equipment as unusable
- Overdue detection

## Database Schema

The system uses SQLite with the following tables:
- `departments` - Company departments
- `users` - Employees/Technicians/Managers
- `teams` - Maintenance teams
- `team_members` - Team membership (junction table)
- `equipment` - Company assets
- `maintenance_requests` - Maintenance work orders

## Troubleshooting

### Backend Issues
- Make sure port 5000 is not in use
- Check that the `data` directory is writable
- Verify database file is created in `data/gearguard.db`

### Frontend Issues
- Make sure backend is running on port 5000
- Check `.env` file has `REACT_APP_API_URL=http://localhost:5000/api`
- Clear browser cache if seeing old data

### Database Issues
- Delete `data/gearguard.db` and run `npm run init-db` to reset
- Check console for SQL errors

## Production Deployment

1. Build frontend:
   ```bash
   cd frontend
   npm run build
   ```

2. Serve frontend build folder with a static server or integrate with backend

3. For production, consider switching to PostgreSQL or MySQL:
   - Update `config/database.js` to use the production database
   - Update connection strings in environment variables

## License

ISC

