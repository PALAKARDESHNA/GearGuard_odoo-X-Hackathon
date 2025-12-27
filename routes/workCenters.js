const express = require('express');
const router = express.Router();
const db = require('../config/database');
const { authenticateToken } = require('../middleware/auth');
const { isManager } = require('../middleware/roles');

// Get all work centers
router.get('/', authenticateToken, async (req, res) => {
  try {
    const query = 'SELECT * FROM work_centers ORDER BY name';
    const pool = db.getDatabase();
    const [rows] = await pool.query(query);
    res.json(rows);
  } catch (error) {
    console.error('Error fetching work centers:', error);
    res.status(500).json({ error: 'Failed to fetch work centers' });
  }
});

// Get single work center
router.get('/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const query = 'SELECT * FROM work_centers WHERE id = ?';
    const pool = db.getDatabase();
    const [rows] = await pool.query(query, [id]);
    
    if (rows.length === 0) {
      return res.status(404).json({ error: 'Work center not found' });
    }
    res.json(rows[0]);
  } catch (error) {
    console.error('Error fetching work center:', error);
    res.status(500).json({ error: 'Failed to fetch work center' });
  }
});

// Create work center (Manager only)
router.post('/', authenticateToken, isManager, async (req, res) => {
  try {
    const {
      name,
      cost,
      qty,
      alternative_information,
      cost_per_hour,
      capacity_unit,
      capacity_period,
      cost_target
    } = req.body;

    if (!name) {
      return res.status(400).json({ error: 'Name is required' });
    }

    // Validate no negative values
    if (cost < 0 || qty < 0 || cost_per_hour < 0 || cost_target < 0) {
      return res.status(400).json({ 
        error: 'Invalid data, a work center cannot be created with negative field. Work was not created.' 
      });
    }

    // Check if work center already exists
    const pool = db.getDatabase();
    const [existing] = await pool.query('SELECT id FROM work_centers WHERE name = ?', [name]);
    if (existing.length > 0) {
      return res.status(400).json({ 
        error: `A work center for '${name}' already exists.` 
      });
    }

    const query = `
      INSERT INTO work_centers (
        name, cost, qty, alternative_information, cost_per_hour,
        capacity_unit, capacity_period, cost_target
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `;

    const params = [
      name,
      cost || 0,
      qty || 0,
      alternative_information || null,
      cost_per_hour || 0,
      capacity_unit || null,
      capacity_period || null,
      cost_target || 0
    ];

    const [result] = await pool.query(query, params);
    
    res.status(201).json({ id: result.insertId, message: 'Work center created successfully' });
  } catch (error) {
    console.error('Error creating work center:', error);
    if (error.code === 'ER_DUP_ENTRY') {
      return res.status(400).json({ error: 'Work center name already exists' });
    }
    res.status(500).json({ error: 'Failed to create work center' });
  }
});

// Update work center (Manager only)
router.put('/:id', authenticateToken, isManager, async (req, res) => {
  try {
    const { id } = req.params;
    const {
      name,
      cost,
      qty,
      alternative_information,
      cost_per_hour,
      capacity_unit,
      capacity_period,
      cost_target
    } = req.body;

    // Validate no negative values
    if ((cost !== undefined && cost < 0) || 
        (qty !== undefined && qty < 0) || 
        (cost_per_hour !== undefined && cost_per_hour < 0) || 
        (cost_target !== undefined && cost_target < 0)) {
      return res.status(400).json({ 
        error: 'Invalid data, a work center cannot be created with negative field. Work was not created.' 
      });
    }

    const query = `
      UPDATE work_centers SET
        name = COALESCE(?, name),
        cost = COALESCE(?, cost),
        qty = COALESCE(?, qty),
        alternative_information = COALESCE(?, alternative_information),
        cost_per_hour = COALESCE(?, cost_per_hour),
        capacity_unit = COALESCE(?, capacity_unit),
        capacity_period = COALESCE(?, capacity_period),
        cost_target = COALESCE(?, cost_target)
      WHERE id = ?
    `;

    const pool = db.getDatabase();
    const [result] = await pool.query(query, [
      name, cost, qty, alternative_information, cost_per_hour,
      capacity_unit, capacity_period, cost_target, id
    ]);
    
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Work center not found' });
    }
    res.json({ message: 'Work center updated successfully' });
  } catch (error) {
    console.error('Error updating work center:', error);
    res.status(500).json({ error: 'Failed to update work center' });
  }
});

// Delete work center (Manager only)
router.delete('/:id', authenticateToken, isManager, async (req, res) => {
  try {
    const { id } = req.params;
    const pool = db.getDatabase();
    const [result] = await pool.query('DELETE FROM work_centers WHERE id = ?', [id]);
    
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Work center not found' });
    }
    res.json({ message: 'Work center deleted successfully' });
  } catch (error) {
    console.error('Error deleting work center:', error);
    res.status(500).json({ error: 'Failed to delete work center' });
  }
});

module.exports = router;

