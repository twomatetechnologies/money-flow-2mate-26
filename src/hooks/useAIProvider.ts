import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { AIProvider, AIOptions, AIConfig } from '@/types/ai';
import { useOllama } from '@/hooks/useOllama';

// Default configuration
const defaultConfig: AIConfig = {
  providerType: 'ollama',
  endpoint: 'http://localhost:11434',
  defaultModel: 'llama3',
  defaultOptions: {
    temperature: 0.7,
    topP: 0.9,
    maxTokens: 1000,
  }
};

// Load configuration from localStorage or use default
const loadConfig = (): AIConfig => {
  try {
    const storedConfig = localStorage.getItem('aiConfig');
    return storedConfig ? JSON.parse(storedConfig) : defaultConfig;
  } catch (error) {
    console.error('Error loading AI configuration:', error);
    return defaultConfig;
  }
};

// Save configuration to localStorage
const saveConfig = (config: AIConfig): void => {
  try {
    localStorage.setItem('aiConfig', JSON.stringify(config));
  } catch (error) {
    console.error('Error saving AI configuration:', error);
  }
};

// Factory class for creating AI providers
class AIProviderFactory {
  static createProvider(config: AIConfig, toast: any): AIProvider {
    switch (config.providerType) {
      case 'ollama':
        return new OllamaProvider(config, toast);
      // Add more providers as needed
      default:
        return new OllamaProvider(config, toast);
    }
  }
}

// Ollama implementation
class OllamaProvider implements AIProvider {
  private config: AIConfig;
  private loading: boolean = false;
  private toast: any;

  constructor(config: AIConfig, toast: any) {
    this.config = config;
    this.toast = toast;
  }

  async generateText(
    prompt: string,
    systemPrompt?: string,
    options: AIOptions = {}
  ): Promise<string> {
    const mergedOptions = { ...this.config.defaultOptions, ...options };
    
    try {
      this.loading = true;
      
      // Use fetch to call the Ollama API
      const response = await fetch(`${this.config.endpoint}/api/generate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: mergedOptions.model || this.config.defaultModel,
          prompt: prompt,
          system: systemPrompt || '',
          temperature: mergedOptions.temperature,
          top_p: mergedOptions.topP,
          max_tokens: mergedOptions.maxTokens,
          stream: false,
        }),
      });

      if (!response.ok) {
        throw new Error(`Error connecting to Ollama: ${response.statusText}`);
      }

      const data = await response.json();
      return data.response;
    } catch (error) {
      console.error('Error calling Ollama:', error);
      this.toast({
        title: "AI Provider Error",
        description: error instanceof Error ? error.message : "Failed to connect to AI service",
        variant: "destructive"
      });
      return "Unable to generate response. Please ensure the AI service is running.";
    } finally {
      this.loading = false;
    }
  }

  isLoading(): boolean {
    return this.loading;
  }
}

export const useAIProvider = () => {
  const [config, setConfig] = useState<AIConfig>(loadConfig());
  const [provider, setProvider] = useState<AIProvider | null>(null);
  const { toast } = useToast();
  const ollamaHook = useOllama(); // Keep for backward compatibility

  // Initialize provider if not already done
  if (!provider) {
    const newProvider = AIProviderFactory.createProvider(config, toast);
    setProvider(newProvider);
  }

  // Update the configuration and provider
  const updateConfig = (newConfig: Partial<AIConfig>) => {
    const updatedConfig = { ...config, ...newConfig };
    setConfig(updatedConfig);
    saveConfig(updatedConfig);
    
    // Create a new provider with the updated config
    const newProvider = AIProviderFactory.createProvider(updatedConfig, toast);
    setProvider(newProvider);
  };

  return {
    // New flexible provider
    generateText: provider ? provider.generateText.bind(provider) : ollamaHook.generateText,
    loading: provider ? provider.isLoading() : ollamaHook.loading,
    
    // Configuration management
    config,
    updateConfig,
    
    // Keep original Ollama hook for backward compatibility
    ollamaProvider: ollamaHook
  };
};
