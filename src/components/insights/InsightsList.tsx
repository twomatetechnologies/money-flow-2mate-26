
import React, { useState } from 'react';
import { InsightCard } from './InsightCard';
import { Insight } from '@/services/insightsService';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  AlertTriangle,
  TrendingUp,
  AlertCircle,
  PiggyBank,
  Search,
  ArrowDownAZ,
  XCircle
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

interface InsightsListProps {
  insights: Insight[];
  loading: boolean;
  onMarkAsRead: (id: string) => Promise<boolean>;
}

export const InsightsList: React.FC<InsightsListProps> = ({ 
  insights, 
  loading, 
  onMarkAsRead 
}) => {
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [impactFilter, setImpactFilter] = useState<string>('all');
  const [sortBy, setSortBy] = useState<string>('date');
  const [searchTerm, setSearchTerm] = useState<string>('');
  
  if (loading) {
    return (
      <div className="flex flex-col space-y-3">
        {[1, 2, 3].map((i) => (
          <div key={i} className="p-4 border rounded-lg animate-pulse bg-gray-100 dark:bg-gray-800 h-24"></div>
        ))}
      </div>
    );
  }
  
  if (insights.length === 0) {
    return (
      <div className="text-center py-8">
        <PiggyBank className="mx-auto h-12 w-12 text-gray-400" />
        <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-gray-100">No insights available</h3>
        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
          We'll generate new insights based on your financial activity.
        </p>
      </div>
    );
  }
  
  // Apply filters
  let filteredInsights = insights;
  
  if (typeFilter !== 'all') {
    filteredInsights = filteredInsights.filter(insight => insight.type === typeFilter);
  }
  
  if (impactFilter !== 'all') {
    filteredInsights = filteredInsights.filter(insight => insight.impact === impactFilter);
  }
  
  if (searchTerm.trim()) {
    const term = searchTerm.toLowerCase();
    filteredInsights = filteredInsights.filter(
      insight => 
        insight.title.toLowerCase().includes(term) || 
        insight.description.toLowerCase().includes(term)
    );
  }
  
  // Apply sorting
  filteredInsights = [...filteredInsights].sort((a, b) => {
    if (sortBy === 'date') {
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    } else if (sortBy === 'impact') {
      const impactMap = { high: 3, medium: 2, low: 1 };
      return impactMap[b.impact as keyof typeof impactMap] - impactMap[a.impact as keyof typeof impactMap];
    } else {
      return 0;
    }
  });

  const hasActiveFilters = typeFilter !== 'all' || impactFilter !== 'all' || searchTerm.trim();
  
  return (
    <div className="space-y-4">
      <div className="flex flex-col md:flex-row gap-2 justify-between">
        <div className="flex flex-1 gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500 dark:text-gray-400" />
            <Input
              placeholder="Search insights..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9"
            />
            {searchTerm && (
              <button 
                className="absolute right-2.5 top-2.5 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
                onClick={() => setSearchTerm('')}
              >
                <XCircle className="h-4 w-4" />
              </button>
            )}
          </div>
        </div>
        
        <div className="flex gap-2">
          <Select value={typeFilter} onValueChange={setTypeFilter}>
            <SelectTrigger className="w-[130px]">
              <SelectValue placeholder="Type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Types</SelectItem>
              <SelectItem value="anomaly">Anomaly</SelectItem>
              <SelectItem value="opportunity">Opportunity</SelectItem>
              <SelectItem value="advice">Advice</SelectItem>
              <SelectItem value="alert">Alert</SelectItem>
            </SelectContent>
          </Select>
          
          <Select value={impactFilter} onValueChange={setImpactFilter}>
            <SelectTrigger className="w-[130px]">
              <SelectValue placeholder="Impact" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Impact</SelectItem>
              <SelectItem value="high">High</SelectItem>
              <SelectItem value="medium">Medium</SelectItem>
              <SelectItem value="low">Low</SelectItem>
            </SelectContent>
          </Select>
          
          <Select value={sortBy} onValueChange={setSortBy}>
            <SelectTrigger className="w-[130px]">
              <SelectValue placeholder="Sort By" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="date">
                <div className="flex items-center">
                  <ArrowDownAZ className="mr-2 h-4 w-4" />
                  <span>Date</span>
                </div>
              </SelectItem>
              <SelectItem value="impact">
                <div className="flex items-center">
                  <AlertTriangle className="mr-2 h-4 w-4" />
                  <span>Impact</span>
                </div>
              </SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
      
      {hasActiveFilters && filteredInsights.length === 0 ? (
        <div className="text-center py-8">
          <AlertCircle className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-gray-100">No matching insights</h3>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            Try adjusting your filters to see more results.
          </p>
          <Button 
            variant="outline" 
            className="mt-4"
            onClick={() => {
              setTypeFilter('all');
              setImpactFilter('all');
              setSearchTerm('');
            }}
          >
            Clear Filters
          </Button>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredInsights.map((insight) => (
            <InsightCard 
              key={insight.id} 
              insight={insight} 
              onMarkAsRead={onMarkAsRead}
            />
          ))}
        </div>
      )}
    </div>
  );
};
