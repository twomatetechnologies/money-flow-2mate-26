import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { getNetWorth } from '@/services/netWorthService';
import { 
  getReportSnapshots, 
  calculateGrowthMetrics,
  ReportSnapshot, // Import ReportSnapshot type
  GrowthMetrics
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { isPostgresEnabled } from '@/services/db/dbConnector';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import ReportSnapshotForm from '@/components/insights/ReportSnapshotForm';
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
      <div className="container mx-auto p-6">
        <h1 className="text-2xl font-bold mb-4">Financial Reports</h1>
        <div className="bg-muted p-4 rounded-lg text-center">
          <p>No financial data available. Please add your assets to generate reports.</p>
        </div>
      </div>
    );
  }

  // The rest of the Reports component...
  
  // This is a placeholder for the actual implementation
  return (
    <div className="container mx-auto p-6">
      <h1 className="text-2xl font-bold mb-4">Financial Reports</h1>
      <p>Reports content here...</p>
    </div>
  );
};

export default Reports;
