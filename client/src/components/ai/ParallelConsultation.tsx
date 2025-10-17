import { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Send, Copy, CheckCircle2, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';
import type { AIModel, EnsembleRequest } from '@shared/multi-ai-types';

interface ModelResponse {
  model: string;
  content: string;
  latency: number;
}

export function ParallelConsultation() {
  const { toast } = useToast();
  const [query, setQuery] = useState('');
  const [selectedModels, setSelectedModels] = useState<AIModel[]>(['claude', 'openai']);
  const [responses, setResponses] = useState<ModelResponse[]>([]);

  const consultMutation = useMutation({
    mutationFn: async (request: EnsembleRequest) => {
      return apiRequest('/api/ai/consult', {
        method: 'POST',
        body: JSON.stringify(request),
      });
    },
    onSuccess: (data: any) => {
      setResponses(data.responses || []);
    },
    onError: (error) => {
      toast({
        title: 'Consultation failed',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  const toggleModel = (model: AIModel) => {
    if (selectedModels.includes(model)) {
      setSelectedModels(selectedModels.filter(m => m !== model));
    } else {
      if (selectedModels.length < 3) {
        setSelectedModels([...selectedModels, model]);
      }
    }
  };

  const handleSubmit = () => {
    if (!query.trim()) {
      toast({
        title: 'Empty query',
        description: 'Please enter a question',
        variant: 'destructive',
      });
      return;
    }

    if (selectedModels.length < 2) {
      toast({
        title: 'Select models',
        description: 'Choose at least 2 AI models for parallel consultation',
        variant: 'destructive',
      });
      return;
    }

    const request: EnsembleRequest = {
      query: query.trim(),
      models: selectedModels,
      synthesize: false,
    };

    consultMutation.mutate(request);
  };

  const copyResponse = (content: string, model: string) => {
    navigator.clipboard.writeText(content);
    toast({
      title: 'Copied!',
      description: `${model} response copied to clipboard`,
    });
  };

  return (
    <div className="space-y-6">
      {/* Model Selection */}
      <Card>
        <CardHeader>
          <CardTitle>Select AI Models (2-3)</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="flex items-center space-x-2">
              <Checkbox
                id="claude"
                checked={selectedModels.includes('claude')}
                onCheckedChange={() => toggleModel('claude')}
                data-testid="checkbox-claude"
              />
              <Label htmlFor="claude" className="cursor-pointer">
                Claude Sonnet 4.5
              </Label>
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox
                id="openai"
                checked={selectedModels.includes('openai')}
                onCheckedChange={() => toggleModel('openai')}
                data-testid="checkbox-openai"
              />
              <Label htmlFor="openai" className="cursor-pointer">
                GPT-4o
              </Label>
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox
                id="gemini"
                checked={selectedModels.includes('gemini')}
                onCheckedChange={() => toggleModel('gemini')}
                data-testid="checkbox-gemini"
              />
              <Label htmlFor="gemini" className="cursor-pointer">
                Gemini 2.5 Pro
              </Label>
            </div>
          </div>

          <Textarea
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Enter your question for parallel AI consultation..."
            className="min-h-[100px]"
            data-testid="input-query"
          />

          <Button
            onClick={handleSubmit}
            disabled={consultMutation.isPending || selectedModels.length < 2}
            className="w-full bg-gradient-to-r from-cyan-500 to-blue-500"
            data-testid="button-submit"
          >
            {consultMutation.isPending ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Consulting {selectedModels.length} AIs...
              </>
            ) : (
              <>
                <Send className="w-4 h-4 mr-2" />
                Consult {selectedModels.length} AI Models
              </>
            )}
          </Button>
        </CardContent>
      </Card>

      {/* Parallel Responses */}
      {responses.length > 0 && (
        <div className={`grid grid-cols-1 ${responses.length === 2 ? 'md:grid-cols-2' : 'md:grid-cols-3'} gap-4`}>
          {responses.map((response, index) => (
            <Card
              key={index}
              className="bg-gradient-to-br from-purple-500/10 to-pink-500/10 border-purple-500/20"
              data-testid={`response-${response.model}`}
            >
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg">{response.model}</CardTitle>
                  <div className="flex gap-2">
                    <Badge variant="outline">{response.latency}ms</Badge>
                    <Button
                      size="icon"
                      variant="ghost"
                      onClick={() => copyResponse(response.content, response.model)}
                      data-testid={`button-copy-${response.model}`}
                    >
                      <Copy className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="prose dark:prose-invert max-w-none text-sm">
                  <p className="whitespace-pre-wrap">{response.content}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
