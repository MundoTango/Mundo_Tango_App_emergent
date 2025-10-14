import { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Send, Sparkles, Clock, DollarSign } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { ModelSelector } from './ModelSelector';
import { apiRequest } from '@/lib/queryClient';
import type { AIRouteRequest, AIRouteResponse, ModelPreference } from '@shared/multi-ai-types';

export function AIQueryInterface() {
  const { toast } = useToast();
  const [query, setQuery] = useState('');
  const [preference, setPreference] = useState<ModelPreference>({
    costPriority: 'balanced',
    autoRoute: true,
  });

  const queryMutation = useMutation<AIRouteResponse, Error, AIRouteRequest>({
    mutationFn: async (request: AIRouteRequest) => {
      const response = await apiRequest('/api/ai/route', {
        method: 'POST',
        body: JSON.stringify(request),
      });
      return response as unknown as AIRouteResponse;
    },
    onError: (error) => {
      toast({
        title: 'Query failed',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  const handleSubmit = () => {
    if (!query.trim()) {
      toast({
        title: 'Empty query',
        description: 'Please enter a question or prompt',
        variant: 'destructive',
      });
      return;
    }

    const request: AIRouteRequest = {
      query: query.trim(),
      ...(preference.autoRoute
        ? { costPriority: preference.costPriority }
        : { preferredModel: preference.preferredModel }
      ),
    };

    queryMutation.mutate(request);
  };

  return (
    <div className="space-y-6">
      {/* Model Configuration */}
      <ModelSelector preference={preference} onChange={setPreference} />

      {/* Query Input */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-cyan-500" />
            Ask AI
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Textarea
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Enter your question or prompt..."
            className="min-h-[120px] resize-none"
            data-testid="input-query"
          />
          
          <div className="flex justify-between items-center">
            <div className="text-sm text-muted-foreground">
              {query.length} characters
            </div>
            <Button
              onClick={handleSubmit}
              disabled={queryMutation.isPending || !query.trim()}
              className="bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600"
              data-testid="button-submit"
            >
              {queryMutation.isPending ? (
                <>Processing...</>
              ) : (
                <>
                  <Send className="w-4 h-4 mr-2" />
                  Submit Query
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Response */}
      {queryMutation.data && (
        <Card className="bg-gradient-to-br from-green-500/10 to-emerald-500/10 border-green-500/20">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-green-500" />
                AI Response
              </CardTitle>
              <div className="flex gap-2">
                <Badge variant="outline" data-testid="badge-model">
                  {queryMutation.data.model}
                </Badge>
                <Badge variant="outline" data-testid="badge-complexity">
                  {queryMutation.data.complexity} complexity
                </Badge>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* AI Response Content */}
            <div className="prose dark:prose-invert max-w-none" data-testid="response-content">
              <p className="whitespace-pre-wrap">{queryMutation.data.content}</p>
            </div>

            {/* Routing Metadata */}
            <div className="pt-4 border-t space-y-2">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <DollarSign className="w-4 h-4" />
                <span>Estimated cost: ${queryMutation.data.routing.estimatedCost.toFixed(4)}</span>
              </div>
              <div className="text-sm text-muted-foreground" data-testid="routing-reasoning">
                <strong>Routing:</strong> {queryMutation.data.routing.reasoning}
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
