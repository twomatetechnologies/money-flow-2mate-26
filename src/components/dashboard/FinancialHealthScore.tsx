
import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import FinancialHealthExplanation from './FinancialHealthExplanation';
import { TrendingUp, TrendingDown } from 'lucide-react';

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
    <Card className="border shadow-sm hover:shadow-md transition-shadow duration-300">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base font-medium">Financial Health Score</CardTitle>
          <FinancialHealthExplanation />
        </div>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col space-y-2">
          <div className="flex items-end">
            <span className="text-3xl font-bold">{score}</span>
            <span className="ml-1 text-muted-foreground">/100</span>
            
            {scoreDifference !== 0 && (
              <div className={`ml-2 flex items-center ${scoreDifference > 0 ? 'text-green-500' : 'text-red-500'}`}>
                {scoreDifference > 0 ? (
                  <TrendingUp className="h-4 w-4 mr-1" />
                ) : (
                  <TrendingDown className="h-4 w-4 mr-1" />
                )}
                <span className="text-sm font-medium">
                  {scoreDifference > 0 ? '+' : ''}{scoreDifference}
                </span>
              </div>
            )}
          </div>
          
          <div className="text-sm font-medium">
            <span className={`inline-block px-2 py-0.5 rounded-full text-xs ${getScoreColor(score)} bg-opacity-20 text-${getScoreColor(score).replace('bg-', '')}`}>
              {getScoreText(score)}
            </span>
          </div>
          
          <div className="w-full bg-gray-100 rounded-full h-2 mt-2 overflow-hidden dark:bg-gray-700">
            <Progress 
              value={score} 
              max={100} 
              className={`h-full ${getScoreColor(score)}`}
            />
          </div>
          
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
