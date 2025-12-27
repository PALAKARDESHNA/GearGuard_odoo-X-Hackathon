const express = require('express');
const router = express.Router();
const db = require('../config/database');
const { authenticateToken } = require('../middleware/auth');
const { isEmployee, isManagerOrTechnician, isManager } = require('../middleware/roles');

// Get all maintenance requests with filters (all authenticated users)
router.get('/', authenticateToken, async (req, res) => {
  try {
    const { 
      equipment_id, 
      team_id, 
      technician_id, 
      stage, 
      request_type,
      is_overdue,
      scheduled_date
    } = req.query;

    let query = `
      SELECT 
        mr.*,
        e.name as equipment_name,
        e.serial_number as equipment_serial,
        e.category as equipment_category,
        t.name as team_name,
        u.name as technician_name,
        u.email as technician_email,
        cu.name as created_by_name,
        CASE 
          WHEN mr.scheduled_date IS NOT NULL AND mr.scheduled_date < CURDATE() 
               AND mr.stage NOT IN ('Repaired', 'Scrap') 
          THEN 1 
          ELSE 0 
        END as is_overdue_calculated
      FROM maintenance_requests mr
      LEFT JOIN equipment e ON mr.equipment_id = e.id
      LEFT JOIN teams t ON mr.maintenance_team_id = t.id
      LEFT JOIN users u ON mr.assigned_technician_id = u.id
      LEFT JOIN users cu ON mr.created_by_user_id = cu.id
      WHERE 1=1
    `;
    const params = [];

    if (equipment_id) {
      query += ' AND mr.equipment_id = ?';
      params.push(equipment_id);
    }
    if (team_id) {
      query += ' AND mr.maintenance_team_id = ?';
      params.push(team_id);
    }
    if (technician_id) {
      query += ' AND mr.assigned_technician_id = ?';
      params.push(technician_id);
    }
    if (stage) {
      query += ' AND mr.stage = ?';
      params.push(stage);
    }
    if (request_type) {
      query += ' AND mr.request_type = ?';
      params.push(request_type);
    }
    if (is_overdue === 'true') {
      query += ' AND mr.scheduled_date IS NOT NULL AND mr.scheduled_date < CURDATE() AND mr.stage NOT IN ("Repaired", "Scrap")';
    }
    if (scheduled_date) {
      query += ' AND mr.scheduled_date = ?';
      params.push(scheduled_date);
    }

    query += ' ORDER BY mr.created_at DESC';

    const pool = db.getDatabase();
    const [rows] = await pool.query(query, params);
    
    // Update is_overdue based on calculated value
    const requests = rows.map(row => ({
      ...row,
      is_overdue: row.is_overdue_calculated === 1
    }));
    res.json(requests);
  } catch (error) {
    console.error('Error fetching requests:', error);
    res.status(500).json({ error: 'Failed to fetch requests' });
  }
});

// Get requests for calendar view (preventive maintenance) - all authenticated users
router.get('/calendar', authenticateToken, async (req, res) => {
  try {
    const { start_date, end_date } = req.query;
    
    let query = `
      SELECT 
        mr.*,
        e.name as equipment_name,
        e.serial_number as equipment_serial,
        t.name as team_name,
        u.name as technician_name
      FROM maintenance_requests mr
      LEFT JOIN equipment e ON mr.equipment_id = e.id
      LEFT JOIN teams t ON mr.maintenance_team_id = t.id
      LEFT JOIN users u ON mr.assigned_technician_id = u.id
      WHERE mr.request_type = 'Preventive'
        AND mr.scheduled_date IS NOT NULL
    `;
    const params = [];

    if (start_date) {
      query += ' AND mr.scheduled_date >= ?';
      params.push(start_date);
    }
    if (end_date) {
      query += ' AND mr.scheduled_date <= ?';
      params.push(end_date);
    }

    query += ' ORDER BY mr.scheduled_date ASC';

    const pool = db.getDatabase();
    const [rows] = await pool.query(query, params);
    res.json(rows);
  } catch (error) {
    console.error('Error fetching calendar requests:', error);
    res.status(500).json({ error: 'Failed to fetch calendar requests' });
  }
});

