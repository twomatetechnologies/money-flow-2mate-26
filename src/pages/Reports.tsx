
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { getNetWorth } from '@/services/netWorthService';
import { 
  getReportSnapshots, 
  calculateGrowthMetrics,
  ReportSnapshot // Import ReportSnapshot type
} from '@/services/reportsDataService';
import { NetWorthData } from '@/types';
import { 
  LineChart,
  Line,
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
import { format, subMonths } from 'date-fns';
import { formatIndianNumber } from '@/lib/utils';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  ChartContainer,
  ChartTooltip as ShadcnChartTooltip, // Renamed to avoid conflict with Recharts Tooltip
  ChartTooltipContent,
} from "@/components/ui/chart";
import { HelpCircle, TrendingUp, TrendingDown, Info } from 'lucide-react';
import { 
  Tooltip as UITooltip,
  TooltipContent as UITooltipContent, // Renamed for clarity
  TooltipProvider,
  TooltipTrigger 
} from "@/components/ui/tooltip";

interface GrowthMetrics {
  monthOverMonth: number;
  threeMonth: number;
  sixMonth: number;
  yearOverYear: number;
}

const Reports = () => {
  const [netWorth, setNetWorth] = useState<NetWorthData | null>(null);
  const [reportSnapshots, setReportSnapshots] = useState<ReportSnapshot[]>([]); // Use ReportSnapshot type
  const [growthMetrics, setGrowthMetrics] = useState<GrowthMetrics | null>(null); // Use GrowthMetrics type
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState<'3m' | '6m' | '1y' | 'all'>('1y');

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true); // Ensure loading is true at the start of fetch
      try {
        // Fetch all data in parallel for better performance
        const [netWorthData, snapshotsData] = await Promise.all([
          getNetWorth(),
          getReportSnapshots()
        ]);
        
        setNetWorth(netWorthData);
        setReportSnapshots(snapshotsData || []); // Ensure snapshots is an array
        
        // Calculate growth metrics
        if (snapshotsData && snapshotsData.length > 0) {
          const growth = await calculateGrowthMetrics(); // Await the async function
          setGrowthMetrics(growth);
        } else {
          setGrowthMetrics({ monthOverMonth: 0, threeMonth: 0, sixMonth: 0, yearOverYear: 0 });
        }
        
      } catch (error) {
        console.error('Error fetching reports data:', error);
        // Set default/empty states on error
        setNetWorth(null);
        setReportSnapshots([]);
        setGrowthMetrics({ monthOverMonth: 0, threeMonth: 0, sixMonth: 0, yearOverYear: 0 });
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) { // Simplified loading check
    return (
      <div className="flex h-screen items-center justify-center">
        <p className="text-lg animate-pulse">Loading reports data...</p>
      </div>
    );
  }

  if (!netWorth) {
    return (
      <div className="flex h-screen items-center justify-center">
        <p className="text-lg text-red-500">Failed to load net worth data. Please try again later.</p>
      </div>
    );
  }


  // Filter snapshots based on selected time range
  const getFilteredSnapshots = () => {
    if (!Array.isArray(reportSnapshots)) return []; // Guard against undefined/non-array
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
  const chartData = filteredSnapshots.map(item => ({ // This uses reportSnapshots state
    date: format(new Date(item.date), 'MMM yyyy'),
    netWorth: item.netWorth,
  }));

  // Use the actual history from netWorthData for the LineChart
  const netWorthHistoryData = (netWorth.history || []).map(item => ({
    date: format(new Date(item.date), 'MMM yyyy'),
    netWorth: item.value
  })).sort((a,b) => new Date(a.date).getTime() - new Date(b.date).getTime()); // Ensure sorted by date


  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8', '#4A5568'];

  // Custom tooltip formatter for pie chart
  const customPieTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0];
      return (
        <div className="bg-background p-2 border border-border shadow-md rounded text-sm">
          <p className="font-bold text-foreground">{data.name}</p>
          <p className="text-muted-foreground">{formatIndianNumber(data.value)}</p>
          <p className="text-muted-foreground">{((data.value / netWorth.total) * 100).toFixed(1)}%</p>
        </div>
      );
    }
    return null;
  };
  
  const CustomLineChartTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-background p-2 border border-border shadow-md rounded text-sm">
          <p className="label text-foreground">{`${label}`}</p>
          {payload.map((entry: any, index: number) => (
            <p key={`item-${index}`} style={{ color: entry.color }} className="text-muted-foreground">
              {`${entry.name}: ${formatIndianNumber(entry.value)}`}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };


  return (
    <div className="container mx-auto p-4 md:p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Financial Reports</h1>
        <p className="text-muted-foreground">
          View detailed reports of your financial portfolio
        </p>
      </div>

      {/* Growth Metrics Cards */}
      {growthMetrics && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Month-over-month</CardTitle>
            </CardHeader>
            <CardContent>
              <div className={`flex items-center ${growthMetrics.monthOverMonth >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                {growthMetrics.monthOverMonth >= 0 ? 
                  <TrendingUp className="h-5 w-5 mr-1" /> : 
                  <TrendingDown className="h-5 w-5 mr-1" />
                }
                <span className="text-2xl font-bold">{growthMetrics.monthOverMonth.toFixed(1)}%</span>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">3-month growth</CardTitle>
            </CardHeader>
            <CardContent>
              <div className={`flex items-center ${growthMetrics.threeMonth >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                {growthMetrics.threeMonth >= 0 ? 
                  <TrendingUp className="h-5 w-5 mr-1" /> : 
                  <TrendingDown className="h-5 w-5 mr-1" />
                }
                <span className="text-2xl font-bold">{growthMetrics.threeMonth.toFixed(1)}%</span>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">6-month growth</CardTitle>
            </CardHeader>
            <CardContent>
              <div className={`flex items-center ${growthMetrics.sixMonth >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                {growthMetrics.sixMonth >= 0 ? 
                  <TrendingUp className="h-5 w-5 mr-1" /> : 
                  <TrendingDown className="h-5 w-5 mr-1" />
                }
                <span className="text-2xl font-bold">{growthMetrics.sixMonth.toFixed(1)}%</span>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Year-over-year</CardTitle>
            </CardHeader>
            <CardContent>
              <div className={`flex items-center ${growthMetrics.yearOverYear >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                {growthMetrics.yearOverYear >= 0 ? 
                  <TrendingUp className="h-5 w-5 mr-1" /> : 
                  <TrendingDown className="h-5 w-5 mr-1" />
                }
                <span className="text-2xl font-bold">{growthMetrics.yearOverYear.toFixed(1)}%</span>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      <div className="grid gap-6 md:grid-cols-1 lg:grid-cols-2"> {/* Changed to 2 columns for larger screens */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-lg font-semibold"> 
              Net Worth History
            </CardTitle>
            <TooltipProvider>
              <UITooltip>
                <TooltipTrigger asChild>
                  <HelpCircle className="h-4 w-4 text-muted-foreground cursor-help" />
                </TooltipTrigger>
                <UITooltipContent side="top" className="max-w-xs bg-popover text-popover-foreground">
                  <p>This chart shows how your net worth has changed over time. Data is based on historical snapshots.</p>
                </UITooltipContent>
              </UITooltip>
            </TooltipProvider>
            {/* Time range tabs removed as chartData now uses netWorth.history which is generally for 1 year */}
          </CardHeader>
          <CardContent>
            <div className="h-[350px] w-full"> {/* Standardized height */}
              <ResponsiveContainer width="100%" height="100%">
                <LineChart
                  data={netWorthHistoryData} // Use netWorthHistoryData from getNetWorth()
                  margin={{ top: 5, right: 20, left: 20, bottom: 5 }} // Adjusted margins
                >
                  <CartesianGrid strokeDasharray="3 3" strokeOpacity={0.5} />
                  <XAxis 
                    dataKey="date" 
                    tick={{ fontSize: 12 }} 
                    axisLine={false} 
                    tickLine={false}
                  />
                  <YAxis 
                    tickFormatter={(value) => `₹${formatIndianNumber(value)}`}
                    tick={{ fontSize: 12 }} 
                    axisLine={false} 
                    tickLine={false}
                    width={80} // Ensure enough space for y-axis labels
                  />
                  <Tooltip content={<CustomLineChartTooltip />} />
                  <Legend wrapperStyle={{fontSize: "12px"}} />
                  <Line
                    type="monotone"
                    dataKey="netWorth"
                    stroke="hsl(var(--primary))"
                    strokeWidth={2}
                    dot={{ r: 3, strokeWidth: 1, fill: "hsl(var(--primary))" }}
                    activeDot={{ r: 6, strokeWidth: 2 }}
                    name="Net Worth"
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
            <div className="mt-4 text-xs text-muted-foreground flex items-center">
              <Info className="h-3 w-3 mr-2 shrink-0" />
              Net worth history is generated based on your overall financial data trends.
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-lg font-semibold">
              Asset Allocation
            </CardTitle>
            <TooltipProvider>
              <UITooltip>
                <TooltipTrigger asChild>
                  <HelpCircle className="h-4 w-4 text-muted-foreground cursor-help" />
                </TooltipTrigger>
                <UITooltipContent side="top" className="max-w-xs bg-popover text-popover-foreground">
                  <p>This chart shows how your assets are distributed across different investment types.</p>
                </UITooltipContent>
              </UITooltip>
            </TooltipProvider>
          </CardHeader>
          <CardContent>
            <div className="h-[350px] w-full"> {/* Standardized height */}
              {pieData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={pieData}
                      cx="50%"
                      cy="50%"
                      labelLine={false} // Simpler labels
                      outerRadius={"80%"} // Responsive outer radius
                      fill="#8884d8"
                      dataKey="value"
                      nameKey="name"
                      label={({ name, percent, x, y, midAngle, outerRadius: or }) => {
                        const RADIAN = Math.PI / 180;
                        const radius = or * 1.15; // Position label outside
                        const lx = x + radius * Math.cos(-midAngle * RADIAN);
                        const ly = y + radius * Math.sin(-midAngle * RADIAN);
                        return (
                          <text x={lx} y={ly} fill="hsl(var(--muted-foreground))" textAnchor={lx > x ? 'start' : 'end'} dominantBaseline="central" fontSize={12}>
                            {`${name} (${(percent * 100).toFixed(0)}%)`}
                          </text>
                        );
                      }}
                    >
                      {pieData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip content={customPieTooltip} />
                    {/* Legend removed for cleaner look with labels */}
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex items-center justify-center h-full">
                  <p className="text-muted-foreground">No asset allocation data available.</p>
                </div>
              )}
            </div>
             <div className="mt-4 text-xs text-muted-foreground flex items-center">
              <Info className="h-3 w-3 mr-2 shrink-0" />
              Asset allocation reflects the current breakdown of your total net worth.
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Reports;
