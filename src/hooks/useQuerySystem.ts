
import { useState } from 'react';
import { processQuery, NLQueryResponse } from '@/services/insightsService';
import { useToast } from '@/hooks/use-toast';
import { useOllama } from '@/hooks/useOllama';
import { parseOllamaQueryResponse } from '@/services/ollamaInsightsService';
import { getNetWorth } from '@/services/netWorthService';
import { getStocks } from '@/services/stockService';
import { getFixedDeposits } from '@/services/fixedDepositService';
import { getSIPInvestments } from '@/services/sipInvestmentService';
import { getGoldInvestments } from '@/services/goldInvestmentService';
import { getGoals } from '@/services/goalService';

export const useQuerySystem = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [queryResponse, setQueryResponse] = useState<NLQueryResponse | null>(null);
  const [queryHistory, setQueryHistory] = useState<{query: string, response: NLQueryResponse}[]>([]);
  const { generateText } = useOllama();
  const { toast } = useToast();

  const submitQuery = async (query: string) => {
    if (!query.trim()) {
      return;
    }
    
    try {
      setLoading(true);
      
      // First try to use the mock API as a fallback
      let response: NLQueryResponse;
      
      try {
        // Fetch financial data to provide context for the query
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
        
        // Generate the prompt for Ollama
        const prompt = `
        I have a question about my finances: "${query}"
        
        Here's my portfolio information:
        
        Net Worth: ₹${netWorthData.total.toLocaleString()}
        
        Asset Allocation:
        - Stocks: ₹${netWorthData.breakdown.stocks.toLocaleString()} (${((netWorthData.breakdown.stocks / netWorthData.total) * 100).toFixed(1)}%)
        - Fixed Deposits: ₹${netWorthData.breakdown.fixedDeposits.toLocaleString()} (${((netWorthData.breakdown.fixedDeposits / netWorthData.total) * 100).toFixed(1)}%)
        - SIPs: ₹${netWorthData.breakdown.sip.toLocaleString()} (${((netWorthData.breakdown.sip / netWorthData.total) * 100).toFixed(1)}%)
        - Gold: ₹${netWorthData.breakdown.gold.toLocaleString()} (${((netWorthData.breakdown.gold / netWorthData.total) * 100).toFixed(1)}%)
        
        Please provide a clear, concise answer to my question based on this financial data.
        Also suggest 3 follow-up questions I might want to ask next.
        `;
        
        const systemPrompt = `You are an AI financial advisor responding to user queries about their investments, portfolio, and financial goals.
        Provide specific, actionable advice based on the financial data.`;
        
        // Call Ollama API to generate response
        const ollamaResponse = await generateText(prompt, systemPrompt, { 
          temperature: 0.7,
          maxTokens: 1000 
        });
        
        // Parse the response
        response = parseOllamaQueryResponse(query, ollamaResponse);
        
      } catch (ollamaError) {
        console.error("Ollama query failed, falling back to mock API:", ollamaError);
        // Fall back to the mock API if Ollama fails
        response = await processQuery(query);
      }
      
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
