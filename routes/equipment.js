const express = require('express');
const router = express.Router();
const db = require('../config/database');
const { authenticateToken } = require('../middleware/auth');
const { isEmployee, isManagerOrTechnician, isManager } = require('../middleware/roles');

// Get all equipment with related data (all authenticated users can view)
router.get('/', authenticateToken, async (req, res) => {
  try {
    const { department_id, user_id, team_id, search } = req.query;
    let query = `
      SELECT 
        e.*,
        d.name as department_name,
        u.name as assigned_user_name,
        u.email as assigned_user_email,
        t.name as maintenance_team_name,
        dt.name as default_technician_name,
        (SELECT COUNT(*) FROM maintenance_requests mr 
         WHERE mr.equipment_id = e.id AND mr.stage != 'Repaired' AND mr.stage != 'Scrap') as open_requests_count
      FROM equipment e
      LEFT JOIN departments d ON e.department_id = d.id
      LEFT JOIN users u ON e.assigned_to_user_id = u.id
      LEFT JOIN teams t ON e.maintenance_team_id = t.id
      LEFT JOIN users dt ON e.default_technician_id = dt.id
      WHERE 1=1
    `;
    const params = [];

    if (department_id) {
      query += ' AND e.department_id = ?';
      params.push(department_id);
    }
    if (user_id) {
      query += ' AND e.assigned_to_user_id = ?';
      params.push(user_id);
    }
    if (team_id) {
      query += ' AND e.maintenance_team_id = ?';
      params.push(team_id);
    }
    if (search) {
      query += ' AND (e.name LIKE ? OR e.serial_number LIKE ? OR e.category LIKE ?)';
      const searchTerm = `%${search}%`;
      params.push(searchTerm, searchTerm, searchTerm);
    }

    query += ' ORDER BY e.created_at DESC';

    const pool = db.getDatabase();
    const [rows] = await pool.query(query, params);
    res.json(rows);
  } catch (error) {
    console.error('Error fetching equipment:', error);
    res.status(500).json({ error: 'Failed to fetch equipment' });
  }
});

// Get single equipment by ID (all authenticated users can view)
router.get('/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const query = `
      SELECT 
        e.*,
        d.name as department_name,
        u.name as assigned_user_name,
        u.email as assigned_user_email,
        t.name as maintenance_team_name,
        dt.name as default_technician_name,
        dt.id as default_technician_id,
        (SELECT COUNT(*) FROM maintenance_requests mr 
         WHERE mr.equipment_id = e.id AND mr.stage != 'Repaired' AND mr.stage != 'Scrap') as open_requests_count
      FROM equipment e
      LEFT JOIN departments d ON e.department_id = d.id
      LEFT JOIN users u ON e.assigned_to_user_id = u.id
      LEFT JOIN teams t ON e.maintenance_team_id = t.id
      LEFT JOIN users dt ON e.default_technician_id = dt.id
      WHERE e.id = ?
    `;

    const pool = db.getDatabase();
    const [rows] = await pool.query(query, [id]);
    
    if (rows.length === 0) {
      return res.status(404).json({ error: 'Equipment not found' });
    }
    res.json(rows[0]);
  } catch (error) {
    console.error('Error fetching equipment:', error);
    res.status(500).json({ error: 'Failed to fetch equipment' });
  }
});

// Get maintenance requests for specific equipment (for smart button) - all authenticated users
router.get('/:id/requests', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const query = `
      SELECT 
        mr.*,
        e.name as equipment_name,
        t.name as team_name,
        u.name as technician_name,
        u.email as technician_email,
        cu.name as created_by_name
      FROM maintenance_requests mr
      LEFT JOIN equipment e ON mr.equipment_id = e.id
      LEFT JOIN teams t ON mr.maintenance_team_id = t.id
      LEFT JOIN users u ON mr.assigned_technician_id = u.id
      LEFT JOIN users cu ON mr.created_by_user_id = cu.id
      WHERE mr.equipment_id = ?
      ORDER BY mr.created_at DESC
    `;

    const pool = db.getDatabase();
    const [rows] = await pool.query(query, [id]);
    res.json(rows);
  } catch (error) {
    console.error('Error fetching requests:', error);
    res.status(500).json({ error: 'Failed to fetch requests' });
  }
});

// Create new equipment (Manager only)
router.post('/', authenticateToken, isManager, async (req, res) => {
  try {
    const {
      name,
      component,
      serial_number,
      category,
      company,
      used_by,
      maintenance_type,
      purchase_date,
      warranty_expiry,
      assigned_date,
      location,
      used_in,
      work_order,
      department_id,
      assigned_to_user_id,
      employee_id,
      maintenance_team_id,
      default_technician_id,
      notes
    } = req.body;

    if (!name || !maintenance_team_id) {
      return res.status(400).json({ error: 'Name and maintenance team are required' });
    }

    const query = `
      INSERT INTO equipment (
        name, component, serial_number, category, company, used_by, maintenance_type,
        purchase_date, warranty_expiry, assigned_date, location, used_in, work_order,
        department_id, assigned_to_user_id, employee_id, maintenance_team_id,
        default_technician_id, notes
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;

    const params = [
      name, component || null, serial_number || null, category || null,
      company || null, used_by || null, maintenance_type || null,
      purchase_date || null, warranty_expiry || null, assigned_date || null,
      location || null, used_in || null, work_order || null,
      department_id || null, assigned_to_user_id || null, employee_id || null,
      maintenance_team_id, default_technician_id || null, notes || null
    ];

    const pool = db.getDatabase();
    const [result] = await pool.query(query, params);
    
    res.status(201).json({ id: result.insertId, message: 'Equipment created successfully' });
  } catch (error) {
    console.error('Error creating equipment:', error);
    if (error.code === 'ER_DUP_ENTRY') {
      return res.status(400).json({ error: 'Serial number already exists' });
    }
    res.status(500).json({ error: 'Failed to create equipment' });
  }
});

