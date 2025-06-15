import React, { useState } from 'react';
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
import { testDatabaseConnection } from '@/services/db/dbConnector';
import { Alert, AlertDescription } from '@/components/ui/alert';

export function DatabaseConnectionDialog() {
  const [open, setOpen] = useState(false);
  const [isTesting, setIsTesting] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState<'untested' | 'success' | 'error'>('untested');

  const testConnection = async () => {
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

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button 
          variant="ghost" 
          size="sm" 
          className="flex items-center gap-2 hover:bg-blue-50"
        >
          <Database className="h-4 w-4" />
          <span>Database Status</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            PostgreSQL Database Status
          </DialogTitle>
          <DialogDescription>
            Check your connection to the PostgreSQL database.
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-6 py-4">
          <div className="flex items-center justify-between space-x-2">
            <div>
              <h4 className="font-medium text-sm">PostgreSQL Database</h4>
              <p className="text-sm text-muted-foreground">
                This application uses PostgreSQL for data persistence
              </p>
            </div>
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
                Successfully connected to PostgreSQL database.
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
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
