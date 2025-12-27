const { authenticateToken } = require('./auth');

// Role-based authorization middleware
const authorize = (...allowedRoles) => {
  return (req, res, next) => {
    // First authenticate the token
    authenticateToken(req, res, () => {
      // Check if user has required role
      if (!req.user) {
        return res.status(401).json({ error: 'Unauthorized' });
      }

      if (!allowedRoles.includes(req.user.role)) {
        return res.status(403).json({ 
          error: 'Forbidden',
          message: `Access denied. Required role: ${allowedRoles.join(' or ')}`
        });
      }

      next();
    });
  };
};

// Specific role checkers
const isManager = authorize('manager');
const isTechnician = authorize('technician', 'manager');
const isEmployee = authorize('employee', 'technician', 'manager');
const isManagerOrTechnician = authorize('manager', 'technician');

module.exports = {
  authorize,
  isManager,
  isTechnician,
  isEmployee,
  isManagerOrTechnician,
};

