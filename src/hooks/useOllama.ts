
import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';

export interface OllamaOptions {
  model?: string;
  temperature?: number;
  topP?: number;
  maxTokens?: number;
}

export const useOllama = () => {
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  const defaultOptions: OllamaOptions = {
    model: 'llama3', // Default model
    temperature: 0.7,
    topP: 0.9,
    maxTokens: 1000,
  };

  // Function to generate text from Ollama
  const generateText = async (
    prompt: string,
    systemPrompt?: string,
    options: OllamaOptions = {}
  ): Promise<string> => {
    const mergedOptions = { ...defaultOptions, ...options };
    
    try {
      setLoading(true);
      
      // Use fetch to call the Ollama API (default is localhost:11434)
      const response = await fetch('http://localhost:11434/api/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: mergedOptions.model,
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
      toast({
        title: "Ollama Error",
        description: error instanceof Error ? error.message : "Failed to connect to Ollama service",
        variant: "destructive"
      });
      return "Unable to generate response from Ollama. Please ensure the service is running.";
    } finally {
      setLoading(false);
    }
  };

  return {
    generateText,
    loading
  };
};
