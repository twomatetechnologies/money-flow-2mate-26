/**
 * SIP Investments API Implementation
 * Uses PostgreSQL for data storage when enabled
 */
import { v4 as uuidv4 } from 'uuid';
import { mapFamilyMemberIdToDb } from '../utils/familyMemberUtils.js';

// Get all SIP investments with optional filters
const getAllSIPInvestments = async (req, res) => {
  try {
    // Check if PostgreSQL is enabled
    if (req.app.locals.db) {
      const { name, familyMemberId, type } = req.query;
      const pool = req.app.locals.db;
      
      // Build the query dynamically based on filters
      let query = 'SELECT * FROM sip_investments WHERE 1=1';
      const queryParams = [];
      
      if (name) {
        queryParams.push(`%${name}%`);
        query += ` AND name ILIKE $${queryParams.length}`;
      }
      
      if (familyMemberId) {
        queryParams.push(familyMemberId);
        query += ` AND family_member_id = $${queryParams.length}`;
      }
      
      if (type) {
        queryParams.push(type);
        query += ` AND (type = $${queryParams.length} OR fund_type = $${queryParams.length})`;
      }
      
      // Execute the query
      const result = await pool.query(query, queryParams);
      res.json(result.rows);
    } else {
      // If PostgreSQL is not enabled, use in-memory storage
      res.status(500).json({ error: 'PostgreSQL is required for SIP investments' });
    }
  } catch (error) {
    console.error('Error fetching SIP investments:', error);
    res.status(500).json({ error: error.message });
  }
};

// Get a specific SIP investment by ID
const getSIPInvestmentById = async (req, res) => {
  try {
    // Check if PostgreSQL is enabled
    if (req.app.locals.db) {
      const { id } = req.params;
      const pool = req.app.locals.db;
      
      const query = 'SELECT * FROM sip_investments WHERE id = $1';
      const result = await pool.query(query, [id]);
      
      if (result.rows.length === 0) {
        return res.status(404).json({ error: `SIP investment with ID ${id} not found` });
      }
      
      res.json(result.rows[0]);
    } else {
      // If PostgreSQL is not enabled, return error
      res.status(500).json({ error: 'PostgreSQL is required for SIP investments' });
    }
  } catch (error) {
    console.error(`Error fetching SIP investment with ID ${req.params.id}:`, error);
    res.status(500).json({ error: error.message });
  }
};

// Create a new SIP investment
const createSIPInvestment = async (req, res) => {
  try {
    // Check if PostgreSQL is enabled
    if (req.app.locals.db) {
      const { 
        name, 
        type, 
        amount, 
        frequency, 
        startDate, 
        duration, 
        currentValue, 
        returns, 
        returnsPercent, 
        familyMemberId 
      } = req.body;
      
      const pool = req.app.locals.db;
      
      // Basic validation
      if (!name || !amount || !startDate) {
        return res.status(400).json({ error: 'Missing required fields: name, amount, and startDate are required' });
      }
      
      // Generate ID and prepare the investment data
      const id = `sip-${uuidv4().slice(0, 8)}`;
      const fundType = type || 'Mutual Fund';
      const lastUpdated = new Date().toISOString();
      
      // Always map the family member ID to ensure it's valid in the database
      // Default to 'self-default' if not provided, which will be mapped to a valid DB ID
      let effectiveFamilyMemberId;
      try {
        effectiveFamilyMemberId = await mapFamilyMemberIdToDb(pool, familyMemberId || 'self-default');
        
        // Double-check that we have a valid ID
        if (!effectiveFamilyMemberId) {
          throw new Error("Mapping family member ID failed");
        }
        
        // Verify the ID exists in the database
        const verifyQuery = "SELECT EXISTS(SELECT 1 FROM family_members WHERE id = $1)";
        const verifyResult = await pool.query(verifyQuery, [effectiveFamilyMemberId]);
        
        if (!verifyResult.rows[0].exists) {
          throw new Error(`Mapped family member ID ${effectiveFamilyMemberId} does not exist in the database`);
        }
      } catch (error) {
        console.error('Error mapping family member ID:', error);
        return res.status(400).json({ 
          error: "No valid family members found in the database. Please create a family member first." 
        });
      }
      
      // Insert into database
      const query = `
        INSERT INTO sip_investments (
          id, name, type, amount, frequency, start_date, duration, 
          current_value, returns, returns_percent, family_member_id, 
          fund_type, last_updated
        ) 
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)
        RETURNING *
      `;
      
      const values = [
        id,
        name,
        type || 'Mutual Fund',
        amount,
        frequency || 'Monthly',
        startDate,
        duration || 12,
        currentValue || amount, // Default current value to amount if not provided
        returns || 0,
        returnsPercent || 0,
        effectiveFamilyMemberId,
        fundType, // For database compatibility
        lastUpdated
      ];
      
      const result = await pool.query(query, values);
      res.status(201).json(result.rows[0]);
    } else {
      // If PostgreSQL is not enabled, return error
      res.status(500).json({ error: 'PostgreSQL is required for SIP investments' });
    }
  } catch (error) {
    console.error('Error creating SIP investment:', error);
    res.status(500).json({ error: error.message });
  }
};

