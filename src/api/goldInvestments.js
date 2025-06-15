/**
 * Gold Investments API Implementation
 * PostgreSQL-only implementation - no in-memory fallback
 */
import { v4 as uuidv4 } from 'uuid';

// Get all gold investments with optional filters
const getAllGoldInvestments = async (req, res) => {
  try {
    const { familyMemberId } = req.query;
    const pool = req.app.locals.db;
    
    let query = 'SELECT * FROM gold_investments WHERE 1=1';
    const params = [];
    
    if (familyMemberId) {
      params.push(familyMemberId);
      query += ` AND family_member_id = $${params.length}`;
    }
    
    query += ' ORDER BY last_updated DESC';
    
    const result = await pool.query(query, params);
    
    // Convert snake_case to camelCase
    const goldInvestments = result.rows.map(row => ({
      id: row.id,
      type: row.type,
      quantity: row.quantity,
      purchasePrice: row.purchase_price,
      currentPrice: row.current_price,
      purchaseDate: row.purchase_date,
      location: row.location,
      familyMemberId: row.family_member_id,
      notes: row.notes,
      lastUpdated: row.last_updated,
      value: row.value
    }));
    
    res.json(goldInvestments);
  } catch (error) {
    console.error('Error in getAllGoldInvestments:', error);
    res.status(500).json({ error: error.message });
  }
};

// Get a specific gold investment by ID
const getGoldInvestmentById = async (req, res) => {
  try {
    const { id } = req.params;
    const pool = req.app.locals.db;
    
    const result = await pool.query('SELECT * FROM gold_investments WHERE id = $1', [id]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: `Gold investment with ID ${id} not found` });
    }
    
    const row = result.rows[0];
    const goldInvestment = {
      id: row.id,
      type: row.type,
      quantity: row.quantity,
      purchasePrice: row.purchase_price,
      currentPrice: row.current_price,
      purchaseDate: row.purchase_date,
      location: row.location,
      familyMemberId: row.family_member_id,
      notes: row.notes,
      lastUpdated: row.last_updated,
      value: row.value
    };
    
    res.json(goldInvestment);
  } catch (error) {
    console.error('Error in getGoldInvestmentById:', error);
    res.status(500).json({ error: error.message });
  }
};

// Create a new gold investment
const createGoldInvestment = async (req, res) => {
  try {
    const { 
      type, 
      quantity, 
      purchasePrice, 
      currentPrice,
      purchaseDate,
      location,
      familyMemberId, 
      notes 
    } = req.body;
    
    // Basic validation
    const missingFields = [];
    
    if (!type) missingFields.push('type');
    if (quantity === undefined || quantity === null) missingFields.push('quantity');
    if (purchasePrice === undefined || purchasePrice === null) missingFields.push('purchasePrice');
    
    if (missingFields.length > 0) {
      return res.status(400).json({ 
        error: `Missing required fields: ${missingFields.join(', ')}` 
      });
    }
    
    const newGoldInvestmentId = `gold-${uuidv4().slice(0, 8)}`;
    const actualCurrentPrice = currentPrice || purchasePrice;
    const actualPurchaseDate = purchaseDate || new Date().toISOString().split('T')[0];
    const actualValue = quantity * actualCurrentPrice;
    const pool = req.app.locals.db;
    
    const query = `
      INSERT INTO gold_investments (
        id, type, quantity, purchase_price, 
        current_price, purchase_date, value, location, family_member_id, 
        notes
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
      RETURNING *
    `;
    
    const values = [
      newGoldInvestmentId, 
      type, 
      quantity, 
      purchasePrice, 
      actualCurrentPrice, 
      actualPurchaseDate,
      actualValue,
      location || '', 
      familyMemberId || null, 
      notes || ''
    ];
    
    const result = await pool.query(query, values);
    const row = result.rows[0];
    
    const newGoldInvestment = {
      id: row.id,
      type: row.type,
      quantity: row.quantity,
      purchasePrice: row.purchase_price,
      currentPrice: row.current_price,
      purchaseDate: row.purchase_date,
      value: row.value,
      location: row.location,
      familyMemberId: row.family_member_id,
      notes: row.notes,
      lastUpdated: row.last_updated
    };
    
    // Create audit record
    try {
      await pool.query(
        'INSERT INTO audit_records (id, entity_id, entity_type, action, user_id, details) VALUES ($1, $2, $3, $4, $5, $6)',
        [`aud-${uuidv4().slice(0, 8)}`, newGoldInvestmentId, 'gold_investment', 'create', 'system', JSON.stringify(newGoldInvestment)]
      );
    } catch (auditError) {
      console.error('Failed to create audit record:', auditError);
    }
    
    res.status(201).json(newGoldInvestment);
  } catch (error) {
    console.error('Error in createGoldInvestment:', error);
    res.status(500).json({ error: error.message });
  }
};

