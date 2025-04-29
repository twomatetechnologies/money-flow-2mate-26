
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Award, HelpCircle } from 'lucide-react';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { NetWorthData } from '@/types';

interface FinancialHealthScoreProps {
  netWorthData: NetWorthData;
}

// Financial health calculation factors
const calculateHealthScore = (data: NetWorthData): { 
  score: number; 
  breakdown: { name: string; score: number; maxScore: number; description: string }[] 
} => {
  // Initialize scores
  let diversificationScore = 0;
  let growthScore = 0;
  let savingsScore = 0;
  let liquidityScore = 0;
  
  // Total of all assets
  const totalAssets = data.total;
  
  if (totalAssets <= 0) {
    return { 
      score: 0, 
      breakdown: [
        { name: 'Diversification', score: 0, maxScore: 25, description: 'Distribution of assets across investment types' },
        { name: 'Growth Trend', score: 0, maxScore: 25, description: 'Positive growth trend over time' },
        { name: 'Savings Rate', score: 0, maxScore: 25, description: 'Regular contributions to savings/investments' },
        { name: 'Liquidity', score: 0, maxScore: 25, description: 'Access to liquid assets for emergencies' }
      ] 
    };
  }
  
  // 1. Calculate diversification score (max 25 points)
  // Count how many asset classes have more than 5% of total assets
  const assetTypes = Object.entries(data.breakdown)
    .filter(([_, value]) => value > 0.05 * totalAssets)
    .length;
  
  diversificationScore = Math.min(25, assetTypes * 6);
  
  // 2. Calculate growth score (max 25 points)
  // Check if there's a positive trend in net worth over time
  if (data.history.length >= 2) {
    const lastIndex = data.history.length - 1;
    const lastValue = data.history[lastIndex].value;
    const firstValue = data.history[0].value;
    const growthRate = (lastValue - firstValue) / firstValue;
    
    // Score based on growth rate
    if (growthRate > 0.10) growthScore = 25; // More than 10% growth
    else if (growthRate > 0.05) growthScore = 20;
    else if (growthRate > 0) growthScore = 15;
    else growthScore = 5; // Negative growth
  } else {
    growthScore = 10; // Not enough data
  }
  
  // 3. Savings rate score (max 25 points)
  // We can only guess this based on growth pattern
  if (data.history.length >= 3) {
    const consistentGrowth = data.history
      .slice(1)
      .every((item, i) => item.value >= data.history[i].value);
    
    savingsScore = consistentGrowth ? 25 : 15;
  } else {
    savingsScore = 15; // Not enough data
  }
  
  // 4. Liquidity score (max 25 points)
  // Consider fixed deposits as liquid assets
  const liquidAssets = data.breakdown.fixedDeposits;
  const liquidityRatio = liquidAssets / totalAssets;
  
  if (liquidityRatio > 0.2) liquidityScore = 25;
  else if (liquidityRatio > 0.1) liquidityScore = 20;
  else if (liquidityRatio > 0.05) liquidityScore = 15;
  else liquidityScore = 10;
  
  const totalScore = diversificationScore + growthScore + savingsScore + liquidityScore;
  
  return {
    score: totalScore,
    breakdown: [
      { name: 'Diversification', score: diversificationScore, maxScore: 25, description: 'Distribution of assets across investment types' },
      { name: 'Growth Trend', score: growthScore, maxScore: 25, description: 'Positive growth trend over time' },
      { name: 'Savings Rate', score: savingsScore, maxScore: 25, description: 'Regular contributions to savings/investments' },
      { name: 'Liquidity', score: liquidityScore, maxScore: 25, description: 'Access to liquid assets for emergencies' }
    ]
  };
};

export function FinancialHealthScore({ netWorthData }: FinancialHealthScoreProps) {
  const healthScore = calculateHealthScore(netWorthData);
  const score = healthScore.score;
  
  // Map score to a message
  let message = '';
  let color = '';
  
  if (score >= 90) {
    message = 'Excellent';
    color = 'text-green-600';
  } else if (score >= 75) {
    message = 'Very Good';
    color = 'text-green-500';
  } else if (score >= 60) {
    message = 'Good';
    color = 'text-blue-500';
  } else if (score >= 40) {
    message = 'Fair';
    color = 'text-yellow-500';
  } else {
    message = 'Needs Attention';
    color = 'text-red-500';
  }

  return (
    <Card className="bg-finance-blue text-white overflow-hidden">
      <CardHeader className="pb-2">
        <CardTitle className="text-xl font-bold flex items-center gap-2">
          <Award className="h-5 w-5" />
          Financial Health Score
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <HelpCircle className="h-4 w-4 text-white/70 cursor-help" />
              </TooltipTrigger>
              <TooltipContent side="right" className="max-w-sm">
                <p>Your financial health score is calculated based on asset diversification, growth trends, savings rate, and liquidity.</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex items-center justify-between mb-4">
          <span className={`text-4xl font-bold ${color}`}>{score}</span>
          <span className={`font-medium text-xl ${color}`}>{message}</span>
        </div>
        
        <Progress value={score} max={100} className="h-2.5 mb-6" />
        
        <div className="space-y-4">
          {healthScore.breakdown.map((item, index) => (
            <div key={index}>
              <div className="flex justify-between mb-1 text-sm">
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <span className="cursor-help flex items-center gap-1">
                        {item.name}
                        <HelpCircle className="h-3 w-3 text-white/70" />
                      </span>
                    </TooltipTrigger>
                    <TooltipContent side="right">
                      <p>{item.description}</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
                <span>{item.score}/{item.maxScore}</span>
              </div>
              <Progress value={item.score} max={item.maxScore} className="h-1.5" />
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
