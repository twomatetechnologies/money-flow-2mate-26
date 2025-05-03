import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { getNetWorth } from '@/services/netWorthService';
import { 
  getReportSnapshots, 
  calculateGrowthMetrics 
} from '@/services/reportsDataService';
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
  Cell,
  LineChart,
  Line
} from 'recharts';
import { format, subMonths } from 'date-fns';
import { formatIndianNumber } from '@/lib/utils';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  ChartContainer,
  ChartTooltipContent,
  ChartTooltip
} from "@/components/ui/chart";
import { HelpCircle, TrendingUp, TrendingDown, Info } from 'lucide-react';
import { 
  Tooltip as UITooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger 
} from "@/components/ui/tooltip";

const Reports = () => {
  const [netWorth, setNetWorth] = useState<NetWorthData | null>(null);
  const [reportSnapshots, setReportSnapshots] = useState<any[]>([]);
  const [growthMetrics, setGrowthMetrics] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState<'3m' | '6m' | '1y' | 'all'>('1y');

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch all data in parallel for better performance
        const [netWorthData, snapshots] = await Promise.all([
          getNetWorth(),
          getReportSnapshots()
        ]);
        
        setNetWorth(netWorthData);
        setReportSnapshots(snapshots);
        
        // Calculate growth metrics
        const growth = calculateGrowthMetrics();
        setGrowthMetrics(growth);
        
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

  // Filter snapshots based on selected time range
  const getFilteredSnapshots = () => {
    if (timeRange === 'all') return reportSnapshots;
    
    const now = new Date();
    let monthsToSubtract = 12;
    
    switch (timeRange) {
      case '3m': monthsToSubtract = 3; break;
      case '6m': monthsToSubtract = 6; break;
      case '1y': monthsToSubtract = 12; break;
      default: monthsToSubtract = 12;
    }
    
    const cutoffDate = subMonths(now, monthsToSubtract);
    return reportSnapshots.filter(item => new Date(item.date) >= cutoffDate);
  };

  // Prepare data for the pie chart
  const pieData = [
    { name: 'Stocks', value: netWorth.breakdown.stocks },
    { name: 'Fixed Deposits', value: netWorth.breakdown.fixedDeposits },
    { name: 'SIP', value: netWorth.breakdown.sip },
    { name: 'Gold', value: netWorth.breakdown.gold },
    { name: 'Provident Fund', value: netWorth.breakdown.providentFund },
    { name: 'Other', value: netWorth.breakdown.other },
  ].filter(item => item.value > 0); // Only include items with values > 0

  // Prepare data for the bar/line chart
  const filteredSnapshots = getFilteredSnapshots();
  const chartData = filteredSnapshots.map(item => ({
    date: format(new Date(item.date), 'MMM yyyy'),
    netWorth: item.netWorth,
  }));

  // Use the actual history from netWorthData
  const netWorthHistoryData = netWorth.history.map(item => ({
    date: format(new Date(item.date), 'MMM yyyy'),
    netWorth: item.value
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

  // Custom tooltip formatter for line/bar chart
  const customChartTooltip = ({ active, payload }: any) => {
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

      {/* Growth Metrics Cards */}
      {growthMetrics && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="finance-card">
            <CardContent className="pt-6">
              <div className="flex justify-between items-center">
                <p className="text-sm font-medium">Month-over-month</p>
                <div className={`flex items-center ${growthMetrics.monthOverMonth >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                  {growthMetrics.monthOverMonth >= 0 ? 
                    <TrendingUp className="h-4 w-4 mr-1" /> : 
                    <TrendingDown className="h-4 w-4 mr-1" />
                  }
                  <span className="font-bold">{growthMetrics.monthOverMonth.toFixed(1)}%</span>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="finance-card">
            <CardContent className="pt-6">
              <div className="flex justify-between items-center">
                <p className="text-sm font-medium">3-month growth</p>
                <div className={`flex items-center ${growthMetrics.threeMonth >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                  {growthMetrics.threeMonth >= 0 ? 
                    <TrendingUp className="h-4 w-4 mr-1" /> : 
                    <TrendingDown className="h-4 w-4 mr-1" />
                  }
                  <span className="font-bold">{growthMetrics.threeMonth.toFixed(1)}%</span>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="finance-card">
            <CardContent className="pt-6">
              <div className="flex justify-between items-center">
                <p className="text-sm font-medium">6-month growth</p>
                <div className={`flex items-center ${growthMetrics.sixMonth >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                  {growthMetrics.sixMonth >= 0 ? 
                    <TrendingUp className="h-4 w-4 mr-1" /> : 
                    <TrendingDown className="h-4 w-4 mr-1" />
                  }
                  <span className="font-bold">{growthMetrics.sixMonth.toFixed(1)}%</span>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="finance-card">
            <CardContent className="pt-6">
              <div className="flex justify-between items-center">
                <p className="text-sm font-medium">Year-over-year</p>
                <div className={`flex items-center ${growthMetrics.yearOverYear >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                  {growthMetrics.yearOverYear >= 0 ? 
                    <TrendingUp className="h-4 w-4 mr-1" /> : 
                    <TrendingDown className="h-4 w-4 mr-1" />
                  }
                  <span className="font-bold">{growthMetrics.yearOverYear.toFixed(1)}%</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      <div className="grid gap-6 md:grid-cols-1">
        <Card className="finance-card">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>
              <div className="flex items-center gap-2">
                Net Worth History
                <TooltipProvider>
                  <UITooltip>
                    <TooltipTrigger asChild>
                      <HelpCircle className="h-4 w-4 text-muted-foreground cursor-help" />
                    </TooltipTrigger>
                    <TooltipContent side="top" className="max-w-sm">
                      <p>This chart shows how your net worth has changed over time based on your actual financial data.</p>
                    </TooltipContent>
                  </UITooltip>
                </TooltipProvider>
              </div>
            </CardTitle>
            <div>
              <Tabs defaultValue="1y" className="w-fit" onValueChange={(value) => setTimeRange(value as any)}>
                <TabsList className="grid grid-cols-4 w-[250px]">
                  <TabsTrigger value="3m">3M</TabsTrigger>
                  <TabsTrigger value="6m">6M</TabsTrigger>
                  <TabsTrigger value="1y">1Y</TabsTrigger>
                  <TabsTrigger value="all">All</TabsTrigger>
                </TabsList>
              </Tabs>
            </div>
          </CardHeader>
          <CardContent>
            <div className="h-96">
              <ChartContainer 
                config={{
                  netWorth: {
                    label: "Net Worth",
                    color: "#4f46e5",
                  },
                }}
              >
                <LineChart
                  data={netWorthHistoryData}
                  margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis 
                    tickFormatter={(value) => `₹${(value / 1000)}K`} 
                  />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Legend />
                  <Line
                    type="monotone"
                    dataKey="netWorth"
                    stroke="#4f46e5"
                    strokeWidth={2}
                    activeDot={{ r: 8 }}
                    name="Net Worth"
                  />
                </LineChart>
              </ChartContainer>
            </div>
            <div className="mt-4 text-xs text-muted-foreground flex items-center">
              <Info className="h-3 w-3 mr-2" />
              Net worth is calculated by tracking all your assets across different investment types
            </div>
          </CardContent>
        </Card>

        <Card className="finance-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              Asset Allocation
              <TooltipProvider>
                <UITooltip>
                  <TooltipTrigger asChild>
                    <HelpCircle className="h-4 w-4 text-muted-foreground cursor-help" />
                  </TooltipTrigger>
                  <TooltipContent side="top" className="max-w-sm">
                    <p>This chart shows how your assets are distributed across different investment types.</p>
                  </TooltipContent>
                </UITooltip>
              </TooltipProvider>
            </CardTitle>
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
