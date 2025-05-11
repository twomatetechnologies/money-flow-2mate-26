
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useSettings } from '@/contexts/SettingsContext';
import { ArrowLeftIcon, ExternalLink } from 'lucide-react';
import { Link } from 'react-router-dom';

const ApiEndpoints = () => {
  const { settings } = useSettings();
  const baseUrl = settings.apiBaseUrl || 'http://localhost:8081';

  const apiCategories = [
    { id: 'auth', name: 'Authentication' },
    { id: 'users', name: 'Users' },
    { id: 'family', name: 'Family' },
    { id: 'investments', name: 'Investments' },
    { id: 'reports', name: 'Reports' },
    { id: 'audit', name: 'Audit' },
  ];

  const endpoints = [
    // Authentication endpoints
    { 
      category: 'auth', 
      method: 'POST', 
      path: '/api/auth/login', 
      description: 'User login',
      params: '{ email, password }',
      response: '{ token, refreshToken, user, requiresTwoFactor }'
    },
    { 
      category: 'auth', 
      method: 'POST', 
      path: '/api/auth/two-factor', 
      description: 'Verify 2FA code',
      params: '{ code }',
      response: '{ token }'
    },
    { 
      category: 'auth', 
      method: 'POST', 
      path: '/api/auth/logout', 
      description: 'User logout',
      params: 'None',
      response: '{ success: true }'
    },
    { 
      category: 'auth', 
      method: 'POST', 
      path: '/api/auth/refresh-token', 
      description: 'Refresh authentication token',
      params: '{ refreshToken }',
      response: '{ token, refreshToken }'
    },
    
    // Users endpoints
    { 
      category: 'users', 
      method: 'GET', 
      path: '/api/users', 
      description: 'Get all users',
      params: 'Query: role (optional)',
      response: 'User[]'
    },
    { 
      category: 'users', 
      method: 'GET', 
      path: '/api/users/{id}', 
      description: 'Get user by ID',
      params: 'Path: id',
      response: 'User'
    },
    { 
      category: 'users', 
      method: 'POST', 
      path: '/api/users', 
      description: 'Create new user',
      params: '{ name, email, password, role, has2FAEnabled, settings }',
      response: 'User'
    },
    { 
      category: 'users', 
      method: 'PUT', 
      path: '/api/users/{id}', 
      description: 'Update user',
      params: 'Path: id, Body: { name, email, role, has2FAEnabled, settings }',
      response: 'User'
    },
    { 
      category: 'users', 
      method: 'DELETE', 
      path: '/api/users/{id}', 
      description: 'Delete user',
      params: 'Path: id',
      response: '{ success: true }'
    },
    { 
      category: 'users', 
      method: 'PUT', 
      path: '/api/users/{id}/password', 
      description: 'Update user password',
      params: 'Path: id, Body: { currentPassword, newPassword }',
      response: '{ success: true }'
    },
    
    // Family members endpoints
    { 
      category: 'family', 
      method: 'GET', 
      path: '/api/family', 
      description: 'Get all family members',
      params: 'None',
      response: 'FamilyMember[]'
    },
    { 
      category: 'family', 
      method: 'POST', 
      path: '/api/family', 
      description: 'Create new family member',
      params: '{ name, relationship, dateOfBirth, color }',
      response: 'FamilyMember'
    },
    { 
      category: 'family', 
      method: 'GET', 
      path: '/api/family/{id}', 
      description: 'Get family member by ID',
      params: 'Path: id',
      response: 'FamilyMember'
    },
    { 
      category: 'family', 
      method: 'PUT', 
      path: '/api/family/{id}', 
      description: 'Update family member',
      params: 'Path: id, Body: FamilyMember',
      response: 'FamilyMember'
    },
    { 
      category: 'family', 
      method: 'DELETE', 
      path: '/api/family/{id}', 
      description: 'Delete family member',
      params: 'Path: id',
      response: '{ success: true }'
    },
    
    // Investments endpoints
    { 
      category: 'investments', 
      method: 'GET', 
      path: '/api/stocks', 
      description: 'Get all stocks',
      params: 'Query: familyMemberId, symbol (optional)',
      response: 'Stock[]'
    },
    { 
      category: 'investments', 
      method: 'POST', 
      path: '/api/stocks', 
      description: 'Add new stock',
      params: '{ symbol, companyName, quantity, purchasePrice, purchaseDate, familyMemberId }',
      response: 'Stock'
    },
    { 
      category: 'investments', 
      method: 'GET', 
      path: '/api/fixed-deposits', 
      description: 'Get all fixed deposits',
      params: 'Query: familyMemberId, bankName (optional)',
      response: 'FixedDeposit[]'
    },
    { 
      category: 'investments', 
      method: 'POST', 
      path: '/api/fixed-deposits', 
      description: 'Create fixed deposit',
      params: '{ bankName, accountNumber, principal, interestRate, startDate, maturityDate, isAutoRenew, familyMemberId }',
      response: 'FixedDeposit'
    },
    { 
      category: 'investments', 
      method: 'GET', 
      path: '/api/gold', 
      description: 'Get all gold investments',
      params: 'Query: familyMemberId, type (optional)',
      response: 'GoldInvestment[]'
    },
    
    // Reports endpoints
    { 
      category: 'reports', 
      method: 'GET', 
      path: '/api/reports/net-worth', 
      description: 'Get net worth report',
      params: 'Query: familyMemberId, startDate, endDate (optional)',
      response: '{ total, assets, liabilities, history }'
    },
    { 
      category: 'reports', 
      method: 'GET', 
      path: '/api/reports/asset-allocation', 
      description: 'Get asset allocation report',
      params: 'Query: familyMemberId (optional)',
      response: '{ total, categories: [{ name, value, percentage }] }'
    },
    
    // Audit endpoints
    { 
      category: 'audit', 
      method: 'GET', 
      path: '/api/audit', 
      description: 'Get audit logs',
      params: 'Query: entityType, entityId, action, startDate, endDate (optional)',
      response: 'AuditRecord[]'
    },
    { 
      category: 'audit', 
      method: 'POST', 
      path: '/api/audit/export', 
      description: 'Export audit logs',
      params: '{ startDate, endDate, entityType, format }',
      response: 'File download (CSV or JSON)'
    }
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">API Endpoints</h1>
          <p className="text-muted-foreground">
            Browse available API endpoints, parameters, and responses
          </p>
        </div>
        <Button variant="outline" asChild>
          <Link to="/settings">
            <ArrowLeftIcon className="mr-2 h-4 w-4" />
            Back to Settings
          </Link>
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>API Base Information</CardTitle>
          <CardDescription>
            Current configuration and connection details
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <h3 className="font-medium">Base URL</h3>
            <div className="flex items-center gap-2 mt-1">
              <code className="bg-muted px-2 py-1 rounded text-sm font-mono">
                {baseUrl}
              </code>
              <Badge variant={settings.apiBaseUrl ? "default" : "outline"}>
                {settings.apiBaseUrl ? "Custom" : "Default"}
              </Badge>
            </div>
          </div>
          
          <div>
            <h3 className="font-medium">Authentication</h3>
            <p className="text-sm text-muted-foreground mt-1">
              Most endpoints require authentication using Bearer token in the Authorization header
            </p>
            <code className="bg-muted px-2 py-1 rounded text-sm font-mono block mt-2">
              Authorization: Bearer &lt;your_token&gt;
            </code>
          </div>
          
          <div className="bg-blue-50 dark:bg-blue-950 p-3 rounded-md">
            <p className="text-sm text-blue-700 dark:text-blue-400">
              You can use the Bruno API Collection included with the application to test these endpoints.
              Find the collection in <code>api-collections/bruno/Money Flow Guardian API Collection</code>.
            </p>
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="auth" className="w-full">
        <TabsList className="mb-4 flex-wrap">
          {apiCategories.map(category => (
            <TabsTrigger key={category.id} value={category.id}>
              {category.name}
            </TabsTrigger>
          ))}
        </TabsList>

        {apiCategories.map(category => (
          <TabsContent key={category.id} value={category.id} className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>{category.name} API</CardTitle>
                <CardDescription>
                  Endpoints related to {category.name.toLowerCase()} operations
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-[100px]">Method</TableHead>
                      <TableHead className="w-[250px]">Endpoint</TableHead>
                      <TableHead>Description</TableHead>
                      <TableHead>Parameters</TableHead>
                      <TableHead>Response</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {endpoints
                      .filter(endpoint => endpoint.category === category.id)
                      .map((endpoint, index) => (
                        <TableRow key={`${endpoint.category}-${index}`}>
                          <TableCell>
                            <Badge variant={
                              endpoint.method === 'GET' ? 'secondary' :
                              endpoint.method === 'POST' ? 'default' :
                              endpoint.method === 'PUT' ? 'outline' : 'destructive'
                            }>
                              {endpoint.method}
                            </Badge>
                          </TableCell>
                          <TableCell className="font-mono text-xs">
                            {endpoint.path}
                          </TableCell>
                          <TableCell>{endpoint.description}</TableCell>
                          <TableCell className="font-mono text-xs">
                            {endpoint.params}
                          </TableCell>
                          <TableCell className="font-mono text-xs">
                            {endpoint.response}
                          </TableCell>
                        </TableRow>
                      ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>
        ))}
      </Tabs>

      <Card>
        <CardHeader>
          <CardTitle>API Documentation</CardTitle>
          <CardDescription>
            Additional resources for API integration
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-col gap-2">
            <Button variant="outline" className="justify-start" asChild>
              <Link to="/docs">
                <ExternalLink className="mr-2 h-4 w-4" />
                View Full API Documentation
              </Link>
            </Button>
            
            <Button variant="outline" className="justify-start" asChild>
              <a href="https://github.com/usebruno/bruno" target="_blank" rel="noopener noreferrer">
                <ExternalLink className="mr-2 h-4 w-4" />
                Bruno API Testing Tool Documentation
              </a>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ApiEndpoints;
