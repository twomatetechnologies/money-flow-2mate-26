
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { useSettings } from '@/contexts/SettingsContext';
import { useToast } from '@/hooks/use-toast';
import { Separator } from '@/components/ui/separator';
import { BrainCircuit, InfoIcon, Lock, Pencil, Shield } from 'lucide-react';
import { Switch } from '@/components/ui/switch';
import { useAuth } from '@/contexts/AuthContext';
import { Link } from 'react-router-dom';

const Settings = () => {
  const { settings, updateSettings } = useSettings();
  const { user, enableTwoFactor } = useAuth();
  const { toast } = useToast();
  const [threshold, setThreshold] = React.useState(settings.stockPriceAlertThreshold);
  const [apiKey, setApiKey] = React.useState(settings.stockApiKey || '');
  const [is2FAEnabled, setIs2FAEnabled] = React.useState(user?.has2FAEnabled || false);
  const [appName, setAppName] = React.useState(settings.appName || "Money Flow Guardian");

  const handleSaveSettings = () => {
    updateSettings({
      stockPriceAlertThreshold: threshold,
      stockApiKey: apiKey
    });

    toast({
      title: "Settings Saved",
      description: "Stock settings updated successfully",
    });
  };

  const handleSaveAppName = () => {
    updateSettings({
      appName: appName
    });

    toast({
      title: "App Name Updated",
      description: "Application name has been updated successfully",
    });
  };

  const handleToggle2FA = (enabled: boolean) => {
    setIs2FAEnabled(enabled);
    enableTwoFactor(enabled);
    toast({
      title: enabled ? "Two-Factor Authentication Enabled" : "Two-Factor Authentication Disabled",
      description: enabled 
        ? "Your account is now more secure with two-factor authentication." 
        : "Two-factor authentication has been disabled.",
    });
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
        <p className="text-muted-foreground">
          Configure application preferences and notifications
        </p>
      </div>

      {/* App Customization Card */}
      <Card>
        <CardHeader>
          <div className="flex items-center space-x-2">
            <Pencil className="h-5 w-5 text-primary" />
            <CardTitle>App Customization</CardTitle>
          </div>
          <CardDescription>
            Change the application name and appearance
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="appName">Application Name</Label>
            <div className="flex gap-2">
              <Input 
                id="appName" 
                value={appName} 
                onChange={(e) => setAppName(e.target.value)}
                placeholder="Enter application name"
                className="flex-1"
              />
              <Button onClick={handleSaveAppName}>Save</Button>
            </div>
            <p className="text-sm text-muted-foreground">
              This name will be displayed in the sidebar and browser title
            </p>
          </div>
        </CardContent>
      </Card>

      {/* AI Settings Card */}
      <Card>
        <CardHeader>
          <div className="flex items-center space-x-2">
            <BrainCircuit className="h-5 w-5 text-primary" />
            <CardTitle>AI Configuration</CardTitle>
          </div>
          <CardDescription>
            Configure AI providers, models and parameters
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Money Flow Guardian uses AI to provide financial insights and to power the AI assistant. 
              Configure your AI providers and models to get the most out of these features.
            </p>
            <Button asChild>
              <Link to="/ai-settings">
                <BrainCircuit className="mr-2 h-4 w-4" />
                Manage AI Settings
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Security Settings */}
      <Card>
        <CardHeader>
          <div className="flex items-center space-x-2">
            <Shield className="h-5 w-5 text-primary" />
            <CardTitle>Security Settings</CardTitle>
          </div>
          <CardDescription>
            Configure authentication and security options
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <Label className="text-base">Two-Factor Authentication</Label>
              <p className="text-sm text-muted-foreground">
                Add an extra layer of security by requiring a verification code when signing in
              </p>
            </div>
            <Switch 
              checked={is2FAEnabled} 
              onCheckedChange={handleToggle2FA}
            />
          </div>

          <Separator className="my-4" />

          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <Lock className="h-5 w-5 text-primary" />
              <Label className="text-lg font-medium">Session Timeout</Label>
            </div>
            <p className="text-sm text-muted-foreground">
              Your session will automatically expire after 30 minutes of inactivity for security purposes.
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Stock Settings */}
      <Card>
        <CardHeader>
          <CardTitle>Stock Price Alerts</CardTitle>
          <CardDescription>
            Configure when you want to be notified about stock price changes
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="threshold">Price Change Threshold (%)</Label>
            <div className="flex items-center space-x-4">
              <Slider
                id="threshold"
                min={1}
                max={20}
                step={0.5}
                defaultValue={[threshold]}
                onValueChange={(value) => setThreshold(value[0])}
                className="w-2/3"
              />
              <Input 
                type="number"
                value={threshold}
                onChange={(e) => setThreshold(Number(e.target.value))}
                className="w-24"
                min={0.5}
                step={0.5}
              />
            </div>
            <p className="text-sm text-muted-foreground">
              You will be notified when a stock price changes by at least {threshold}%
            </p>
          </div>
          
          <Separator className="my-4" />
          
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <Label htmlFor="apiKey" className="text-lg font-medium">Live Stock Data API Key</Label>
              <div className="rounded-full bg-blue-100 p-1">
                <InfoIcon className="h-4 w-4 text-blue-600" />
              </div>
            </div>
            
            <div className="bg-blue-50 p-3 rounded-md mb-3">
              <p className="text-sm text-blue-700 mb-1">
                Get real-time stock prices by adding your Alpha Vantage API key.
              </p>
              <p className="text-sm text-blue-700">
                Without an API key, the application will use simulated data.
              </p>
            </div>
            
            <Input 
              id="apiKey"
              type="text"
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              placeholder="Enter your Alpha Vantage API key"
              className="font-mono"
            />
            <p className="text-sm text-muted-foreground">
              <a 
                href="https://www.alphavantage.co/support/#api-key" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-blue-500 hover:underline"
              >
                Get a free API key
              </a>
              {' '}for real-time stock data. Leave empty to use simulated data.
            </p>
          </div>
          
          <Button onClick={handleSaveSettings} className="mt-4">Save Settings</Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default Settings;
