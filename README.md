# GearGuard - The Ultimate Maintenance Tracker 🛠️

A comprehensive, hackathon-winning maintenance management system that seamlessly connects Equipment, Teams, and Requests for efficient asset maintenance tracking.

## 🎯 Key Features

### ✅ Equipment Management
- Track all company assets (machines, vehicles, computers)
- Department and employee assignment
- Maintenance team linkage
- **Smart Button**: View all requests for specific equipment with badge count
- Warranty and purchase date tracking

### ✅ Maintenance Teams
- Create specialized teams (Mechanics, Electricians, IT Support)
- Assign technicians to teams
- Team-based workflow logic

### ✅ Maintenance Requests
- **Corrective**: Unplanned breakdown repairs
- **Preventive**: Scheduled routine maintenance
- **Auto-Fill Logic**: Automatically fetches team and technician from equipment
- Stage workflow: New → In Progress → Repaired/Scrap
- Overdue detection and visual indicators
- Duration tracking

### ✅ Kanban Board
- Drag & drop between stages
- Visual indicators for overdue requests (red border)
- Technician avatars
- Priority and type badges
- Real-time stage updates

### ✅ Calendar View
- Display all preventive maintenance requests
- Click any date to schedule new maintenance
- Color-coded by stage and overdue status

### ✅ Reports & Analytics
- Pivot reports by Team or Equipment Category
- Bar charts with request distribution
- Summary statistics

## 🚀 Quick Start

### Backend Setup

```bash
# Install dependencies
npm install

# Initialize database (creates tables and seeds sample data)
npm run init-db

# Start server
npm start
# Or for development with auto-reload:
npm run dev
```

Backend runs on `http://localhost:5000`

### Frontend Setup

```bash
cd frontend
npm install
npm start
```

Frontend runs on `http://localhost:3000`

## 📋 Complete Setup

See [SETUP.md](./SETUP.md) for detailed installation and configuration instructions.

## 🛠️ Tech Stack

### Backend
- **Node.js** + **Express.js** - RESTful API
- **SQLite** - Database (easily switchable to PostgreSQL/MySQL)
- **RESTful API** - Clean, well-structured endpoints

### Frontend
- **React** + **TypeScript** - Type-safe UI
- **Material UI** - Beautiful, modern components
- **Tailwind CSS** - Utility-first styling
- **React Beautiful DnD** - Drag & drop for Kanban
- **React Big Calendar** - Calendar view
- **Recharts** - Data visualization

## 📡 API Documentation

### Equipment Endpoints
- `GET /api/equipment` - List all (supports filters: department_id, user_id, team_id, search)
- `GET /api/equipment/:id` - Get details
- `GET /api/equipment/:id/requests` - Get requests (smart button)
- `POST /api/equipment` - Create
- `PUT /api/equipment/:id` - Update
- `DELETE /api/equipment/:id` - Delete

### Teams Endpoints
- `GET /api/teams` - List all
- `GET /api/teams/:id` - Get details with members
- `POST /api/teams` - Create
- `PUT /api/teams/:id` - Update
- `POST /api/teams/:id/members` - Add member
- `DELETE /api/teams/:id/members/:userId` - Remove member

### Maintenance Requests Endpoints
- `GET /api/requests` - List all (filters: equipment_id, team_id, stage, request_type, is_overdue)
- `GET /api/requests/calendar` - Get preventive for calendar
- `GET /api/requests/:id` - Get details
- `POST /api/requests` - Create (auto-fills team from equipment)
- `PUT /api/requests/:id` - Update
- `POST /api/requests/:id/assign` - Assign technician
- `GET /api/requests/reports/pivot?group_by=team` - Team report
- `GET /api/requests/reports/pivot?group_by=equipment_category` - Category report

## 🎨 UI Features

1. **Dashboard**: Overview statistics and quick access
2. **Equipment List**: Searchable, filterable table with smart button badges
3. **Equipment Detail**: Full details with maintenance history and smart button
4. **Kanban Board**: Drag & drop workflow management
5. **Calendar View**: Visual scheduling for preventive maintenance
6. **Reports**: Analytics and pivot tables

## 🔄 Workflow

### Breakdown Flow
1. User creates corrective request
2. System auto-fills team and technician from equipment
3. Request starts in "New" stage
4. Manager/technician assigns themselves
5. Stage moves to "In Progress"
6. Technician records duration and moves to "Repaired"

### Preventive Flow
1. Manager creates preventive request with scheduled date
2. Request appears on calendar view
3. Technician sees scheduled work
4. Executes maintenance
5. Records completion

## 🗄️ Database Schema

- `departments` - Company departments
- `users` - Employees/Technicians/Managers
- `teams` - Maintenance teams
- `team_members` - Team membership (junction)
- `equipment` - Company assets
- `maintenance_requests` - Work orders

## ✨ Smart Features

- **Auto-Fill Logic**: Equipment selection automatically fills team and technician
- **Smart Buttons**: Equipment form shows open requests count
- **Scrap Logic**: Moving request to Scrap marks equipment as unusable
- **Overdue Detection**: Automatic calculation and visual indicators
- **Calendar Integration**: Preventive requests appear on calendar

## 📝 Sample Data

The database is seeded with:
- 5 Departments (Production, IT, Maintenance, Administration, Logistics)
- 4 Teams (Mechanics, Electricians, IT Support, General Maintenance)
- 5 Users (Managers and Technicians)
- 4 Sample Equipment items

## 🏆 Hackathon Winning Features

✅ Complete CRUD operations for all entities
✅ Smart auto-fill workflow logic
✅ Drag & drop Kanban board
✅ Calendar view for scheduling
✅ Pivot reports and analytics
✅ Modern, responsive UI
✅ Type-safe TypeScript implementation
✅ RESTful API architecture

## 📄 License

ISC

---

**Built for Hackathon Excellence** 🚀

