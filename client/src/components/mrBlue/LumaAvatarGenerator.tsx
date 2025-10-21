import { useState } from 'react';
import { useMutation, useQuery } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Loader2, Sparkles, Download, CheckCircle2, XCircle, AlertCircle } from 'lucide-react';
import { apiRequest, queryClient } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';

interface Generation {
  id: string;
  state: 'queued' | 'dreaming' | 'completed' | 'failed';
  assets?: {
    model?: string;
    preview?: string;
  };
  failure_reason?: string;
  created_at: string;
}

interface LumaAvatarGeneratorProps {
  onAvatarReady?: (glbUrl: string) => void;
}

export default function LumaAvatarGenerator({ onAvatarReady }: LumaAvatarGeneratorProps) {
  const { toast } = useToast();
  const [currentGenerationId, setCurrentGenerationId] = useState<string | null>(null);
  
  const generateMutation = useMutation({
    mutationFn: async () => {
      return await apiRequest('/api/luma/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          characterName: 'Scott',
          hairColor: 'blue',
          quality: 'high',
          style: 'stylized'
        })
      });
    },
    onSuccess: (data: any) => {
      if (data.success) {
        setCurrentGenerationId(data.generationId);
        toast({
          title: 'Generation Started',
          description: 'Scott avatar is being created. This takes 5-10 minutes.',
        });
      }
    },
    onError: (error: any) => {
      toast({
        title: 'Generation Failed',
        description: error.message || 'Failed to start avatar generation',
        variant: 'destructive'
      });
    }
  });
  
  const { data: statusData, isLoading: isCheckingStatus } = useQuery<{ success: boolean; generation: Generation }>({
    queryKey: ['/api/luma/status', currentGenerationId],
    enabled: !!currentGenerationId,
    refetchInterval: (query) => {
      const generation = query.state.data?.generation;
      if (generation?.state === 'completed' || generation?.state === 'failed') {
        return false;
      }
      return 5000;
    },
  });
  
  const downloadMutation = useMutation({
    mutationFn: async (generationId: string) => {
      return await apiRequest(`/api/luma/download/${generationId}`, {
        method: 'POST'
      });
    },
    onSuccess: (data: any) => {
      if (data.success && data.localPath) {
        toast({
          title: 'Avatar Downloaded',
          description: 'Scott avatar is ready to use!',
        });
        onAvatarReady?.(data.localPath);
        queryClient.invalidateQueries({ queryKey: ['/api/luma/history'] });
      }
    },
    onError: (error: any) => {
      toast({
        title: 'Download Failed',
        description: error.message || 'Failed to download avatar',
        variant: 'destructive'
      });
    }
  });
  
  const generation = statusData?.generation;
  
  const getStatusDisplay = () => {
    if (!generation) return null;
    
    switch (generation.state) {
      case 'queued':
        return {
          icon: <AlertCircle className="h-5 w-5 text-yellow-500" />,
          text: 'Queued for generation...',
          color: 'text-yellow-500'
        };
      case 'dreaming':
        return {
          icon: <Loader2 className="h-5 w-5 text-cyan-500 animate-spin" />,
          text: 'AI is creating your avatar...',
          color: 'text-cyan-500'
        };
      case 'completed':
        return {
          icon: <CheckCircle2 className="h-5 w-5 text-green-500" />,
          text: 'Avatar generation complete!',
          color: 'text-green-500'
        };
      case 'failed':
        return {
          icon: <XCircle className="h-5 w-5 text-red-500" />,
          text: `Generation failed: ${generation.failure_reason || 'Unknown error'}`,
          color: 'text-red-500'
        };
    }
  };
  
  const statusDisplay = getStatusDisplay();
  
  return (
    <Card className="p-6 bg-black/40 backdrop-blur-md border-cyan-500/30">
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold text-white flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-cyan-400" />
              Luma Labs AI Avatar Generator
            </h3>
            <p className="text-sm text-gray-400 mt-1">
              Professional 3D avatar generation powered by Luma AI
            </p>
          </div>
        </div>
        
        {!currentGenerationId ? (
          <div className="text-center py-8">
            <div className="mb-4 text-gray-400">
              Click below to generate a professional 3D avatar for Scott using Luma Labs AI.
              Generation takes approximately 5-10 minutes.
            </div>
            <Button
              onClick={() => generateMutation.mutate()}
              disabled={generateMutation.isPending}
              className="bg-gradient-to-r from-cyan-500 to-teal-500 hover:from-cyan-600 hover:to-teal-600"
              data-testid="button-generate-avatar"
            >
              {generateMutation.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Starting Generation...
                </>
              ) : (
                <>
                  <Sparkles className="mr-2 h-4 w-4" />
                  Generate Scott Avatar
                </>
              )}
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            {statusDisplay && (
              <div className={`flex items-center gap-3 p-4 rounded-lg bg-black/20 border border-cyan-500/20 ${statusDisplay.color}`}>
                {statusDisplay.icon}
                <span className="font-medium">{statusDisplay.text}</span>
              </div>
            )}
            
            {generation?.state === 'dreaming' && (
              <div className="space-y-2">
                <div className="h-2 bg-black/40 rounded-full overflow-hidden">
                  <div className="h-full bg-gradient-to-r from-cyan-500 to-teal-500 animate-pulse" style={{ width: '60%' }} />
                </div>
                <p className="text-xs text-gray-500 text-center">
                  AI is crafting your avatar with blue hair, turquoise jewelry, and professional style...
                </p>
              </div>
            )}
            
            {generation?.assets?.preview && (
              <div className="rounded-lg overflow-hidden border border-cyan-500/30">
                <img 
                  src={generation.assets.preview} 
                  alt="Avatar Preview" 
                  className="w-full h-64 object-cover"
                />
              </div>
            )}
            
            {generation?.state === 'completed' && (
              <div className="flex gap-3">
                <Button
                  onClick={() => downloadMutation.mutate(generation.id)}
                  disabled={downloadMutation.isPending}
                  className="flex-1 bg-gradient-to-r from-cyan-500 to-teal-500 hover:from-cyan-600 hover:to-teal-600"
                  data-testid="button-download-avatar"
                >
                  {downloadMutation.isPending ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Downloading...
                    </>
                  ) : (
                    <>
                      <Download className="mr-2 h-4 w-4" />
                      Download & Apply Avatar
                    </>
                  )}
                </Button>
                <Button
                  onClick={() => {
                    setCurrentGenerationId(null);
                    generateMutation.reset();
                  }}
                  variant="outline"
                  className="border-cyan-500/30 hover:bg-cyan-500/10"
                  data-testid="button-regenerate"
                >
                  <Sparkles className="mr-2 h-4 w-4" />
                  Regenerate
                </Button>
              </div>
            )}
            
            {generation?.state === 'failed' && (
              <Button
                onClick={() => {
                  setCurrentGenerationId(null);
                  generateMutation.reset();
                }}
                variant="outline"
                className="w-full border-red-500/30 hover:bg-red-500/10"
                data-testid="button-retry"
              >
                Try Again
              </Button>
            )}
          </div>
        )}
      </div>
    </Card>
  );
}
