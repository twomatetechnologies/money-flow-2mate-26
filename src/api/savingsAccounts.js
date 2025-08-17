/**
 * Savings Accounts API Implementation
 */
import { v4 as uuidv4 } from 'uuid';
import { pool } from './crudService.js';

// Get all savings accounts with optional filters
const getAllSavingsAccounts = async (req, res) => {
  try {
    const { bankName, familyMemberId } = req.query;
    let query = 'SELECT * FROM savings_accounts WHERE 1=1';
    const values = [];
    
    if (bankName) {
      query += ' AND LOWER(bank_name) LIKE LOWER($' + (values.length + 1) + ')';
      values.push(`%${bankName}%`);
    }
    
    if (familyMemberId) {
      query += ' AND family_member_id = $' + (values.length + 1);
      values.push(familyMemberId);
    }
    
    const result = await pool.query(query, values);
    res.json(result.rows);
  } catch (error) {
    console.error('Error in getAllSavingsAccounts:', error);
    res.status(500).json({ error: error.message });
  }
};

// Get a specific savings account by ID
const getSavingsAccountById = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query('SELECT * FROM savings_accounts WHERE id = $1', [id]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: `Savings account with ID ${id} not found` });
    }
    
    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error in getSavingsAccountById:', error);
    res.status(500).json({ error: error.message });
  }
};

// Create a new savings account
const createSavingsAccount = async (req, res) => {
  try {
    const {
      bankName,
      accountNumber,
      accountType,
      balance,
      interestRate,
      branchName,
      ifscCode,
      familyMemberId,
      nominees,
      notes
    } = req.body;

    // Basic validation
    if (!bankName || !accountNumber || balance === undefined || !interestRate || !familyMemberId) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const id = `sa-${uuidv4().slice(0, 8)}`;
    const query = `
      INSERT INTO savings_accounts (
        id, bank_name, account_number, account_type, balance,
        interest_rate, branch_name, ifsc_code, family_member_id,
        nominees, notes, last_updated
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, NOW())
      RETURNING *
    `;

    const values = [
      id,
      bankName,
      accountNumber,
      accountType || 'Savings',
      balance,
      interestRate,
      branchName || '',
      ifscCode || '',
      familyMemberId,
      Array.isArray(nominees) ? nominees : [],
      notes || ''
    ];

    const result = await pool.query(query, values);
    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Error in createSavingsAccount:', error);
    res.status(500).json({ error: error.message });
  }
};

// Update an existing savings account
const updateSavingsAccount = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      bankName,
      accountNumber,
      accountType,
      balance,
      interestRate,
      branchName,
      ifscCode,
      familyMemberId,
      nominees,
      notes
    } = req.body;

    const query = `
      UPDATE savings_accounts 
      SET 
        bank_name = COALESCE($1, bank_name),
        account_number = COALESCE($2, account_number),
        account_type = COALESCE($3, account_type),
        balance = COALESCE($4, balance),
        interest_rate = COALESCE($5, interest_rate),
        branch_name = COALESCE($6, branch_name),
        ifsc_code = COALESCE($7, ifsc_code),
        family_member_id = COALESCE($8, family_member_id),
        nominees = COALESCE($9, nominees),
        notes = COALESCE($10, notes),
        last_updated = NOW()
      WHERE id = $11
      RETURNING *
    `;

    const values = [
      bankName,
      accountNumber,
      accountType,
      balance,
      interestRate,
      branchName,
      ifscCode,
      familyMemberId,
      Array.isArray(nominees) ? nominees : undefined,
      notes,
      id
    ];

    const result = await pool.query(query, values);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: `Savings account with ID ${id} not found` });
    }

    res.json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Delete a savings account
const deleteSavingsAccount = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Delete the account and check if it existed
    const result = await pool.query('DELETE FROM savings_accounts WHERE id = $1 RETURNING id', [id]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: `Savings account with ID ${id} not found` });
    }
    
    // Return success with empty body
    res.status(200).json({ success: true });
  } catch (error) {
    console.error('Error in deleteSavingsAccount:', error);
    res.status(500).json({ error: error.message });
  }
};

export {
  getAllSavingsAccounts,
  getSavingsAccountById,
  createSavingsAccount,
  updateSavingsAccount,
  deleteSavingsAccount
};
