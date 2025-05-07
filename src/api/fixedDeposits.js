
/**
 * API handlers for Fixed Deposit operations
 */
const { Pool } = require('pg');
const { v4: uuidv4 } = require('uuid');

// Create a PostgreSQL connection pool
const pool = new Pool({
  host: process.env.POSTGRES_HOST || 'db',
  port: parseInt(process.env.POSTGRES_PORT || '5432'),
  database: process.env.POSTGRES_DB || 'financeapp',
  user: process.env.POSTGRES_USER || 'postgres',
  password: process.env.POSTGRES_PASSWORD || 'postgres123'
});

// Get all fixed deposits
exports.getAllFixedDeposits = async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT * FROM fixed_deposits
      ORDER BY maturity_date ASC
    `);
    
    // Transform from snake_case to camelCase
    const deposits = result.rows.map(row => ({
      id: row.id,
      bankName: row.bank_name,
      accountNumber: row.account_number,
      principal: parseFloat(row.principal),
      interestRate: parseFloat(row.interest_rate),
      startDate: row.start_date,
      maturityDate: row.maturity_date,
      maturityAmount: parseFloat(row.maturity_amount || 0),
      isAutoRenew: row.is_auto_renewal,
      notes: row.notes,
      familyMemberId: row.family_member_id,
      lastUpdated: row.last_updated
    }));
    
    res.json(deposits);
  } catch (error) {
    console.error('Database error:', error);
    res.status(500).json({ error: 'Failed to fetch fixed deposits' });
  }
};

// Get a specific fixed deposit by ID
exports.getFixedDepositById = async (req, res) => {
  try {
    const { id } = req.params;
    
    const result = await pool.query(`
      SELECT * FROM fixed_deposits
      WHERE id = $1
    `, [id]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Fixed deposit not found' });
    }
    
    const row = result.rows[0];
    const deposit = {
      id: row.id,
      bankName: row.bank_name,
      accountNumber: row.account_number,
      principal: parseFloat(row.principal),
      interestRate: parseFloat(row.interest_rate),
      startDate: row.start_date,
      maturityDate: row.maturity_date,
      maturityAmount: parseFloat(row.maturity_amount || 0),
      isAutoRenew: row.is_auto_renewal,
      notes: row.notes,
      familyMemberId: row.family_member_id,
      lastUpdated: row.last_updated
    };
    
    res.json(deposit);
  } catch (error) {
    console.error('Database error:', error);
    res.status(500).json({ error: 'Failed to fetch fixed deposit' });
  }
};

// Create a new fixed deposit
exports.createFixedDeposit = async (req, res) => {
  try {
    const {
      id = uuidv4(),
      bankName,
      accountNumber,
      principal,
      interestRate,
      startDate,
      maturityDate,
      maturityAmount,
      isAutoRenew,
      notes,
      familyMemberId
    } = req.body;
    
    const result = await pool.query(`
      INSERT INTO fixed_deposits (
        id, bank_name, account_number, principal, interest_rate, 
        start_date, maturity_date, maturity_amount, is_auto_renewal, 
        notes, family_member_id, last_updated
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
      RETURNING *
    `, [
      id, bankName, accountNumber, principal, interestRate,
      startDate, maturityDate, maturityAmount, isAutoRenew,
      notes, familyMemberId, new Date()
    ]);
    
    const row = result.rows[0];
    const deposit = {
      id: row.id,
      bankName: row.bank_name,
      accountNumber: row.account_number,
      principal: parseFloat(row.principal),
      interestRate: parseFloat(row.interest_rate),
      startDate: row.start_date,
      maturityDate: row.maturity_date,
      maturityAmount: parseFloat(row.maturity_amount || 0),
      isAutoRenew: row.is_auto_renewal,
      notes: row.notes,
      familyMemberId: row.family_member_id,
      lastUpdated: row.last_updated
    };
    
    res.status(201).json(deposit);
  } catch (error) {
    console.error('Database error:', error);
    res.status(500).json({ error: 'Failed to create fixed deposit' });
  }
};

// Update a fixed deposit
exports.updateFixedDeposit = async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;
    
    // Build dynamic update query based on provided fields
    const setClauses = [];
    const values = [];
    let paramCounter = 1;
    
    // Map camelCase to snake_case for database columns
    const fieldMappings = {
      bankName: 'bank_name',
      accountNumber: 'account_number',
      principal: 'principal',
      interestRate: 'interest_rate',
      startDate: 'start_date',
      maturityDate: 'maturity_date',
      maturityAmount: 'maturity_amount',
      isAutoRenew: 'is_auto_renewal',
      notes: 'notes',
      familyMemberId: 'family_member_id'
    };
    
    // Always update last_updated
    setClauses.push(`last_updated = $${paramCounter}`);
    values.push(new Date());
    paramCounter++;
    
    // Add other fields if they exist in the update
    Object.entries(updates).forEach(([key, value]) => {
      // Skip id and lastUpdated as they are handled separately
      if (key === 'id' || key === 'lastUpdated') return;
      
      const dbField = fieldMappings[key];
      if (dbField) {
        setClauses.push(`${dbField} = $${paramCounter}`);
        values.push(value);
        paramCounter++;
      }
    });
    
    // Add the ID as the last parameter
    values.push(id);
    
    const query = `
      UPDATE fixed_deposits
      SET ${setClauses.join(', ')}
      WHERE id = $${paramCounter}
      RETURNING *
    `;
    
    const result = await pool.query(query, values);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Fixed deposit not found' });
    }
    
    const row = result.rows[0];
    const deposit = {
      id: row.id,
      bankName: row.bank_name,
      accountNumber: row.account_number,
      principal: parseFloat(row.principal),
      interestRate: parseFloat(row.interest_rate),
      startDate: row.start_date,
      maturityDate: row.maturity_date,
      maturityAmount: parseFloat(row.maturity_amount || 0),
      isAutoRenew: row.is_auto_renewal,
      notes: row.notes,
      familyMemberId: row.family_member_id,
      lastUpdated: row.last_updated
    };
    
    res.json(deposit);
  } catch (error) {
    console.error('Database error:', error);
    res.status(500).json({ error: 'Failed to update fixed deposit' });
  }
};

// Delete a fixed deposit
exports.deleteFixedDeposit = async (req, res) => {
  try {
    const { id } = req.params;
    
    const result = await pool.query(`
      DELETE FROM fixed_deposits
      WHERE id = $1
      RETURNING id
    `, [id]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Fixed deposit not found' });
    }
    
    res.json({ message: 'Fixed deposit deleted successfully', id });
  } catch (error) {
    console.error('Database error:', error);
    res.status(500).json({ error: 'Failed to delete fixed deposit' });
  }
};
