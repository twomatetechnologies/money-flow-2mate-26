
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { isPostgresEnabled, toggleDatabaseSource } from '@/services/db/dbConnector';
import { useToast } from '@/components/ui/use-toast';
import { AlertCircle, Database, HardDrive } from 'lucide-react';

export function DatabaseSettings() {
  const { toast } = useToast();
  const [usePostgres, setUsePostgres] = useState<boolean>(isPostgresEnabled());
  const [isConfirmingSwitch, setIsConfirmingSwitch] = useState<boolean>(false);

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
