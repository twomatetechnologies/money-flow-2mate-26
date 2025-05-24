/**
 * Audit Records API Implementation
 */
import { v4 as uuidv4 } from 'uuid';

// In-memory data store for development
let auditRecords = [];

// Get all audit records with optional filters
const getAllAuditRecords = async (req, res) => {
  try {
    // Check if PostgreSQL is enabled
    if (req.app.locals.db) {
      const { entityId, entityType, action, startDate, endDate } = req.query;
      const pool = req.app.locals.db;
      
      // Build the query dynamically based on filters
      let query = 'SELECT * FROM audit_records WHERE 1=1';
      const queryParams = [];
      
      if (entityId) {
        queryParams.push(entityId);
        query += ` AND entity_id = $${queryParams.length}`;
      }
      
      if (entityType) {
        queryParams.push(entityType);
        query += ` AND entity_type = $${queryParams.length}`;
      }
      
      if (action) {
        queryParams.push(action);
        query += ` AND action = $${queryParams.length}`;
      }
      
      if (startDate) {
        queryParams.push(startDate);
        query += ` AND timestamp >= $${queryParams.length}`;
      }
      
      if (endDate) {
        queryParams.push(endDate);
        query += ` AND timestamp <= $${queryParams.length}`;
      }
      
      // Add order by timestamp
      query += ' ORDER BY timestamp DESC';
      
      // Execute the query
      const result = await pool.query(query, queryParams);
      res.json(result.rows);
    } else {
      // If PostgreSQL is not enabled, use in-memory storage
      const { entityId, entityType, action, startDate, endDate } = req.query;
      
      // Apply filters if provided
      let filteredRecords = [...auditRecords];
      
      if (entityId) {
        filteredRecords = filteredRecords.filter(record => record.entityId === entityId);
      }
      
      if (entityType) {
        filteredRecords = filteredRecords.filter(record => record.entityType === entityType);
      }
      
      if (action) {
        filteredRecords = filteredRecords.filter(record => record.action === action);
      }
      
      if (startDate) {
        const startDateObj = new Date(startDate);
        filteredRecords = filteredRecords.filter(record => new Date(record.timestamp) >= startDateObj);
      }
      
      if (endDate) {
        const endDateObj = new Date(endDate);
        filteredRecords = filteredRecords.filter(record => new Date(record.timestamp) <= endDateObj);
      }
      
      res.json(filteredRecords);
    }
  } catch (error) {
    console.error('Error getting audit records:', error);
    res.status(500).json({ error: error.message });
  }
};

// Get audit records by entity ID
const getAuditRecordsByEntityId = async (req, res) => {
  try {
    const { entityId } = req.params;
    
    // Check if PostgreSQL is enabled
    if (req.app.locals.db) {
      const pool = req.app.locals.db;
      
      const query = 'SELECT * FROM audit_records WHERE entity_id = $1 ORDER BY timestamp DESC';
      const result = await pool.query(query, [entityId]);
      
      res.json(result.rows);
    } else {
      // If PostgreSQL is not enabled, use in-memory storage
      const records = auditRecords.filter(record => record.entityId === entityId);
      res.json(records);
    }
  } catch (error) {
    console.error('Error getting audit records by entity ID:', error);
    res.status(500).json({ error: error.message });
  }
};

// Get audit records by entity type
const getAuditRecordsByEntityType = async (req, res) => {
  try {
    const { entityType } = req.params;
    
    // Check if PostgreSQL is enabled
    if (req.app.locals.db) {
      const pool = req.app.locals.db;
      
      const query = 'SELECT * FROM audit_records WHERE entity_type = $1 ORDER BY timestamp DESC';
      const result = await pool.query(query, [entityType]);
      
      res.json(result.rows);
    } else {
      // If PostgreSQL is not enabled, use in-memory storage
      const records = auditRecords.filter(record => record.entityType === entityType);
      res.json(records);
    }
  } catch (error) {
    console.error('Error getting audit records by entity type:', error);
    res.status(500).json({ error: error.message });
  }
};

// Create a new audit record
const createAuditRecord = async (req, res) => {
  try {
    const { entityId, entityType, action, details, userId = 'current-user' } = req.body;
    
    if (!entityId || !entityType || !action) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    // Generate a shorter ID for audit record to fit within varchar(36)
    const id = `aud-${uuidv4().slice(0, 8)}`;
    const timestamp = new Date().toISOString();

    // Check if PostgreSQL is enabled
    if (req.app.locals.db) {
      const pool = req.app.locals.db;
      
      try {
        // Limit the details to prevent oversized entries
        const cleanDetails = typeof details === 'object' ? 
          JSON.stringify(details).substring(0, 10000) : // Limit to 10K chars
          (details || '').substring(0, 1000); // Limit string to 1K chars
        
        const query = `
          INSERT INTO audit_records (
            id, entity_id, entity_type, action, timestamp, user_id, details
          ) 
          VALUES ($1, $2, $3, $4, $5, $6, $7)
          RETURNING *
        `;
        
        const values = [
          id,
          entityId,
          entityType,
          action,
          timestamp,
          userId,
          cleanDetails
        ];
        
        const result = await pool.query(query, values);
        res.status(201).json(result.rows[0]);
      } catch (error) {
        console.error('Error creating audit record in PostgreSQL:', error);
        // If PostgreSQL insert fails, still send a success to not block the main operation
        res.status(201).json({
          id,
          entityId,
          entityType,
          action,
          timestamp,
          userId,
          details: "Error storing details: " + error.message
        });
      }
    } else {
      // In-memory storage for development
      const newRecord = {
        id,
        entityId,
        entityType,
        action,
        details,
        timestamp,
        userId
      };

      auditRecords.push(newRecord);
      res.status(201).json(newRecord);
    }
  } catch (error) {
    console.error('Error in createAuditRecord:', error);
    // Still return 201 to not block main operations
    res.status(201).json({ 
      id: `aud-error-${Date.now()}`,
      message: 'Audit record creation failed, but operation will continue',
      error: error.message
    });
  }
};

export {
  getAllAuditRecords,
  getAuditRecordsByEntityId,
  getAuditRecordsByEntityType,
  createAuditRecord
};
