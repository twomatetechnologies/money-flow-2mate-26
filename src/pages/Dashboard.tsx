
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
            <h3 className="text-xl font-bold mb-2">Quick Stats</h3>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-4">
              <div>
                <p className="text-sm text-gray-300">SIP Investments</p>
                <p className="text-2xl font-bold">{formatIndianNumber(sipInvestments.reduce((sum, sip) => sum + sip.currentValue, 0))}</p>
              </div>
              <div>
                <p className="text-sm text-gray-300">Gold Value</p>
                <p className="text-2xl font-bold">{formatIndianNumber(goldInvestments.reduce((sum, gold) => sum + gold.value, 0))}</p>
              </div>
              <div>
                <p className="text-sm text-gray-300">Insurance Cover</p>
                <p className="text-2xl font-bold">{formatIndianNumber(insurancePolicies.reduce((sum, policy) => sum + policy.coverAmount, 0))}</p>
              </div>
              <div>
                <p className="text-sm text-gray-300">PF Balance</p>
                <p className="text-2xl font-bold">{formatIndianNumber(providentFunds.reduce((sum, pf) => sum + pf.totalBalance, 0))}</p>
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
