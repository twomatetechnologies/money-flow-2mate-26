
import { useState, useEffect } from 'react';
import { Insight, getInsights, markInsightAsRead, getInsightSummary, InsightSummary } from '@/services/insightsService';
import { useOllama } from '@/hooks/useOllama';
import { parseOllamaInsights, updateFinancialData } from '@/services/ollamaInsightsService';
import { useToast } from '@/hooks/use-toast';
import { getNetWorth } from '@/services/netWorthService';
import { getStocks } from '@/services/stockService';
import { getFixedDeposits } from '@/services/fixedDepositService';
import { getSIPInvestments } from '@/services/sipInvestmentService';
import { getGoldInvestments } from '@/services/goldInvestmentService';
import { getGoals } from '@/services/goalService';

export const useInsights = () => {
  const [insights, setInsights] = useState<Insight[]>([]);
  const [summary, setSummary] = useState<InsightSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const { generateText, loading: ollamaLoading } = useOllama();
  const { toast } = useToast();

  // Fetch data and generate insights using Ollama
  const fetchInsights = async () => {
    try {
      setLoading(true);
      
      // First, try to get cached insights for immediate display
      const cachedInsightsData = await getInsights();
      const cachedSummary = await getInsightSummary();
      
      setInsights(cachedInsightsData);
      setSummary(cachedSummary);
      
      // Next, fetch all the financial data needed to generate fresh insights
      const [
        netWorthData,
        stocksData,
        fdData,
        sipData,
        goldData,
        goalsData
      ] = await Promise.all([
        getNetWorth(),
        getStocks(),
        getFixedDeposits(),
        getSIPInvestments(),
        getGoldInvestments(),
        getGoals()
      ]);
      
      // Update the cached financial data
      updateFinancialData(netWorthData, stocksData, fdData, sipData, goldData, goalsData);
      
      // Generate the prompt for Ollama
      const prompt = `
      I need financial insights based on the following portfolio:
      
      Net Worth: ₹${netWorthData.total.toLocaleString()}
      
      Asset Allocation:
      - Stocks: ₹${netWorthData.breakdown.stocks.toLocaleString()} (${((netWorthData.breakdown.stocks / netWorthData.total) * 100).toFixed(1)}%)
      - Fixed Deposits: ₹${netWorthData.breakdown.fixedDeposits.toLocaleString()} (${((netWorthData.breakdown.fixedDeposits / netWorthData.total) * 100).toFixed(1)}%)
      - SIPs: ₹${netWorthData.breakdown.sip.toLocaleString()} (${((netWorthData.breakdown.sip / netWorthData.total) * 100).toFixed(1)}%)
      - Gold: ₹${netWorthData.breakdown.gold.toLocaleString()} (${((netWorthData.breakdown.gold / netWorthData.total) * 100).toFixed(1)}%)
      - Others: ₹${netWorthData.breakdown.other.toLocaleString()} (${((netWorthData.breakdown.other / netWorthData.total) * 100).toFixed(1)}%)
      
      Based on this information, provide 3-5 personalized financial insights in the following format:
      [
        {
          "type": "anomaly|opportunity|advice|alert",
          "title": "Short title",
          "description": "Detailed description",
          "impact": "high|medium|low",
          "category": "stocks|fixedDeposits|sip|gold|general|spending",
          "actionable": true|false,
          "actionText": "Action button text",
          "actionLink": "/relevant-page"
        }
      ]
      
      Return ONLY valid JSON that can be parsed directly.
      `;
      
      const systemPrompt = `You are an AI financial advisor that provides personalized insights by analyzing financial data.
      Be concise, specific, and actionable in your insights. ONLY return valid JSON that can be parsed.`;
      
      // Call Ollama API to generate insights
      const ollamaResponse = await generateText(prompt, systemPrompt, { 
        temperature: 0.3, // Lower temperature for more consistent responses
        maxTokens: 2000
      });
      
      // Parse the response into Insight objects
      const generatedInsights = parseOllamaInsights(ollamaResponse);
      
      // Update insights with the AI-generated ones
      setInsights(generatedInsights);
      
      // Update summary based on the new insights
      const newSummary = {
        totalInsights: generatedInsights.length,
        unreadInsights: generatedInsights.filter(insight => !insight.read).length,
        highImpactInsights: generatedInsights.filter(insight => insight.impact === 'high').length,
        categories: {} as { [key: string]: number }
      };
      
      // Count insights by category
      generatedInsights.forEach(insight => {
        if (!newSummary.categories[insight.category]) {
          newSummary.categories[insight.category] = 0;
        }
        newSummary.categories[insight.category]++;
      });
      
      setSummary(newSummary);
      setError(null);
      
    } catch (err) {
      console.error("Error fetching insights:", err);
      setError(err instanceof Error ? err : new Error('Failed to fetch insights'));
      toast({
        title: "Error",
        description: "Failed to load investment insights",
        variant: "destructive"
      });
      
      // Fall back to cached insights if available
      try {
        const fallbackInsights = await getInsights();
        const fallbackSummary = await getInsightSummary();
        setInsights(fallbackInsights);
        setSummary(fallbackSummary);
      } catch (fallbackErr) {
        console.error("Failed to load fallback insights:", fallbackErr);
      }
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
    loading: loading || ollamaLoading,
    error,
    fetchInsights,
    markAsRead
  };
};
