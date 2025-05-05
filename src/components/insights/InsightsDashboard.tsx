
import React from 'react';
import { useInsights } from '@/hooks/useInsights';
import { InsightsList } from './InsightsList';
import { QuerySystem } from './QuerySystem';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { BrainCircuit, ListFilter, MessageSquare, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';

export const InsightsDashboard: React.FC = () => {
  const { insights, summary, loading, fetchInsights, markAsRead } = useInsights();
  
  const handleRefresh = () => {
    fetchInsights();
  };
  
  return (
    <Card className="border border-gray-100 dark:border-gray-800 shadow-sm">
      <CardHeader className="py-4 px-6 bg-gray-50 dark:bg-gray-800/50 border-b border-gray-100 dark:border-gray-800 flex flex-row items-center justify-between">
        <div className="flex items-center gap-2">
          <BrainCircuit className="h-5 w-5 text-primary" />
          <CardTitle className="text-lg font-medium">AI Investment Insights</CardTitle>
          {summary && summary.unreadInsights > 0 && (
            <Badge className="ml-2 bg-primary text-primary-foreground">
              {summary.unreadInsights} new
            </Badge>
          )}
        </div>
        <Button 
          variant="outline" 
          size="sm" 
          onClick={handleRefresh}
          className="h-8"
        >
          <RefreshCw className="h-3.5 w-3.5 mr-1" />
          Refresh
        </Button>
      </CardHeader>
      <CardContent className="p-4">
        <Tabs defaultValue="insights" className="w-full">
          <TabsList className="mb-4">
            <TabsTrigger value="insights" className="flex items-center">
              <ListFilter className="h-4 w-4 mr-2" />
              Insights
              {summary && summary.unreadInsights > 0 && (
                <Badge className="ml-2 bg-primary text-primary-foreground">
                  {summary.unreadInsights}
                </Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="query" className="flex items-center">
              <MessageSquare className="h-4 w-4 mr-2" />
              Ask Advisor
            </TabsTrigger>
          </TabsList>
          <TabsContent value="insights" className="border-none p-0">
            <InsightsList 
              insights={insights} 
              loading={loading} 
              onMarkAsRead={markAsRead} 
            />
          </TabsContent>
          <TabsContent value="query" className="border-none p-0">
            <QuerySystem />
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};
