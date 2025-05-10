
/**
 * Stocks API Implementation
 */
const { v4: uuidv4 } = require('uuid');

// In-memory data store for development
let stocks = [
  {
    id: 'stock-001',
    symbol: 'AAPL',
    companyName: 'Apple Inc.',
    quantity: 10,
    purchasePrice: 150.25,
    currentPrice: 175.50,
    purchaseDate: '2023-12-15',
    sector: 'Technology',
    familyMemberId: 'fam-001'
  }
];

// Get all stocks with optional filters
const getAllStocks = (req, res) => {
  try {
    const { symbol, familyMemberId } = req.query;
    let filteredStocks = [...stocks];
    
    if (symbol) {
      filteredStocks = filteredStocks.filter(stock => stock.symbol.toLowerCase() === symbol.toLowerCase());
    }
    
    if (familyMemberId) {
      filteredStocks = filteredStocks.filter(stock => stock.familyMemberId === familyMemberId);
    }
    
    res.json(filteredStocks);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get a specific stock by ID
const getStockById = (req, res) => {
  try {
    const { id } = req.params;
    const stock = stocks.find(s => s.id === id);
    
    if (!stock) {
      return res.status(404).json({ error: `Stock with ID ${id} not found` });
    }
    
    res.json(stock);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Create a new stock
const createStock = (req, res) => {
  try {
    const { symbol, companyName, quantity, purchasePrice, purchaseDate, sector, familyMemberId, notes } = req.body;
    
    // Basic validation
    if (!symbol || !companyName || !quantity || !purchasePrice || !purchaseDate || !familyMemberId) {
      return res.status(400).json({ error: 'Missing required fields' });
    }
    
    const newStock = {
      id: `stock-${uuidv4().slice(0, 8)}`,
      symbol,
      companyName,
      quantity,
      purchasePrice,
      currentPrice: purchasePrice, // Initialize with purchase price
      purchaseDate,
      sector,
      familyMemberId,
      notes,
      createdAt: new Date().toISOString()
    };
    
    stocks.push(newStock);
    res.status(201).json(newStock);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Update an existing stock
const updateStock = (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;
    
    const stockIndex = stocks.findIndex(s => s.id === id);
    
    if (stockIndex === -1) {
      return res.status(404).json({ error: `Stock with ID ${id} not found` });
    }
    
    // Update only the fields provided in the request body
    stocks[stockIndex] = {
      ...stocks[stockIndex],
      ...updateData,
      updatedAt: new Date().toISOString()
    };
    
    res.json(stocks[stockIndex]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Delete a stock
const deleteStock = (req, res) => {
  try {
    const { id } = req.params;
    const initialLength = stocks.length;
    
    stocks = stocks.filter(s => s.id !== id);
    
    if (stocks.length === initialLength) {
      return res.status(404).json({ error: `Stock with ID ${id} not found` });
    }
    
    res.status(204).send();
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports = {
  getAllStocks,
  getStockById,
  createStock,
  updateStock,
  deleteStock
};
