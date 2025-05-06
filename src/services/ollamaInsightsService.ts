
import { Insight, InsightSummary, NLQueryResponse } from './insightsService';
import { StockHolding, FixedDeposit, SIPInvestment, GoldInvestment } from '@/types';
import { NetWorthData } from '@/types';
import { FinancialGoal } from '@/types/goals';

// This function generates a prompt for Ollama about the user's financial situation
const generateFinancialPrompt = (
  netWorth: NetWorthData,
  stocks: StockHolding[],
  fixedDeposits: FixedDeposit[],
  sipInvestments: SIPInvestment[],
  goldInvestments: GoldInvestment[],
  goals: FinancialGoal[]
): string => {
  return `
  I need financial insights based on the following portfolio:
  
  Net Worth: ₹${netWorth.total.toLocaleString()}
  
  Asset Allocation:
  - Stocks: ₹${netWorth.breakdown.stocks.toLocaleString()} (${((netWorth.breakdown.stocks / netWorth.total) * 100).toFixed(1)}%)
  - Fixed Deposits: ₹${netWorth.breakdown.fixedDeposits.toLocaleString()} (${((netWorth.breakdown.fixedDeposits / netWorth.total) * 100).toFixed(1)}%)
  - SIPs: ₹${netWorth.breakdown.sip.toLocaleString()} (${((netWorth.breakdown.sip / netWorth.total) * 100).toFixed(1)}%)
  - Gold: ₹${netWorth.breakdown.gold.toLocaleString()} (${((netWorth.breakdown.gold / netWorth.total) * 100).toFixed(1)}%)
  - Others: ₹${netWorth.breakdown.others.toLocaleString()} (${((netWorth.breakdown.others / netWorth.total) * 100).toFixed(1)}%)
  
  Stock Holdings (${stocks.length}):
  ${stocks.map(stock => `- ${stock.stockName}: ${stock.quantity} shares at ₹${stock.currentPrice} (Total: ₹${stock.currentValue})`).join('\n')}
  
  Fixed Deposits (${fixedDeposits.length}):
  ${fixedDeposits.map(fd => `- ₹${fd.amount} at ${fd.interestRate}% maturing on ${new Date(fd.maturityDate).toLocaleDateString()}`).join('\n')}
  
  SIP Investments (${sipInvestments.length}):
  ${sipInvestments.map(sip => `- ${sip.schemeName}: ₹${sip.monthlyAmount} monthly (Current Value: ₹${sip.currentValue})`).join('\n')}
  
  Gold Investments (${goldInvestments.length}):
  ${goldInvestments.map(gold => `- ${gold.investmentType}: ${gold.quantity}${gold.quantityUnit} (Value: ₹${gold.value})`).join('\n')}
  
  Financial Goals (${goals.length}):
  ${goals.map(goal => `- ${goal.name}: ₹${goal.targetAmount} by ${new Date(goal.targetDate).toLocaleDateString()} (Current: ₹${goal.currentAmount})`).join('\n')}
  
  Based on this information, provide 3-5 personalized financial insights in the following categories:
  1. Anomalies (unusual patterns or issues)
  2. Opportunities (potential investments to consider)
  3. Advice (general financial recommendations)
  4. Alerts (time-sensitive issues to address)
  
  For each insight, provide:
  - A short, clear title (10 words or less)
  - A detailed description (1-2 sentences)
  - Impact level (high, medium, or low)
  - Whether it's actionable
  - If actionable, a suggestion for what action to take
  
  Format the response as a JSON array where each insight has these fields: type, title, description, impact, category, actionable.
  `;
};

// System prompt for Ollama
const SYSTEM_PROMPT = `
You are an AI financial advisor that provides personalized insights by analyzing financial data.
Be concise, specific, and actionable in your insights.
Focus on providing value through pattern detection, anomaly identification, and personalized recommendations.
Your insights should help the user make better financial decisions or alert them to important issues.
ONLY return a valid JSON array with no explanations - it must be parsable directly.
`;

// Query system prompt for Ollama
const QUERY_SYSTEM_PROMPT = `
You are an AI financial advisor responding to user queries about their investments, portfolio, and financial goals.
Provide specific, actionable advice based on the financial data.
If you don't have enough information to answer confidently, explain what additional information would be needed.
Format responses as conversational paragraphs - not JSON.
Include specific numbers and percentages when relevant to make your answers concrete.
`;

