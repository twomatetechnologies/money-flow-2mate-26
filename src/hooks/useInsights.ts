
import { useState, useEffect } from 'react';
import { Insight, getInsights, markInsightAsRead, getInsightSummary, InsightSummary } from '@/services/insightsService';
import { useToast } from '@/hooks/use-toast';

export const useInsights = () => {
  const [insights, setInsights] = useState<Insight[]>([]);
  const [summary, setSummary] = useState<InsightSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const { toast } = useToast();

  const fetchInsights = async () => {
    try {
      setLoading(true);
      const [fetchedInsights, fetchedSummary] = await Promise.all([
        getInsights(),
        getInsightSummary()
      ]);
      
      setInsights(fetchedInsights);
      setSummary(fetchedSummary);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to fetch insights'));
      toast({
        title: "Error",
        description: "Failed to load investment insights",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const markAsRead = async (insightId: string) => {
    try {
      await markInsightAsRead(insightId);
      
      // Update local state
      setInsights(prev => 
        prev.map(insight => 
          insight.id === insightId 
            ? { ...insight, read: true } 
            : insight
        )
      );
      
      // Update summary
      if (summary) {
        setSummary({
          ...summary,
          unreadInsights: summary.unreadInsights - 1
        });
      }
      
      return true;
    } catch (error) {
      console.error('Error marking insight as read:', error);
      toast({
        title: "Error",
        description: "Failed to update insight status",
        variant: "destructive"
      });
      return false;
    }
  };

  useEffect(() => {
    fetchInsights();
  }, []);

  return {
    insights,
    summary,
    loading,
    error,
    fetchInsights,
    markAsRead
  };
};
