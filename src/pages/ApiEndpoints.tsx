import React, { useState } from 'react';
import { useSettings } from '@/contexts/SettingsContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { 
  Search, Code, FileJson, Server, Key, Shield, 
  Database, BarChart, BanknoteIcon, PiggyBank, 
  TrendingUp, TrophyIcon, Coins, CreditCard 
} from 'lucide-react';

const ApiEndpoints: React.FC = () => {
  const { settings } = useSettings();
  const [searchQuery, setSearchQuery] = useState('');
  const baseUrl = settings.apiBaseUrl || 'http://localhost:8080';

  // Define API categories and endpoints
  const apiCategories = [
    {
      id: 'auth',
      name: 'Authentication',
      icon: <Shield className="h-4 w-4" />,
      endpoints: [
        {
          method: 'POST',
          path: '/api/auth/login',
          description: 'Authenticate user and get token',
          parameters: [
            { name: 'email', type: 'string', required: true },
            { name: 'password', type: 'string', required: true }
          ],
          response: '{ "token": string, "user": User, "requiresTwoFactor": boolean }'
        },
        {
          method: 'POST',
          path: '/api/auth/two-factor',
          description: 'Verify 2FA code',
          parameters: [
            { name: 'code', type: 'string', required: true }
          ],
          response: '{ "token": string, "success": boolean }'
        },
        {
          method: 'POST',
          path: '/api/auth/logout',
          description: 'Logout user and invalidate token',
          parameters: [],
          response: '{ "success": boolean }'
        },
        {
          method: 'POST',
          path: '/api/auth/refresh-token',
          description: 'Get a new token using refresh token',
          parameters: [
            { name: 'refreshToken', type: 'string', required: true }
          ],
          response: '{ "token": string }'
        }
      ]
    },
    {
      id: 'users',
      name: 'User Management',
      icon: <Key className="h-4 w-4" />,
      endpoints: [
        {
          method: 'GET',
          path: '/api/users',
          description: 'Get all users (admin only)',
          parameters: [
            { name: 'role', type: 'string', required: false }
          ],
          response: 'User[]'
        },
        {
          method: 'GET',
          path: '/api/users/:id',
          description: 'Get user by ID',
          parameters: [
            { name: 'id', type: 'string', required: true }
          ],
          response: 'User'
        },
        {
          method: 'POST',
          path: '/api/users',
          description: 'Create new user',
          parameters: [
            { name: 'name', type: 'string', required: true },
            { name: 'email', type: 'string', required: true },
            { name: 'password', type: 'string', required: true },
            { name: 'role', type: 'string', required: false }
          ],
          response: 'User'
        },
        {
          method: 'PUT',
          path: '/api/users/:id',
          description: 'Update user',
          parameters: [
            { name: 'id', type: 'string', required: true },
            { name: 'name', type: 'string', required: false },
            { name: 'email', type: 'string', required: false },
            { name: 'settings', type: 'object', required: false }
          ],
          response: 'User'
        },
        {
          method: 'DELETE',
          path: '/api/users/:id',
          description: 'Delete user',
          parameters: [
            { name: 'id', type: 'string', required: true }
          ],
          response: '204 No Content'
        }
      ]
    },
    {
      id: 'stocks',
      name: 'Stocks',
      icon: <BarChart className="h-4 w-4" />,
      endpoints: [
        {
          method: 'GET',
          path: '/api/stocks',
          description: 'Get all stocks',
          parameters: [
            { name: 'familyMemberId', type: 'string', required: false },
            { name: 'symbol', type: 'string', required: false }
          ],
          response: 'StockHolding[]'
        },
        {
          method: 'POST',
          path: '/api/stocks',
          description: 'Add stock',
          parameters: [
            { name: 'symbol', type: 'string', required: true },
            { name: 'quantity', type: 'number', required: true },
            { name: 'purchasePrice', type: 'number', required: true },
            { name: 'purchaseDate', type: 'string', required: true },
            { name: 'familyMemberId', type: 'string', required: false }
          ],
          response: 'StockHolding'
        },
        {
          method: 'PUT',
          path: '/api/stocks/:id',
          description: 'Update stock',
          parameters: [
            { name: 'id', type: 'string', required: true },
            { name: 'quantity', type: 'number', required: false },
            { name: 'purchasePrice', type: 'number', required: false }
          ],
          response: 'StockHolding'
        },
        {
          method: 'DELETE',
          path: '/api/stocks/:id',
          description: 'Delete stock',
          parameters: [
            { name: 'id', type: 'string', required: true }
          ],
          response: '204 No Content'
        }
      ]
    },
    {
      id: 'fixedDeposits',
      name: 'Fixed Deposits',
      icon: <BanknoteIcon className="h-4 w-4" />,
      endpoints: [
        {
          method: 'GET',
          path: '/api/fixed-deposits',
          description: 'Get all fixed deposits',
          parameters: [
            { name: 'familyMemberId', type: 'string', required: false },
            { name: 'bankName', type: 'string', required: false }
          ],
          response: 'FixedDeposit[]'
        },
        {
          method: 'GET',
          path: '/api/fixed-deposits/:id',
          description: 'Get fixed deposit by ID',
          parameters: [
            { name: 'id', type: 'string', required: true }
          ],
          response: 'FixedDeposit'
        },
        {
          method: 'POST',
          path: '/api/fixed-deposits',
          description: 'Create new fixed deposit',
          parameters: [
            { name: 'bankName', type: 'string', required: true },
            { name: 'accountNumber', type: 'string', required: true },
            { name: 'principal', type: 'number', required: true },
            { name: 'interestRate', type: 'number', required: true },
            { name: 'startDate', type: 'string', required: true },
            { name: 'maturityDate', type: 'string', required: true },
            { name: 'familyMemberId', type: 'string', required: false }
          ],
          response: 'FixedDeposit'
        },
        {
          method: 'PUT',
          path: '/api/fixed-deposits/:id',
          description: 'Update fixed deposit',
          parameters: [
            { name: 'id', type: 'string', required: true },
            { name: 'interestRate', type: 'number', required: false },
            { name: 'isAutoRenew', type: 'boolean', required: false },
            { name: 'maturityAmount', type: 'number', required: false }
          ],
          response: 'FixedDeposit'
        },
        {
          method: 'DELETE',
          path: '/api/fixed-deposits/:id',
          description: 'Delete fixed deposit',
          parameters: [
            { name: 'id', type: 'string', required: true }
          ],
          response: '204 No Content'
        }
      ]
    },
    {
      id: 'savingsAccounts',
      name: 'Savings Accounts',
      icon: <PiggyBank className="h-4 w-4" />,
      endpoints: [
        {
          method: 'GET',
          path: '/api/savings-accounts',
          description: 'Get all savings accounts',
          parameters: [
            { name: 'familyMemberId', type: 'string', required: false },
            { name: 'bankName', type: 'string', required: false }
          ],
          response: 'SavingsAccount[]'
        },
        {
          method: 'GET',
          path: '/api/savings-accounts/:id',
          description: 'Get savings account by ID',
          parameters: [
            { name: 'id', type: 'string', required: true }
          ],
          response: 'SavingsAccount'
        },
        {
          method: 'POST',
          path: '/api/savings-accounts',
          description: 'Create new savings account',
          parameters: [
            { name: 'bankName', type: 'string', required: true },
            { name: 'accountNumber', type: 'string', required: true },
            { name: 'accountType', type: 'string', required: true },
            { name: 'balance', type: 'number', required: true },
            { name: 'interestRate', type: 'number', required: true },
            { name: 'familyMemberId', type: 'string', required: false }
          ],
          response: 'SavingsAccount'
        },
        {
          method: 'PUT',
          path: '/api/savings-accounts/:id',
          description: 'Update savings account',
          parameters: [
            { name: 'id', type: 'string', required: true },
            { name: 'balance', type: 'number', required: false },
            { name: 'interestRate', type: 'number', required: false }
          ],
          response: 'SavingsAccount'
        },
        {
          method: 'DELETE',
          path: '/api/savings-accounts/:id',
          description: 'Delete savings account',
          parameters: [
            { name: 'id', type: 'string', required: true }
          ],
          response: '204 No Content'
        }
      ]
    },
    {
      id: 'sipInvestments',
      name: 'SIP Investments',
      icon: <TrendingUp className="h-4 w-4" />,
      endpoints: [
        {
          method: 'GET',
          path: '/api/sip-investments',
          description: 'Get all SIP investments',
          parameters: [
            { name: 'familyMemberId', type: 'string', required: false },
            { name: 'type', type: 'string', required: false }
          ],
          response: 'SIPInvestment[]'
        },
        {
          method: 'GET',
          path: '/api/sip-investments/:id',
          description: 'Get SIP investment by ID',
          parameters: [
            { name: 'id', type: 'string', required: true }
          ],
          response: 'SIPInvestment'
        },
        {
          method: 'POST',
          path: '/api/sip-investments',
          description: 'Create new SIP investment',
          parameters: [
            { name: 'name', type: 'string', required: true },
            { name: 'type', type: 'string', required: true },
            { name: 'amount', type: 'number', required: true },
            { name: 'frequency', type: 'string', required: true },
            { name: 'startDate', type: 'string', required: true },
            { name: 'familyMemberId', type: 'string', required: false }
          ],
          response: 'SIPInvestment'
        },
        {
          method: 'PUT',
          path: '/api/sip-investments/:id',
          description: 'Update SIP investment',
          parameters: [
            { name: 'id', type: 'string', required: true },
            { name: 'amount', type: 'number', required: false },
            { name: 'currentValue', type: 'number', required: false },
            { name: 'returns', type: 'number', required: false }
          ],
          response: 'SIPInvestment'
        },
        {
          method: 'DELETE',
          path: '/api/sip-investments/:id',
          description: 'Delete SIP investment',
          parameters: [
            { name: 'id', type: 'string', required: true }
          ],
          response: '204 No Content'
        }
      ]
    },
    {
      id: 'providentFunds',
      name: 'Provident Funds',
      icon: <PiggyBank className="h-4 w-4" />,
      endpoints: [
        {
          method: 'GET',
          path: '/api/provident-funds',
          description: 'Get all provident funds',
          parameters: [
            { name: 'familyMemberId', type: 'string', required: false },
            { name: 'employerName', type: 'string', required: false }
          ],
          response: 'ProvidentFund[]'
        },
        {
          method: 'GET',
          path: '/api/provident-funds/:id',
          description: 'Get provident fund by ID',
          parameters: [
            { name: 'id', type: 'string', required: true }
          ],
          response: 'ProvidentFund'
        },
        {
          method: 'POST',
          path: '/api/provident-funds',
          description: 'Create new provident fund',
          parameters: [
            { name: 'employerName', type: 'string', required: true },
            { name: 'accountNumber', type: 'string', required: true },
            { name: 'employeeContribution', type: 'number', required: true },
            { name: 'employerContribution', type: 'number', required: true },
            { name: 'interestRate', type: 'number', required: true },
            { name: 'startDate', type: 'string', required: true },
            { name: 'familyMemberId', type: 'string', required: false }
          ],
          response: 'ProvidentFund'
        },
        {
          method: 'PUT',
          path: '/api/provident-funds/:id',
          description: 'Update provident fund',
          parameters: [
            { name: 'id', type: 'string', required: true },
            { name: 'employeeContribution', type: 'number', required: false },
            { name: 'employerContribution', type: 'number', required: false },
            { name: 'totalBalance', type: 'number', required: false }
          ],
          response: 'ProvidentFund'
        },
        {
          method: 'DELETE',
          path: '/api/provident-funds/:id',
          description: 'Delete provident fund',
          parameters: [
            { name: 'id', type: 'string', required: true }
          ],
          response: '204 No Content'
        }
      ]
    },
    {
      id: 'gold',
      name: 'Gold Investments',
      icon: <Coins className="h-4 w-4" />,
      endpoints: [
        {
          method: 'GET',
          path: '/api/gold',
          description: 'Get all gold investments',
          parameters: [
            { name: 'familyMemberId', type: 'string', required: false },
            { name: 'type', type: 'string', required: false }
          ],
          response: 'GoldInvestment[]'
        },
        {
          method: 'GET',
          path: '/api/gold/:id',
          description: 'Get gold investment by ID',
          parameters: [
            { name: 'id', type: 'string', required: true }
          ],
          response: 'GoldInvestment'
        },
        {
          method: 'POST',
          path: '/api/gold',
          description: 'Create new gold investment',
          parameters: [
            { name: 'type', type: 'string', required: true },
            { name: 'quantity', type: 'number', required: true },
            { name: 'purchaseDate', type: 'string', required: true },
            { name: 'purchasePrice', type: 'number', required: true },
            { name: 'location', type: 'string', required: false },
            { name: 'familyMemberId', type: 'string', required: false }
          ],
          response: 'GoldInvestment'
        },
        {
          method: 'PUT',
          path: '/api/gold/:id',
          description: 'Update gold investment',
          parameters: [
            { name: 'id', type: 'string', required: true },
            { name: 'quantity', type: 'number', required: false },
            { name: 'currentPrice', type: 'number', required: false },
            { name: 'location', type: 'string', required: false }
          ],
          response: 'GoldInvestment'
        },
        {
          method: 'DELETE',
          path: '/api/gold/:id',
          description: 'Delete gold investment',
          parameters: [
            { name: 'id', type: 'string', required: true }
          ],
          response: '204 No Content'
        }
      ]
    },
    {
      id: 'insurance',
      name: 'Insurance Policies',
      icon: <Shield className="h-4 w-4" />,
      endpoints: [
        {
          method: 'GET',
          path: '/api/insurance',
          description: 'Get all insurance policies',
          parameters: [
            { name: 'familyMemberId', type: 'string', required: false },
            { name: 'type', type: 'string', required: false }
          ],
          response: 'InsurancePolicy[]'
        },
        {
          method: 'GET',
          path: '/api/insurance/:id',
          description: 'Get insurance policy by ID',
          parameters: [
            { name: 'id', type: 'string', required: true }
          ],
          response: 'InsurancePolicy'
        },
        {
          method: 'POST',
          path: '/api/insurance',
          description: 'Create new insurance policy',
          parameters: [
            { name: 'type', type: 'string', required: true },
            { name: 'policyNumber', type: 'string', required: true },
            { name: 'provider', type: 'string', required: true },
            { name: 'coverAmount', type: 'number', required: true },
            { name: 'premium', type: 'number', required: true },
            { name: 'frequency', type: 'string', required: true },
            { name: 'startDate', type: 'string', required: true },
            { name: 'endDate', type: 'string', required: true },
            { name: 'familyMemberId', type: 'string', required: false }
          ],
          response: 'InsurancePolicy'
        },
        {
          method: 'PUT',
          path: '/api/insurance/:id',
          description: 'Update insurance policy',
          parameters: [
            { name: 'id', type: 'string', required: true },
            { name: 'premium', type: 'number', required: false },
            { name: 'coverAmount', type: 'number', required: false },
            { name: 'endDate', type: 'string', required: false }
          ],
          response: 'InsurancePolicy'
        },
        {
          method: 'DELETE',
          path: '/api/insurance/:id',
          description: 'Delete insurance policy',
          parameters: [
            { name: 'id', type: 'string', required: true }
          ],
          response: '204 No Content'
        }
      ]
    },
    {
      id: 'goals',
      name: 'Financial Goals',
      icon: <TrophyIcon className="h-4 w-4" />,
      endpoints: [
        {
          method: 'GET',
          path: '/api/goals',
          description: 'Get all financial goals',
          parameters: [
            { name: 'familyMemberId', type: 'string', required: false },
            { name: 'category', type: 'string', required: false }
          ],
          response: 'FinancialGoal[]'
        },
        {
          method: 'GET',
          path: '/api/goals/:id',
          description: 'Get financial goal by ID',
          parameters: [
            { name: 'id', type: 'string', required: true }
          ],
          response: 'FinancialGoal'
        },
        {
          method: 'GET',
          path: '/api/goals/:id/progress',
          description: 'Get goal progress details',
          parameters: [
            { name: 'id', type: 'string', required: true }
          ],
          response: 'GoalProgress'
        },
        {
          method: 'POST',
          path: '/api/goals',
          description: 'Create new financial goal',
          parameters: [
            { name: 'name', type: 'string', required: true },
            { name: 'targetAmount', type: 'number', required: true },
            { name: 'currentAmount', type: 'number', required: true },
            { name: 'deadline', type: 'string', required: true },
            { name: 'category', type: 'string', required: true },
            { name: 'priority', type: 'string', required: false },
            { name: 'familyMemberId', type: 'string', required: false }
          ],
          response: 'FinancialGoal'
        },
        {
          method: 'PUT',
          path: '/api/goals/:id',
          description: 'Update financial goal',
          parameters: [
            { name: 'id', type: 'string', required: true },
            { name: 'targetAmount', type: 'number', required: false },
            { name: 'currentAmount', type: 'number', required: false },
            { name: 'deadline', type: 'string', required: false },
            { name: 'priority', type: 'string', required: false }
          ],
          response: 'FinancialGoal'
        },
        {
          method: 'DELETE',
          path: '/api/goals/:id',
          description: 'Delete financial goal',
          parameters: [
            { name: 'id', type: 'string', required: true }
          ],
          response: '204 No Content'
        }
      ]
    },
    {
      id: 'reports',
      name: 'Reports',
      icon: <FileJson className="h-4 w-4" />,
      endpoints: [
        {
          method: 'GET',
          path: '/api/reports/net-worth',
          description: 'Get net worth report',
          parameters: [
            { name: 'familyMemberId', type: 'string', required: false },
            { name: 'startDate', type: 'string', required: false },
            { name: 'endDate', type: 'string', required: false }
          ],
          response: 'NetWorthData'
        },
        {
          method: 'GET',
          path: '/api/reports/asset-allocation',
          description: 'Get asset allocation report',
          parameters: [
            { name: 'familyMemberId', type: 'string', required: false }
          ],
          response: 'AssetAllocationData'
        }
      ]
    },
    {
      id: 'audit',
      name: 'Audit Logs',
      icon: <Database className="h-4 w-4" />,
      endpoints: [
        {
          method: 'GET',
          path: '/api/audit',
          description: 'Get audit logs',
          parameters: [
            { name: 'entityType', type: 'string', required: false },
            { name: 'entityId', type: 'string', required: false },
            { name: 'action', type: 'string', required: false },
            { name: 'startDate', type: 'string', required: false },
            { name: 'endDate', type: 'string', required: false }
          ],
          response: 'AuditRecord[]'
        },
        {
          method: 'POST',
          path: '/api/audit/export',
          description: 'Export audit logs',
          parameters: [
            { name: 'startDate', type: 'string', required: false },
            { name: 'endDate', type: 'string', required: false },
            { name: 'entityType', type: 'string', required: false },
            { name: 'format', type: 'string', required: true }
          ],
          response: 'File (CSV or PDF)'
        }
      ]
    }
  ];

  // Filter endpoints based on search query
  const filteredCategories = searchQuery 
    ? apiCategories.map(category => ({
        ...category,
        endpoints: category.endpoints.filter(endpoint => 
          endpoint.path.toLowerCase().includes(searchQuery.toLowerCase()) || 
          endpoint.description.toLowerCase().includes(searchQuery.toLowerCase())
        ),
      })).filter(category => category.endpoints.length > 0)
    : apiCategories;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">API Endpoints</h1>
        <p className="text-muted-foreground">
          Documentation for available API endpoints in {settings.appName}
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>API Base URL</CardTitle>
          <CardDescription>
            Use this base URL for all API requests
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center space-x-2">
            <Server className="h-4 w-4 text-primary" />
            <code className="bg-muted p-2 rounded block text-sm flex-1">
              {baseUrl}
            </code>
          </div>
          <p className="mt-2 text-sm text-muted-foreground">
            All endpoints require authentication via Bearer token unless otherwise specified.
          </p>
        </CardContent>
      </Card>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input 
          placeholder="Search endpoints..." 
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-10"
        />
      </div>

      <Tabs defaultValue="all" className="w-full">
        <TabsList className="mb-4">
          <TabsTrigger value="all">All Endpoints</TabsTrigger>
          <TabsTrigger value="authentication">Authentication</TabsTrigger>
          <TabsTrigger value="finance">Finance</TabsTrigger>
          <TabsTrigger value="data">Reporting</TabsTrigger>
        </TabsList>
        
        <TabsContent value="all" className="space-y-6">
          {filteredCategories.map(category => (
            <Card key={category.id}>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  {category.icon}
                  {category.name}
                </CardTitle>
                <CardDescription>
                  API endpoints for {category.name.toLowerCase()} operations
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {category.endpoints.map((endpoint, index) => (
                    <div key={`${category.id}-${index}`} className={index > 0 ? "pt-4 border-t mt-4" : ""}>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Badge 
                            className={
                              endpoint.method === 'GET' ? "bg-blue-500" : 
                              endpoint.method === 'POST' ? "bg-green-500" : 
                              endpoint.method === 'PUT' ? "bg-amber-500" : 
                              "bg-red-500"
                            }
                          >
                            {endpoint.method}
                          </Badge>
                          <code className="font-bold">{endpoint.path}</code>
                        </div>
                        <Code className="h-4 w-4 text-muted-foreground" />
                      </div>
                      
                      <p className="mt-2 text-sm">
                        {endpoint.description}
                      </p>
                      
                      {endpoint.parameters.length > 0 && (
                        <div className="mt-3">
                          <Label className="text-xs uppercase">Parameters</Label>
                          <div className="bg-muted rounded-md p-2 mt-1">
                            <table className="text-sm w-full">
                              <thead>
                                <tr className="border-b">
                                  <th className="text-left py-1 px-2">Name</th>
                                  <th className="text-left py-1 px-2">Type</th>
                                  <th className="text-left py-1 px-2">Required</th>
                                </tr>
                              </thead>
                              <tbody>
                                {endpoint.parameters.map((param, idx) => (
                                  <tr key={idx} className={idx > 0 ? "border-t border-gray-200" : ""}>
                                    <td className="py-1 px-2">{param.name}</td>
                                    <td className="py-1 px-2 font-mono text-xs">{param.type}</td>
                                    <td className="py-1 px-2">{param.required ? "Yes" : "No"}</td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>
                        </div>
                      )}
                      
                      <div className="mt-3">
                        <Label className="text-xs uppercase">Response</Label>
                        <div className="bg-muted rounded-md p-2 mt-1">
                          <code className="text-sm">{endpoint.response}</code>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          ))}
        </TabsContent>
        
        <TabsContent value="authentication" className="space-y-6">
          {filteredCategories
            .filter(category => ['auth', 'users'].includes(category.id))
            .map(category => (
              <Card key={category.id}>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    {category.icon}
                    {category.name}
                  </CardTitle>
                  <CardDescription>
                    API endpoints for authentication and authorization
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    {category.endpoints.map((endpoint, index) => (
                      <div key={`${category.id}-${index}`} className={index > 0 ? "pt-4 border-t mt-4" : ""}>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <Badge 
                              className={
                                endpoint.method === 'GET' ? "bg-blue-500" : 
                                endpoint.method === 'POST' ? "bg-green-500" : 
                                endpoint.method === 'PUT' ? "bg-amber-500" : 
                                "bg-red-500"
                              }
                            >
                              {endpoint.method}
                            </Badge>
                            <code className="font-bold">{endpoint.path}</code>
                          </div>
                        </div>
                        
                        <p className="mt-2 text-sm">
                          {endpoint.description}
                        </p>
                        
                        {endpoint.parameters.length > 0 && (
                          <div className="mt-3">
                            <Label className="text-xs uppercase">Parameters</Label>
                            <div className="bg-muted rounded-md p-2 mt-1">
                              <table className="text-sm w-full">
                                <thead>
                                  <tr className="border-b">
                                    <th className="text-left py-1 px-2">Name</th>
                                    <th className="text-left py-1 px-2">Type</th>
                                    <th className="text-left py-1 px-2">Required</th>
                                  </tr>
                                </thead>
                                <tbody>
                                  {endpoint.parameters.map((param, idx) => (
                                    <tr key={idx} className={idx > 0 ? "border-t border-gray-200" : ""}>
                                      <td className="py-1 px-2">{param.name}</td>
                                      <td className="py-1 px-2 font-mono text-xs">{param.type}</td>
                                      <td className="py-1 px-2">{param.required ? "Yes" : "No"}</td>
                                    </tr>
                                  ))}
                                </tbody>
                              </table>
                            </div>
                          </div>
                        )}
                        
                        <div className="mt-3">
                          <Label className="text-xs uppercase">Response</Label>
                          <div className="bg-muted rounded-md p-2 mt-1">
                            <code className="text-sm">{endpoint.response}</code>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
          ))}
        </TabsContent>
        
        <TabsContent value="finance" className="space-y-6">
          {filteredCategories
            .filter(category => ['stocks', 'fixedDeposits', 'savingsAccounts', 'sipInvestments', 'providentFunds', 'gold', 'insurance', 'goals'].includes(category.id))
            .map(category => (
              <Card key={category.id}>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    {category.icon}
                    {category.name}
                  </CardTitle>
                  <CardDescription>
                    API endpoints for {category.name.toLowerCase()} operations
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    {category.endpoints.map((endpoint, index) => (
                      <div key={`${category.id}-${index}`} className={index > 0 ? "pt-4 border-t mt-4" : ""}>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <Badge 
                              className={
                                endpoint.method === 'GET' ? "bg-blue-500" : 
                                endpoint.method === 'POST' ? "bg-green-500" : 
                                endpoint.method === 'PUT' ? "bg-amber-500" : 
                                "bg-red-500"
                              }
                            >
                              {endpoint.method}
                            </Badge>
                            <code className="font-bold">{endpoint.path}</code>
                          </div>
                        </div>
                        
                        <p className="mt-2 text-sm">
                          {endpoint.description}
                        </p>
                        
                        {endpoint.parameters.length > 0 && (
                          <div className="mt-3">
                            <Label className="text-xs uppercase">Parameters</Label>
                            <div className="bg-muted rounded-md p-2 mt-1">
                              <table className="text-sm w-full">
                                <thead>
                                  <tr className="border-b">
                                    <th className="text-left py-1 px-2">Name</th>
                                    <th className="text-left py-1 px-2">Type</th>
                                    <th className="text-left py-1 px-2">Required</th>
                                  </tr>
                                </thead>
                                <tbody>
                                  {endpoint.parameters.map((param, idx) => (
                                    <tr key={idx} className={idx > 0 ? "border-t border-gray-200" : ""}>
                                      <td className="py-1 px-2">{param.name}</td>
                                      <td className="py-1 px-2 font-mono text-xs">{param.type}</td>
                                      <td className="py-1 px-2">{param.required ? "Yes" : "No"}</td>
                                    </tr>
                                  ))}
                                </tbody>
                              </table>
                            </div>
                          </div>
                        )}
                        
                        <div className="mt-3">
                          <Label className="text-xs uppercase">Response</Label>
                          <div className="bg-muted rounded-md p-2 mt-1">
                            <code className="text-sm">{endpoint.response}</code>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
          ))}
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ApiEndpoints;
