
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { NetWorthData } from '@/types';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';

interface AssetAllocationCardProps {
  data: NetWorthData;
}

export function AssetAllocationCard({ data }: AssetAllocationCardProps) {
  // Calculate actual percentages based on the current total
  const total = data.total;
  const calculatePercentage = (value: number) => ((value / total) * 100).toFixed(1);
  
  const chartData = [
    { name: 'Stocks', value: data.breakdown.stocks, percentage: calculatePercentage(data.breakdown.stocks) },
    { name: 'Fixed Deposits', value: data.breakdown.fixedDeposits, percentage: calculatePercentage(data.breakdown.fixedDeposits) },
    { name: 'SIP Investments', value: data.breakdown.sip, percentage: calculatePercentage(data.breakdown.sip) },
    { name: 'Gold', value: data.breakdown.gold, percentage: calculatePercentage(data.breakdown.gold) },
    { name: 'Other Assets', value: data.breakdown.other, percentage: calculatePercentage(data.breakdown.other) }
  ];

  const COLORS = ['#1A365D', '#2C7A7B', '#D69E2E', '#805AD5', '#4A5568'];

  return (
    <Card className="finance-card">
      <CardHeader className="pb-2">
        <CardTitle>Asset Allocation</CardTitle>
      </CardHeader>
      <CardContent>
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
                formatter={(value: number) => [`₹${value.toLocaleString()}`, 'Value']}
                contentStyle={{ borderRadius: '8px', border: '1px solid #e2e8f0' }}
              />
              <Legend 
                layout="vertical" 
                verticalAlign="middle" 
                align="right"
                formatter={(value, entry, index) => {
                  return (
                    <span style={{ color: '#4A5568', fontSize: '0.875rem' }}>
                      {value}: {chartData[index!].percentage}%
                    </span>
                  );
                }}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
