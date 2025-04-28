
import React, { useEffect, useState } from 'react';
import { NetWorthCard } from '@/components/dashboard/NetWorthCard';
import { AssetAllocationCard } from '@/components/dashboard/AssetAllocationCard';
import { StockSummaryCard } from '@/components/dashboard/StockSummaryCard';
import { UpcomingFDMaturityCard } from '@/components/dashboard/UpcomingFDMaturityCard';
import { ProvidentFundSummaryCard } from '@/components/dashboard/ProvidentFundSummaryCard';
import { 
  getNetWorth
} from '@/services/netWorthService';
import { getStocks } from '@/services/stockService';
import { getFixedDeposits } from '@/services/fixedDepositService';
import { getSIPInvestments } from '@/services/sipInvestmentService';
import { getGoldInvestments } from '@/services/goldInvestmentService';
import { getInsurancePolicies } from '@/services/crudService';
import { getProvidentFunds } from '@/services/providentFundService';
import { 
  NetWorthData, 
  StockHolding, 
  FixedDeposit, 
  SIPInvestment,
  GoldInvestment,
  InsurancePolicy,
  ProvidentFund 
} from '@/types';
import { formatIndianNumber } from '@/lib/utils';
import { handleError } from '@/utils/errorHandler';
import { 
  Banknote, 
  Coins, 
  BadgeIndianRupee, 
  PiggyBank,
  HelpCircle 
} from 'lucide-react';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

const Dashboard = () => {
  const [netWorth, setNetWorth] = useState<NetWorthData | null>(null);
  const [stocks, setStocks] = useState<StockHolding[]>([]);
  const [fixedDeposits, setFixedDeposits] = useState<FixedDeposit[]>([]);
  const [sipInvestments, setSipInvestments] = useState<SIPInvestment[]>([]);
  const [goldInvestments, setGoldInvestments] = useState<GoldInvestment[]>([]);
  const [insurancePolicies, setInsurancePolicies] = useState<InsurancePolicy[]>([]);
  const [providentFunds, setProvidentFunds] = useState<ProvidentFund[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    setLoading(true);
    try {
      // Fetch all data in parallel
      const [
        netWorthData,
        stocksData, 
        fdData, 
        sipData,
        goldData,
        insuranceData,
        providentFundsData
      ] = await Promise.all([
        getNetWorth(),
        getStocks(),
        getFixedDeposits(),
        getSIPInvestments(),
        getGoldInvestments(),
        getInsurancePolicies(),
        getProvidentFunds()
      ]);

      setStocks(stocksData);
      setFixedDeposits(fdData);
      setSipInvestments(sipData);
      setGoldInvestments(goldData);
      setInsurancePolicies(insuranceData);
      setProvidentFunds(providentFundsData);
      setNetWorth(netWorthData);
      
    } catch (error) {
      handleError(error, 'Error fetching dashboard data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  if (loading || !netWorth) {
    return (
      <div className="flex h-full items-center justify-center">
        <p className="text-lg">Loading dashboard data...</p>
      </div>
    );
  }

  // Dynamic insight message based on data
  const getInsightMessage = () => {
    if (netWorth.total <= 0) return "Start building your wealth today!";
    
    const largestAsset = Object.entries(netWorth.breakdown)
      .reduce((max, [key, value]) => value > max.value ? {key, value} : max, {key: "", value: 0});
      
    if (largestAsset.key === "stocks" && largestAsset.value > netWorth.total * 0.5) {
      return "Your portfolio is heavily weighted towards stocks. Consider diversification.";
    } else if (largestAsset.key === "fixedDeposits" && largestAsset.value > netWorth.total * 0.5) {
      return "Consider equity investments for potentially higher returns.";
    } else if (netWorth.history.length > 2) {
      const lastValue = netWorth.history[netWorth.history.length - 1].value;
      const prevValue = netWorth.history[netWorth.history.length - 2].value;
      if (lastValue > prevValue) {
        return "Your wealth is growing steadily!";
      } else {
        return "Focus on increasing your savings and investments.";
      }
    }
    
    return "Keep tracking your investments for better financial health!";
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground">
          Your personal finance overview and insights
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <div className="md:col-span-2">
          <NetWorthCard data={netWorth} />
        </div>
        <div>
          <AssetAllocationCard data={netWorth} />
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <div>
          <StockSummaryCard stocks={stocks} />
        </div>
        <div>
          <UpcomingFDMaturityCard fixedDeposits={fixedDeposits} />
        </div>
        <div>
          <ProvidentFundSummaryCard providentFunds={providentFunds} />
        </div>
      </div>
      
      <div className="grid gap-6 md:grid-cols-1">
        <div className="finance-card bg-finance-blue text-white p-6 rounded-lg shadow-md flex flex-col justify-between">
          <div>
            <h3 className="text-xl font-bold mb-2 flex items-center gap-2">
              <BadgeIndianRupee className="h-5 w-5" />
              Quick Stats
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <HelpCircle className="h-4 w-4 text-white/70 cursor-help" />
                  </TooltipTrigger>
                  <TooltipContent side="right" className="max-w-sm">
                    <p>This section provides a quick overview of key financial metrics across different asset types.</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-4">
              <div>
                <div className="flex items-center gap-1">
                  <Banknote className="h-4 w-4" />
                  <p className="text-sm text-gray-300">SIP Investments</p>
                </div>
                <p className="text-2xl font-bold">{formatIndianNumber(sipInvestments.reduce((sum, sip) => sum + sip.currentValue, 0))}</p>
              </div>
              <div>
                <div className="flex items-center gap-1">
                  <Coins className="h-4 w-4" />
                  <p className="text-sm text-gray-300">Gold Value</p>
                </div>
                <p className="text-2xl font-bold">{formatIndianNumber(goldInvestments.reduce((sum, gold) => sum + gold.value, 0))}</p>
              </div>
              <div>
                <div className="flex items-center gap-1">
                  <BadgeIndianRupee className="h-4 w-4" />
                  <p className="text-sm text-gray-300">Insurance Cover</p>
                </div>
                <p className="text-2xl font-bold">{formatIndianNumber(insurancePolicies.reduce((sum, policy) => sum + policy.coverAmount, 0))}</p>
              </div>
              <div>
                <div className="flex items-center gap-1">
                  <PiggyBank className="h-4 w-4" />
                  <p className="text-sm text-gray-300">PF Balance</p>
                </div>
                <p className="text-2xl font-bold">{formatIndianNumber(providentFunds.reduce((sum, pf) => sum + pf.totalBalance, 0))}</p>
              </div>
            </div>
          </div>
          <div className="mt-6 font-medium text-lg">
            {getInsightMessage()}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