// Update equipment (Manager only)
router.put('/:id', authenticateToken, isManager, async (req, res) => {
  try {
    const { id } = req.params;
    const {
      name,
      component,
      serial_number,
      category,
      company,
      used_by,
      maintenance_type,
      purchase_date,
      warranty_expiry,
      assigned_date,
      location,
      used_in,
      work_order,
      department_id,
      assigned_to_user_id,
      employee_id,
      maintenance_team_id,
      default_technician_id,
      status,
      notes
    } = req.body;

    const query = `
      UPDATE equipment SET
        name = COALESCE(?, name),
        component = COALESCE(?, component),
        serial_number = COALESCE(?, serial_number),
        category = COALESCE(?, category),
        company = COALESCE(?, company),
        used_by = COALESCE(?, used_by),
        maintenance_type = COALESCE(?, maintenance_type),
        purchase_date = COALESCE(?, purchase_date),
        warranty_expiry = COALESCE(?, warranty_expiry),
        assigned_date = COALESCE(?, assigned_date),
        location = COALESCE(?, location),
        used_in = COALESCE(?, used_in),
        work_order = COALESCE(?, work_order),
        department_id = COALESCE(?, department_id),
        assigned_to_user_id = COALESCE(?, assigned_to_user_id),
        employee_id = COALESCE(?, employee_id),
        maintenance_team_id = COALESCE(?, maintenance_team_id),
        default_technician_id = COALESCE(?, default_technician_id),
        status = COALESCE(?, status),
        notes = COALESCE(?, notes),
        updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `;

    const params = [
      name, component, serial_number, category, company, used_by, maintenance_type,
      purchase_date, warranty_expiry, assigned_date, location, used_in, work_order,
      department_id, assigned_to_user_id, employee_id, maintenance_team_id,
      default_technician_id, status, notes, id
    ];

    const pool = db.getDatabase();
    const [result] = await pool.query(query, params);
    
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Equipment not found' });
    }
    res.json({ message: 'Equipment updated successfully' });
  } catch (error) {
    console.error('Error updating equipment:', error);
    res.status(500).json({ error: 'Failed to update equipment' });
  }
});

// Delete equipment (Manager only)
router.delete('/:id', authenticateToken, isManager, async (req, res) => {
  try {
    const { id } = req.params;
    const pool = db.getDatabase();
    const [result] = await pool.query('DELETE FROM equipment WHERE id = ?', [id]);
    
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Equipment not found' });
    }
    res.json({ message: 'Equipment deleted successfully' });
  } catch (error) {
    console.error('Error deleting equipment:', error);
    res.status(500).json({ error: 'Failed to delete equipment' });
  }
});

module.exports = router;
