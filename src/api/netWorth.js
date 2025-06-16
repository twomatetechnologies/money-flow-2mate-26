/**
 * Net Worth Temporary API
 */
import { getNetWorth } from '../services/netWorthService.js';

export const getNetWorthData = async (req, res) => {
  try {
    const netWorthData = await getNetWorth();
    res.json(netWorthData);
  } catch (error) {
    console.error('Error fetching net worth data:', error);
    res.status(500).json({ error: 'Failed to fetch net worth data' });
  }
};