// Update an existing SIP investment
const updateSIPInvestment = async (req, res) => {
  try {
    // Check if PostgreSQL is enabled
    if (req.app.locals.db) {
      const { id } = req.params;
      const { 
        name, 
        type, 
        amount, 
        frequency, 
        startDate, 
        duration, 
        currentValue, 
        returns, 
        returnsPercent, 
        familyMemberId 
      } = req.body;
      
      const pool = req.app.locals.db;
      
      // Check if the investment exists
      const checkQuery = 'SELECT * FROM sip_investments WHERE id = $1';
      const checkResult = await pool.query(checkQuery, [id]);
      
      if (checkResult.rows.length === 0) {
        return res.status(404).json({ error: `SIP investment with ID ${id} not found` });
      }
      
      // Build the SET clause dynamically based on provided fields
      const updates = [];
      const values = [id]; // First parameter is always the ID
      let paramIndex = 2; // Start parameter index from 2 (after ID)
      
      if (name !== undefined) {
        updates.push(`name = $${paramIndex++}`);
        values.push(name);
      }
      
      if (type !== undefined) {
        updates.push(`type = $${paramIndex++}`);
        values.push(type);
        updates.push(`fund_type = $${paramIndex++}`); // For database compatibility
        values.push(type);
      }
      
      if (amount !== undefined) {
        updates.push(`amount = $${paramIndex++}`);
        values.push(amount);
      }
      
      if (frequency !== undefined) {
        updates.push(`frequency = $${paramIndex++}`);
        values.push(frequency);
      }
      
      if (startDate !== undefined) {
        updates.push(`start_date = $${paramIndex++}`);
        values.push(startDate);
      }
      
      if (duration !== undefined) {
        updates.push(`duration = $${paramIndex++}`);
        values.push(duration);
      }
      
      if (currentValue !== undefined) {
        updates.push(`current_value = $${paramIndex++}`);
        values.push(currentValue);
      }
      
      if (returns !== undefined) {
        updates.push(`returns = $${paramIndex++}`);
        values.push(returns);
      }
      
      if (returnsPercent !== undefined) {
        updates.push(`returns_percent = $${paramIndex++}`);
        values.push(returnsPercent);
      }
      
      if (familyMemberId !== undefined) {
        try {
          // Map the familyMemberId to a valid database ID
          const effectiveFamilyMemberId = await mapFamilyMemberIdToDb(pool, familyMemberId);
          
          // Double-check that we have a valid ID
          if (!effectiveFamilyMemberId) {
            throw new Error("Mapping family member ID failed");
          }
          
          // Verify the ID exists in the database
          const verifyQuery = "SELECT EXISTS(SELECT 1 FROM family_members WHERE id = $1)";
          const verifyResult = await pool.query(verifyQuery, [effectiveFamilyMemberId]);
          
          if (!verifyResult.rows[0].exists) {
            throw new Error(`Mapped family member ID ${effectiveFamilyMemberId} does not exist in the database`);
          }
          
          updates.push(`family_member_id = $${paramIndex++}`);
          values.push(effectiveFamilyMemberId);
        } catch (error) {
          console.error('Error mapping family member ID:', error);
          return res.status(400).json({ 
            error: "Failed to map family member ID. Please ensure family members exist in the database." 
          });
        }
      }
      
      // Always update the last_updated timestamp
      updates.push(`last_updated = $${paramIndex++}`);
      values.push(new Date().toISOString());
      
      // If no fields to update, just return the existing record
      if (updates.length === 1 && updates[0].startsWith('last_updated')) {
        return res.json(checkResult.rows[0]);
      }
      
      // Construct and execute the update query
      const updateQuery = `
        UPDATE sip_investments 
        SET ${updates.join(', ')} 
        WHERE id = $1 
        RETURNING *
      `;
      
      const result = await pool.query(updateQuery, values);
      res.json(result.rows[0]);
    } else {
      // If PostgreSQL is not enabled, return error
      res.status(500).json({ error: 'PostgreSQL is required for SIP investments' });
    }
  } catch (error) {
    console.error(`Error updating SIP investment with ID ${req.params.id}:`, error);
    res.status(500).json({ error: error.message });
  }
};

// Delete a SIP investment
const deleteSIPInvestment = async (req, res) => {
  try {
    // Check if PostgreSQL is enabled
    if (req.app.locals.db) {
      const { id } = req.params;
      const pool = req.app.locals.db;
      
      // Check if the investment exists before deleting
      const checkQuery = 'SELECT * FROM sip_investments WHERE id = $1';
      const checkResult = await pool.query(checkQuery, [id]);
      
      if (checkResult.rows.length === 0) {
        return res.status(404).json({ error: `SIP investment with ID ${id} not found` });
      }
      
      // Delete the investment
      const deleteQuery = 'DELETE FROM sip_investments WHERE id = $1';
      await pool.query(deleteQuery, [id]);
      
      res.status(200).json({ success: true });
    } else {
      // If PostgreSQL is not enabled, return error
      res.status(500).json({ error: 'PostgreSQL is required for SIP investments' });
    }
  } catch (error) {
    console.error(`Error deleting SIP investment with ID ${req.params.id}:`, error);
    res.status(500).json({ error: error.message });
  }
};

export {
  getAllSIPInvestments,
  getSIPInvestmentById,
  createSIPInvestment,
  updateSIPInvestment,
  deleteSIPInvestment
};
