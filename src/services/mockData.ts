import { 
  FixedDeposit, 
  SIPInvestment, 
  InsurancePolicy, 
  GoldInvestment,
  NetWorthData,
  ProvidentFund
} from '@/types';

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
    lastUpdated: new Date()
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
    lastUpdated: new Date()
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
    lastUpdated: new Date()
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
    lastUpdated: new Date()
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
    lastUpdated: new Date()
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
    lastUpdated: new Date()
  }
];

// Mock Provident Fund data (example structure)
export const mockProvidentFunds: ProvidentFund[] = [
  {
    id: 'pf1',
    accountNumber: 'PFACC001',
    employerName: 'Tech Solutions Inc.', // Added
    employeeContribution: 50000,
    employerContribution: 50000,
    monthlyContribution: 8000, // Added
    totalBalance: 100000,
    interestRate: 8.1,
    startDate: new Date('2020-01-01'), // Added
    lastUpdated: new Date(),
    familyMemberId: 'self-default',
  },
  {
    id: 'pf2',
    accountNumber: 'PFACC002',
    employerName: 'Innovate Corp.', // Added
    employeeContribution: 75000,
    employerContribution: 75000,
    monthlyContribution: 12000, // Added
    totalBalance: 150000,
    interestRate: 8.1,
    startDate: new Date('2019-07-15'), // Added
    lastUpdated: new Date(),
    familyMemberId: 'spouse-default',
  }
];

// Mock net worth data
export const mockNetWorthData: NetWorthData = {
  total: 0, // Will be recalculated
  breakdown: {
    stocks: 0,
    fixedDeposits: mockFixedDeposits.reduce((sum, fd) => sum + (fd.principal || 0), 0),
    sip: mockSIPInvestments.reduce((sum, sip) => sum + (sip.currentValue || 0), 0),
    gold: mockGoldInvestments.reduce((sum, gold) => sum + (gold.value || 0), 0),
    providentFund: mockProvidentFunds.reduce((sum, pf) => sum + (pf.totalBalance || 0), 0),
    other: 505500, // Keeping 'other' as a static value for now
  },
  history: [
    { date: new Date('2023-06-01'), value: 1800000 },
    { date: new Date('2023-07-01'), value: 1850000 },
    { date: new Date('2023-08-01'), value: 1880000 },
    { date: new Date('2023-09-01'), value: 1920000 },
    { date: new Date('2023-10-01'), value: 1950000 },
    { date: new Date('2023-11-01'), value: 1975000 },
    { date: new Date('2023-12-01'), value: 2020000 },
    { date: new Date('2024-01-01'), value: 2050000 },
    { date: new Date('2024-02-01'), value: 2100000 },
    { date: new Date('2024-03-01'), value: 2130000 },
    { date: new Date('2024-04-01'), value: 2160000 },
    { date: new Date('2024-05-01'), value: 0 } // This will be updated by the recalculation logic
  ]
};

// Update mockNetWorthData.total based on its breakdown
mockNetWorthData.total = Object.values(mockNetWorthData.breakdown).reduce((sum, val) => sum + val, 0);
if (mockNetWorthData.history.length > 0) {
  mockNetWorthData.history[mockNetWorthData.history.length -1].value = mockNetWorthData.total;
}

// Helper functions to get mock data (for non-stock entities)
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

export function getProvidentFunds(): Promise<ProvidentFund[]> {
  return Promise.resolve(mockProvidentFunds);
}

export function getNetWorth(): Promise<NetWorthData> {
  // This mock getNetWorth is generally overridden by the one in crudService or netWorthService
  // which calculate live values. It serves as a fallback if directly called.
  // Recalculate total and last history point just in case it's called directly
  mockNetWorthData.breakdown.fixedDeposits = mockFixedDeposits.reduce((sum, fd) => sum + (fd.principal || 0), 0);
  mockNetWorthData.breakdown.sip = mockSIPInvestments.reduce((sum, sip) => sum + (sip.currentValue || 0), 0);
  mockNetWorthData.breakdown.gold = mockGoldInvestments.reduce((sum, gold) => sum + (gold.value || 0), 0);
  mockNetWorthData.breakdown.providentFund = mockProvidentFunds.reduce((sum, pf) => sum + (pf.totalBalance || 0), 0);
  // 'stocks' and 'other' remain as they are, stocks are meant to be 0 here.

  mockNetWorthData.total = Object.values(mockNetWorthData.breakdown).reduce((sum, val) => sum + val, 0);
  if (mockNetWorthData.history.length > 0) {
    mockNetWorthData.history[mockNetWorthData.history.length -1].value = mockNetWorthData.total;
  }
  return Promise.resolve(mockNetWorthData);
}