// Update an existing gold investment
const updateGoldInvestment = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;
    const now = new Date().toISOString();
    const pool = req.app.locals.db;
    
    // First check if the gold investment exists
    const checkResult = await pool.query('SELECT * FROM gold_investments WHERE id = $1', [id]);
    
    if (checkResult.rows.length === 0) {
      return res.status(404).json({ error: `Gold investment with ID ${id} not found` });
    }
    
    // Build the dynamic update query
    const updates = [];
    const values = [id];
    let paramIndex = 2;
    
    // Map camelCase to snake_case and build the query
    if (updateData.type !== undefined) {
      updates.push(`type = $${paramIndex++}`);
      values.push(updateData.type);
    }
    
    if (updateData.quantity !== undefined) {
      updates.push(`quantity = $${paramIndex++}`);
      values.push(updateData.quantity);
    }
    
    if (updateData.purchasePrice !== undefined) {
      updates.push(`purchase_price = $${paramIndex++}`);
      values.push(updateData.purchasePrice);
    }
    
    if (updateData.currentPrice !== undefined) {
      updates.push(`current_price = $${paramIndex++}`);
      values.push(updateData.currentPrice);
    }
    
    if (updateData.purchaseDate !== undefined) {
      updates.push(`purchase_date = $${paramIndex++}`);
      values.push(updateData.purchaseDate);
    }
    
    if (updateData.location !== undefined) {
      updates.push(`location = $${paramIndex++}`);
      values.push(updateData.location);
    }
    
    if (updateData.notes !== undefined) {
      updates.push(`notes = $${paramIndex++}`);
      values.push(updateData.notes);
    }
    
    // Update calculated value if quantity or currentPrice changed
    if (updateData.quantity !== undefined || updateData.currentPrice !== undefined) {
      const currentRow = checkResult.rows[0];
      const newQuantity = updateData.quantity || currentRow.quantity;
      const newCurrentPrice = updateData.currentPrice || currentRow.current_price;
      updates.push(`value = $${paramIndex++}`);
      values.push(newQuantity * newCurrentPrice);
    }
    
    // Always update the last_updated timestamp
    updates.push(`last_updated = $${paramIndex++}`);
    values.push(now);
    
    // Execute the update query
    const query = `UPDATE gold_investments SET ${updates.join(', ')} WHERE id = $1 RETURNING *`;
    const result = await pool.query(query, values);
    
    const row = result.rows[0];
    const updatedGoldInvestment = {
      id: row.id,
      type: row.type,
      quantity: row.quantity,
      purchasePrice: row.purchase_price,
      currentPrice: row.current_price,
      purchaseDate: row.purchase_date,
      value: row.value,
      location: row.location,
      familyMemberId: row.family_member_id,
      notes: row.notes,
      lastUpdated: row.last_updated
    };
    
    // Create audit record
    try {
      await pool.query(
        'INSERT INTO audit_records (id, entity_id, entity_type, action, user_id, details) VALUES ($1, $2, $3, $4, $5, $6)',
        [`aud-${uuidv4().slice(0, 8)}`, id, 'gold_investment', 'update', 'system', JSON.stringify({
          previous: checkResult.rows[0],
          current: updatedGoldInvestment,
          changes: updateData
        })]
      );
    } catch (auditError) {
      console.error('Failed to create audit record:', auditError);
    }
    
    res.json(updatedGoldInvestment);
  } catch (error) {
    console.error('Error in updateGoldInvestment:', error);
    res.status(500).json({ error: error.message });
  }
};

// Delete a gold investment
const deleteGoldInvestment = async (req, res) => {
  try {
    const { id } = req.params;
    const pool = req.app.locals.db;
    
    // First check if the gold investment exists
    const checkResult = await pool.query('SELECT * FROM gold_investments WHERE id = $1', [id]);
    
    if (checkResult.rows.length === 0) {
      return res.status(404).json({ error: `Gold investment with ID ${id} not found` });
    }
    
    // Execute the delete query
    await pool.query('DELETE FROM gold_investments WHERE id = $1', [id]);
    
    // Create audit record
    try {
      await pool.query(
        'INSERT INTO audit_records (id, entity_id, entity_type, action, user_id, details) VALUES ($1, $2, $3, $4, $5, $6)',
        [`aud-${uuidv4().slice(0, 8)}`, id, 'gold_investment', 'delete', 'system', JSON.stringify(checkResult.rows[0])]
      );
    } catch (auditError) {
      console.error('Failed to create audit record:', auditError);
    }
    
    res.status(204).send();
  } catch (error) {
    console.error('Error in deleteGoldInvestment:', error);
    res.status(500).json({ error: error.message });
  }
};

export {
  getAllGoldInvestments,
  getGoldInvestmentById,
  createGoldInvestment,
  updateGoldInvestment,
  deleteGoldInvestment
};
