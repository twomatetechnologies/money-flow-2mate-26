
import React from 'react';
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
import { ExternalLink } from 'lucide-react';

const Settings: React.FC = () => {
  const { settings, updateSettings } = useSettings();

  const handleAppNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    updateSettings({ appName: e.target.value });
  };

  const handleApiBaseUrlChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    updateSettings({ apiBaseUrl: e.target.value });
  };

  const handleStockAlertThresholdChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    updateSettings({ stockPriceAlertThreshold: Number(e.target.value) });
  };

  const handleStockApiKeyChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    updateSettings({ stockApiKey: e.target.value });
  };

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
              value={settings.appName}
              onChange={handleAppNameChange}
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
              value={settings.apiBaseUrl}
              onChange={handleApiBaseUrlChange}
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
            <Label htmlFor="stockAlertThreshold">Price Change Alert Threshold (%)</Label>
            <Input
              id="stockAlertThreshold"
              type="number"
              min="1"
              max="50"
              value={settings.stockPriceAlertThreshold}
              onChange={handleStockAlertThresholdChange}
            />
            <p className="text-sm text-muted-foreground">
              Percentage change that triggers a stock price alert
            </p>
          </div>
          
          <Separator />
          
          <div className="space-y-2">
            <Label htmlFor="stockApiKey">Stock API Key</Label>
            <Input
              id="stockApiKey"
              type="password"
              value={settings.stockApiKey || ''}
              onChange={handleStockApiKeyChange}
              placeholder="Enter your API key"
            />
            <p className="text-sm text-muted-foreground">
              API key for accessing real-time stock data
            </p>
          </div>
        </CardContent>
      </Card>

      <DatabaseSettings />
    </div>
  );
};

export default Settings;
