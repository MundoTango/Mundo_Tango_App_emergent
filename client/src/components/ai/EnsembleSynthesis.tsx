import { useState } from 'react'
import { useTranslation } from 'react-i18next';;
import { useMutation } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Send, Sparkles, TrendingUp, AlertTriangle, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';
import type { AIModel, EnsembleRequest, EnsembleResponse } from '@shared/multi-ai-types';

export function EnsembleSynthesis() {
  const { toast } = useToast();
  const [query, setQuery] = useState('');
  const [selectedModels, setSelectedModels] = useState<AIModel[]>(['claude', 'openai', 'gemini']);
  const [ensemble, setEnsemble] = useState<EnsembleResponse | null>(null);

  const ensembleMutation = useMutation<EnsembleResponse, Error, EnsembleRequest>({
    mutationFn: async (request: EnsembleRequest) => {
      const response = await apiRequest('/api/ai/ensemble', {
        method: 'POST',
        body: JSON.stringify(request),
      });
      return response as unknown as EnsembleResponse;
    },
    onSuccess: (data) => {
      setEnsemble(data);
    },
    onError: (error) => {
      toast({
        title: 'Ensemble synthesis failed',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  const toggleModel = (model: AIModel) => {
    if (selectedModels.includes(model)) {
      setSelectedModels(selectedModels.filter(m => m !== model));
    } else {
      setSelectedModels([...selectedModels, model]);
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
        description: 'Choose at least 2 AI models for ensemble synthesis',
        variant: 'destructive',
      });
      return;
    }

    const request: EnsembleRequest = {
      query: query.trim(),
      models: selectedModels,
      synthesize: true,
    };

    ensembleMutation.mutate(request);
  };

  return (
    <div className="space-y-6">
      {/* Input */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-cyan-500" />
            Ensemble AI Synthesis
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="flex items-center space-x-2">
              <Checkbox
                id="claude-ensemble"
                checked={selectedModels.includes('claude')}
                onCheckedChange={() => toggleModel('claude')}
                data-testid="checkbox-claude"
              />
              <Label htmlFor="claude-ensemble" className="cursor-pointer">Claude</Label>
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox
                id="openai-ensemble"
                checked={selectedModels.includes('openai')}
                onCheckedChange={() => toggleModel('openai')}
                data-testid="checkbox-openai"
              />
              <Label htmlFor="openai-ensemble" className="cursor-pointer">GPT-4o</Label>
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox
                id="gemini-ensemble"
                checked={selectedModels.includes('gemini')}
                onCheckedChange={() => toggleModel('gemini')}
                data-testid="checkbox-gemini"
              />
              <Label htmlFor="gemini-ensemble" className="cursor-pointer">Gemini</Label>
            </div>
          </div>

          <Textarea
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Enter a complex question for ensemble AI synthesis..."
            className="min-h-[120px]"
            data-testid="input-query"
          />

          <Button
            onClick={handleSubmit}
            disabled={ensembleMutation.isPending || selectedModels.length < 2}
            className="w-full bg-gradient-to-r from-purple-500 to-pink-500"
            data-testid="button-submit"
          >
            {ensembleMutation.isPending ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Synthesizing from {selectedModels.length} AIs...
              </>
            ) : (
              <>
                <Send className="w-4 h-4 mr-2" />
                Generate Ensemble Synthesis
              </>
            )}
          </Button>
        </CardContent>
      </Card>

      {/* Synthesis Result */}
      {ensemble?.synthesis && (
        <div className="space-y-4">
          {/* Consensus Score */}
          <Card className="bg-gradient-to-br from-green-500/10 to-emerald-500/10 border-green-500/20">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-green-500" />
                AI Consensus
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <div className="flex justify-between mb-2">
                  <span className="text-sm font-medium">Agreement Level</span>
                  <span className="text-sm font-bold" data-testid="consensus-percentage">
                    {(ensemble.synthesis.consensus * 100).toFixed(0)}%
                  </span>
                </div>
                <Progress value={ensemble.synthesis.consensus * 100} className="h-2" />
              </div>
              
              {ensemble.synthesis.consensus >= 0.8 && (
                <Badge variant="default" className="bg-green-500">
                  High Consensus
                </Badge>
              )}
              {ensemble.synthesis.consensus >= 0.5 && ensemble.synthesis.consensus < 0.8 && (
                <Badge variant="secondary">
                  Moderate Consensus
                </Badge>
              )}
              {ensemble.synthesis.consensus < 0.5 && (
                <Badge variant="destructive">
                  Low Consensus
                </Badge>
              )}
            </CardContent>
          </Card>

          {/* Combined Synthesis */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-purple-500" />
                Synthesized Answer
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="prose dark:prose-invert max-w-none" data-testid="synthesis-content">
                <p className="whitespace-pre-wrap">{ensemble.synthesis.combined}</p>
              </div>
            </CardContent>
          </Card>

          {/* Disagreements */}
          {ensemble.synthesis.disagreements.length > 0 && (
            <Card className="bg-gradient-to-br from-amber-500/10 to-orange-500/10 border-amber-500/20">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <AlertTriangle className="w-5 h-5 text-amber-500" />
                  Points of Disagreement
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2" data-testid="disagreements-list">
                  {ensemble.synthesis.disagreements.map((point, index) => (
                    <li key={index} className="flex items-start gap-2">
                      <span className="text-amber-500 mt-1">•</span>
                      <span className="text-sm">{point}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          )}

          {/* Individual Responses */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {ensemble.responses.map((response, index) => (
              <Card key={index} className="border-muted" data-testid={`individual-${response.model}`}>
                <CardHeader>
                  <div className="flex justify-between items-center">
                    <CardTitle className="text-sm">{response.model}</CardTitle>
                    <Badge variant="outline">{response.latency}ms</Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-sm text-muted-foreground">
                    <p className="line-clamp-4">{response.content}</p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
