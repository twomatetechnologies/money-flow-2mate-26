
import React, { useState, useRef, useEffect } from 'react';
import { useQuerySystem } from '@/hooks/useQuerySystem';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { InsightCard } from './InsightCard';
import { useInsights } from '@/hooks/useInsights';
import { 
  Send, 
  Loader2, 
  Search, 
  BrainCircuit, 
  MessagesSquare, 
  XCircle, 
  Copy,
  CheckCheck
} from 'lucide-react';

export const QuerySystem: React.FC = () => {
  const { submitQuery, loading, queryResponse, queryHistory } = useQuerySystem();
  const { markAsRead } = useInsights();
  const [query, setQuery] = useState('');
  const [copied, setCopied] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const responseRef = useRef<HTMLDivElement>(null);
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      await submitQuery(query);
      setQuery('');
    }
  };
  
  const handleSuggestedQuestion = (question: string) => {
    setQuery(question);
    if (inputRef.current) {
      inputRef.current.focus();
    }
  };
  
  const copyToClipboard = () => {
    if (queryResponse?.answer) {
      navigator.clipboard.writeText(queryResponse.answer);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };
  
  // Scroll to response when it's loaded
  useEffect(() => {
    if (queryResponse && responseRef.current) {
      responseRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [queryResponse]);
  
  return (
    <Card className="h-full flex flex-col">
      <CardHeader className="border-b">
        <CardTitle className="flex items-center">
          <BrainCircuit className="h-5 w-5 mr-2 text-primary" />
          Financial Advisor AI
        </CardTitle>
      </CardHeader>
      <CardContent className="p-4 flex-1 overflow-y-auto">
        {!queryResponse && !loading && (
          <div className="text-center py-8">
            <MessagesSquare className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-lg font-medium text-gray-900 dark:text-gray-100">
              Ask me anything about your finances
            </h3>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              I can help with portfolio analysis, investment advice, goal tracking, and more.
            </p>
            <div className="mt-6 grid grid-cols-1 gap-2 md:grid-cols-2">
              {[
                "How is my portfolio performing?",
                "Should I increase my gold allocation?",
                "What are my top performing investments?",
                "Am I on track for my retirement goal?"
              ].map((suggestion) => (
                <Button
                  key={suggestion}
                  variant="outline"
                  size="sm"
                  className="justify-start text-left"
                  onClick={() => handleSuggestedQuestion(suggestion)}
                >
                  <Search className="mr-2 h-3.5 w-3.5" />
                  {suggestion}
                </Button>
              ))}
            </div>
            
            {queryHistory.length > 0 && (
              <div className="mt-8">
                <h4 className="text-sm font-medium text-gray-900 dark:text-gray-100 mb-2">Recent Questions</h4>
                <div className="space-y-1">
                  {queryHistory.map((item, index) => (
                    <Button
                      key={index}
                      variant="ghost"
                      size="sm"
                      className="w-full justify-start text-left"
                      onClick={() => handleSuggestedQuestion(item.query)}
                    >
                      <Search className="mr-2 h-3.5 w-3.5 text-gray-500" />
                      <span className="truncate">{item.query}</span>
                    </Button>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
        
        {loading && (
          <div className="flex flex-col items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <p className="mt-4 text-sm text-gray-500">Analyzing your portfolio and market data...</p>
          </div>
        )}
        
        {queryResponse && (
          <div ref={responseRef} className="space-y-4">
            <div className="flex items-start space-x-2">
              <div className="bg-primary/10 rounded-lg p-4 flex-1">
                <div className="flex justify-between">
                  <h3 className="font-medium text-primary">{queryResponse.answer}</h3>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-6 w-6"
                    onClick={copyToClipboard}
                  >
                    {copied ? (
                      <CheckCheck className="h-4 w-4 text-green-500" />
                    ) : (
                      <Copy className="h-4 w-4" />
                    )}
                  </Button>
                </div>
                <div className="mt-2 text-xs text-gray-500">
                  Confidence: {(queryResponse.confidence * 100).toFixed(0)}%
                </div>
              </div>
            </div>
            
            {queryResponse.relatedInsights.length > 0 && (
              <div>
                <h3 className="text-sm font-medium text-gray-900 dark:text-gray-100 mb-2">
                  Related Insights
                </h3>
                <div className="space-y-2">
                  {queryResponse.relatedInsights.map((insight) => (
                    <InsightCard
                      key={insight.id}
                      insight={insight}
                      onMarkAsRead={markAsRead}
                    />
                  ))}
                </div>
              </div>
            )}
            
            {queryResponse.suggestedQuestions.length > 0 && (
              <div>
                <h3 className="text-sm font-medium text-gray-900 dark:text-gray-100 mb-2">
                  You might also want to ask:
                </h3>
                <div className="flex flex-wrap gap-2">
                  {queryResponse.suggestedQuestions.map((question, index) => (
                    <Button
                      key={index}
                      variant="outline"
                      size="sm"
                      onClick={() => handleSuggestedQuestion(question)}
                    >
                      {question}
                    </Button>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </CardContent>
      <CardFooter className="p-4 pt-2 border-t">
        <form onSubmit={handleSubmit} className="w-full flex gap-2">
          <div className="relative flex-1">
            <Input
              ref={inputRef}
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Ask about your investments..."
              className="pr-8"
              disabled={loading}
            />
            {query && (
              <button
                type="button"
                className="absolute right-2 top-2 text-gray-500 hover:text-gray-700"
                onClick={() => setQuery('')}
              >
                <XCircle className="h-4 w-4" />
              </button>
            )}
          </div>
          <Button type="submit" disabled={!query.trim() || loading}>
            {loading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Send className="h-4 w-4" />
            )}
          </Button>
        </form>
      </CardFooter>
    </Card>
  );
};
