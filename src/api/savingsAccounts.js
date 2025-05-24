/**
 * Savings Accounts API Implementation
 */
import { v4 as uuidv4 } from 'uuid';

// In-memory data store for development
let savingsAccounts = [];

// Get all savings accounts with optional filters
const getAllSavingsAccounts = (req, res) => {
  try {
    const { bankName, familyMemberId } = req.query;
    let filteredAccounts = [...savingsAccounts];
    
    if (bankName) {
      filteredAccounts = filteredAccounts.filter(sa => sa.bankName.toLowerCase().includes(bankName.toLowerCase()));
    }
    
    if (familyMemberId) {
      filteredAccounts = filteredAccounts.filter(sa => sa.familyMemberId === familyMemberId);
    }
    
    res.json(filteredAccounts);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get a specific savings account by ID
const getSavingsAccountById = (req, res) => {
  try {
    const { id } = req.params;
    const account = savingsAccounts.find(sa => sa.id === id);
    
    if (!account) {
      return res.status(404).json({ error: `Savings account with ID ${id} not found` });
    }
    
    res.json(account);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Create a new savings account
const createSavingsAccount = (req, res) => {
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

    const newAccount = {
      id: `sa-${uuidv4().slice(0, 8)}`,
      bankName,
      accountNumber,
      accountType: accountType || 'Savings',
      balance,
      interestRate,
      branchName: branchName || '',
      ifscCode: ifscCode || '',
      familyMemberId,
      nominees: Array.isArray(nominees) ? nominees : [],
      notes: notes || '',
      lastUpdated: new Date().toISOString()
    };

    savingsAccounts.push(newAccount);
    res.status(201).json(newAccount);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Update an existing savings account
const updateSavingsAccount = (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    const accountIndex = savingsAccounts.findIndex(sa => sa.id === id);

    if (accountIndex === -1) {
      return res.status(404).json({ error: `Savings account with ID ${id} not found` });
    }

    // Update all fields, but preserve id
    savingsAccounts[accountIndex] = {
      ...savingsAccounts[accountIndex],
      ...updateData,
      lastUpdated: new Date().toISOString()
    };

    res.json(savingsAccounts[accountIndex]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Delete a savings account
const deleteSavingsAccount = (req, res) => {
  try {
    const { id } = req.params;
    
    // First find the account to delete for audit purposes
    const accountToDelete = savingsAccounts.find(sa => sa.id === id);
    
    if (!accountToDelete) {
      return res.status(404).json({ error: `Savings account with ID ${id} not found` });
    }
    
    // Remove the account
    savingsAccounts = savingsAccounts.filter(sa => sa.id !== id);
    
    // Return success with empty body
    res.status(200).json({ success: true });
  } catch (error) {
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
