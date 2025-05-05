
import React from 'react';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';
import { Insight } from '@/services/insightsService';
import { 
  AlertTriangle, 
  TrendingUp, 
  PiggyBank, 
  AlertCircle, 
  ChevronRight 
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface InsightCardProps {
  insight: Insight;
  onMarkAsRead: (id: string) => Promise<boolean>;
  expanded?: boolean;
}

export const InsightCard: React.FC<InsightCardProps> = ({ 
  insight, 
  onMarkAsRead,
  expanded = false
}) => {
  const navigate = useNavigate();
  
  const handleAction = () => {
    if (insight.actionLink) {
      onMarkAsRead(insight.id);
      navigate(insight.actionLink);
    }
  };
  
  const handleMarkAsRead = (e: React.MouseEvent) => {
    e.stopPropagation();
    onMarkAsRead(insight.id);
  };
  
  // Function to get the appropriate icon based on insight type
  const getIcon = () => {
    switch (insight.type) {
      case 'anomaly':
        return <AlertTriangle className="h-5 w-5 text-amber-500" />;
      case 'opportunity':
        return <TrendingUp className="h-5 w-5 text-green-500" />;
      case 'advice':
        return <PiggyBank className="h-5 w-5 text-blue-500" />;
      case 'alert':
        return <AlertCircle className="h-5 w-5 text-red-500" />;
      default:
        return <PiggyBank className="h-5 w-5 text-gray-500" />;
    }
  };
  
  // Get impact color
  const getImpactColor = () => {
    switch (insight.impact) {
      case 'high':
        return 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400';
      case 'medium':
        return 'bg-amber-100 text-amber-800 dark:bg-amber-900/20 dark:text-amber-400';
      case 'low':
        return 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400';
    }
  };
  
  return (
    <Card className={`hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors border ${!insight.read ? 'border-l-4 border-l-primary' : 'border-gray-200 dark:border-gray-700'}`}>
      <CardContent className="p-4">
        <div className="flex items-start">
          <div className="mr-3 mt-0.5">
            {getIcon()}
          </div>
          <div className="flex-1">
            <div className="flex justify-between items-start">
              <h3 className="font-medium text-gray-900 dark:text-gray-100">{insight.title}</h3>
              <Badge className={`ml-2 ${getImpactColor()}`}>
                {insight.impact}
              </Badge>
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">{insight.description}</p>
            <div className="text-xs text-gray-500 mt-2">
              {format(new Date(insight.createdAt), 'MMM d, h:mm a')}
            </div>
          </div>
        </div>
      </CardContent>
      {(insight.actionable || !insight.read) && (
        <CardFooter className="p-2 pt-0 flex justify-end">
          <div className="flex gap-2">
            {!insight.read && (
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={handleMarkAsRead}
                className="text-xs"
              >
                Mark as read
              </Button>
            )}
            {insight.actionable && insight.actionText && (
              <Button 
                variant="outline" 
                size="sm" 
                onClick={handleAction}
                className="text-xs"
              >
                {insight.actionText}
                <ChevronRight className="h-3 w-3 ml-1" />
              </Button>
            )}
          </div>
        </CardFooter>
      )}
    </Card>
  );
};