// Get single request by ID (all authenticated users)
router.get('/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const query = `
      SELECT 
        mr.*,
        e.name as equipment_name,
        e.serial_number as equipment_serial,
        e.category as equipment_category,
        e.maintenance_team_id as equipment_team_id,
        t.name as team_name,
        u.name as technician_name,
        u.email as technician_email,
        cu.name as created_by_name
      FROM maintenance_requests mr
      LEFT JOIN equipment e ON mr.equipment_id = e.id
      LEFT JOIN teams t ON mr.maintenance_team_id = t.id
      LEFT JOIN users u ON mr.assigned_technician_id = u.id
      LEFT JOIN users cu ON mr.created_by_user_id = cu.id
      WHERE mr.id = ?
    `;

    const pool = db.getDatabase();
    const [rows] = await pool.query(query, [id]);
    
    if (rows.length === 0) {
      return res.status(404).json({ error: 'Request not found' });
    }
    res.json(rows[0]);
  } catch (error) {
    console.error('Error fetching request:', error);
    res.status(500).json({ error: 'Failed to fetch request' });
  }
});

// Create new maintenance request with auto-fill logic (Employee, Technician, Manager can create)
router.post('/', authenticateToken, isEmployee, async (req, res) => {
  try {
    const {
      subject,
      description,
      request_type,
      equipment_id,
      scheduled_date,
      priority,
      created_by_user_id
    } = req.body;

    if (!subject || !request_type || !equipment_id) {
      return res.status(400).json({ error: 'Subject, request type, and equipment are required' });
    }

    const pool = db.getDatabase();

    // Auto-fill logic: Get equipment details
    const [equipmentRows] = await pool.query(
      'SELECT category, maintenance_team_id, default_technician_id FROM equipment WHERE id = ?',
      [equipment_id]
    );

    if (equipmentRows.length === 0) {
      return res.status(404).json({ error: 'Equipment not found' });
    }

    const equipment = equipmentRows[0];

    // Auto-fill maintenance_team_id from equipment
    const maintenance_team_id = equipment.maintenance_team_id;
    const assigned_technician_id = equipment.default_technician_id || null;

    const insertQuery = `
      INSERT INTO maintenance_requests (
        subject, description, request_type, maintenance_type, equipment_id,
        maintenance_team_id, assigned_technician_id, work_center_id, workplace,
        scheduled_date, start_date, end_date, priority, created_by_user_id, stage, status
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'New', 'Open')
    `;

    const params = [
      subject,
      description || null,
      request_type,
      req.body.maintenance_type || null,
      equipment_id,
      maintenance_team_id,
      assigned_technician_id,
      req.body.work_center_id || null,
      req.body.workplace || null,
      scheduled_date || null,
      req.body.start_date || null,
      req.body.end_date || null,
      priority || 'Medium',
      created_by_user_id || null
    ];

    const [result] = await pool.query(insertQuery, params);
    
    res.status(201).json({ 
      id: result.insertId, 
      message: 'Maintenance request created successfully',
      auto_filled: {
        maintenance_team_id,
        assigned_technician_id
      }
    });
  } catch (error) {
    console.error('Error creating request:', error);
    res.status(500).json({ error: 'Failed to create request' });
  }
});

// Update maintenance request (Technician and Manager can update)
router.put('/:id', authenticateToken, isManagerOrTechnician, async (req, res) => {
  try {
    const { id } = req.params;
    const {
      subject,
      description,
      request_type,
      maintenance_type,
      equipment_id,
      maintenance_team_id,
      assigned_technician_id,
      work_center_id,
      workplace,
      scheduled_date,
      start_date,
      end_date,
      duration_hours,
      cost,
      stage,
      status,
      priority
    } = req.body;

    const pool = db.getDatabase();

    // If stage is being updated to "Repaired", set completed_at
    // If stage is being updated to "Scrap", mark equipment as unusable
    if (stage === 'Repaired') {
      // Get current stage to check if we're transitioning
      const [currentRows] = await pool.query(
        'SELECT stage FROM maintenance_requests WHERE id = ?',
        [id]
      );
      
      if (currentRows.length > 0 && currentRows[0].stage !== 'Repaired') {
        // This is a transition to Repaired
        const completedAt = new Date().toISOString().slice(0, 19).replace('T', ' ');
        await pool.query(
          'UPDATE maintenance_requests SET completed_at = ? WHERE id = ?',
          [completedAt, id]
        );
      }
    } else if (stage === 'Scrap') {
      // Mark equipment as unusable
      if (equipment_id) {
        const [equipmentRows] = await pool.query(
          'SELECT notes FROM equipment WHERE id = ?',
          [equipment_id]
        );
        const existingNotes = equipmentRows[0]?.notes || '';
        const newNotes = existingNotes + (existingNotes ? '\n' : '') + 
          `Equipment marked as scrapped from maintenance request #${id}`;
        
        await pool.query(
          'UPDATE equipment SET status = "scrapped", notes = ? WHERE id = ?',
          [newNotes, equipment_id]
        );
      }
    }

    const query = `
      UPDATE maintenance_requests SET
        subject = COALESCE(?, subject),
        description = COALESCE(?, description),
        request_type = COALESCE(?, request_type),
        maintenance_type = COALESCE(?, maintenance_type),
        equipment_id = COALESCE(?, equipment_id),
        maintenance_team_id = COALESCE(?, maintenance_team_id),
        assigned_technician_id = COALESCE(?, assigned_technician_id),
        work_center_id = COALESCE(?, work_center_id),
        workplace = COALESCE(?, workplace),
        scheduled_date = COALESCE(?, scheduled_date),
        start_date = COALESCE(?, start_date),
        end_date = COALESCE(?, end_date),
        duration_hours = COALESCE(?, duration_hours),
        cost = COALESCE(?, cost),
        stage = COALESCE(?, stage),
        status = COALESCE(?, status),
        priority = COALESCE(?, priority),
        updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `;

    const params = [
      subject, description, request_type, maintenance_type, equipment_id, 
      maintenance_team_id, assigned_technician_id, work_center_id, workplace,
      scheduled_date, start_date, end_date, duration_hours, cost, 
      stage, status, priority, id
    ];

    const [result] = await pool.query(query, params);
    
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Request not found' });
    }

    res.json({ message: 'Maintenance request updated successfully' });
  } catch (error) {
    console.error('Error updating request:', error);
    res.status(500).json({ error: 'Failed to update request' });
  }
});

