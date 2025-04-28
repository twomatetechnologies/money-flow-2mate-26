
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { NetWorthData } from '@/types';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';
import { PieChart as PieChartIcon, HelpCircle } from 'lucide-react';
import { formatIndianNumber } from '@/lib/utils';
import {
  Tooltip as UITooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface AssetAllocationCardProps {
  data: NetWorthData;
}

export function AssetAllocationCard({ data }: AssetAllocationCardProps) {
  // Calculate actual percentages based on the current total
  const total = data.total;
  
  // Avoid division by zero
  const calculatePercentage = (value: number) => {
    if (total <= 0) return "0.0";
    return ((value / total) * 100).toFixed(1);
  };
  
  // Only include assets with values > 0
  const chartData = [
    { name: 'Stocks', value: data.breakdown.stocks, percentage: calculatePercentage(data.breakdown.stocks) },
    { name: 'Fixed Deposits', value: data.breakdown.fixedDeposits, percentage: calculatePercentage(data.breakdown.fixedDeposits) },
    { name: 'SIP Investments', value: data.breakdown.sip, percentage: calculatePercentage(data.breakdown.sip) },
    { name: 'Gold', value: data.breakdown.gold, percentage: calculatePercentage(data.breakdown.gold) },
    { name: 'Provident Fund', value: data.breakdown.providentFund, percentage: calculatePercentage(data.breakdown.providentFund) },
    { name: 'Other Assets', value: data.breakdown.other, percentage: calculatePercentage(data.breakdown.other) }
  ].filter(item => item.value > 0);

  const COLORS = ['#1A365D', '#2C7A7B', '#D69E2E', '#805AD5', '#38A169', '#4A5568'];

  return (
    <Card className="finance-card">
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center gap-2">
          <PieChartIcon className="h-5 w-5" />
          <span>Asset Allocation</span>
          <TooltipProvider>
            <UITooltip>
              <TooltipTrigger asChild>
                <HelpCircle className="h-4 w-4 text-muted-foreground cursor-help" />
              </TooltipTrigger>
              <TooltipContent side="right" className="max-w-sm">
                <p>Asset Allocation shows how your wealth is distributed across different investment types.</p>
                <p className="mt-2">A well-diversified portfolio typically has assets spread across multiple categories to balance risk and return.</p>
              </TooltipContent>
            </UITooltip>
          </TooltipProvider>
        </CardTitle>
      </CardHeader>
      <CardContent>
        {chartData.length > 0 ? (
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={chartData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {chartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(value: number) => [formatIndianNumber(value), 'Value']}
                  contentStyle={{ borderRadius: '8px', border: '1px solid #e2e8f0' }}
                />
                <Legend 
                  layout="vertical" 
                  verticalAlign="middle" 
                  align="right"
                  formatter={(value, entry, index) => {
                    if (index === undefined || index >= chartData.length) return value;
                    return (
                      <span style={{ color: '#4A5568', fontSize: '0.875rem' }}>
                        {value}: {chartData[index].percentage}%
                      </span>
                    );
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        ) : (
          <div className="h-64 flex items-center justify-center">
            <p className="text-muted-foreground">No asset data available</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
