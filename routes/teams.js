const express = require('express');
const router = express.Router();
const db = require('../config/database');
const { authenticateToken } = require('../middleware/auth');
const { isManager } = require('../middleware/roles');

// Get all teams with members (all authenticated users can view)
router.get('/', authenticateToken, async (req, res) => {
  try {
    const query = `
      SELECT 
        t.*,
        GROUP_CONCAT(CONCAT(u.id, ':', u.name) SEPARATOR ',') as members
      FROM teams t
      LEFT JOIN team_members tm ON t.id = tm.team_id
      LEFT JOIN users u ON tm.user_id = u.id
      GROUP BY t.id
      ORDER BY t.name
    `;

    const pool = db.getDatabase();
    const [rows] = await pool.query(query);
    
    // Parse members string into array
    const teams = rows.map(team => ({
      ...team,
      members: team.members ? team.members.split(',').map(m => {
        const [id, name] = m.split(':');
        return { id: parseInt(id), name };
      }) : []
    }));
    res.json(teams);
  } catch (error) {
    console.error('Error fetching teams:', error);
    res.status(500).json({ error: 'Failed to fetch teams' });
  }
});

// Get single team with detailed member info (all authenticated users can view)
router.get('/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const query = `
      SELECT 
        t.*,
        u.id as member_id,
        u.name as member_name,
        u.email as member_email,
        u.role as member_role
      FROM teams t
      LEFT JOIN team_members tm ON t.id = tm.team_id
      LEFT JOIN users u ON tm.user_id = u.id
      WHERE t.id = ?
    `;

    const pool = db.getDatabase();
    const [rows] = await pool.query(query, [id]);
    
    if (rows.length === 0) {
      return res.status(404).json({ error: 'Team not found' });
    }

    const team = {
      id: rows[0].id,
      name: rows[0].name,
      description: rows[0].description,
      created_at: rows[0].created_at,
      members: rows
        .filter(row => row.member_id)
        .map(row => ({
          id: row.member_id,
          name: row.member_name,
          email: row.member_email,
          role: row.member_role
        }))
    };

    res.json(team);
  } catch (error) {
    console.error('Error fetching team:', error);
    res.status(500).json({ error: 'Failed to fetch team' });
  }
});

// Create new team (Manager only)
router.post('/', authenticateToken, isManager, async (req, res) => {
  try {
    const { name, description, member_ids } = req.body;

    if (!name) {
      return res.status(400).json({ error: 'Team name is required' });
    }

    const pool = db.getDatabase();
    
    // Start transaction
    const connection = await pool.getConnection();
    await connection.beginTransaction();

    try {
      // Insert team
      const [teamResult] = await connection.query(
        'INSERT INTO teams (name, description) VALUES (?, ?)',
        [name, description || null]
      );

      const teamId = teamResult.insertId;

      // Add members if provided
      if (member_ids && member_ids.length > 0) {
        for (const userId of member_ids) {
          try {
            await connection.query(
              'INSERT INTO team_members (team_id, user_id) VALUES (?, ?)',
              [teamId, userId]
            );
          } catch (err) {
            // Ignore duplicate entries
            if (err.code !== 'ER_DUP_ENTRY') {
              throw err;
            }
          }
        }
      }

      await connection.commit();
      res.status(201).json({ id: teamId, message: 'Team created successfully' });
    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  } catch (error) {
    console.error('Error creating team:', error);
    if (error.code === 'ER_DUP_ENTRY') {
      return res.status(400).json({ error: 'Team name already exists' });
    }
    res.status(500).json({ error: 'Failed to create team' });
  }
});

// Update team (Manager only)
router.put('/:id', authenticateToken, isManager, async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description } = req.body;

    const query = `
      UPDATE teams SET
        name = COALESCE(?, name),
        description = COALESCE(?, description)
      WHERE id = ?
    `;

    const pool = db.getDatabase();
    const [result] = await pool.query(query, [name, description, id]);
    
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Team not found' });
    }
    res.json({ message: 'Team updated successfully' });
  } catch (error) {
    console.error('Error updating team:', error);
    res.status(500).json({ error: 'Failed to update team' });
  }
});

// Add member to team (Manager only)
router.post('/:id/members', authenticateToken, isManager, async (req, res) => {
  try {
    const { id } = req.params;
    const { user_id } = req.body;

    if (!user_id) {
      return res.status(400).json({ error: 'User ID is required' });
    }

    const pool = db.getDatabase();
    await pool.query(
      'INSERT INTO team_members (team_id, user_id) VALUES (?, ?)',
      [id, user_id]
    );
    
    res.status(201).json({ message: 'Team member added successfully' });
  } catch (error) {
    console.error('Error adding team member:', error);
    if (error.code === 'ER_DUP_ENTRY') {
      return res.status(400).json({ error: 'User is already a member of this team' });
    }
    res.status(500).json({ error: 'Failed to add team member' });
  }
});

// Remove member from team (Manager only)
router.delete('/:id/members/:userId', authenticateToken, isManager, async (req, res) => {
  try {
    const { id, userId } = req.params;
    const pool = db.getDatabase();
    const [result] = await pool.query(
      'DELETE FROM team_members WHERE team_id = ? AND user_id = ?',
      [id, userId]
    );
    
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Team member not found' });
    }
    res.json({ message: 'Team member removed successfully' });
  } catch (error) {
    console.error('Error removing team member:', error);
    res.status(500).json({ error: 'Failed to remove team member' });
  }
});

// Delete team (Manager only)
router.delete('/:id', authenticateToken, isManager, async (req, res) => {
  try {
    const { id } = req.params;
    const pool = db.getDatabase();
    const [result] = await pool.query('DELETE FROM teams WHERE id = ?', [id]);
    
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Team not found' });
    }
    res.json({ message: 'Team deleted successfully' });
  } catch (error) {
    console.error('Error deleting team:', error);
    res.status(500).json({ error: 'Failed to delete team' });
  }
});

module.exports = router;