// Assign technician to request (Manager and Technician can assign)
router.post('/:id/assign', authenticateToken, isManagerOrTechnician, async (req, res) => {
  try {
    const { id } = req.params;
    const { technician_id, stage } = req.body;

    if (!technician_id) {
      return res.status(400).json({ error: 'Technician ID is required' });
    }

    const query = `
      UPDATE maintenance_requests SET
        assigned_technician_id = ?,
        stage = COALESCE(?, CASE WHEN stage = 'New' THEN 'In Progress' ELSE stage END),
        updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `;

    const pool = db.getDatabase();
    const [result] = await pool.query(query, [technician_id, stage, id]);
    
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Request not found' });
    }
    res.json({ message: 'Technician assigned successfully' });
  } catch (error) {
    console.error('Error assigning technician:', error);
    res.status(500).json({ error: 'Failed to assign technician' });
  }
});

// Delete request (Manager only)
router.delete('/:id', authenticateToken, isManager, async (req, res) => {
  try {
    const { id } = req.params;
    const pool = db.getDatabase();
    const [result] = await pool.query('DELETE FROM maintenance_requests WHERE id = ?', [id]);
    
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Request not found' });
    }
    res.json({ message: 'Request deleted successfully' });
  } catch (error) {
    console.error('Error deleting request:', error);
    res.status(500).json({ error: 'Failed to delete request' });
  }
});

// Get maintenance duration report (Manager only)
router.get('/reports/duration', authenticateToken, isManager, async (req, res) => {
  try {
    const query = `
      SELECT 
        wc.name as work_center,
        COALESCE(SUM(mr.duration_hours), 0) as duration_hours,
        COALESCE(SUM(mr.cost), 0) as cost
      FROM work_centers wc
      LEFT JOIN maintenance_requests mr ON wc.id = mr.work_center_id
      WHERE mr.stage = 'Repaired' OR mr.work_center_id IS NULL
      GROUP BY wc.id, wc.name
      ORDER BY wc.name
    `;

    const pool = db.getDatabase();
    const [rows] = await pool.query(query);
    res.json(rows);
  } catch (error) {
    console.error('Error fetching duration report:', error);
    res.status(500).json({ error: 'Failed to fetch duration report' });
  }
});

// Get pivot/graph report data (Manager only)
router.get('/reports/pivot', authenticateToken, isManager, async (req, res) => {
  try {
    const { group_by } = req.query; // 'team' or 'equipment_category'

    let query;
    if (group_by === 'team') {
      query = `
        SELECT 
          t.name as group_name,
          COUNT(*) as total_requests,
          SUM(CASE WHEN mr.stage = 'New' THEN 1 ELSE 0 END) as new_count,
          SUM(CASE WHEN mr.stage = 'In Progress' THEN 1 ELSE 0 END) as in_progress_count,
          SUM(CASE WHEN mr.stage = 'Repaired' THEN 1 ELSE 0 END) as repaired_count,
          SUM(CASE WHEN mr.stage = 'Scrap' THEN 1 ELSE 0 END) as scrap_count
        FROM maintenance_requests mr
        LEFT JOIN teams t ON mr.maintenance_team_id = t.id
        GROUP BY t.id, t.name
        ORDER BY total_requests DESC
      `;
    } else if (group_by === 'equipment_category') {
      query = `
        SELECT 
          COALESCE(e.category, 'Uncategorized') as group_name,
          COUNT(*) as total_requests,
          SUM(CASE WHEN mr.stage = 'New' THEN 1 ELSE 0 END) as new_count,
          SUM(CASE WHEN mr.stage = 'In Progress' THEN 1 ELSE 0 END) as in_progress_count,
          SUM(CASE WHEN mr.stage = 'Repaired' THEN 1 ELSE 0 END) as repaired_count,
          SUM(CASE WHEN mr.stage = 'Scrap' THEN 1 ELSE 0 END) as scrap_count
        FROM maintenance_requests mr
        LEFT JOIN equipment e ON mr.equipment_id = e.id
        GROUP BY e.category
        ORDER BY total_requests DESC
      `;
    } else {
      return res.status(400).json({ error: 'Invalid group_by parameter. Use "team" or "equipment_category"' });
    }

    const pool = db.getDatabase();
    const [rows] = await pool.query(query);
    res.json(rows);
  } catch (error) {
    console.error('Error fetching report:', error);
    res.status(500).json({ error: 'Failed to fetch report' });
  }
});

module.exports = router;
