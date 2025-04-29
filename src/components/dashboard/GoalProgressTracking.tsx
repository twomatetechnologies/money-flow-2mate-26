
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { FinancialGoal, GoalProgress } from '@/types/goals';
import { formatIndianNumber } from '@/lib/utils';
import { Flag, TrendingUp, HelpCircle } from 'lucide-react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Link } from 'react-router-dom';

interface GoalProgressTrackingProps {
  goals: FinancialGoal[];
  goalProgress: Record<string, GoalProgress>;
}

export function GoalProgressTracking({ goals, goalProgress }: GoalProgressTrackingProps) {
  // Sort goals by closest to deadline first
  const sortedGoals = [...goals].sort((a, b) => {
    const aDeadline = new Date(a.deadline).getTime();
    const bDeadline = new Date(b.deadline).getTime();
    return aDeadline - bDeadline;
  });

  // Get top 3 goals with the nearest deadline
  const topGoals = sortedGoals.slice(0, 3);
  
  // Count goals by status
  const onTrackCount = goals.filter(goal => goalProgress[goal.id]?.isOnTrack).length;
  const behindCount = goals.length - onTrackCount;
  
  // Calculate overall progress
  const overallProgress = goals.length > 0
    ? goals.reduce((sum, goal) => sum + goalProgress[goal.id]?.percentageComplete || 0, 0) / goals.length
    : 0;

  return (
    <Card className="bg-finance-blue text-white overflow-hidden">
      <CardHeader className="pb-2">
        <CardTitle className="text-xl font-bold flex items-center gap-2">
          <TrendingUp className="h-5 w-5" />
          Goal Progress Tracking
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <HelpCircle className="h-4 w-4 text-white/70 cursor-help" />
              </TooltipTrigger>
              <TooltipContent side="right" className="max-w-sm">
                <p>Track your financial goals and see if you're on track to meet them.</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </CardTitle>
      </CardHeader>
      <CardContent>
        {goals.length > 0 ? (
          <>
            <div className="flex items-center justify-between mb-2">
              <div>
                <p className="text-sm text-gray-300">Overall Progress</p>
                <p className="text-2xl font-bold">{Math.round(overallProgress)}%</p>
              </div>
              <div className="flex gap-2">
                <Badge variant="outline" className="bg-green-500/20 text-green-300 border-green-300">
                  {onTrackCount} On Track
                </Badge>
                <Badge variant="outline" className="bg-red-500/20 text-red-300 border-red-300">
                  {behindCount} Behind
                </Badge>
              </div>
            </div>
            
            <Progress value={overallProgress} max={100} className="h-2 mb-6" />
            
            {topGoals.length > 0 ? (
              <Table>
                <TableHeader>
                  <TableRow className="hover:bg-white/5">
                    <TableHead className="text-white/80">Goal</TableHead>
                    <TableHead className="text-white/80">Progress</TableHead>
                    <TableHead className="text-white/80">Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {topGoals.map(goal => {
                    const progress = goalProgress[goal.id] || { percentageComplete: 0, isOnTrack: false };
                    return (
                      <TableRow key={goal.id} className="hover:bg-white/5">
                        <TableCell className="font-medium">
                          <div className="flex items-center gap-2">
                            <Flag className="h-4 w-4" />
                            <span>{goal.name}</span>
                          </div>
                          <div className="text-xs text-gray-300 mt-1">
                            Due {new Date(goal.deadline).toLocaleDateString('en-IN', {
                              day: 'numeric',
                              month: 'short',
                              year: 'numeric'
                            })}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Progress
                              value={progress.percentageComplete}
                              max={100}
                              className="h-1.5 w-16"
                            />
                            <span>{Math.round(progress.percentageComplete)}%</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant="outline"
                            className={progress.isOnTrack 
                              ? "bg-green-500/20 text-green-300 border-green-300" 
                              : "bg-red-500/20 text-red-300 border-red-300"}
                          >
                            {progress.isOnTrack ? 'On Track' : 'Behind'}
                          </Badge>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            ) : (
              <p className="text-center py-4">No goals found</p>
            )}
            
            <div className="mt-4 text-center">
              <Link to="/goals" className="text-blue-300 hover:text-blue-200 text-sm">
                View all goals →
              </Link>
            </div>
          </>
        ) : (
          <div className="text-center py-8">
            <p className="mb-2">No financial goals added yet</p>
            <Link 
              to="/goals" 
              className="inline-block px-4 py-2 bg-white/10 hover:bg-white/20 rounded-md transition"
            >
              Add your first goal →
            </Link>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
