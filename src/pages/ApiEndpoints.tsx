
import React, { useState } from 'react';
import { useSettings } from '@/contexts/SettingsContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Search, Code, FileJson, Server, Key, Shield, Database, BarChart } from 'lucide-react';

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
        <TabsList>
          <TabsTrigger value="all">All Endpoints</TabsTrigger>
          <TabsTrigger value="authentication">Authentication</TabsTrigger>
          <TabsTrigger value="data">Data Endpoints</TabsTrigger>
        </TabsList>
        
        <TabsContent value="all" className="space-y-6 mt-4">
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
        
        <TabsContent value="authentication" className="space-y-6 mt-4">
          {filteredCategories
            .filter(category => category.id === 'auth')
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
        
        <TabsContent value="data" className="space-y-6 mt-4">
          {filteredCategories
            .filter(category => ['stocks', 'reports', 'audit'].includes(category.id))
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
