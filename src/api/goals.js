/**
 * Financial Goals API Implementation
 * PostgreSQL-only implementation - no in-memory fallback
 */
import { v4 as uuidv4 } from 'uuid';

// Get all financial goals with optional filters
const getAllGoals = async (req, res) => {
  try {
    const { familyMemberId, status } = req.query;
    const pool = req.app.locals.db;
    
    let query = 'SELECT * FROM financial_goals WHERE 1=1';
    const params = [];
    
    if (familyMemberId) {
      params.push(familyMemberId);
      query += ` AND family_member_id = $${params.length}`;
    }
    
    if (status) {
      params.push(status);
      query += ` AND status = $${params.length}`;
    }
    
    query += ' ORDER BY deadline ASC';
    
    const result = await pool.query(query, params);
    
    // Convert snake_case to camelCase
    const goals = result.rows.map(row => ({
      id: row.id,
      name: row.name,
      targetAmount: row.target_amount,
      currentAmount: row.current_amount,
      deadline: row.deadline,
      category: row.category,
      priority: row.priority,
      type: row.type,
      startDate: row.start_date,
      familyMemberId: row.family_member_id,
      notes: row.notes,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
      progress: row.current_amount && row.target_amount ? 
        Math.round((parseFloat(row.current_amount) / parseFloat(row.target_amount)) * 100) : 0
    }));
    
    res.json(goals);
  } catch (error) {
    console.error('Error in getAllGoals:', error);
    res.status(500).json({ error: error.message });
  }
};

// Get a specific goal by ID
const getGoalById = async (req, res) => {
  try {
    const { id } = req.params;
    const pool = req.app.locals.db;
    
    const result = await pool.query('SELECT * FROM financial_goals WHERE id = $1', [id]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: `Financial goal with ID ${id} not found` });
    }
    
    const row = result.rows[0];
    const goal = {
      id: row.id,
      name: row.name,
      targetAmount: row.target_amount,
      currentAmount: row.current_amount,
      deadline: row.deadline,
      category: row.category,
      priority: row.priority,
      type: row.type,
      startDate: row.start_date,
      familyMemberId: row.family_member_id,
      notes: row.notes,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
      progress: row.current_amount && row.target_amount ? 
        Math.round((parseFloat(row.current_amount) / parseFloat(row.target_amount)) * 100) : 0
    };
    
    res.json(goal);
  } catch (error) {
    console.error('Error in getGoalById:', error);
    res.status(500).json({ error: error.message });
  }
};

// Create a new financial goal
const createGoal = async (req, res) => {
  try {
    const { 
      name, 
      targetAmount, 
      currentAmount,
      deadline,
      category,
      priority,
      type,
      startDate,
      familyMemberId, 
      notes 
    } = req.body;
    
    // Basic validation
    const missingFields = [];
    
    if (!name) missingFields.push('name');
    if (targetAmount === undefined || targetAmount === null) missingFields.push('targetAmount');
    if (!deadline) missingFields.push('deadline');
    if (!category) missingFields.push('category');
    
    if (missingFields.length > 0) {
      return res.status(400).json({ 
        error: `Missing required fields: ${missingFields.join(', ')}` 
      });
    }
    
    const newGoalId = `goal-${uuidv4().slice(0, 8)}`;
    const pool = req.app.locals.db;
    
    const query = `
      INSERT INTO financial_goals (
        id, name, target_amount, current_amount,
        deadline, category, priority, type, start_date, family_member_id, 
        notes
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
      RETURNING *
    `;
    
    const values = [
      newGoalId, 
      name, 
      targetAmount, 
      currentAmount || 0, 
      deadline,
      category,
      priority || 'Medium',
      type || 'General',
      startDate || new Date().toISOString().split('T')[0],
      familyMemberId || null, 
      notes || ''
    ];
    
    const result = await pool.query(query, values);
    const row = result.rows[0];
    
    const newGoal = {
      id: row.id,
      name: row.name,
      targetAmount: row.target_amount,
      currentAmount: row.current_amount,
      deadline: row.deadline,
      category: row.category,
      priority: row.priority,
      type: row.type,
      startDate: row.start_date,
      familyMemberId: row.family_member_id,
      notes: row.notes,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
      progress: row.current_amount && row.target_amount ? 
        Math.round((parseFloat(row.current_amount) / parseFloat(row.target_amount)) * 100) : 0
    };
    
    // Create audit record
    try {
      await pool.query(
        'INSERT INTO audit_records (id, entity_id, entity_type, action, user_id, details) VALUES ($1, $2, $3, $4, $5, $6)',
        [`aud-${uuidv4().slice(0, 8)}`, newGoalId, 'financial_goal', 'create', 'system', JSON.stringify(newGoal)]
      );
    } catch (auditError) {
      console.error('Failed to create audit record:', auditError);
    }
    
    res.status(201).json(newGoal);
  } catch (error) {
    console.error('Error in createGoal:', error);
    res.status(500).json({ error: error.message });
  }
};

