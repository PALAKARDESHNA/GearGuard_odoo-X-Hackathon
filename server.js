const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const db = require('./config/database');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/equipment', require('./routes/equipment'));
app.use('/api/teams', require('./routes/teams'));
app.use('/api/requests', require('./routes/requests'));
app.use('/api/users', require('./routes/users'));
app.use('/api/departments', require('./routes/departments'));
app.use('/api/work-centers', require('./routes/workCenters'));
app.use('/api/equipment-categories', require('./routes/equipmentCategories'));

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: 'GearGuard API is running' });
});

// Initialize database and start server
db.initDatabase().then(() => {
  app.listen(PORT, () => {
    console.log(`🚀 GearGuard Server running on port ${PORT}`);
  });
}).catch(err => {
  console.error('Failed to initialize database:', err);
  process.exit(1);
});

module.exports = app;

