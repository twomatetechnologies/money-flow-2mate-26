/**
 * SIP Investments API Implementation
 */
import { v4 as uuidv4 } from 'uuid';

// In-memory data store for development
let sipInvestments = [
  {
    id: 'sip-001',
    fundName: 'Axis Bluechip Fund',
    monthlyAmount: 5000,
    startDate: '2023-01-15',
    currentValue: 65000,
    totalInvested: 60000,
    familyMemberId: 'fam-001'
  }
];

// Get all SIP investments with optional filters
const getAllSIPInvestments = (req, res) => {
  try {
    const { fundName, familyMemberId } = req.query;
    let filteredInvestments = [...sipInvestments];
    
    if (fundName) {
      filteredInvestments = filteredInvestments.filter(sip => sip.fundName.toLowerCase().includes(fundName.toLowerCase()));
    }
    
    if (familyMemberId) {
      filteredInvestments = filteredInvestments.filter(sip => sip.familyMemberId === familyMemberId);
    }
    
    res.json(filteredInvestments);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get a specific SIP investment by ID
const getSIPInvestmentById = (req, res) => {
  try {
    const { id } = req.params;
    const investment = sipInvestments.find(sip => sip.id === id);
    
    if (!investment) {
      return res.status(404).json({ error: `SIP investment with ID ${id} not found` });
    }
    
    res.json(investment);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Create a new SIP investment
const createSIPInvestment = (req, res) => {
  try {
    const { fundName, monthlyAmount, startDate, currentValue, totalInvested, familyMemberId } = req.body;
    
    // Basic validation
    if (!fundName || !monthlyAmount || !startDate || !familyMemberId) {
      return res.status(400).json({ error: 'Missing required fields' });
    }
    
    const newInvestment = {
      id: `sip-${uuidv4().slice(0, 8)}`,
      fundName,
      monthlyAmount,
      startDate,
      currentValue: currentValue || 0,
      totalInvested: totalInvested || 0,
      familyMemberId,
      createdAt: new Date().toISOString()
    };
    
    sipInvestments.push(newInvestment);
    res.status(201).json(newInvestment);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Update an existing SIP investment
const updateSIPInvestment = (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;
    
    const investmentIndex = sipInvestments.findIndex(sip => sip.id === id);
    
    if (investmentIndex === -1) {
      return res.status(404).json({ error: `SIP investment with ID ${id} not found` });
    }
    
    // Update only the fields provided in the request body
    sipInvestments[investmentIndex] = {
      ...sipInvestments[investmentIndex],
      ...updateData,
      updatedAt: new Date().toISOString()
    };
    
    res.json(sipInvestments[investmentIndex]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Delete a SIP investment
const deleteSIPInvestment = (req, res) => {
  try {
    const { id } = req.params;
    const initialLength = sipInvestments.length;
    
    sipInvestments = sipInvestments.filter(sip => sip.id !== id);
    
    if (sipInvestments.length === initialLength) {
      return res.status(404).json({ error: `SIP investment with ID ${id} not found` });
    }
    
    res.status(204).send();
  } catch (error) {
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
