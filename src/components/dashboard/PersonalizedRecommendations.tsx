
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Bulb, ExternalLink, HelpCircle } from 'lucide-react';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { NetWorthData } from '@/types';
import { FinancialGoal } from '@/types/goals';
import { StockHolding, FixedDeposit } from '@/types';
import { Link } from 'react-router-dom';

interface PersonalizedRecommendationsProps {
  netWorthData: NetWorthData;
  goals?: FinancialGoal[];
  stocks?: StockHolding[];
  fixedDeposits?: FixedDeposit[];
}

interface Recommendation {
  id: string;
  title: string;
  description: string;
  priority: 'high' | 'medium' | 'low';
  actionLink?: string;
  actionText?: string;
}

export function PersonalizedRecommendations({
  netWorthData,
  goals = [],
  stocks = [],
  fixedDeposits = []
}: PersonalizedRecommendationsProps) {
  // Generate personalized recommendations based on user data
  const generateRecommendations = (): Recommendation[] => {
    const recommendations: Recommendation[] = [];
    
    // 1. Check for portfolio diversification
    const totalAssets = netWorthData.total;
    
    if (totalAssets > 0) {
      // Check if any single asset class has more than 60% of total portfolio
      const assetClasses = Object.entries(netWorthData.breakdown);
      
      for (const [assetClass, value] of assetClasses) {
        const percentage = (value / totalAssets) * 100;
        
        if (percentage > 60) {
          recommendations.push({
            id: 'diversify-' + assetClass,
            title: 'Diversify Your Portfolio',
            description: `Over ${Math.round(percentage)}% of your assets are in ${assetClass.replace(/([A-Z])/g, ' $1').toLowerCase()}. Consider diversifying to reduce risk.`,
            priority: 'high',
            actionLink: '/reports',
            actionText: 'View asset allocation'
          });
          break;
        }
      }
      
      // Specific checks for stocks
      if (stocks.length > 0) {
        // Check if stocks are concentrated in one sector
        const sectors = stocks.reduce((acc, stock) => {
          if (stock.sector) {
            acc[stock.sector] = (acc[stock.sector] || 0) + (stock.currentPrice * stock.quantity);
          }
          return acc;
        }, {} as Record<string, number>);
        
        const totalStockValue = stocks.reduce((sum, stock) => sum + (stock.currentPrice * stock.quantity), 0);
        
        for (const [sector, value] of Object.entries(sectors)) {
          const percentage = (value / totalStockValue) * 100;
          
          if (percentage > 40 && stocks.length > 3) {
            recommendations.push({
              id: 'sector-diversify',
              title: 'Diversify Stock Sectors',
              description: `${Math.round(percentage)}% of your stock portfolio is in the ${sector} sector. Consider adding stocks from different sectors.`,
              priority: 'medium',
              actionLink: '/stocks',
              actionText: 'Manage stocks'
            });
            break;
          }
        }
      }
    }
    
    // 2. Check for emergency fund (assuming FDs could be emergency funds)
    const liquidAssets = netWorthData.breakdown.fixedDeposits || 0;
    const liquidityRatio = totalAssets > 0 ? (liquidAssets / totalAssets) * 100 : 0;
    
    if (liquidityRatio < 10 && totalAssets > 10000) {
      recommendations.push({
        id: 'emergency-fund',
        title: 'Build Emergency Fund',
        description: 'Only ' + Math.round(liquidityRatio) + '% of your assets are liquid. Aim for 3-6 months of expenses in emergency funds.',
        priority: 'high',
        actionLink: '/goals',
        actionText: 'Create emergency fund goal'
      });
    }
    
    // 3. Check for maturity dates of fixed deposits
    const today = new Date();
    const nextMonth = new Date();
    nextMonth.setMonth(today.getMonth() + 1);
    
    const maturingFDs = fixedDeposits.filter(fd => {
      const maturity = new Date(fd.maturityDate);
      return maturity >= today && maturity <= nextMonth;
    });
    
    if (maturingFDs.length > 0) {
      recommendations.push({
        id: 'maturing-fds',
        title: 'FDs Maturing Soon',
        description: `You have ${maturingFDs.length} fixed deposit(s) maturing in the next 30 days. Plan for reinvestment.`,
        priority: 'medium',
        actionLink: '/fixed-deposits',
        actionText: 'View fixed deposits'
      });
    }
    
    // 4. Check goals that are behind schedule
    const behindGoals = goals.filter(goal => {
      // This assumes the goal progress is calculated elsewhere
      const deadline = new Date(goal.deadline);
      const today = new Date();
      const totalDuration = deadline.getTime() - new Date(goal.createdAt).getTime();
      const elapsedDuration = today.getTime() - new Date(goal.createdAt).getTime();
      const expectedProgress = (elapsedDuration / totalDuration) * 100;
      const actualProgress = (goal.currentAmount / goal.targetAmount) * 100;
      
      return actualProgress < expectedProgress * 0.8; // 20% or more behind
    });
    
    if (behindGoals.length > 0) {
      recommendations.push({
        id: 'behind-goals',
        title: 'Goals Need Attention',
        description: `${behindGoals.length} of your financial goals are significantly behind schedule. Review and adjust your savings plan.`,
        priority: 'high',
        actionLink: '/goals',
        actionText: 'View goals'
      });
    }
    
    // 5. Check if still investing in low-return FDs despite having higher-return options
    if (fixedDeposits.length > 0 && stocks.length > 0) {
      const averageFDRate = fixedDeposits.reduce((sum, fd) => sum + fd.interestRate, 0) / fixedDeposits.length;
      
      if (averageFDRate < 6 && netWorthData.breakdown.stocks < netWorthData.breakdown.fixedDeposits) {
        recommendations.push({
          id: 'consider-equity',
          title: 'Consider Higher-Return Investments',
          description: `Your FDs average only ${averageFDRate.toFixed(1)}% return. Consider allocating more to equity-based investments for long-term goals.`,
          priority: 'medium',
          actionLink: '/sip-investments',
          actionText: 'Explore SIP investments'
        });
      }
    }
    
    return recommendations;
  };
  
  const recommendations = generateRecommendations();
  
  // Get color based on priority
  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'bg-red-500/20 text-red-300 border-red-300';
      case 'medium':
        return 'bg-yellow-500/20 text-yellow-300 border-yellow-300';
      case 'low':
        return 'bg-green-500/20 text-green-300 border-green-300';
      default:
        return 'bg-blue-500/20 text-blue-300 border-blue-300';
    }
  };

  return (
    <Card className="bg-finance-blue text-white">
      <CardHeader className="pb-2">
        <CardTitle className="text-xl font-bold flex items-center gap-2">
          <Bulb className="h-5 w-5" />
          Personalized Recommendations
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <HelpCircle className="h-4 w-4 text-white/70 cursor-help" />
              </TooltipTrigger>
              <TooltipContent side="right" className="max-w-sm">
                <p>Smart suggestions based on your financial data to improve your financial health.</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </CardTitle>
      </CardHeader>
      <CardContent>
        {recommendations.length > 0 ? (
          <div className="space-y-4">
            {recommendations.map(rec => (
              <div key={rec.id} className="bg-white/10 rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-semibold text-lg">{rec.title}</h3>
                  <Badge 
                    variant="outline" 
                    className={getPriorityColor(rec.priority)}
                  >
                    {rec.priority.charAt(0).toUpperCase() + rec.priority.slice(1)} Priority
                  </Badge>
                </div>
                <p className="text-sm text-gray-300 mb-3">{rec.description}</p>
                {rec.actionLink && (
                  <Link to={rec.actionLink} className="inline-flex items-center text-blue-300 hover:text-blue-200 text-sm">
                    {rec.actionText} <ExternalLink className="ml-1 h-3 w-3" />
                  </Link>
                )}
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-white/10 rounded-lg p-6 text-center">
            <p>Great job! No recommendations at this time.</p>
            <p className="text-sm text-gray-300 mt-2">
              We'll provide personalized suggestions as your financial data changes.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
