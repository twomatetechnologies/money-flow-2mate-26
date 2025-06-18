import React, { useState } from 'react';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { useToast } from '@/hooks/use-toast';
import { availableProviders } from '@/services/stockApiProviders';

interface ProviderStatusProps {
  onRefresh?: () => void;
  lastUpdated?: Date | null;
  dataProvider?: string | null;
}

/**
 * Shows the status of stock data providers and last update time
 */
export const ProviderStatus: React.FC<ProviderStatusProps> = ({ 
  onRefresh, 
  lastUpdated = null,
  dataProvider = null
}) => {
  const { toast } = useToast();
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Format the last updated time
  const formattedTime = lastUpdated 
    ? new Date(lastUpdated).toLocaleString() 
    : 'Never';

  // Handle manual refresh
  const handleRefresh = async () => {
    if (!onRefresh) return;
    
    setIsRefreshing(true);
    try {
      await onRefresh();
      toast({
        title: "Refresh Started",
        description: "Stock prices are being updated in the background.",
        variant: "default",
      });
    } catch (error) {
      toast({
        title: "Refresh Failed",
        description: "Could not refresh stock prices. Please try again later.",
        variant: "destructive",
      });
    } finally {
      setIsRefreshing(false);
    }
  };

  // Get the available providers
  const providers = availableProviders.map(p => p.name);

  return (
    <div className="flex flex-col space-y-2 mb-4">
      <div className="flex items-center gap-2 text-sm">
        <span className="text-muted-foreground">Last updated:</span>
        <span className="font-medium">{formattedTime}</span>
        
        {dataProvider && (
          <>
            <span className="text-muted-foreground ml-2">Provider:</span>
            <Badge variant="outline" className="bg-primary/10">
              {dataProvider}
            </Badge>
          </>
        )}
        
        {onRefresh && (
          <Button 
            variant="outline" 
            size="sm" 
            onClick={handleRefresh} 
            disabled={isRefreshing}
            className="ml-auto"
          >
            {isRefreshing ? 'Refreshing...' : 'Refresh Prices'}
          </Button>
        )}
      </div>
      
      <div className="flex flex-wrap gap-1 text-xs">
        <span className="text-muted-foreground">Available providers:</span>
        {providers.map((provider, index) => (
          <Badge 
            key={provider} 
            variant="outline" 
            className={`${index === 0 ? 'bg-primary/10' : ''}`}
          >
            {provider}{index === 0 ? ' (Primary)' : ''}
          </Badge>
        ))}
      </div>
    </div>
  );
};

export default ProviderStatus;
