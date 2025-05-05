
import { StockHolding, FixedDeposit, SIPInvestment, GoldInvestment } from '@/types';
import { NetWorthData } from '@/types';
import { FinancialGoal } from '@/types/goals';
import { toast } from '@/hooks/use-toast';

// Types for insights
export interface Insight {
  id: string;
  type: 'anomaly' | 'opportunity' | 'advice' | 'alert';
  title: string;
  description: string;
  impact: 'low' | 'medium' | 'high';
  category: 'stocks' | 'fixedDeposits' | 'sip' | 'gold' | 'general' | 'spending';
  createdAt: Date;
  read: boolean;
  actionable: boolean;
  actionText?: string;
  actionLink?: string;
}

export interface NLQueryResponse {
  answer: string;
  confidence: number;
  relatedInsights: Insight[];
  suggestedQuestions: string[];
}

export interface InsightSummary {
  totalInsights: number;
  unreadInsights: number;
  highImpactInsights: number;
  categories: {
    [key: string]: number;
  };
}

// Mock data for initial development - would be AI-generated in production
const SAMPLE_INSIGHTS: Insight[] = [
  {
    id: '1',
    type: 'anomaly',
    title: 'Unusual spending detected',
    description: 'Your spending in entertainment category has increased by 45% compared to previous months.',
    impact: 'medium',
    category: 'spending',
    createdAt: new Date(),
    read: false,
    actionable: true,
    actionText: 'View spending analysis',
    actionLink: '/reports'
  },
  {
    id: '2',
    type: 'opportunity',
    title: 'Potential investment opportunity',
    description: 'Technology sector stocks in your watchlist are showing strong growth potential based on recent market trends.',
    impact: 'high',
    category: 'stocks',
    createdAt: new Date(),
    read: false,
    actionable: true,
    actionText: 'Explore opportunities',
    actionLink: '/stocks'
  },
  {
    id: '3',
    type: 'advice',
    title: 'Diversification suggestion',
    description: 'Your portfolio is heavily weighted towards stocks (75%). Consider diversifying into other asset classes to reduce risk.',
    impact: 'high',
    category: 'general',
    createdAt: new Date(),
    read: false,
    actionable: false
  },
  {
    id: '4',
    type: 'alert',
    title: 'FD maturing soon',
    description: 'You have a fixed deposit maturing in 15 days with auto-renewal disabled. Consider your reinvestment options.',
    impact: 'medium',
    category: 'fixedDeposits',
    createdAt: new Date(),
    read: false,
    actionable: true,
    actionText: 'View FD details',
    actionLink: '/fixed-deposits'
  },
  {
    id: '5',
    type: 'opportunity',
    title: 'SIP increase recommendation',
    description: 'Based on your income and expenses, you can increase your monthly SIP contribution by approximately ₹5,000.',
    impact: 'medium',
    category: 'sip',
    createdAt: new Date(),
    read: false,
    actionable: true,
    actionText: 'Adjust SIP',
    actionLink: '/sip-investments'
  }
];

// Mock implementation of natural language queries
const SAMPLE_QUESTIONS = [
  'How is my portfolio performing?',
  'What are my top performing stocks?',
  'Should I invest more in gold?',
  'Am I on track for my retirement goal?',
  'How can I reduce my investment risk?'
];

// Simulate an AI processing delay
const simulateProcessing = async (timeout = 1000) => {
  return new Promise(resolve => setTimeout(resolve, timeout));
};

// Get all insights for the user
export const getInsights = async (): Promise<Insight[]> => {
  // In a real implementation, this would call an AI service
  await simulateProcessing(800);
  return [...SAMPLE_INSIGHTS];
};

// Get insight summary statistics
export const getInsightSummary = async (): Promise<InsightSummary> => {
  const insights = await getInsights();
  
  const summary: InsightSummary = {
    totalInsights: insights.length,
    unreadInsights: insights.filter(insight => !insight.read).length,
    highImpactInsights: insights.filter(insight => insight.impact === 'high').length,
    categories: {}
  };
  
  // Count insights by category
  insights.forEach(insight => {
    if (!summary.categories[insight.category]) {
      summary.categories[insight.category] = 0;
    }
    summary.categories[insight.category]++;
  });
  
  return summary;
};

// Mark an insight as read
export const markInsightAsRead = async (insightId: string): Promise<boolean> => {
  // This would update the database in a real implementation
  await simulateProcessing(300);
  return true;
};

