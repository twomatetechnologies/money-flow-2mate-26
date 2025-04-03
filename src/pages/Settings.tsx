
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { useSettings } from '@/contexts/SettingsContext';
import { useToast } from '@/hooks/use-toast';
import { Separator } from '@/components/ui/separator';
import { InfoIcon } from 'lucide-react';

const Settings = () => {
  const { settings, updateSettings } = useSettings();
  const { toast } = useToast();
  const [threshold, setThreshold] = React.useState(settings.stockPriceAlertThreshold);
  const [apiKey, setApiKey] = React.useState(settings.stockApiKey || '');

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

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
        <p className="text-muted-foreground">
          Configure application preferences and notifications
        </p>
      </div>

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
