
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { getNetWorth } from '@/services/netWorthService';
import { NetWorthData } from '@/types';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from 'recharts';
import { format } from 'date-fns';
import { formatIndianNumber } from '@/lib/utils';

const Reports = () => {
  const [netWorth, setNetWorth] = useState<NetWorthData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const data = await getNetWorth();
        setNetWorth(data);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching net worth data:', error);
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading || !netWorth) {
    return (
      <div className="flex h-full items-center justify-center">
        <p className="text-lg">Loading reports data...</p>
      </div>
    );
  }

  // Prepare data for the pie chart
  const pieData = [
    { name: 'Stocks', value: netWorth.breakdown.stocks },
    { name: 'Fixed Deposits', value: netWorth.breakdown.fixedDeposits },
    { name: 'SIP', value: netWorth.breakdown.sip },
    { name: 'Gold', value: netWorth.breakdown.gold },
    { name: 'Provident Fund', value: netWorth.breakdown.providentFund },
    { name: 'Other', value: netWorth.breakdown.other },
  ].filter(item => item.value > 0); // Only include items with values > 0

  // Prepare data for the bar chart
  const barData = netWorth.history.map(item => ({
    date: format(new Date(item.date), 'MMM yyyy'),
    Net_Worth: item.value
  }));

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8', '#4A5568'];

  // Custom tooltip formatter for pie chart
  const customPieTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0];
      return (
        <div className="bg-white p-2 border border-gray-200 shadow-md rounded">
          <p className="font-bold">{data.name}</p>
          <p>{formatIndianNumber(data.value)}</p>
          <p>{((data.value / netWorth.total) * 100).toFixed(1)}%</p>
        </div>
      );
    }
    return null;
  };

  // Custom tooltip formatter for bar chart
  const customBarTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-2 border border-gray-200 shadow-md rounded">
          <p className="font-bold">{payload[0].payload.date}</p>
          <p>{formatIndianNumber(payload[0].value)}</p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Financial Reports</h1>
        <p className="text-muted-foreground">
          View detailed reports of your financial portfolio
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-1">
        <Card className="finance-card">
          <CardHeader>
            <CardTitle>Net Worth History</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-96">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={barData}
                  margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis 
                    tickFormatter={(value) => `₹${(value / 1000)}K`} 
                  />
                  <Tooltip content={customBarTooltip} />
                  <Legend />
                  <Bar 
                    dataKey="Net_Worth" 
                    fill="#4f46e5" 
                    name="Net Worth" 
                    radius={[4, 4, 0, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card className="finance-card">
          <CardHeader>
            <CardTitle>Asset Allocation</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-96">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    labelLine={true}
                    outerRadius={150}
                    fill="#8884d8"
                    dataKey="value"
                    nameKey="name"
                    label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(1)}%`}
                  >
                    {pieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip content={customPieTooltip} />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Reports;
