
import React, { useEffect, useState } from 'react';
import { getNetWorth, getStocks, getFixedDeposits, getSIPInvestments, getGoldInvestments } from '@/services/mockData';
import { NetWorthData, StockHolding, FixedDeposit, SIPInvestment, GoldInvestment } from '@/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  BarChart, 
  Bar, 
  LineChart, 
  Line, 
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

const Reports = () => {
  const [netWorth, setNetWorth] = useState<NetWorthData | null>(null);
  const [stocks, setStocks] = useState<StockHolding[]>([]);
  const [fixedDeposits, setFixedDeposits] = useState<FixedDeposit[]>([]);
  const [sipInvestments, setSipInvestments] = useState<SIPInvestment[]>([]);
  const [goldInvestments, setGoldInvestments] = useState<GoldInvestment[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [netWorthData, stocksData, fdData, sipData, goldData] = await Promise.all([
          getNetWorth(),
          getStocks(),
          getFixedDeposits(),
          getSIPInvestments(),
          getGoldInvestments()
        ]);

        setNetWorth(netWorthData);
        setStocks(stocksData);
        setFixedDeposits(fdData);
        setSipInvestments(sipData);
        setGoldInvestments(goldData);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching reports data:', error);
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

  // Prepare data for the charts
  const netWorthHistory = netWorth.history.map(item => ({
    date: format(new Date(item.date), 'MMM yyyy'),
    value: item.value
  }));

  const assetAllocation = [
    { name: 'Stocks', value: netWorth.breakdown.stocks },
    { name: 'Fixed Deposits', value: netWorth.breakdown.fixedDeposits },
    { name: 'SIP Investments', value: netWorth.breakdown.sip },
    { name: 'Gold', value: netWorth.breakdown.gold },
    { name: 'Other Assets', value: netWorth.breakdown.other }
  ];

  // Calculate performance data
  const stocksPerformance = stocks.map(stock => ({
    name: stock.symbol,
    value: ((stock.currentPrice - stock.averageBuyPrice) / stock.averageBuyPrice) * 100
  })).sort((a, b) => b.value - a.value);

  const COLORS = ['#1A365D', '#2C7A7B', '#D69E2E', '#805AD5', '#4A5568'];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Financial Reports</h1>
        <p className="text-muted-foreground">
          View detailed reports and analysis of your finances
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card className="finance-card">
          <CardHeader>
            <CardTitle>Net Worth History</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart
                  data={netWorthHistory}
                  margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis tickFormatter={(value) => `₹${(value / 1000)}k`} />
                  <Tooltip formatter={(value) => [`₹${value.toLocaleString()}`, 'Value']} />
                  <Legend />
                  <Line type="monotone" dataKey="value" stroke="#1A365D" activeDot={{ r: 8 }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card className="finance-card">
          <CardHeader>
            <CardTitle>Asset Allocation</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={assetAllocation}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                    label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(1)}%`}
                  >
                    {assetAllocation.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value) => [`₹${value.toLocaleString()}`, 'Value']} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card className="finance-card md:col-span-2">
          <CardHeader>
            <CardTitle>Stock Performance</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={stocksPerformance}
                  margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis tickFormatter={(value) => `${value}%`} />
                  <Tooltip formatter={(value) => [`${value.toFixed(2)}%`, 'Return']} />
                  <Legend />
                  <Bar 
                    dataKey="value" 
                    name="Return %" 
                    fill="#2C7A7B"
                    shape={(props: any) => {
                      const { x, y, width, height, value } = props;
                      return (
                        <rect 
                          x={x} 
                          y={value >= 0 ? y : y + height} 
                          width={width} 
                          height={Math.abs(height)} 
                          fill={value >= 0 ? '#2C7A7B' : '#E53E3E'} 
                          radius={[4, 4, 0, 0]}
                        />
                      );
                    }}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Reports;
