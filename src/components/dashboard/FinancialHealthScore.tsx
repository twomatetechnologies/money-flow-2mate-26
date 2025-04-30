
import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import FinancialHealthExplanation from './FinancialHealthExplanation';

interface FinancialHealthScoreProps {
  score: number;
  previousScore?: number;
  lastUpdated?: Date;
}

export const FinancialHealthScore = ({ score, previousScore, lastUpdated }: FinancialHealthScoreProps) => {
  const getScoreColor = (score: number) => {
    if (score >= 90) return 'bg-green-500';
    if (score >= 80) return 'bg-emerald-500';
    if (score >= 70) return 'bg-blue-500';
    if (score >= 60) return 'bg-yellow-500';
    if (score >= 50) return 'bg-orange-500';
    return 'bg-red-500';
  };

  const getScoreText = (score: number) => {
    if (score >= 90) return 'Excellent';
    if (score >= 80) return 'Very Good';
    if (score >= 70) return 'Good';
    if (score >= 60) return 'Adequate';
    if (score >= 50) return 'Fair';
    return 'Needs Attention';
  };

  const scoreDifference = previousScore ? score - previousScore : 0;

  return (
    <Card className="border-none shadow-none">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base font-medium">Financial Health Score</CardTitle>
          <FinancialHealthExplanation />
        </div>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col space-y-1">
          <div className="flex items-end">
            <span className="text-2xl font-bold">{score}</span>
            <span className="ml-1 text-muted-foreground">/100</span>
            
            {scoreDifference !== 0 && (
              <span className={`ml-2 text-sm ${scoreDifference > 0 ? 'text-green-500' : 'text-red-500'}`}>
                {scoreDifference > 0 ? '+' : ''}{scoreDifference}
              </span>
            )}
          </div>
          
          <div className="text-sm font-medium">
            {getScoreText(score)}
          </div>
          
          <Progress 
            value={score} 
            max={100} 
            className={`h-2 mt-2 ${getScoreColor(score)}`}
          />
          
          {lastUpdated && (
            <div className="text-xs text-muted-foreground mt-1">
              Last updated: {lastUpdated.toLocaleDateString()}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default FinancialHealthScore;
