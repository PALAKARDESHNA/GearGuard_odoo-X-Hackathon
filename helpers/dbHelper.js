const db = require('../config/database');

// Helper function to execute queries with parameters
const executeQuery = async (query, params = {}) => {
  const pool = db.getDatabase();
  const request = pool.request();

  // Add parameters to request
  Object.keys(params).forEach(key => {
    const value = params[key];
    if (typeof value === 'string') {
      request.input(key, db.sql.NVarChar, value);
    } else if (typeof value === 'number') {
      request.input(key, db.sql.Int, value);
    } else if (value === null || value === undefined) {
      request.input(key, db.sql.NVarChar, null);
    } else {
      request.input(key, db.sql.NVarChar, value);
    }
  });

  return await request.query(query);
};

// Helper to get single record
const getOne = async (query, params = {}) => {
  const result = await executeQuery(query, params);
  return result.recordset[0] || null;
};

// Helper to get all records
const getAll = async (query, params = {}) => {
  const result = await executeQuery(query, params);
  return result.recordset || [];
};

// Helper to execute insert/update/delete
const execute = async (query, params = {}) => {
  const result = await executeQuery(query, params);
  return {
    rowsAffected: result.rowsAffected[0],
    recordset: result.recordset,
  };
};

module.exports = {
  executeQuery,
  getOne,
  getAll,
  execute,
};

