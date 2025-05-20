
/**
 * Stocks API Implementation
 */
import { v4 as uuidv4 } from 'uuid';

// Remove in-memory test data
let stocks = [];

// Get all stocks with optional filters
const getAllStocks = async (req, res) => {
  try {
    const { symbol, familyMemberId } = req.query;
    
    // Check if we have a database connection
    if (req.app.locals.db && process.env.POSTGRES_ENABLED === 'true') {
      // Use PostgreSQL
      let query = 'SELECT * FROM stocks WHERE 1=1';
      const params = [];
      
      if (symbol) {
        params.push(symbol.toLowerCase());
        query += ` AND LOWER(symbol) = LOWER($${params.length})`;
      }
      
      if (familyMemberId) {
        params.push(familyMemberId);
        query += ` AND family_member_id = $${params.length}`;
      }
      
      const result = await req.app.locals.db.query(query, params);
      
      // Convert snake_case to camelCase
      const stocksData = result.rows.map(row => ({
        id: row.id,
        symbol: row.symbol,
        companyName: row.company_name,
        quantity: row.quantity,
        purchasePrice: row.purchase_price,
        currentPrice: row.current_price,
        purchaseDate: row.purchase_date,
        sector: row.sector,
        familyMemberId: row.family_member_id,
        notes: row.notes,
        lastUpdated: row.last_updated,
        value: row.value
      }));
      
      res.json(stocksData);
    } else {
      // Use in-memory fallback
      console.log('Using in-memory stock data');
      let filteredStocks = [...stocks];
      
      if (symbol) {
        filteredStocks = filteredStocks.filter(stock => stock.symbol.toLowerCase() === symbol.toLowerCase());
      }
      
      if (familyMemberId) {
        filteredStocks = filteredStocks.filter(stock => stock.familyMemberId === familyMemberId);
      }
      
      res.json(filteredStocks);
    }
  } catch (error) {
    console.error('Error in getAllStocks:', error);
    res.status(500).json({ error: error.message });
  }
};

// Get a specific stock by ID
const getStockById = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Check if we have a database connection
    if (req.app.locals.db && process.env.POSTGRES_ENABLED === 'true') {
      // Use PostgreSQL
      const result = await req.app.locals.db.query('SELECT * FROM stocks WHERE id = $1', [id]);
      
      if (result.rows.length === 0) {
        return res.status(404).json({ error: `Stock with ID ${id} not found` });
      }
      
      const row = result.rows[0];
      const stock = {
        id: row.id,
        symbol: row.symbol,
        companyName: row.company_name,
        quantity: row.quantity,
        purchasePrice: row.purchase_price,
        currentPrice: row.current_price,
        purchaseDate: row.purchase_date,
        sector: row.sector,
        familyMemberId: row.family_member_id,
        notes: row.notes,
        lastUpdated: row.last_updated,
        value: row.value
      };
      
      res.json(stock);
    } else {
      // Use in-memory fallback
      const stock = stocks.find(s => s.id === id);
      
      if (!stock) {
        return res.status(404).json({ error: `Stock with ID ${id} not found` });
      }
      
      res.json(stock);
    }
  } catch (error) {
    console.error('Error in getStockById:', error);
    res.status(500).json({ error: error.message });
  }
};

// Create a new stock
const createStock = async (req, res) => {
  try {
    const { 
      symbol, 
      name, 
      quantity, 
      averageBuyPrice, 
      currentPrice,
      sector, 
      familyMemberId, 
      notes 
    } = req.body;
    
    // Basic validation with detailed error messages
    const missingFields = [];
    
    if (!symbol) missingFields.push('symbol');
    if (!name) missingFields.push('name');
    if (quantity === undefined || quantity === null) missingFields.push('quantity');
    if (averageBuyPrice === undefined || averageBuyPrice === null) missingFields.push('averageBuyPrice');
    
    if (missingFields.length > 0) {
      return res.status(400).json({ 
        error: `Missing required fields: ${missingFields.join(', ')}` 
      });
    }
    
    const newStockId = `stock-${uuidv4().slice(0, 8)}`;
    const actualCurrentPrice = currentPrice || averageBuyPrice; // Default to averageBuyPrice if currentPrice not provided
    const now = new Date().toISOString();
    
    // Check if we have a database connection
    if (req.app.locals.db && process.env.POSTGRES_ENABLED === 'true') {
      // Use PostgreSQL
      const query = `
        INSERT INTO stocks (
          id, symbol, company_name, quantity, purchase_price, 
          current_price, purchase_date, sector, family_member_id, 
          notes, last_updated
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
        RETURNING *
      `;
      
      const values = [
        newStockId, 
        symbol, 
        name, 
        quantity, 
        averageBuyPrice, 
        actualCurrentPrice, 
        new Date().toISOString().split('T')[0], // Use current date for purchase date
        sector || 'Unspecified', 
        familyMemberId || null, 
        notes || '', 
        now
      ];
      
      const result = await req.app.locals.db.query(query, values);
      const row = result.rows[0];
      
      const newStock = {
        id: row.id,
        symbol: row.symbol,
        companyName: row.company_name,
        quantity: row.quantity,
        purchasePrice: row.purchase_price,
        currentPrice: row.current_price,
        purchaseDate: row.purchase_date,
        sector: row.sector,
        familyMemberId: row.family_member_id,
        notes: row.notes,
        lastUpdated: row.last_updated,
        value: row.value
      };
      
      // Create audit record
      try {
        await req.app.locals.db.query(
          'INSERT INTO audit_records (id, entity_id, entity_type, action, user_id, details) VALUES ($1, $2, $3, $4, $5, $6)',
          [`audit-${uuidv4()}`, newStockId, 'stock', 'create', 'system', JSON.stringify(newStock)]
        );
      } catch (auditError) {
        console.error('Failed to create audit record:', auditError);
      }
      
      res.status(201).json(newStock);
    } else {
      // Use in-memory fallback
      const newStock = {
        id: newStockId,
        symbol,
        companyName: name,
        quantity,
        purchasePrice: averageBuyPrice,
        currentPrice: actualCurrentPrice,
        purchaseDate: new Date().toISOString().split('T')[0],
        sector: sector || 'Unspecified',
        familyMemberId: familyMemberId || null,
        notes: notes || '',
        lastUpdated: now,
        value: quantity * actualCurrentPrice
      };
      
      stocks.push(newStock);
      res.status(201).json(newStock);
    }
  } catch (error) {
    console.error('Error in createStock:', error);
    res.status(500).json({ error: error.message });
  }
};

