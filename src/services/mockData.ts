
import { 
  StockHolding, 
  FixedDeposit, 
  SIPInvestment, 
  InsurancePolicy, 
  GoldInvestment,
  NetWorthData
} from '@/types';

// Mock stock data
export const mockStocks: StockHolding[] = [
  {
    id: '1',
    symbol: 'RELIANCE',
    name: 'Reliance Industries',
    quantity: 50,
    averageBuyPrice: 2400,
    currentPrice: 2580,
    change: 35,
    changePercent: 1.37,
    value: 129000,
    sector: 'Energy',
    lastUpdated: new Date(),
    familyMemberId: 'self-default'
  },
  {
    id: '2',
    symbol: 'INFY',
    name: 'Infosys',
    quantity: 100,
    averageBuyPrice: 1500,
    currentPrice: 1420,
    change: -28,
    changePercent: -1.93,
    value: 142000,
    sector: 'Technology',
    lastUpdated: new Date(),
    familyMemberId: 'spouse-default'
  },
  {
    id: '3',
    symbol: 'HDFCBANK',
    name: 'HDFC Bank',
    quantity: 75,
    averageBuyPrice: 1650,
    currentPrice: 1720,
    change: 12,
    changePercent: 0.7,
    value: 129000,
    sector: 'Banking',
    lastUpdated: new Date(),
    familyMemberId: 'parent-default'
  },
  {
    id: '4',
    symbol: 'TCS',
    name: 'Tata Consultancy Services',
    quantity: 30,
    averageBuyPrice: 3200,
    currentPrice: 3450,
    change: 75,
    changePercent: 2.22,
    value: 103500,
    sector: 'Technology',
    lastUpdated: new Date(),
    familyMemberId: 'self-default'
  },
  {
    id: '5',
    symbol: 'BAJFINANCE',
    name: 'Bajaj Finance',
    quantity: 25,
    averageBuyPrice: 7100,
    currentPrice: 6800,
    change: -120,
    changePercent: -1.73,
    value: 170000,
    sector: 'Financial Services',
    lastUpdated: new Date(),
    familyMemberId: 'spouse-default'
  }
];

// Mock fixed deposit data
export const mockFixedDeposits: FixedDeposit[] = [
  {
    id: '1',
    bankName: 'SBI',
    accountNumber: 'XXXX1234',
    principal: 100000,
    interestRate: 5.7,
    startDate: new Date('2023-10-15'),
    maturityDate: new Date('2024-10-15'),
    maturityAmount: 105700,
    isAutoRenew: true,
    familyMemberId: 'self-default',
    lastUpdated: new Date() // Add this line
  },
  {
    id: '2',
    bankName: 'HDFC',
    accountNumber: 'XXXX5678',
    principal: 200000,
    interestRate: 6.1,
    startDate: new Date('2023-06-20'),
    maturityDate: new Date('2025-06-20'),
    maturityAmount: 225044,
    isAutoRenew: false,
    notes: 'For home renovation',
    familyMemberId: 'spouse-default',
    lastUpdated: new Date() // Add this line
  },
  {
    id: '3',
    bankName: 'ICICI',
    accountNumber: 'XXXX9012',
    principal: 150000,
    interestRate: 5.9,
    startDate: new Date('2024-01-10'),
    maturityDate: new Date('2024-07-10'),
    maturityAmount: 154425,
    isAutoRenew: true,
    notes: 'Short term FD',
    familyMemberId: 'parent-default',
    lastUpdated: new Date() // Add this line
  }
];

// Mock SIP data
export const mockSIPInvestments: SIPInvestment[] = [
  {
    id: '1',
    name: 'HDFC Mid-Cap Opportunities Fund',
    type: 'Mutual Fund',
    amount: 5000,
    frequency: 'Monthly',
    startDate: new Date('2022-05-15'),
    duration: 60, // 5 years
    currentValue: 115000,
    returns: 15000,
    returnsPercent: 15.0,
    familyMemberId: 'self-default'
  },
  {
    id: '2',
    name: 'Axis Long Term Equity Fund',
    type: 'ELSS',
    amount: 3000,
    frequency: 'Monthly',
    startDate: new Date('2021-01-10'),
    duration: 36, // 3 years
    currentValue: 124500,
    returns: 16500,
    returnsPercent: 15.3,
    familyMemberId: 'spouse-default'
  },
  {
    id: '3',
    name: 'SBI Nifty Index Fund',
    type: 'Index Fund',
    amount: 2000,
    frequency: 'Monthly',
    startDate: new Date('2022-11-05'),
    currentValue: 38000,
    returns: 4000,
    returnsPercent: 11.8,
    familyMemberId: 'parent-default'
  }
];

