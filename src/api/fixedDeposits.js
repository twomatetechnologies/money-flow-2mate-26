
/**
 * Fixed Deposits API Implementation
 */
import { v4 as uuidv4 } from 'uuid';

// In-memory data store for development
let fixedDeposits = [
  {
    id: 'fd-001',
    bankName: 'HDFC Bank',
    accountNumber: 'FD123456',
    principal: 100000,
    interestRate: 7.5,
    startDate: '2024-01-01',
    maturityDate: '2025-01-01',
    isAutoRenew: false,
    familyMemberId: 'self-default',
    notes: ''
  }
];

// Get all fixed deposits with optional filters
const getAllFixedDeposits = (req, res) => {
  try {
    const { bankName, familyMemberId } = req.query;
    let filteredDeposits = [...fixedDeposits];
    
    if (bankName) {
      filteredDeposits = filteredDeposits.filter(fd => fd.bankName.toLowerCase().includes(bankName.toLowerCase()));
    }
    
    if (familyMemberId) {
      filteredDeposits = filteredDeposits.filter(fd => fd.familyMemberId === familyMemberId);
    }
    
    res.json(filteredDeposits);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get a specific fixed deposit by ID
const getFixedDepositById = (req, res) => {
  try {
    const { id } = req.params;
    const deposit = fixedDeposits.find(fd => fd.id === id);
    
    if (!deposit) {
      return res.status(404).json({ error: `Fixed deposit with ID ${id} not found` });
    }
    
    res.json(deposit);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Create a new fixed deposit
const createFixedDeposit = (req, res) => {
  try {
    const { 
      bankName, 
      accountNumber, 
      principal, 
      interestRate, 
      startDate, 
      maturityDate, 
      isAutoRenew, 
      familyMemberId, 
      notes 
    } = req.body;
    
    // Basic validation
    if (!bankName || !accountNumber || !principal || !interestRate || !startDate || !maturityDate) {
      return res.status(400).json({ error: 'Missing required fields' });
    }
    
    // Calculate maturity amount if not provided
    const timeDiff = Math.max(0, (new Date(maturityDate).getTime() - new Date(startDate).getTime()) / (1000 * 3600 * 24 * 365));
    const calculatedMaturityAmount = principal + (principal * interestRate * timeDiff) / 100;
    
    const newDeposit = {
      id: `fd-${uuidv4().slice(0, 8)}`,
      bankName,
      accountNumber,
      principal,
      interestRate,
      startDate,
      maturityDate,
      maturityAmount: calculatedMaturityAmount,
      isAutoRenew: isAutoRenew || false,
      familyMemberId: familyMemberId || 'self-default', // Default to self if not provided
      notes: notes || '',
      createdAt: new Date().toISOString()
    };
    
    fixedDeposits.push(newDeposit);
    res.status(201).json(newDeposit);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Update an existing fixed deposit
const updateFixedDeposit = (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;
    
    const depositIndex = fixedDeposits.findIndex(fd => fd.id === id);
    
    if (depositIndex === -1) {
      return res.status(404).json({ error: `Fixed deposit with ID ${id} not found` });
    }
    
    // Update only the fields provided in the request body
    fixedDeposits[depositIndex] = {
      ...fixedDeposits[depositIndex],
      ...updateData,
      updatedAt: new Date().toISOString()
    };
    
    res.json(fixedDeposits[depositIndex]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Delete a fixed deposit
const deleteFixedDeposit = (req, res) => {
  try {
    const { id } = req.params;
    const initialLength = fixedDeposits.length;
    
    fixedDeposits = fixedDeposits.filter(fd => fd.id !== id);
    
    if (fixedDeposits.length === initialLength) {
      return res.status(404).json({ error: `Fixed deposit with ID ${id} not found` });
    }
    
    res.json({ success: true, message: 'Fixed deposit deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export {
  getAllFixedDeposits,
  getFixedDepositById,
  createFixedDeposit,
  updateFixedDeposit,
  deleteFixedDeposit
};
