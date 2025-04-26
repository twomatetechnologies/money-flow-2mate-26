import React, { useEffect, useState } from 'react';
import { NetWorthCard } from '@/components/dashboard/NetWorthCard';
import { AssetAllocationCard } from '@/components/dashboard/AssetAllocationCard';
import { StockSummaryCard } from '@/components/dashboard/StockSummaryCard';
import { UpcomingFDMaturityCard } from '@/components/dashboard/UpcomingFDMaturityCard';
import { 
  getNetWorth, 
  getStocks, 
  getFixedDeposits, 
  getSIPInvestments,
  getGoldInvestments,
  getInsurancePolicies
} from '@/services/crudService';
import { 
  NetWorthData, 
  StockHolding, 
  FixedDeposit, 
  SIPInvestment,
  GoldInvestment,
  InsurancePolicy 
} from '@/types';

const Dashboard = () => {
  const [netWorth, setNetWorth] = useState<NetWorthData | null>(null);
  const [stocks, setStocks] = useState<StockHolding[]>([]);
  const [fixedDeposits, setFixedDeposits] = useState<FixedDeposit[]>([]);
  const [sipInvestments, setSipInvestments] = useState<SIPInvestment[]>([]);
  const [goldInvestments, setGoldInvestments] = useState<GoldInvestment[]>([]);
  const [insurancePolicies, setInsurancePolicies] = useState<InsurancePolicy[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    try {
      const stocksData = await getStocks();
      
      const [
        fdData, 
        sipData,
        goldData,
        insuranceData
      ] = await Promise.all([
        getFixedDeposits(),
        getSIPInvestments(),
        getGoldInvestments(),
        getInsurancePolicies()
      ]);

      setStocks(stocksData);
      setFixedDeposits(fdData);
      setSipInvestments(sipData);
      setGoldInvestments(goldData);
      setInsurancePolicies(insuranceData);
      
      const stocksTotal = stocksData.reduce((sum, stock) => sum + stock.value, 0);
      const fdTotal = fdData.reduce((sum, fd) => sum + fd.principal, 0);
      const sipTotal = sipData.reduce((sum, sip) => sum + sip.currentValue, 0);
      const goldTotal = goldData.reduce((sum, gold) => sum + gold.value, 0);
      const otherTotal = insuranceData.reduce((sum, insurance) => sum + insurance.premium * 12, 0);
      
      const total = stocksTotal + fdTotal + sipTotal + goldTotal + otherTotal;
      
      const calculatedNetWorth: NetWorthData = {
        total: total,
        breakdown: {
          stocks: stocksTotal,
          fixedDeposits: fdTotal,
          sip: sipTotal,
          gold: goldTotal,
          other: otherTotal
        },
        history: [
          ...(netWorth?.history.slice(0, -1) || []),
          { date: new Date(), value: total }
        ]
      };
      
      setNetWorth(calculatedNetWorth);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
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
        <div className="finance-card bg-finance-blue text-white p-6 rounded-lg shadow-md flex flex-col justify-between">
          <div>
            <h3 className="text-xl font-bold mb-2">Quick Stats</h3>
            <div className="space-y-4 mt-4">
              <div>
                <p className="text-sm text-gray-300">SIP Investments</p>
                <p className="text-2xl font-bold">₹{sipInvestments.reduce((sum, sip) => sum + sip.currentValue, 0).toLocaleString()}</p>
              </div>
              <div>
                <p className="text-sm text-gray-300">Gold Value</p>
                <p className="text-2xl font-bold">₹{goldInvestments.reduce((sum, gold) => sum + gold.value, 0).toLocaleString()}</p>
              </div>
              <div>
                <p className="text-sm text-gray-300">Insurance Cover</p>
                <p className="text-2xl font-bold">₹{insurancePolicies.reduce((sum, policy) => sum + policy.coverAmount, 0).toLocaleString()}</p>
              </div>
            </div>
          </div>
          <div className="mt-6 font-medium text-lg">
            Your wealth is growing steadily!
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