// Update an existing stock
const updateStock = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;
    const now = new Date().toISOString();
    
    // Check if we have a database connection
    if (req.app.locals.db && process.env.POSTGRES_ENABLED === 'true') {
      // First check if the stock exists
      const checkResult = await req.app.locals.db.query('SELECT * FROM stocks WHERE id = $1', [id]);
      
      if (checkResult.rows.length === 0) {
        return res.status(404).json({ error: `Stock with ID ${id} not found` });
      }
      
      // Build the dynamic update query
      const updates = [];
      const values = [id];
      let paramIndex = 2;
      
      // Map camelCase to snake_case and build the query
      if (updateData.symbol !== undefined) {
        updates.push(`symbol = $${paramIndex++}`);
        values.push(updateData.symbol);
      }
      
      if (updateData.companyName !== undefined) {
        updates.push(`company_name = $${paramIndex++}`);
        values.push(updateData.companyName);
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
      
      if (updateData.sector !== undefined) {
        updates.push(`sector = $${paramIndex++}`);
        values.push(updateData.sector);
      }
      
      if (updateData.notes !== undefined) {
        updates.push(`notes = $${paramIndex++}`);
        values.push(updateData.notes);
      }
      
      // Always update the last_updated timestamp
      updates.push(`last_updated = $${paramIndex++}`);
      values.push(now);
      
      // Execute the update query
      const query = `UPDATE stocks SET ${updates.join(', ')} WHERE id = $1 RETURNING *`;
      const result = await req.app.locals.db.query(query, values);
      
      const row = result.rows[0];
      const updatedStock = {
        id: row.id,
        symbol: row.symbol,
        companyName: row.company_name,
        quantity: row.quantity,
        purchasePrice: row.purchase_price,
        currentPrice: row.current_price,
        purchaseDate: row.purchase_date,
        sector: row.sector,
        familyMemberId: row.family_member_id,
        notes: row.notes,
        lastUpdated: row.last_updated,
        value: row.value
      };
      
      // Create audit record
      try {
        await req.app.locals.db.query(
          'INSERT INTO audit_records (id, entity_id, entity_type, action, user_id, details) VALUES ($1, $2, $3, $4, $5, $6)',
          [`audit-${uuidv4()}`, id, 'stock', 'update', 'system', JSON.stringify({
            previous: checkResult.rows[0],
            current: updatedStock,
            changes: updateData
          })]
        );
      } catch (auditError) {
        console.error('Failed to create audit record:', auditError);
      }
      
      res.json(updatedStock);
    } else {
      // Use in-memory fallback
      const stockIndex = stocks.findIndex(s => s.id === id);
      
      if (stockIndex === -1) {
        return res.status(404).json({ error: `Stock with ID ${id} not found` });
      }
      
      // Update only the fields provided in the request body
      stocks[stockIndex] = {
        ...stocks[stockIndex],
        ...updateData,
        updatedAt: now
      };
      
      res.json(stocks[stockIndex]);
    }
  } catch (error) {
    console.error('Error in updateStock:', error);
    res.status(500).json({ error: error.message });
  }
};

// Delete a stock
const deleteStock = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Check if we have a database connection
    if (req.app.locals.db && process.env.POSTGRES_ENABLED === 'true') {
      // First check if the stock exists
      const checkResult = await req.app.locals.db.query('SELECT * FROM stocks WHERE id = $1', [id]);
      
      if (checkResult.rows.length === 0) {
        return res.status(404).json({ error: `Stock with ID ${id} not found` });
      }
      
      // Execute the delete query
      await req.app.locals.db.query('DELETE FROM stocks WHERE id = $1', [id]);
      
      // Create audit record
      try {
        await req.app.locals.db.query(
          'INSERT INTO audit_records (id, entity_id, entity_type, action, user_id, details) VALUES ($1, $2, $3, $4, $5, $6)',
          [`audit-${uuidv4()}`, id, 'stock', 'delete', 'system', JSON.stringify(checkResult.rows[0])]
        );
      } catch (auditError) {
        console.error('Failed to create audit record:', auditError);
      }
      
      res.status(204).send();
    } else {
      // Use in-memory fallback
      const initialLength = stocks.length;
      
      stocks = stocks.filter(s => s.id !== id);
      
      if (stocks.length === initialLength) {
        return res.status(404).json({ error: `Stock with ID ${id} not found` });
      }
      
      res.status(204).send();
    }
  } catch (error) {
    console.error('Error in deleteStock:', error);
    res.status(500).json({ error: error.message });
  }
};

export {
  getAllStocks,
  getStockById,
  createStock,
  updateStock,
  deleteStock
};