// Mock insurance data
export const mockInsurancePolicies: InsurancePolicy[] = [
  {
    id: '1',
    type: 'Term',
    policyNumber: 'LI789456123',
    provider: 'LIC',
    coverAmount: 10000000,
    premium: 15000,
    frequency: 'Yearly',
    startDate: new Date('2020-05-10'),
    endDate: new Date('2045-05-10'),
    nominees: ['Spouse Name'],
    notes: 'Term insurance with critical illness cover',
    familyMemberId: 'self-default'
  },
  {
    id: '2',
    type: 'Health',
    policyNumber: 'HI456789123',
    provider: 'Star Health',
    coverAmount: 500000,
    premium: 18000,
    frequency: 'Yearly',
    startDate: new Date('2022-03-15'),
    endDate: new Date('2023-03-15'),
    nominees: ['Self', 'Spouse', 'Children'],
    notes: 'Family floater plan',
    familyMemberId: 'spouse-default'
  },
  {
    id: '3',
    type: 'Vehicle',
    policyNumber: 'VI123456789',
    provider: 'ICICI Lombard',
    coverAmount: 1000000,
    premium: 12000,
    frequency: 'Yearly',
    startDate: new Date('2023-11-20'),
    endDate: new Date('2024-11-20'),
    notes: 'Comprehensive car insurance',
    familyMemberId: 'parent-default'
  }
];

// Mock gold investment data
export const mockGoldInvestments: GoldInvestment[] = [
  {
    id: '1',
    type: 'Physical',
    quantity: 50, // 50 grams
    purchaseDate: new Date('2020-10-15'),
    purchasePrice: 4500, // per gram
    currentPrice: 5800, // per gram
    value: 290000, // current value
    location: 'Bank locker',
    notes: 'Gold coins purchased during Diwali',
    familyMemberId: 'self-default',
    lastUpdated: new Date() // Add this line
  },
  {
    id: '2',
    type: 'SGB',
    quantity: 40, // units
    purchaseDate: new Date('2021-08-05'),
    purchasePrice: 4800, // per unit
    currentPrice: 5800, // per unit
    value: 232000, // current value
    notes: 'Sovereign Gold Bond 2021-22 Series',
    familyMemberId: 'spouse-default',
    lastUpdated: new Date() // Add this line
  },
  {
    id: '3',
    type: 'Digital',
    quantity: 25, // grams
    purchaseDate: new Date('2022-01-20'),
    purchasePrice: 5000, // per gram
    currentPrice: 5800, // per gram
    value: 145000, // current value
    notes: 'Digital gold on investment app',
    familyMemberId: 'parent-default',
    lastUpdated: new Date() // Add this line
  }
];

// Mock net worth data
export const mockNetWorthData: NetWorthData = {
  total: 2483969,
  breakdown: {
    stocks: 673500,
    fixedDeposits: 450000,
    sip: 277500,
    gold: 667000,
    other: 415969,
    providentFund: 0  // Add the missing property
  },
  history: [
    { date: new Date('2023-06-01'), value: 2100000 },
    { date: new Date('2023-07-01'), value: 2150000 },
    { date: new Date('2023-08-01'), value: 2180000 },
    { date: new Date('2023-09-01'), value: 2220000 },
    { date: new Date('2023-10-01'), value: 2250000 },
    { date: new Date('2023-11-01'), value: 2275000 },
    { date: new Date('2023-12-01'), value: 2320000 },
    { date: new Date('2024-01-01'), value: 2350000 },
    { date: new Date('2024-02-01'), value: 2400000 },
    { date: new Date('2024-03-01'), value: 2430000 },
    { date: new Date('2024-04-01'), value: 2460000 },
    { date: new Date('2024-05-01'), value: 2483969 }
  ]
};

// Helper functions to get mock data
export function getStocks(): Promise<StockHolding[]> {
  return Promise.resolve(mockStocks);
}

export function getFixedDeposits(): Promise<FixedDeposit[]> {
  return Promise.resolve(mockFixedDeposits);
}

export function getSIPInvestments(): Promise<SIPInvestment[]> {
  return Promise.resolve(mockSIPInvestments);
}

export function getInsurancePolicies(): Promise<InsurancePolicy[]> {
  return Promise.resolve(mockInsurancePolicies);
}

export function getGoldInvestments(): Promise<GoldInvestment[]> {
  return Promise.resolve(mockGoldInvestments);
}

export function getNetWorth(): Promise<NetWorthData> {
  return Promise.resolve(mockNetWorthData);
}