// Process a natural language query
export const processQuery = async (query: string): Promise<NLQueryResponse> => {
  await simulateProcessing(1500);
  
  // Sample responses based on pattern matching
  // In a real implementation, this would use NLP/LLM technologies
  let answer = '';
  let suggestedQuestions: string[] = [];
  
  if (query.toLowerCase().includes('portfolio')) {
    answer = 'Your portfolio has grown by 8.2% in the last quarter, outperforming the market average of 5.6%.';
    suggestedQuestions = ['Which sectors in my portfolio are performing best?', 'Should I rebalance my portfolio?'];
  } else if (query.toLowerCase().includes('stock')) {
    answer = 'Your top performing stock is Infosys with a 12.5% gain this year. Your technology stocks are generally outperforming other sectors.';
    suggestedQuestions = ['What stocks should I consider selling?', 'Which sectors should I invest in?'];
  } else if (query.toLowerCase().includes('gold')) {
    answer = 'Gold currently makes up 8% of your portfolio. With current market volatility, increasing your gold allocation to 10-15% may provide additional stability.';
    suggestedQuestions = ['What are current gold rates?', 'How do I buy digital gold?'];
  } else if (query.toLowerCase().includes('retirement') || query.toLowerCase().includes('goal')) {
    answer = 'Based on your current savings rate and investment performance, you are approximately 65% on track to meet your retirement goal by 2040.';
    suggestedQuestions = ['How can I improve my retirement readiness?', 'Should I increase my SIP contributions?'];
  } else {
    answer = 'I don\'t have enough information to answer that question specifically. Try asking about your portfolio, investments, or financial goals.';
    suggestedQuestions = SAMPLE_QUESTIONS.slice(0, 3);
  }
  
  // Return a subset of insights that might be related to the query
  const relatedInsights = SAMPLE_INSIGHTS.slice(0, 2);
  
  return {
    answer,
    confidence: 0.85,
    relatedInsights,
    suggestedQuestions
  };
};

// Generate personalized investment insights based on user data
export const generatePersonalizedInsights = async (
  netWorth: NetWorthData,
  stocks: StockHolding[],
  fixedDeposits: FixedDeposit[],
  sipInvestments: SIPInvestment[],
  goldInvestments: GoldInvestment[],
  goals: FinancialGoal[]
): Promise<Insight[]> => {
  // This function would implement sophisticated analysis in production
  // For now, we'll return sample insights
  await simulateProcessing(1200);
  
  try {
    const insights: Insight[] = [];
    
    // Portfolio diversification analysis
    const totalAssets = netWorth.total;
    const stocksPercentage = (netWorth.breakdown.stocks / totalAssets) * 100;
    
    if (stocksPercentage > 70) {
      insights.push({
        id: 'ai-1',
        type: 'advice',
        title: 'High stock exposure detected',
        description: `Your portfolio has ${stocksPercentage.toFixed(1)}% allocation to stocks, which may expose you to higher market volatility. Consider diversifying into other asset classes.`,
        impact: 'high',
        category: 'stocks',
        createdAt: new Date(),
        read: false,
        actionable: true,
        actionText: 'View asset allocation',
        actionLink: '/reports'
      });
    }
    
    // Check for upcoming FD maturities
    const upcomingMaturities = fixedDeposits.filter(fd => {
      const maturityDate = new Date(fd.maturityDate);
      const today = new Date();
      const daysDifference = Math.floor((maturityDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
      return daysDifference <= 30 && daysDifference >= 0;
    });
    
    if (upcomingMaturities.length > 0) {
      insights.push({
        id: 'ai-2',
        type: 'alert',
        title: `${upcomingMaturities.length} FDs maturing soon`,
        description: `You have ${upcomingMaturities.length} fixed deposits maturing in the next 30 days. Consider your reinvestment strategy.`,
        impact: 'medium',
        category: 'fixedDeposits',
        createdAt: new Date(),
        read: false,
        actionable: true,
        actionText: 'View maturing FDs',
        actionLink: '/fixed-deposits'
      });
    }
    
    // Check goal progress
    const underperformingGoals = goals.filter(goal => {
      const targetDate = new Date(goal.targetDate);
      const today = new Date();
      const timeRemaining = targetDate.getTime() - today.getTime();
      const timeTotal = targetDate.getTime() - new Date(goal.startDate).getTime();
      const timeElapsedPercentage = 100 - (timeRemaining / timeTotal) * 100;
      
      // If time elapsed percentage is greater than progress percentage, the goal is behind schedule
      return timeElapsedPercentage > (goal.currentAmount / goal.targetAmount) * 100;
    });
    
    if (underperformingGoals.length > 0) {
      insights.push({
        id: 'ai-3',
        type: 'advice',
        title: `${underperformingGoals.length} goals need attention`,
        description: `You have ${underperformingGoals.length} financial goals that are currently behind schedule. Consider increasing your contributions.`,
        impact: 'high',
        category: 'general',
        createdAt: new Date(),
        read: false,
        actionable: true,
        actionText: 'Review goals',
        actionLink: '/goals'
      });
    }
    
    // Combine with some sample insights to ensure we have a variety
    return [...insights, ...SAMPLE_INSIGHTS.slice(0, 3)];
  } catch (error) {
    console.error('Error generating insights:', error);
    toast({
      title: "Error",
      description: "Failed to generate personalized insights",
      variant: "destructive"
    });
    return SAMPLE_INSIGHTS;
  }
};
