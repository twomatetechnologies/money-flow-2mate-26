/**
 * SIP Investments API Implementation
 * Uses PostgreSQL for data storage when enabled
 */
import { v4 as uuidv4 } from 'uuid';
import { mapFamilyMemberIdToDb } from '../utils/familyMemberUtils.js';

// Helper to map camelCase from request to snake_case for DB
const mapRequestToDbColumns = (body) => {
  const dbData = {};
  if (body.name !== undefined) dbData.name = body.name;
  if (body.type !== undefined) dbData.type = body.type; // SIP Category
  if (body.fundType !== undefined) dbData.fund_type = body.fundType; // Asset Class
  if (body.amount !== undefined) dbData.amount = body.amount;
  if (body.frequency !== undefined) dbData.frequency = body.frequency;
  if (body.startDate !== undefined) dbData.start_date = body.startDate;
  if (body.endDate !== undefined) dbData.end_date = body.endDate;
  if (body.duration !== undefined) dbData.duration = body.duration;
  if (body.currentValue !== undefined) dbData.current_value = body.currentValue;
  if (body.returns !== undefined) dbData.returns = body.returns;
  if (body.returnsPercent !== undefined) dbData.returns_percent = body.returnsPercent;
  if (body.familyMemberId !== undefined) dbData.family_member_id = body.familyMemberId; // Will be mapped later
  if (body.units !== undefined) dbData.units = body.units;
  if (body.currentNav !== undefined) dbData.current_nav = body.currentNav;
  if (body.notes !== undefined) dbData.notes = body.notes;
  return dbData;
};


// Get all SIP investments with optional filters
const getAllSIPInvestments = async (req, res) => {
  try {
    // Check if we have a database connection (matching pattern from stocks.js)
    if (!req.app.locals.db || process.env.POSTGRES_ENABLED !== 'true') {
      return res.status(500).json({ error: 'PostgreSQL is required for SIP investments' });
    }
    const pool = req.app.locals.db;
    // ... keep existing code (filtering logic, ensure it uses snake_case for DB columns)
    const { name, familyMemberId, type /* SIP Category */, fundType /* Asset Class */ } = req.query;
      
    let query = 'SELECT * FROM sip_investments WHERE 1=1';
    const queryParams = [];
    
    if (name) {
      queryParams.push(`%${name}%`);
      query += ` AND name ILIKE $${queryParams.length}`;
    }
    
    if (familyMemberId) {
      queryParams.push(familyMemberId);
      query += ` AND family_member_id = $${queryParams.length}`; // Assuming DB column is family_member_id
    }
    
    if (type) { // This 'type' from query refers to the SIP Category
      queryParams.push(type);
      query += ` AND type = $${queryParams.length}`;
    }

    if (fundType) { // This 'fundType' from query refers to the Asset Class
        queryParams.push(fundType);
        query += ` AND fund_type = $${queryParams.length}`; 
    }
    
    query += ` ORDER BY start_date DESC, name ASC`; // Default ordering

    const result = await pool.query(query, queryParams);
    res.json(result.rows); // rows will have snake_case keys from DB

  } catch (error) {
    console.error('Error fetching SIP investments:', error);
    res.status(500).json({ error: error.message });
  }
};

// Get a specific SIP investment by ID
const getSIPInvestmentById = async (req, res) => {
  try {
    if (!req.app.locals.db || process.env.POSTGRES_ENABLED !== 'true') {
      return res.status(500).json({ error: 'PostgreSQL is required for SIP investments' });
    }
    const { id } = req.params;
    const pool = req.app.locals.db;
    
    const query = 'SELECT * FROM sip_investments WHERE id = $1';
    const result = await pool.query(query, [id]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: `SIP investment with ID ${id} not found` });
    }
    
    res.json(result.rows[0]); // row will have snake_case keys from DB
  } catch (error) {
    console.error(`Error fetching SIP investment with ID ${req.params.id}:`, error);
    res.status(500).json({ error: error.message });
  }
};

