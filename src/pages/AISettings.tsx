
import React from 'react';
import { AISettings as AISettingsComponent } from '@/components/settings/AISettings';
import { Sheet } from '@/components/ui/sheet';
import { BrainCircuit } from 'lucide-react';

const AISettings: React.FC = () => {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">AI Configuration</h1>
        <p className="text-muted-foreground">
          Configure AI providers for insights and intelligent features
        </p>
      </div>

      <div className="grid gap-6">
        <AISettingsComponent />
        
        <div className="bg-blue-50 dark:bg-blue-950 p-4 rounded-lg border border-blue-100 dark:border-blue-900">
          <div className="flex items-center gap-2 mb-2">
            <BrainCircuit className="h-5 w-5 text-blue-600 dark:text-blue-400" />
            <h3 className="text-lg font-semibold text-blue-800 dark:text-blue-300">About AI Integration</h3>
          </div>
          <p className="text-sm text-blue-700 dark:text-blue-400">
            Money Flow Guardian supports multiple AI providers to power financial insights
            and the AI assistant. You can configure the provider, model, and other settings here.
          </p>
          <div className="mt-3 text-sm">
            <h4 className="font-medium text-blue-800 dark:text-blue-300 mb-1">Supported Providers:</h4>
            <ul className="list-disc pl-5 text-blue-700 dark:text-blue-400 space-y-1">
              <li>Ollama (local, no API key required)</li>
              <li>OpenAI (requires API key)</li>
              <li>Anthropic (requires API key)</li>
              <li>Perplexity AI (requires API key)</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AISettings;
