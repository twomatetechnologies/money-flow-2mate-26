
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { 
  isPostgresEnabled, 
  toggleDatabaseSource, 
  getPgAdminUrl, 
  hasConnectionError,
  testDatabaseConnection
} from '@/services/db/dbConnector';
import { useToast } from '@/components/ui/use-toast';
import { AlertCircle, Database, HardDrive, ExternalLink, WifiOff, Check, RefreshCw } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

export function DatabaseSettings() {
  const { toast } = useToast();
  const [usePostgres, setUsePostgres] = useState<boolean>(isPostgresEnabled());
  const [isConfirmingSwitch, setIsConfirmingSwitch] = useState<boolean>(false);
  const [connectionStatus, setConnectionStatus] = useState<'checking' | 'connected' | 'error'>('checking');

  useEffect(() => {
    checkDatabaseConnection();
  }, []);

  const checkDatabaseConnection = async () => {
    if (usePostgres) {
      setConnectionStatus('checking');
      const isConnected = await testDatabaseConnection();
      setConnectionStatus(isConnected ? 'connected' : 'error');
    }
  };

  const handleToggle = (checked: boolean) => {
    setUsePostgres(checked);
    setIsConfirmingSwitch(true);
  };

  const confirmSwitch = () => {
    toast({
      title: `Switching to ${usePostgres ? 'PostgreSQL' : 'localStorage'} storage`,
      description: "The application will reload to apply changes.",
      duration: 3000
    });
    
    // Give the toast time to display before reloading
    setTimeout(() => {
      toggleDatabaseSource(usePostgres);
    }, 1000);
  };

  const cancelSwitch = () => {
    setUsePostgres(isPostgresEnabled());
    setIsConfirmingSwitch(false);
  };

  const openPgAdmin = () => {
    window.open(getPgAdminUrl(), '_blank');
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Data Storage Settings</CardTitle>
        <CardDescription>
          Configure how your financial data is stored and retrieved
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between rounded-lg border p-4">
          <div className="flex items-center space-x-4">
            {usePostgres ? (
              <Database className="h-6 w-6 text-blue-500" />
            ) : (
              <HardDrive className="h-6 w-6 text-green-500" />
            )}
            <div className="space-y-1">
              <p className="text-sm font-medium leading-none">
                Storage Engine
              </p>
              <p className="text-sm text-muted-foreground">
                {usePostgres 
                  ? "Using PostgreSQL database for data persistence" 
                  : "Using browser's localStorage for data persistence"}
              </p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <Label htmlFor="storage-toggle">Use PostgreSQL</Label>
            <Switch
              id="storage-toggle"
              checked={usePostgres}
              onCheckedChange={handleToggle}
            />
          </div>
        </div>

        {isConfirmingSwitch && (
          <div className="flex items-center space-x-2 rounded-md bg-amber-50 p-3 text-amber-800">
            <AlertCircle className="h-5 w-5" />
            <div className="flex-1 text-sm">
              <p className="font-medium">Warning: Switching storage engines</p>
              <p>
                Changing the storage engine will reload the application. Any unsaved changes 
                will be lost, and data will not be transferred between storage types.
              </p>
            </div>
            <div className="flex space-x-2">
              <Button variant="outline" size="sm" onClick={cancelSwitch}>
                Cancel
              </Button>
              <Button variant="default" size="sm" onClick={confirmSwitch}>
                Confirm
              </Button>
            </div>
          </div>
        )}

        {usePostgres && (
          <>
            {connectionStatus === 'error' && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Connection Error</AlertTitle>
                <AlertDescription>
                  Unable to connect to PostgreSQL database. Please check your Docker configuration or switch to localStorage mode temporarily.
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

            {connectionStatus === 'connected' && (
              <Alert className="bg-green-50 text-green-800 border-green-200">
                <Check className="h-4 w-4 text-green-600" />
                <AlertTitle>Database Connected</AlertTitle>
                <AlertDescription className="text-green-700">
                  Successfully connected to PostgreSQL database.
                </AlertDescription>
              </Alert>
            )}

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
                <span className="font-mono">admin@example.com</span>
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