// Create a new SIP investment
const createSIPInvestment = async (req, res) => {
  try {
    if (!req.app.locals.db || process.env.POSTGRES_ENABLED !== 'true') {
      return res.status(500).json({ error: 'PostgreSQL is required for SIP investments' });
    }
    const pool = req.app.locals.db;
    const body = req.body; // Expected to be camelCase from client

    const {
        name,
        type, // SIP Category e.g. Mutual Fund, ELSS
        fund_type, // Asset Class e.g. Equity, Debt
        amount,
        frequency,
        start_date,
        end_date,
        duration,
        current_value,
        returns,
        returns_percent,
        family_member_id, // Raw familyMemberId from client
        units,
        current_nav,
        notes,
    } = mapRequestToDbColumns(body);


    if (!name || amount === undefined || !start_date) {
      return res.status(400).json({ error: 'Missing required fields: name, amount, and startDate are required' });
    }
    
    const id = `sip-${uuidv4().slice(0, 8)}`;
    const last_updated = new Date().toISOString();
    
    let effectiveFamilyMemberId = null;
    if (family_member_id) {
        try {
            effectiveFamilyMemberId = await mapFamilyMemberIdToDb(pool, family_member_id);
            if (!effectiveFamilyMemberId) throw new Error("Family member mapping failed or returned null.");

            const verifyQuery = "SELECT EXISTS(SELECT 1 FROM family_members WHERE id = $1)";
            const verifyResult = await pool.query(verifyQuery, [effectiveFamilyMemberId]);
            if (!verifyResult.rows[0].exists) {
                throw new Error(`Mapped family member ID ${effectiveFamilyMemberId} does not exist in the database`);
            }
        } catch (error) {
            console.error('Error mapping or verifying family member ID during create:', error);
            // Decide if this is a hard error or if null is acceptable
             return res.status(400).json({ 
                error: `Invalid family member ID provided or mapping failed: ${error.message}. Ensure family members exist.` 
            });
        }
    }
          
    const insertQuery = `
      INSERT INTO sip_investments (
        id, name, type, fund_type, amount, frequency, start_date, end_date, duration, 
        current_value, returns, returns_percent, family_member_id, 
        units, current_nav, notes, last_updated
      ) 
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17)
      RETURNING *
    `;
    
    const values = [
      id, name, type || 'Mutual Fund', fund_type || 'Equity', amount, frequency || 'Monthly',
      start_date, end_date, duration, current_value || amount, returns || 0, returns_percent || 0,
      effectiveFamilyMemberId, units, current_nav, notes, last_updated
    ];
    
    const result = await pool.query(insertQuery, values);
    res.status(201).json(result.rows[0]); // row will have snake_case keys from DB

  } catch (error) {
    console.error('Error creating SIP investment:', error);
    res.status(500).json({ error: error.message });
  }
};

// Update an existing SIP investment
const updateSIPInvestment = async (req, res) => {
  try {
    if (!req.app.locals.db || process.env.POSTGRES_ENABLED !== 'true') {
      return res.status(500).json({ error: 'PostgreSQL is required for SIP investments' });
    }
    const { id } = req.params;
    const pool = req.app.locals.db;
    const body = req.body; // Expected to be camelCase from client

    const checkQuery = 'SELECT * FROM sip_investments WHERE id = $1';
    const checkResult = await pool.query(checkQuery, [id]);
    
    if (checkResult.rows.length === 0) {
      return res.status(404).json({ error: `SIP investment with ID ${id} not found` });
    }
    
    const updatesFromRequest = mapRequestToDbColumns(body);
    
    const updates = [];
    const values = [];
    let paramIndex = 1;

    for (const key in updatesFromRequest) {
        if (key === 'family_member_id' && updatesFromRequest[key]) {
            try {
                const effectiveFamilyMemberId = await mapFamilyMemberIdToDb(pool, updatesFromRequest[key]);
                 if (!effectiveFamilyMemberId) throw new Error("Family member mapping failed or returned null.");

                const verifyQuery = "SELECT EXISTS(SELECT 1 FROM family_members WHERE id = $1)";
                const verifyResult = await pool.query(verifyQuery, [effectiveFamilyMemberId]);
                if (!verifyResult.rows[0].exists) {
                    throw new Error(`Mapped family member ID ${effectiveFamilyMemberId} does not exist in the database`);
                }
                updates.push(`family_member_id = $${paramIndex++}`);
                values.push(effectiveFamilyMemberId);
            } catch (error) {
                 console.error('Error mapping or verifying family member ID during update:', error);
                 return res.status(400).json({ 
                    error: `Invalid family member ID provided for update or mapping failed: ${error.message}. Ensure family members exist.`
                });
            }
        } else if (updatesFromRequest[key] !== undefined) {
            updates.push(`${key} = $${paramIndex++}`); // key is already snake_case from mapRequestToDbColumns
            values.push(updatesFromRequest[key]);
        }
    }
            
    if (updates.length === 0 && !(body.familyMemberId && updatesFromRequest.family_member_id === undefined)) { // No actual fields to update other than potentially family_member_id which might be nullified
        return res.json(checkResult.rows[0]); // Return existing record if no changes
    }

    updates.push(`last_updated = $${paramIndex++}`);
    values.push(new Date().toISOString());
    
    values.push(id); // Add ID for the WHERE clause (last parameter)
    
    const updateQuery = `
      UPDATE sip_investments 
      SET ${updates.join(', ')} 
      WHERE id = $${paramIndex} 
      RETURNING *
    `;
    
    const result = await pool.query(updateQuery, values);
    res.json(result.rows[0]); // row will have snake_case keys from DB

  } catch (error) {
    console.error(`Error updating SIP investment with ID ${req.params.id}:`, error);
    res.status(500).json({ error: error.message });
  }
};

// Delete a SIP investment
const deleteSIPInvestment = async (req, res) => {
  try {
    if (!req.app.locals.db || process.env.POSTGRES_ENABLED !== 'true') {
     return res.status(500).json({ error: 'PostgreSQL is required for SIP investments' });
    }
    const { id } = req.params;
    const pool = req.app.locals.db;
    
    const checkQuery = 'SELECT * FROM sip_investments WHERE id = $1';
    const checkResult = await pool.query(checkQuery, [id]);
    
    if (checkResult.rows.length === 0) {
      return res.status(404).json({ error: `SIP investment with ID ${id} not found` });
    }
    
    const deleteQuery = 'DELETE FROM sip_investments WHERE id = $1';
    await pool.query(deleteQuery, [id]);
    
    // Standard practice is to return 204 No Content for successful DELETE
    // or 200 OK with a confirmation message.
    res.status(200).json({ success: true, message: `SIP Investment ${id} deleted successfully` });
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
