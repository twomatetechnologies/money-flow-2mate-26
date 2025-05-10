/**
 * Audit Records API Implementation
 */
import { v4 as uuidv4 } from 'uuid';

// In-memory data store for development
let auditRecords = [];

// Get all audit records with optional filters
const getAllAuditRecords = (req, res) => {
  try {
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
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get audit records by entity ID
const getAuditRecordsByEntityId = (req, res) => {
  try {
    const { entityId } = req.params;
    const records = auditRecords.filter(record => record.entityId === entityId);
    res.json(records);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get audit records by entity type
const getAuditRecordsByEntityType = (req, res) => {
  try {
    const { entityType } = req.params;
    const records = auditRecords.filter(record => record.entityType === entityType);
    res.json(records);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Create a new audit record
const createAuditRecord = (req, res) => {
  try {
    const { entityId, entityType, action, details } = req.body;
    
    if (!entityId || !entityType || !action) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const newRecord = {
      id: `audit-${uuidv4()}`,
      entityId,
      entityType,
      action,
      details,
      timestamp: new Date().toISOString()
    };

    auditRecords.push(newRecord);
    res.status(201).json(newRecord);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export {
  getAllAuditRecords,
  getAuditRecordsByEntityId,
  getAuditRecordsByEntityType,
  createAuditRecord
};
