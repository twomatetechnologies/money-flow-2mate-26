
export interface AIOptions {
  model?: string;
  temperature?: number;
  topP?: number;
  maxTokens?: number;
  [key: string]: any; // Allow for provider-specific parameters
}

export interface AIProvider {
  generateText(prompt: string, systemPrompt?: string, options?: AIOptions): Promise<string>;
  isLoading(): boolean;
}

export type AIProviderType = 'ollama' | 'openai' | 'anthropic' | 'perplexity' | 'custom';

export interface AIConfig {
  providerType: AIProviderType;
  endpoint: string;
  apiKey?: string;
  defaultModel: string;
  defaultOptions: AIOptions;
}
