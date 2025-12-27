const express = require('express');
const router = express.Router();
const db = require('../config/database');
const { authenticateToken } = require('../middleware/auth');
const { isManager } = require('../middleware/roles');

// Get all users (Manager only)
router.get('/', authenticateToken, isManager, async (req, res) => {
  try {
    const { role, department_id } = req.query;
    let query = `
      SELECT 
        u.*,
        d.name as department_name
      FROM users u
      LEFT JOIN departments d ON u.department_id = d.id
      WHERE 1=1
    `;
    const params = [];

    if (role) {
      query += ' AND u.role = ?';
      params.push(role);
    }
    if (department_id) {
      query += ' AND u.department_id = ?';
      params.push(department_id);
    }

    query += ' ORDER BY u.name';

    const pool = db.getDatabase();
    const [rows] = await pool.query(query, params);
    res.json(rows);
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({ error: 'Failed to fetch users' });
  }
});

// Get single user (Manager can view all, users can view their own)
router.get('/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const userId = parseInt(id);
    const currentUser = req.user;

    // Users can only view their own profile unless they're a manager
    if (currentUser.role !== 'manager' && currentUser.id !== userId) {
      return res.status(403).json({ error: 'Forbidden: You can only view your own profile' });
    }

    const query = `
      SELECT 
        u.*,
        d.name as department_name
      FROM users u
      LEFT JOIN departments d ON u.department_id = d.id
      WHERE u.id = ?
    `;

    const pool = db.getDatabase();
    const [rows] = await pool.query(query, [id]);
    
    if (rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    // Don't return password
    const user = rows[0];
    delete user.password;
    res.json(user);
  } catch (error) {
    console.error('Error fetching user:', error);
    res.status(500).json({ error: 'Failed to fetch user' });
  }
});

// Create user (Manager only)
router.post('/', authenticateToken, isManager, async (req, res) => {
  try {
    const { name, email, role, department_id } = req.body;

    if (!name) {
      return res.status(400).json({ error: 'Name is required' });
    }

    const query = 'INSERT INTO users (name, email, role, department_id) VALUES (?, ?, ?, ?)';
    const params = [name, email || null, role || 'employee', department_id || null];

    const pool = db.getDatabase();
    const [result] = await pool.query(query, params);
    
    res.status(201).json({ id: result.insertId, message: 'User created successfully' });
  } catch (error) {
    console.error('Error creating user:', error);
    if (error.code === 'ER_DUP_ENTRY') {
      return res.status(400).json({ error: 'Email already exists' });
    }
    res.status(500).json({ error: 'Failed to create user' });
  }
});

// Update user (Manager can update all, users can update their own basic info)
router.put('/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const userId = parseInt(id);
    const currentUser = req.user;
    const { name, email, role, department_id } = req.body;

    // Users can only update their own profile unless they're a manager
    if (currentUser.role !== 'manager' && currentUser.id !== userId) {
      return res.status(403).json({ error: 'Forbidden: You can only update your own profile' });
    }

    // Only managers can change role and department
    if (currentUser.role !== 'manager' && (role || department_id)) {
      return res.status(403).json({ error: 'Forbidden: Only managers can change role or department' });
    }

    const query = `
      UPDATE users SET
        name = COALESCE(?, name),
        email = COALESCE(?, email),
        role = COALESCE(?, role),
        department_id = COALESCE(?, department_id)
      WHERE id = ?
    `;

    const pool = db.getDatabase();
    const [result] = await pool.query(query, [name, email, role, department_id, id]);
    
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'User not found' });
    }
    res.json({ message: 'User updated successfully' });
  } catch (error) {
    console.error('Error updating user:', error);
    res.status(500).json({ error: 'Failed to update user' });
  }
});

// Delete user (Manager only)
router.delete('/:id', authenticateToken, isManager, async (req, res) => {
  try {
    const { id } = req.params;
    const pool = db.getDatabase();
    const [result] = await pool.query('DELETE FROM users WHERE id = ?', [id]);
    
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'User not found' });
    }
    res.json({ message: 'User deleted successfully' });
  } catch (error) {
    console.error('Error deleting user:', error);
    res.status(500).json({ error: 'Failed to delete user' });
  }
});

module.exports = router;
