# GearGuard Project Structure

## Backend Structure

```
GearGuard/
├── config/
│   └── database.js          # Database connection and initialization
├── routes/
│   ├── equipment.js         # Equipment CRUD endpoints
│   ├── teams.js             # Teams CRUD endpoints
│   ├── requests.js           # Maintenance requests endpoints
│   ├── users.js              # Users endpoints
│   └── departments.js        # Departments endpoints
├── scripts/
│   └── initDatabase.js      # Database initialization script
├── data/
│   └── gearguard.db         # SQLite database (created on init)
├── server.js                # Express server entry point
├── package.json              # Backend dependencies
└── README.md                 # Project documentation
```

## Frontend Structure

```
frontend/
├── public/
│   └── index.html           # HTML template
├── src/
│   ├── components/
│   │   ├── Navbar.tsx       # Navigation bar
│   │   ├── EquipmentForm.tsx # Equipment create/edit form
│   │   └── RequestForm.tsx  # Maintenance request form
│   ├── pages/
│   │   ├── Dashboard.tsx    # Dashboard with statistics
│   │   ├── EquipmentList.tsx # Equipment listing page
│   │   ├── EquipmentDetail.tsx # Equipment detail with smart button
│   │   ├── TeamsList.tsx    # Teams management
│   │   ├── RequestsKanban.tsx # Kanban board with drag & drop
│   │   ├── CalendarView.tsx # Calendar for preventive maintenance
│   │   └── Reports.tsx      # Analytics and reports
│   ├── services/
│   │   └── api.ts           # API service layer
│   ├── types/
│   │   └── index.ts         # TypeScript type definitions
│   ├── App.tsx               # Main app component with routing
│   ├── index.tsx             # React entry point
│   └── index.css             # Global styles with Tailwind
├── package.json              # Frontend dependencies
└── tsconfig.json             # TypeScript configuration
```

## Key Files Explained

### Backend

**server.js**
- Express server setup
- Route registration
- Database initialization
- Server startup

**config/database.js**
- SQLite connection
- Table creation
- Initial data seeding
- Database helper functions

**routes/equipment.js**
- Equipment CRUD operations
- Smart button endpoint (equipment/:id/requests)
- Search and filter functionality

**routes/requests.js**
- Request CRUD operations
- Auto-fill logic implementation
- Calendar endpoint
- Pivot report endpoint
- Assignment logic

### Frontend

**App.tsx**
- Main application component
- React Router setup
- Material UI theme provider
- Route definitions

**services/api.ts**
- Axios instance configuration
- API endpoint wrappers
- Centralized API calls

**pages/RequestsKanban.tsx**
- Drag & drop implementation
- Stage management
- Visual indicators
- Request assignment

**pages/CalendarView.tsx**
- React Big Calendar integration
- Event rendering
- Date selection
- Preventive maintenance display

**pages/EquipmentDetail.tsx**
- Equipment information display
- Smart button implementation
- Maintenance history table

## Data Flow

1. **User Action** → Frontend Component
2. **API Call** → services/api.ts
3. **HTTP Request** → Express Route
4. **Database Query** → SQLite
5. **Response** → Frontend Component
6. **UI Update** → React State

## Key Features Implementation

### Auto-Fill Logic
- Location: `routes/requests.js` (POST /api/requests)
- When equipment is selected, fetches equipment record
- Auto-fills maintenance_team_id and assigned_technician_id

### Smart Button
- Location: `routes/equipment.js` (GET /api/equipment/:id/requests)
- Returns count of open requests in equipment detail
- Displayed as badge on equipment card

### Drag & Drop
- Location: `pages/RequestsKanban.tsx`
- Uses react-beautiful-dnd
- Updates request stage on drop
- Calls PUT /api/requests/:id

### Scrap Logic
- Location: `routes/requests.js` (PUT /api/requests/:id)
- When stage changes to "Scrap", updates equipment status
- Adds note to equipment record

### Overdue Detection
- Location: `routes/requests.js` (GET /api/requests)
- Calculates overdue based on scheduled_date
- Returns is_overdue flag in response

## Environment Variables

### Backend
- `PORT` - Server port (default: 5000)

### Frontend
- `REACT_APP_API_URL` - Backend API URL (default: http://localhost:5000/api)

## Database Schema

All tables are created in `config/database.js`:
- Foreign key relationships
- Indexes for performance
- Constraints for data integrity

## Styling

- **Material UI**: Component library
- **Tailwind CSS**: Utility classes
- **Custom CSS**: Global styles in index.css

## Type Safety

- TypeScript for frontend
- Type definitions in `src/types/index.ts`
- API responses typed

