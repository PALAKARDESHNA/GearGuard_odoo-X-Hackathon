const express = require('express');
const router = express.Router();
const db = require('../config/database');
const { authenticateToken } = require('../middleware/auth');
const { isManager } = require('../middleware/roles');

// Get all equipment categories
router.get('/', authenticateToken, async (req, res) => {
  try {
    const query = 'SELECT * FROM equipment_categories ORDER BY name';
    const pool = db.getDatabase();
    const [rows] = await pool.query(query);
    res.json(rows);
  } catch (error) {
    console.error('Error fetching equipment categories:', error);
    res.status(500).json({ error: 'Failed to fetch equipment categories' });
  }
});

// Get single equipment category
router.get('/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const query = 'SELECT * FROM equipment_categories WHERE id = ?';
    const pool = db.getDatabase();
    const [rows] = await pool.query(query, [id]);
    
    if (rows.length === 0) {
      return res.status(404).json({ error: 'Equipment category not found' });
    }
    res.json(rows[0]);
  } catch (error) {
    console.error('Error fetching equipment category:', error);
    res.status(500).json({ error: 'Failed to fetch equipment category' });
  }
});

// Create equipment category (Manager only)
router.post('/', authenticateToken, isManager, async (req, res) => {
  try {
    const { name, description } = req.body;

    if (!name) {
      return res.status(400).json({ error: 'Name is required' });
    }

    const query = 'INSERT INTO equipment_categories (name, description) VALUES (?, ?)';
    const pool = db.getDatabase();
    const [result] = await pool.query(query, [name, description || null]);
    
    res.status(201).json({ id: result.insertId, message: 'Equipment category created successfully' });
  } catch (error) {
    console.error('Error creating equipment category:', error);
    if (error.code === 'ER_DUP_ENTRY') {
      return res.status(400).json({ error: 'Equipment category name already exists' });
    }
    res.status(500).json({ error: 'Failed to create equipment category' });
  }
});

// Update equipment category (Manager only)
router.put('/:id', authenticateToken, isManager, async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description } = req.body;

    const query = `
      UPDATE equipment_categories SET
        name = COALESCE(?, name),
        description = COALESCE(?, description)
      WHERE id = ?
    `;

    const pool = db.getDatabase();
    const [result] = await pool.query(query, [name, description, id]);
    
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Equipment category not found' });
    }
    res.json({ message: 'Equipment category updated successfully' });
  } catch (error) {
    console.error('Error updating equipment category:', error);
    res.status(500).json({ error: 'Failed to update equipment category' });
  }
});

// Delete equipment category (Manager only)
router.delete('/:id', authenticateToken, isManager, async (req, res) => {
  try {
    const { id } = req.params;
    const pool = db.getDatabase();
    const [result] = await pool.query('DELETE FROM equipment_categories WHERE id = ?', [id]);
    
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Equipment category not found' });
    }
    res.json({ message: 'Equipment category deleted successfully' });
  } catch (error) {
    console.error('Error deleting equipment category:', error);
    res.status(500).json({ error: 'Failed to delete equipment category' });
  }
});

module.exports = router;

