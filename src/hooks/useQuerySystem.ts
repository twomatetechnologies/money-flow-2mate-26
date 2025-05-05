
import { useState } from 'react';
import { processQuery, NLQueryResponse } from '@/services/insightsService';
import { useToast } from '@/hooks/use-toast';

export const useQuerySystem = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [queryResponse, setQueryResponse] = useState<NLQueryResponse | null>(null);
  const [queryHistory, setQueryHistory] = useState<{query: string, response: NLQueryResponse}[]>([]);
  const { toast } = useToast();

  const submitQuery = async (query: string) => {
    if (!query.trim()) {
      return;
    }
    
    try {
      setLoading(true);
      const response = await processQuery(query);
      setQueryResponse(response);
      
      // Add to history
      setQueryHistory(prev => [...prev, {query, response}].slice(-5)); // Keep last 5 queries
      
      return response;
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Failed to process query');
      setError(error);
      toast({
        title: "Error",
        description: "Failed to process your query. Please try again.",
        variant: "destructive"
      });
      return null;
    } finally {
      setLoading(false);
    }
  };

  const clearQueryResponse = () => {
    setQueryResponse(null);
  };

  const clearHistory = () => {
    setQueryHistory([]);
  };

  return {
    loading,
    error,
    queryResponse,
    queryHistory,
    submitQuery,
    clearQueryResponse,
    clearHistory
  };
};
