/**
 * Provident Funds API Implementation
 */
import { v4 as uuidv4 } from 'uuid';

// In-memory data store for development
let providentFunds = [
  {
    id: 'pf-001',
    accountNumber: 'PF12345678',
    employeeContribution: 2500,
    employerContribution: 2500,
    totalBalance: 150000,
    familyMemberId: 'fam-001'
  }
];

// Get all provident funds with optional filters
const getAllProvidentFunds = (req, res) => {
  try {
    const { familyMemberId } = req.query;
    let filteredFunds = [...providentFunds];
    
    if (familyMemberId) {
      filteredFunds = filteredFunds.filter(pf => pf.familyMemberId === familyMemberId);
    }
    
    res.json(filteredFunds);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get a specific provident fund by ID
const getProvidentFundById = (req, res) => {
  try {
    const { id } = req.params;
    const fund = providentFunds.find(pf => pf.id === id);
    
    if (!fund) {
      return res.status(404).json({ error: `Provident fund with ID ${id} not found` });
    }
    
    res.json(fund);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Create a new provident fund
const createProvidentFund = (req, res) => {
  try {
    const { accountNumber, employeeContribution, employerContribution, totalBalance, familyMemberId } = req.body;
    
    // Basic validation
    if (!accountNumber || !familyMemberId || employeeContribution === undefined) {
      return res.status(400).json({ error: 'Missing required fields' });
    }
    
    const newFund = {
      id: `pf-${uuidv4().slice(0, 8)}`,
      accountNumber,
      employeeContribution,
      employerContribution: employerContribution || 0,
      totalBalance: totalBalance || (employeeContribution + (employerContribution || 0)),
      familyMemberId,
      createdAt: new Date().toISOString()
    };
    
    providentFunds.push(newFund);
    res.status(201).json(newFund);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Update an existing provident fund
const updateProvidentFund = (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;
    
    const fundIndex = providentFunds.findIndex(pf => pf.id === id);
    
    if (fundIndex === -1) {
      return res.status(404).json({ error: `Provident fund with ID ${id} not found` });
    }
    
    // Update only the fields provided in the request body
    providentFunds[fundIndex] = {
      ...providentFunds[fundIndex],
      ...updateData,
      updatedAt: new Date().toISOString()
    };
    
    res.json(providentFunds[fundIndex]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Delete a provident fund
const deleteProvidentFund = (req, res) => {
  try {
    const { id } = req.params;
    const initialLength = providentFunds.length;
    
    providentFunds = providentFunds.filter(pf => pf.id !== id);
    
    if (providentFunds.length === initialLength) {
      return res.status(404).json({ error: `Provident fund with ID ${id} not found` });
    }
    
    res.status(200).json({ success: true, message: 'Provident fund deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export {
  getAllProvidentFunds,
  getProvidentFundById,
  createProvidentFund,
  updateProvidentFund,
  deleteProvidentFund
};