// Generate a system prompt for query processing
const generateQueryPrompt = (
  query: string,
  netWorth: NetWorthData,
  stocks: StockHolding[],
  fixedDeposits: FixedDeposit[],
  sipInvestments: SIPInvestment[],
  goldInvestments: GoldInvestment[],
  goals: FinancialGoal[]
): string => {
  return `
  I have a question about my finances: "${query}"
  
  Here's my portfolio information:
  
  Net Worth: ₹${netWorth.total.toLocaleString()}
  
  Asset Allocation:
  - Stocks: ₹${netWorth.breakdown.stocks.toLocaleString()} (${((netWorth.breakdown.stocks / netWorth.total) * 100).toFixed(1)}%)
  - Fixed Deposits: ₹${netWorth.breakdown.fixedDeposits.toLocaleString()} (${((netWorth.breakdown.fixedDeposits / netWorth.total) * 100).toFixed(1)}%)
  - SIPs: ₹${netWorth.breakdown.sip.toLocaleString()} (${((netWorth.breakdown.sip / netWorth.total) * 100).toFixed(1)}%)
  - Gold: ₹${netWorth.breakdown.gold.toLocaleString()} (${((netWorth.breakdown.gold / netWorth.total) * 100).toFixed(1)}%)
  - Others: ₹${netWorth.breakdown.others.toLocaleString()} (${((netWorth.breakdown.others / netWorth.total) * 100).toFixed(1)}%)
  
  Stock Holdings (${stocks.length}):
  ${stocks.map(stock => `- ${stock.stockName}: ${stock.quantity} shares at ₹${stock.currentPrice} (Total: ₹${stock.currentValue})`).join('\n')}
  
  Fixed Deposits (${fixedDeposits.length}):
  ${fixedDeposits.map(fd => `- ₹${fd.amount} at ${fd.interestRate}% maturing on ${new Date(fd.maturityDate).toLocaleDateString()}`).join('\n')}
  
  SIP Investments (${sipInvestments.length}):
  ${sipInvestments.map(sip => `- ${sip.schemeName}: ₹${sip.monthlyAmount} monthly (Current Value: ₹${sip.currentValue})`).join('\n')}
  
  Gold Investments (${goldInvestments.length}):
  ${goldInvestments.map(gold => `- ${gold.investmentType}: ${gold.quantity}${gold.quantityUnit} (Value: ₹${gold.value})`).join('\n')}
  
  Financial Goals (${goals.length}):
  ${goals.map(goal => `- ${goal.name}: ₹${goal.targetAmount} by ${new Date(goal.targetDate).toLocaleDateString()} (Current: ₹${goal.currentAmount})`).join('\n')}
  
  Please provide a clear, concise answer to my question based on this financial data.
  Also suggest 3 follow-up questions I might want to ask next.
  `;
};

// Get financial data from global state or context (to be implemented)
let cachedNetWorth: NetWorthData | null = null;
let cachedStocks: StockHolding[] = [];
let cachedFixedDeposits: FixedDeposit[] = [];
let cachedSipInvestments: SIPInvestment[] = [];
let cachedGoldInvestments: GoldInvestment[] = [];
let cachedGoals: FinancialGoal[] = [];

// Function to update the cached financial data
export const updateFinancialData = (
  netWorth: NetWorthData,
  stocks: StockHolding[],
  fixedDeposits: FixedDeposit[],
  sipInvestments: SIPInvestment[],
  goldInvestments: GoldInvestment[],
  goals: FinancialGoal[]
) => {
  cachedNetWorth = netWorth;
  cachedStocks = stocks;
  cachedFixedDeposits = fixedDeposits;
  cachedSipInvestments = sipInvestments;
  cachedGoldInvestments = goldInvestments;
  cachedGoals = goals;
};

// Generate random ID for insights
const generateInsightId = () => Math.random().toString(36).substring(2, 15);

// Parse the Ollama response to create Insight objects
export const parseOllamaInsights = (ollamaResponse: string): Insight[] => {
  try {
    // Try to parse the JSON response
    const parsedInsights = JSON.parse(ollamaResponse);
    
    if (!Array.isArray(parsedInsights)) {
      throw new Error("Response is not an array");
    }
    
    // Convert to Insight objects and add missing fields
    return parsedInsights.map((insight: any, index: number) => ({
      id: generateInsightId(),
      type: insight.type || "advice",
      title: insight.title || `Insight ${index + 1}`,
      description: insight.description || "No description provided",
      impact: insight.impact || "medium",
      category: insight.category || "general",
      createdAt: new Date(),
      read: false,
      actionable: insight.actionable || false,
      actionText: insight.actionText || "Take action",
      actionLink: insight.actionLink || "/dashboard"
    }));
  } catch (error) {
    console.error("Failed to parse Ollama response:", error);
    console.error("Raw response:", ollamaResponse);
    
    // Return a fallback insight if parsing fails
    return [{
      id: generateInsightId(),
      type: "advice",
      title: "AI Analysis Available",
      description: "We analyzed your portfolio but encountered an issue formatting the results. Try refreshing the insights.",
      impact: "low",
      category: "general",
      createdAt: new Date(),
      read: false,
      actionable: false
    }];
  }
};

// Parse Ollama response for query
export const parseOllamaQueryResponse = (query: string, ollamaResponse: string): NLQueryResponse => {
  try {
    // Extract suggested questions using a simple pattern
    const suggestedQuestions: string[] = [];
    const lines = ollamaResponse.split('\n');
    
    for (const line of lines) {
      // Look for numbered questions or bullet points
      if (/^\d+[\.\)]|^-|^\*/.test(line.trim())) {
        const question = line.replace(/^\d+[\.\)]\s*|-\s*|\*\s*/, '').trim();
        if (question && !question.endsWith('?')) {
          // If it doesn't end with a question mark, add one
          suggestedQuestions.push(question + '?');
        } else if (question) {
          suggestedQuestions.push(question);
        }
      }
    }

    // If we didn't find any questions, generate some default ones
    const defaultQuestions = [
      "How can I improve my portfolio diversification?",
      "What's my current asset allocation?",
      "Am I on track to meet my financial goals?"
    ];

    return {
      answer: ollamaResponse.split('\n').filter(line => !line.match(/^\d+[\.\)]|^-|^\*/)).join('\n').trim(),
      confidence: 0.85, // Hard to determine actual confidence, so use a default
      relatedInsights: [], // This would be populated from existing insights
      suggestedQuestions: suggestedQuestions.length > 0 ? suggestedQuestions : defaultQuestions
    };
  } catch (error) {
    console.error("Failed to parse Ollama query response:", error);
    
    return {
      answer: "I experienced a technical issue while analyzing your question. Please try again or rephrase your question.",
      confidence: 0.5,
      relatedInsights: [],
      suggestedQuestions: [
        "How is my portfolio performing?",
        "What's my current asset allocation?",
        "Am I on track to meet my financial goals?"
      ]
    };
  }
};
