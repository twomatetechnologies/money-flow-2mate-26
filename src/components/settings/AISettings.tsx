
import React, { useState } from 'react';
import { useAIProvider } from '@/hooks/useAIProvider';
import { AIProviderType, AIConfig } from '@/types/ai';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';
import { toast } from '@/hooks/use-toast';

export const AISettings: React.FC = () => {
  const { config, updateConfig } = useAIProvider();
  const [formData, setFormData] = useState<AIConfig>({ ...config });

  const handleProviderChange = (value: string) => {
    setFormData({
      ...formData,
      providerType: value as AIProviderType,
      // Set default endpoints based on provider
      endpoint: getDefaultEndpoint(value as AIProviderType),
    });
  };

  const getDefaultEndpoint = (providerType: AIProviderType): string => {
    switch (providerType) {
      case 'ollama':
        return 'http://localhost:11434';
      case 'openai':
        return 'https://api.openai.com/v1';
      case 'anthropic':
        return 'https://api.anthropic.com/v1';
      case 'perplexity':
        return 'https://api.perplexity.ai';
      default:
        return '';
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateConfig(formData);
    toast({
      title: "Settings Updated",
      description: "AI provider settings have been saved.",
    });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>AI Provider Settings</CardTitle>
        <CardDescription>
          Configure your AI provider for financial insights and queries.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="provider">AI Provider</Label>
              <Select
                value={formData.providerType}
                onValueChange={handleProviderChange}
              >
                <SelectTrigger id="provider">
                  <SelectValue placeholder="Select AI provider" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ollama">Ollama (Local)</SelectItem>
                  <SelectItem value="openai">OpenAI</SelectItem>
                  <SelectItem value="anthropic">Anthropic</SelectItem>
                  <SelectItem value="perplexity">Perplexity AI</SelectItem>
                  <SelectItem value="custom">Custom</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="endpoint">API Endpoint</Label>
              <Input
                id="endpoint"
                value={formData.endpoint}
                onChange={(e) => setFormData({ ...formData, endpoint: e.target.value })}
                placeholder="http://localhost:11434"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="apiKey">API Key {formData.providerType === 'ollama' && '(Not required for local Ollama)'}</Label>
              <Input
                id="apiKey"
                value={formData.apiKey || ''}
                onChange={(e) => setFormData({ ...formData, apiKey: e.target.value })}
                placeholder="Enter API key if required"
                type="password"
                disabled={formData.providerType === 'ollama'}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="defaultModel">Default Model</Label>
              <Input
                id="defaultModel"
                value={formData.defaultModel}
                onChange={(e) => setFormData({ ...formData, defaultModel: e.target.value })}
                placeholder="llama3"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="temperature">Temperature ({formData.defaultOptions.temperature})</Label>
              <Slider
                id="temperature"
                min={0}
                max={1}
                step={0.05}
                value={[formData.defaultOptions.temperature || 0.7]}
                onValueChange={(values) => setFormData({
                  ...formData,
                  defaultOptions: {
                    ...formData.defaultOptions,
                    temperature: values[0]
                  }
                })}
              />
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>More Precise</span>
                <span>More Creative</span>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="maxTokens">Max Tokens ({formData.defaultOptions.maxTokens})</Label>
              <Slider
                id="maxTokens"
                min={100}
                max={5000}
                step={100}
                value={[formData.defaultOptions.maxTokens || 1000]}
                onValueChange={(values) => setFormData({
                  ...formData,
                  defaultOptions: {
                    ...formData.defaultOptions,
                    maxTokens: values[0]
                  }
                })}
              />
            </div>

            <div className="flex items-center justify-between">
              <Label htmlFor="advanced" className="text-base">Show Advanced Settings</Label>
              <Switch id="advanced" />
            </div>
          </div>
          
          <div className="space-y-2">
            <Button type="submit" className="w-full">Save Settings</Button>
            <Button type="button" variant="outline" className="w-full" onClick={() => {
              setFormData({
                providerType: 'ollama',
                endpoint: 'http://localhost:11434',
                defaultModel: 'llama3',
                defaultOptions: {
                  temperature: 0.7,
                  topP: 0.9,
                  maxTokens: 1000,
                }
              });
            }}>
              Reset to Defaults
            </Button>
          </div>
        </form>
      </CardContent>
      <CardFooter className="flex-col space-y-2 border-t pt-4">
        <div className="text-sm text-muted-foreground">
          <p className="mb-2"><strong>Current configuration:</strong></p>
          <p>Provider: {config.providerType}</p>
          <p>Endpoint: {config.endpoint}</p>
          <p>Model: {config.defaultModel}</p>
        </div>
      </CardFooter>
    </Card>
  );
};
