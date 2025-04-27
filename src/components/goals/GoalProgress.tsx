
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { FinancialGoal, GoalProgress } from '@/types/goals';
import { formatIndianNumber } from '@/lib/utils';

interface GoalProgressProps {
  goal: FinancialGoal;
  progress: GoalProgress;
}

export function GoalProgressCard({ goal, progress }: GoalProgressProps) {
  const { percentageComplete, monthlyRequired, isOnTrack } = progress;

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg">{goal.name}</CardTitle>
          <Badge variant={isOnTrack ? "default" : "destructive"}>
            {isOnTrack ? "On Track" : "Behind Schedule"}
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div>
            <div className="flex justify-between mb-2 text-sm">
              <span>Progress</span>
              <span>{Math.round(percentageComplete)}%</span>
            </div>
            <Progress value={percentageComplete} className="h-2" />
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-muted-foreground">Current Amount</p>
              <p className="text-lg font-semibold">₹{formatIndianNumber(goal.currentAmount)}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Target Amount</p>
              <p className="text-lg font-semibold">₹{formatIndianNumber(goal.targetAmount)}</p>
            </div>
          </div>
          
          <div>
            <p className="text-sm text-muted-foreground">Monthly Saving Required</p>
            <p className="text-lg font-semibold">₹{formatIndianNumber(monthlyRequired)}</p>
          </div>
          
          <div>
            <p className="text-sm text-muted-foreground">Deadline</p>
            <p className="text-lg font-semibold">
              {new Date(goal.deadline).toLocaleDateString('en-IN', {
                day: 'numeric',
                month: 'short',
                year: 'numeric'
              })}
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
