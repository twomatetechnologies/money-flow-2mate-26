/**
 * Insurance Policies API Implementation
 */
import { v4 as uuidv4 } from 'uuid';

// Helper function to map database column names to camelCase
const mapDbToResponse = (dbRow) => {
  return {
    id: dbRow.id,
    type: dbRow.type,
    policyNumber: dbRow.policy_number,
    provider: dbRow.provider,
    coverAmount: dbRow.cover_amount,
    premium: dbRow.premium,
    frequency: dbRow.frequency,
    startDate: dbRow.start_date,
    endDate: dbRow.end_date,
    familyMemberId: dbRow.family_member_id,
    documents: dbRow.documents || [],
    notes: dbRow.notes,
    lastUpdated: dbRow.last_updated
  };
};

// Helper function to map request body to database columns
const mapRequestToDbColumns = (body) => {
  const dbData = {};
  if (body.type !== undefined) dbData.type = body.type;
  if (body.policyNumber !== undefined) dbData.policy_number = body.policyNumber;
  if (body.provider !== undefined) dbData.provider = body.provider;
  if (body.coverAmount !== undefined) dbData.cover_amount = body.coverAmount;
  if (body.premium !== undefined) dbData.premium = body.premium;
  if (body.frequency !== undefined) dbData.frequency = body.frequency;
  if (body.startDate !== undefined) dbData.start_date = body.startDate;
  if (body.endDate !== undefined) dbData.end_date = body.endDate;
  if (body.familyMemberId !== undefined) dbData.family_member_id = body.familyMemberId;
  if (body.documents !== undefined) dbData.documents = body.documents;
  if (body.notes !== undefined) dbData.notes = body.notes;
  return dbData;
};

// Get all insurance policies with optional filters
const getAllInsurancePolicies = async (req, res) => {
  try {
    const db = req.app.locals.db;
    const { type, familyMemberId } = req.query;
    
    let query = 'SELECT * FROM insurance_policies WHERE 1=1';
    const params = [];
    let paramIndex = 1;

    if (type) {
      query += ` AND LOWER(type) = LOWER($${paramIndex})`;
      params.push(type);
      paramIndex++;
    }

    if (familyMemberId) {
      query += ` AND family_member_id = $${paramIndex}`;
      params.push(familyMemberId);
      paramIndex++;
    }

    query += ' ORDER BY start_date DESC';

    const result = await db.query(query, params);
    const mappedPolicies = result.rows.map(mapDbToResponse);
    
    res.json(mappedPolicies);
  } catch (error) {
    console.error('Error fetching insurance policies:', error);
    res.status(500).json({ error: 'Failed to retrieve insurance policies' });
  }
};

// Get a specific insurance policy by ID
const getInsurancePolicyById = async (req, res) => {
  try {
    const db = req.app.locals.db;
    const { id } = req.params;
    
    const result = await db.query('SELECT * FROM insurance_policies WHERE id = $1', [id]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: `Insurance policy with ID ${id} not found` });
    }
    
    const mappedPolicy = mapDbToResponse(result.rows[0]);
    res.json(mappedPolicy);
  } catch (error) {
    console.error('Error fetching insurance policy:', error);
    res.status(500).json({ error: 'Failed to retrieve insurance policy' });
  }
};

// Create a new insurance policy
const createInsurancePolicy = async (req, res) => {
  try {
    const db = req.app.locals.db;
    const body = req.body;
    
    // Validate required fields
    if (!body.type || !body.policyNumber || !body.provider || !body.coverAmount || !body.premium || !body.frequency || !body.startDate || !body.endDate) {
      return res.status(400).json({ error: 'Missing required fields: type, policyNumber, provider, coverAmount, premium, frequency, startDate, endDate' });
    }

    const newId = `ins-${uuidv4()}`;
    const dbData = mapRequestToDbColumns(body);
    
    // Set default values
    dbData.id = newId;
    dbData.family_member_id = dbData.family_member_id || 'self-default';
    dbData.documents = dbData.documents || [];
    dbData.last_updated = new Date();

    const query = `
      INSERT INTO insurance_policies (
        id, type, policy_number, provider, cover_amount, premium, frequency, 
        start_date, end_date, family_member_id, documents, notes, last_updated
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13) 
      RETURNING *
    `;
    
    const values = [
      dbData.id,
      dbData.type,
      dbData.policy_number,
      dbData.provider,
      dbData.cover_amount,
      dbData.premium,
      dbData.frequency,
      dbData.start_date,
      dbData.end_date,
      dbData.family_member_id,
      JSON.stringify(dbData.documents),
      dbData.notes,
      dbData.last_updated
    ];
    
    const result = await db.query(query, values);
    const mappedPolicy = mapDbToResponse(result.rows[0]);
    
    res.status(201).json(mappedPolicy);
  } catch (error) {
    console.error('Error creating insurance policy:', error);
    res.status(500).json({ error: 'Failed to create insurance policy' });
  }
};

// Update an insurance policy
const updateInsurancePolicy = async (req, res) => {
  try {
    const db = req.app.locals.db;
    const { id } = req.params;
    const body = req.body;

    // Check if policy exists
    const checkResult = await db.query('SELECT * FROM insurance_policies WHERE id = $1', [id]);
    
    if (checkResult.rows.length === 0) {
      return res.status(404).json({ error: `Insurance policy with ID ${id} not found` });
    }
    
    const updatesFromRequest = mapRequestToDbColumns(body);
    
    const updates = [];
    const values = [];
    let paramIndex = 1;

    for (const key in updatesFromRequest) {
      if (updatesFromRequest[key] !== undefined) {
        updates.push(`${key} = $${paramIndex}`);
        values.push(updatesFromRequest[key]);
        paramIndex++;
      }
    }

    if (updates.length === 0) {
      return res.status(400).json({ error: 'No valid fields to update' });
    }

    // Add last_updated
    updates.push(`last_updated = $${paramIndex}`);
    values.push(new Date());
    paramIndex++;

    values.push(id); // For the WHERE clause

    const query = `
      UPDATE insurance_policies 
      SET ${updates.join(', ')} 
      WHERE id = $${paramIndex} 
      RETURNING *
    `;
    
    const result = await db.query(query, values);
    const mappedPolicy = mapDbToResponse(result.rows[0]);
    
    res.json(mappedPolicy);
  } catch (error) {
    console.error('Error updating insurance policy:', error);
    res.status(500).json({ error: 'Failed to update insurance policy' });
  }
};

// Delete an insurance policy
const deleteInsurancePolicy = async (req, res) => {
  try {
    const db = req.app.locals.db;
    const { id } = req.params;
    
    // Check if policy exists
    const checkResult = await db.query('SELECT * FROM insurance_policies WHERE id = $1', [id]);
    
    if (checkResult.rows.length === 0) {
      return res.status(404).json({ error: `Insurance policy with ID ${id} not found` });
    }
    
    await db.query('DELETE FROM insurance_policies WHERE id = $1', [id]);
    
    res.status(200).json({ success: true });
  } catch (error) {
    console.error('Error deleting insurance policy:', error);
    res.status(500).json({ error: 'Failed to delete insurance policy' });
  }
};

export {
  getAllInsurancePolicies,
  getInsurancePolicyById,
  createInsurancePolicy,
  updateInsurancePolicy,
  deleteInsurancePolicy
};
