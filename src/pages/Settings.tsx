
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useSettings } from "@/contexts/SettingsContext";
import { toggleDatabaseSource, isPostgresEnabled, getPgAdminUrl, testDatabaseConnection } from "@/services/db/dbConnector";
import { DatabaseSettings } from "@/components/settings/DatabaseSettings";
import { Link } from 'react-router-dom';
import { ExternalLink, Save } from 'lucide-react'; // Added Save icon
import { toast } from '@/hooks/use-toast';

const Settings: React.FC = () => {
  const { settings: contextSettings, updateSettings, isLoading: isLoadingContext } = useSettings();
  const [localSettings, setLocalSettings] = useState(contextSettings);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    // Update local form state when context settings are loaded or change
    if (!isLoadingContext) {
      setLocalSettings(contextSettings);
    }
  }, [contextSettings, isLoadingContext]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { id, value, type } = e.target;
    setLocalSettings(prev => ({
      ...prev,
      [id]: type === 'number' ? (value === '' ? '' : Number(value)) : value, // Handle empty string for number input
    }));
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      // Validate before saving, e.g., stockPriceAlertThreshold must be a positive number
      if (localSettings.stockPriceAlertThreshold <= 0) {
        toast({
          title: "Invalid Input",
          description: "Stock price alert threshold must be greater than 0.",
          variant: "destructive",
        });
        setIsSaving(false);
        return;
      }
      await updateSettings(localSettings);
      // Toast for success/failure is handled within updateSettings in the context
    } catch (error) {
      // This catch is more for unexpected errors during the call from this page,
      // as context's updateSettings also has its own try/catch for the API call.
      console.error("Error triggering settings save:", error);
      toast({
        title: "Save Error",
        description: "An unexpected error occurred while trying to save settings.",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoadingContext) {
    return <div>Loading settings page...</div>;
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
        <p className="text-muted-foreground">
          Configure application preferences and external services
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>General Settings</CardTitle>
          <CardDescription>
            Configure basic application settings
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="appName">Application Name</Label>
            <Input
              id="appName"
              value={localSettings.appName}
              onChange={handleInputChange}
              placeholder="Money Flow Guardian"
            />
            <p className="text-sm text-muted-foreground">
              This name will be displayed throughout the application
            </p>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>API Configuration</CardTitle>
          <CardDescription>
            Configure API endpoints and access settings
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="apiBaseUrl">API Base URL</Label>
            <Input
              id="apiBaseUrl"
              value={localSettings.apiBaseUrl || ''}
              onChange={handleInputChange}
              placeholder="http://localhost:8080"
            />
            <p className="text-sm text-muted-foreground">
              Base URL for API requests. Leave empty to use relative URLs (same origin)
            </p>
          </div>

          <Button variant="outline" asChild className="mt-4">
            <Link to="/api-endpoints">
              <ExternalLink className="mr-2 h-4 w-4" />
              View API Endpoints Documentation
            </Link>
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Stock Price Settings</CardTitle>
          <CardDescription>
            Configure stock price alerts and API access
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="stockPriceAlertThreshold">Price Change Alert Threshold (%)</Label>
            <Input
              id="stockPriceAlertThreshold"
              type="number"
              min="1"
              max="100" // Sensible max
              value={localSettings.stockPriceAlertThreshold}
              onChange={handleInputChange}
            />
            <p className="text-sm text-muted-foreground">
              Percentage change that triggers a stock price alert (e.g., 5 for 5%)
            </p>
          </div>
          
          <div className="space-y-2"> {/* Changed from Separator and div to just div for grouping */}
            <Label htmlFor="stockApiKey">Stock API Key</Label>
            <Input
              id="stockApiKey"
              type="password"
              value={localSettings.stockApiKey || ''}
              onChange={handleInputChange}
              placeholder="Enter your API key"
            />
            <p className="text-sm text-muted-foreground">
              API key for accessing real-time stock data (e.g., Alpha Vantage)
            </p>
          </div>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader>
          <CardTitle>Save Configuration</CardTitle>
          <CardDescription>
            Apply all changes made above to application, API, and stock settings.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button onClick={handleSave} disabled={isSaving || isLoadingContext} className="w-full">
            <Save className="mr-2 h-4 w-4" />
            {isSaving ? "Saving..." : "Save All Settings"}
          </Button>
        </CardContent>
      </Card>

      <DatabaseSettings />
    </div>
  );
};

export default Settings;
