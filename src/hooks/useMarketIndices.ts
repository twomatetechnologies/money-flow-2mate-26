
import { useState, useEffect } from 'react';
import { MarketIndex, fetchAllMarketIndices, startMarketIndicesMonitoring } from '@/services/marketIndicesService';

export const useMarketIndices = (refreshInterval = 60000) => {
  const [indices, setIndices] = useState<MarketIndex[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    const handleIndicesUpdate = (newIndices: MarketIndex[]) => {
      setIndices(newIndices);
      setLastUpdated(new Date());
      setLoading(false);
      setRefreshing(false);
    };

    // Initial loading
    setLoading(true);
    
    // Start monitoring indices
    const stopMonitoring = startMarketIndicesMonitoring(
      handleIndicesUpdate,
      refreshInterval
    );

    // Cleanup function
    return () => {
      stopMonitoring();
    };
  }, [refreshInterval]);

  // Function to manually refresh data
  const refreshIndices = async () => {
    try {
      setRefreshing(true);
      const data = await fetchAllMarketIndices();
      setIndices(data);
      setLastUpdated(new Date());
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to refresh indices'));
    } finally {
      setRefreshing(false);
    }
  };

  return {
    indices,
    loading,
    error,
    lastUpdated,
    refreshing,
    refreshIndices
  };
};
