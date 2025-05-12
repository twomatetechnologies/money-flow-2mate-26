
import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Database, Settings } from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { isPostgresEnabled, toggleDatabaseSource, testDatabaseConnection } from '@/services/db/dbConnector';
import { Alert, AlertDescription } from '@/components/ui/alert';

export function DatabaseConnectionDialog() {
  const [open, setOpen] = useState(false);
  const [usePostgres, setUsePostgres] = useState(isPostgresEnabled);
  const [isTesting, setIsTesting] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState<'untested' | 'success' | 'error'>('untested');

  useEffect(() => {
    // Update local state when the actual status changes
    setUsePostgres(isPostgresEnabled());
  }, [open]); // Check when dialog opens

  const handleToggle = (checked: boolean) => {
    setUsePostgres(checked);
    // We don't immediately apply the change until the user clicks "Apply"
  };

  const testConnection = async () => {
    if (!usePostgres) {
      setConnectionStatus('success');
      return;
    }
    
    setIsTesting(true);
    setConnectionStatus('untested');
    
    try {
      const success = await testDatabaseConnection();
      setConnectionStatus(success ? 'success' : 'error');
    } catch (error) {
      console.error('Error testing connection:', error);
      setConnectionStatus('error');
    } finally {
      setIsTesting(false);
    }
  };

  const applyChanges = () => {
    toggleDatabaseSource(usePostgres);
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button 
          variant="ghost" 
          size="sm" 
          className="flex items-center gap-2 hover:bg-blue-50"
        >
          <Database className="h-4 w-4" />
          <span>Database Settings</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            Database Connection Settings
          </DialogTitle>
          <DialogDescription>
            Configure how the application should store and retrieve data.
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-6 py-4">
          <div className="flex items-center justify-between space-x-2">
            <div>
              <h4 className="font-medium text-sm">Use PostgreSQL Database</h4>
              <p className="text-sm text-muted-foreground">
                {usePostgres 
                  ? "Using PostgreSQL database for data persistence" 
                  : "Using browser's localStorage (data will be stored in this browser only)"}
              </p>
            </div>
            <Switch
              checked={usePostgres}
              onCheckedChange={handleToggle}
              id="postgres-mode"
            />
          </div>

          {connectionStatus === 'error' && (
            <Alert variant="destructive" className="text-sm">
              <AlertDescription>
                Unable to connect to PostgreSQL. Make sure your database container is running.
              </AlertDescription>
            </Alert>
          )}

          {connectionStatus === 'success' && (
            <Alert className="bg-green-50 border-green-200 text-green-800 text-sm">
              <AlertDescription>
                {usePostgres 
                  ? "Successfully connected to PostgreSQL database."
                  : "Local storage is available and working."}
              </AlertDescription>
            </Alert>
          )}

          <Button 
            variant="outline" 
            size="sm" 
            onClick={testConnection} 
            disabled={isTesting}
            className="w-full"
          >
            {isTesting ? "Testing..." : "Test Connection"}
          </Button>
        </div>
        
        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>
            Cancel
          </Button>
          <Button onClick={applyChanges}>
            Apply Changes
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
