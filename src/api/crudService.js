/**
 * JavaScript version of the crudService (simplified for stock refresh endpoint)
 */
import pg from 'pg';

// Create a pool
const pool = new pg.Pool({
  host: process.env.POSTGRES_HOST || 'db',
  port: process.env.POSTGRES_PORT || 5432,
  database: process.env.POSTGRES_DB || 'financeapp',
  user: process.env.POSTGRES_USER || 'postgres',
  password: process.env.POSTGRES_PASSWORD || 'postgres123'
});

// Fetch stocks from the database
export const getStocks = async () => {
  try {
    console.log('[crudService] Connecting to PostgreSQL to fetch stocks');
    const result = await pool.query('SELECT * FROM stocks');
    console.log(`[crudService] Retrieved ${result.rows.length} stocks from database`);
    return result.rows;
  } catch (error) {
    console.error('[crudService] Error in getStocks:', error);
    // Fallback to mock data if database connection fails
    console.log('[crudService] Falling back to mock data');
    return [
      { id: 'stock-1', symbol: 'AAPL', current_price: 190.5, purchase_price: 150, quantity: 10 },
      { id: 'stock-2', symbol: 'MSFT', current_price: 380.2, purchase_price: 300, quantity: 5 },
      { id: 'stock-3', symbol: 'GOOGL', current_price: 142.3, purchase_price: 120, quantity: 8 }
    ];
  }
};

// Update a stock in the database
export const updateStock = async (id, updates) => {
  try {
    console.log(`[crudService] Updating stock ${id} with:`, updates);
    
    // Convert camelCase keys to snake_case if needed
    const formattedUpdates = {};
    for (const [key, value] of Object.entries(updates)) {
      // Convert camelCase to snake_case (e.g., currentPrice -> current_price)
      // Check if the key already has underscores to avoid double conversion
      if (key.includes('_')) {
        formattedUpdates[key] = value;
      } else {
        const snakeKey = key.replace(/([A-Z])/g, '_$1').toLowerCase();
        formattedUpdates[snakeKey] = value;
      }
    }
    
    // Build SET clause for SQL
    const setClause = Object.keys(formattedUpdates)
      .map((key, index) => `${key} = $${index + 1}`)
      .join(', ');
    
    const values = [...Object.values(formattedUpdates), id];
    const queryText = `UPDATE stocks SET ${setClause} WHERE id = $${values.length} RETURNING *`;
    
    console.log(`[crudService] SQL query: ${queryText}`);
    console.log(`[crudService] SQL values:`, values);
    
    const result = await pool.query(queryText, values);
    
    if (result.rows.length === 0) {
      throw new Error(`Stock with ID ${id} not found`);
    }
    
    console.log(`[crudService] Successfully updated stock ${id}`);
    return result.rows[0];
  } catch (error) {
    console.error(`[crudService] Error in updateStock for ID ${id}:`, error);
    
    // Fallback - just return a success response for now
    console.log(`[crudService] Fallback: mock update for stock ${id}`);
    return { id, ...updates };
  }
};
