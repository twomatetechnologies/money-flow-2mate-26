import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Switch } from "@/components/ui/switch";
import { 
  isPostgresEnabled,
  toggleDatabaseSource,
  getPgAdminUrl, 
  testDatabaseConnection
} from '@/services/db/dbConnector';
import { useToast } from '@/components/ui/use-toast';
import { AlertCircle, Database, ExternalLink, Check, RefreshCw } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

export function DatabaseSettings() {
  const { toast } = useToast();
  const [connectionStatus, setConnectionStatus] = useState<'checking' | 'connected' | 'error'>('checking');
  const [usePostgres, setUsePostgres] = useState(isPostgresEnabled());

  useEffect(() => {
    checkDatabaseConnection();
    
    // Keep local state in sync with the actual storage setting
    setUsePostgres(isPostgresEnabled());
  }, []);

  const checkDatabaseConnection = async () => {
    setConnectionStatus('checking');
    const isConnected = await testDatabaseConnection();
    setConnectionStatus(isConnected ? 'connected' : 'error');
  };

  const openPgAdmin = () => {
    window.open(getPgAdminUrl(), '_blank');
  };
  
  const handleToggleStorage = (enabled: boolean) => {
    // Show confirmation toast
    toast({
      title: "Changing Storage Engine",
      description: "The page will reload to apply your changes.",
    });
    
    // Toggle the database source
    toggleDatabaseSource(enabled);
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Database Configuration</CardTitle>
        <CardDescription>
          Configure how the application stores and retrieves data
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between rounded-lg border p-4">
          <div className="flex items-center space-x-4">
            <Database className="h-6 w-6 text-blue-500" />
            <div className="space-y-1">
              <p className="text-sm font-medium leading-none">
                Storage Engine
              </p>
              <p className="text-sm text-muted-foreground">
                {usePostgres 
                  ? "Using PostgreSQL database for data persistence"
                  : "Using browser's localStorage (data will be stored in this browser only)"}
              </p>
            </div>
          </div>
          <Switch 
            checked={usePostgres} 
            onCheckedChange={handleToggleStorage}
          />
        </div>

        {connectionStatus === 'error' && usePostgres && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Connection Error</AlertTitle>
            <AlertDescription>
              Unable to connect to PostgreSQL database. Please check your Docker configuration.
            </AlertDescription>
            <Button 
              variant="outline" 
              size="sm" 
              className="mt-2 flex items-center gap-2"
              onClick={checkDatabaseConnection}
            >
              <RefreshCw className="h-3 w-3" />
              <span>Retry Connection</span>
            </Button>
          </Alert>
        )}

        {connectionStatus === 'connected' && usePostgres && (
          <Alert className="bg-green-50 text-green-800 border-green-200">
            <Check className="h-4 w-4 text-green-600" />
            <AlertTitle>Database Connected</AlertTitle>
            <AlertDescription className="text-green-700">
              Successfully connected to PostgreSQL database.
            </AlertDescription>
          </Alert>
        )}

        {usePostgres && (
          <>
            <div className="flex items-center justify-between rounded-lg border p-4 bg-blue-50">
              <div className="flex items-center space-x-4">
                <Database className="h-6 w-6 text-blue-500" />
                <div className="space-y-1">
                  <p className="text-sm font-medium leading-none">
                    Database Administration
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Manage your PostgreSQL database using pgAdmin
                  </p>
                </div>
              </div>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={openPgAdmin} 
                className="flex items-center gap-2"
                disabled={connectionStatus === 'error'}
              >
                <span>Open pgAdmin</span>
                <ExternalLink className="h-4 w-4" />
              </Button>
            </div>

            <div className="rounded-lg border p-4 bg-blue-50">
              <h4 className="text-sm font-medium mb-2">pgAdmin Login Information</h4>
              <div className="grid grid-cols-2 gap-2 text-sm">
                <span className="text-muted-foreground">Email:</span>
                <span className="font-mono">pg.admin@example.com</span>
                <span className="text-muted-foreground">Password:</span>
                <span className="font-mono">admin123</span>
              </div>
            </div>
          </>
        )}
      </CardContent>
      <CardFooter className="flex justify-between border-t px-6 py-4">
        <div className="text-xs text-muted-foreground">
          {window.DB_SIZE && (
            <p>Current database size: {window.DB_SIZE}</p>
          )}
        </div>
      </CardFooter>
    </Card>
  );
}

export default DatabaseSettings;