// Update an existing financial goal
const updateGoal = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;
    const now = new Date().toISOString();
    const pool = req.app.locals.db;
    
    // First check if the goal exists
    const checkResult = await pool.query('SELECT * FROM financial_goals WHERE id = $1', [id]);
    
    if (checkResult.rows.length === 0) {
      return res.status(404).json({ error: `Financial goal with ID ${id} not found` });
    }
    
    // Build the dynamic update query
    const updates = [];
    const values = [id];
    let paramIndex = 2;
    
    // Map camelCase to snake_case and build the query
    if (updateData.title !== undefined) {
      updates.push(`title = $${paramIndex++}`);
      values.push(updateData.title);
    }
    
    if (updateData.description !== undefined) {
      updates.push(`description = $${paramIndex++}`);
      values.push(updateData.description);
    }
    
    if (updateData.targetAmount !== undefined) {
      updates.push(`target_amount = $${paramIndex++}`);
      values.push(updateData.targetAmount);
    }
    
    if (updateData.currentAmount !== undefined) {
      updates.push(`current_amount = $${paramIndex++}`);
      values.push(updateData.currentAmount);
    }
    
    if (updateData.targetDate !== undefined) {
      updates.push(`target_date = $${paramIndex++}`);
      values.push(updateData.targetDate);
    }
    
    if (updateData.category !== undefined) {
      updates.push(`category = $${paramIndex++}`);
      values.push(updateData.category);
    }
    
    if (updateData.priority !== undefined) {
      updates.push(`priority = $${paramIndex++}`);
      values.push(updateData.priority);
    }
    
    if (updateData.status !== undefined) {
      updates.push(`status = $${paramIndex++}`);
      values.push(updateData.status);
    }
    
    if (updateData.notes !== undefined) {
      updates.push(`notes = $${paramIndex++}`);
      values.push(updateData.notes);
    }
    
    // Always update the last_updated timestamp
    updates.push(`last_updated = $${paramIndex++}`);
    values.push(now);
    
    // Execute the update query
    const query = `UPDATE financial_goals SET ${updates.join(', ')} WHERE id = $1 RETURNING *`;
    const result = await pool.query(query, values);
    
    const row = result.rows[0];
    const updatedGoal = {
      id: row.id,
      title: row.title,
      description: row.description,
      targetAmount: row.target_amount,
      currentAmount: row.current_amount,
      targetDate: row.target_date,
      category: row.category,
      priority: row.priority,
      status: row.status,
      familyMemberId: row.family_member_id,
      notes: row.notes,
      lastUpdated: row.last_updated,
      createdAt: row.created_at,
      progress: row.current_amount && row.target_amount ? 
        Math.round((parseFloat(row.current_amount) / parseFloat(row.target_amount)) * 100) : 0
    };
    
    // Create audit record
    try {
      await pool.query(
        'INSERT INTO audit_records (id, entity_id, entity_type, action, user_id, details) VALUES ($1, $2, $3, $4, $5, $6)',
        [`aud-${uuidv4().slice(0, 8)}`, id, 'financial_goal', 'update', 'system', JSON.stringify({
          previous: checkResult.rows[0],
          current: updatedGoal,
          changes: updateData
        })]
      );
    } catch (auditError) {
      console.error('Failed to create audit record:', auditError);
    }
    
    res.json(updatedGoal);
  } catch (error) {
    console.error('Error in updateGoal:', error);
    res.status(500).json({ error: error.message });
  }
};

// Delete a financial goal
const deleteGoal = async (req, res) => {
  try {
    const { id } = req.params;
    const pool = req.app.locals.db;
    
    // First check if the goal exists
    const checkResult = await pool.query('SELECT * FROM financial_goals WHERE id = $1', [id]);
    
    if (checkResult.rows.length === 0) {
      return res.status(404).json({ error: `Financial goal with ID ${id} not found` });
    }
    
    // Execute the delete query
    await pool.query('DELETE FROM financial_goals WHERE id = $1', [id]);
    
    // Create audit record
    try {
      await pool.query(
        'INSERT INTO audit_records (id, entity_id, entity_type, action, user_id, details) VALUES ($1, $2, $3, $4, $5, $6)',
        [`aud-${uuidv4().slice(0, 8)}`, id, 'financial_goal', 'delete', 'system', JSON.stringify(checkResult.rows[0])]
      );
    } catch (auditError) {
      console.error('Failed to create audit record:', auditError);
    }
    
    res.status(204).send();
  } catch (error) {
    console.error('Error in deleteGoal:', error);
    res.status(500).json({ error: error.message });
  }
};

export {
  getAllGoals,
  getGoalById,
  createGoal,
  updateGoal,
  deleteGoal
};
