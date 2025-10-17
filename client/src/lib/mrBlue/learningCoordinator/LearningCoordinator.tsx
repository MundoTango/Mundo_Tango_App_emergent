import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ArrowUp, ArrowRight, ArrowDown, Brain, TrendingUp } from 'lucide-react';
import { apiRequest } from '@/lib/queryClient';

/**
 * TRACK 2: Agent #80 Learning Coordinator
 * Knowledge flows UP (to CEO) and ACROSS (to peers) and DOWN (to all)
 * 
 * Features:
 * - Knowledge capture from all 113 agents
 * - UP flow: Strategic patterns → CEO
 * - ACROSS flow: Tactical solutions → Peers
 * - DOWN flow: Best practices → All agents
 * - Effectiveness tracking
 */

interface Learning {
  id: string;
  agentId: string;
  agentName: string;
  pattern: string;
  category: 'strategic' | 'tactical' | 'best-practice';
  flowDirection: 'UP' | 'ACROSS' | 'DOWN';
  recipients: string[];
  effectiveness: number;
  timesReused: number;
  timestamp: Date;
}

interface KnowledgeFlow {
  direction: 'UP' | 'ACROSS' | 'DOWN';
  count: number;
  avgEffectiveness: number;
  recentLearnings: Learning[];
}

export default function LearningCoordinator() {
  const [upFlow, setUpFlow] = useState<KnowledgeFlow | null>(null);
  const [acrossFlow, setAcrossFlow] = useState<KnowledgeFlow | null>(null);
  const [downFlow, setDownFlow] = useState<KnowledgeFlow | null>(null);
  const [recentLearnings, setRecentLearnings] = useState<Learning[]>([]);

  // Load knowledge flows
  useEffect(() => {
    const loadFlows = async () => {
      try {
        const flows = await apiRequest<{ up: KnowledgeFlow; across: KnowledgeFlow; down: KnowledgeFlow }>('/api/learning-coordinator/flows');
        setUpFlow(flows.up);
        setAcrossFlow(flows.across);
        setDownFlow(flows.down);
      } catch (error) {
        console.error('Failed to load knowledge flows:', error);
      }
    };

    loadFlows();
    const interval = setInterval(loadFlows, 30000); // Refresh every 30s
    return () => clearInterval(interval);
  }, []);

  // Capture new learning
  const captureLearning = async (learning: Omit<Learning, 'id' | 'timestamp'>) => {
    try {
      await apiRequest('/api/learning-coordinator/capture', {
        method: 'POST',
        body: JSON.stringify(learning)
      });
    } catch (error) {
      console.error('Failed to capture learning:', error);
    }
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center gap-3">
        <Brain className="w-8 h-8 text-primary" />
        <div>
          <h2 className="text-2xl font-bold">Learning Coordinator</h2>
          <p className="text-sm text-muted-foreground">
            Agent #80 - Knowledge Flow System
          </p>
        </div>
      </div>

      {/* Knowledge Flow Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="border-blue-500/50">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium">UP Flow</CardTitle>
              <ArrowUp className="w-5 h-5 text-blue-500" />
            </div>
            <CardDescription>Patterns → CEO Agent #0</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{upFlow?.count || 0}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Strategic insights
            </p>
            <div className="flex items-center gap-2 mt-2">
              <TrendingUp className="w-4 h-4 text-green-500" />
              <span className="text-sm">
                {Math.round((upFlow?.avgEffectiveness || 0) * 100)}% effective
              </span>
            </div>
          </CardContent>
        </Card>

        <Card className="border-purple-500/50">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium">ACROSS Flow</CardTitle>
              <ArrowRight className="w-5 h-5 text-purple-500" />
            </div>
            <CardDescription>Solutions → Peer Agents</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{acrossFlow?.count || 0}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Tactical solutions
            </p>
            <div className="flex items-center gap-2 mt-2">
              <TrendingUp className="w-4 h-4 text-green-500" />
              <span className="text-sm">
                {Math.round((acrossFlow?.avgEffectiveness || 0) * 100)}% effective
              </span>
            </div>
          </CardContent>
        </Card>

        <Card className="border-green-500/50">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium">DOWN Flow</CardTitle>
              <ArrowDown className="w-5 h-5 text-green-500" />
            </div>
            <CardDescription>Best Practices → All Agents</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{downFlow?.count || 0}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Standard practices
            </p>
            <div className="flex items-center gap-2 mt-2">
              <TrendingUp className="w-4 h-4 text-green-500" />
              <span className="text-sm">
                {Math.round((downFlow?.avgEffectiveness || 0) * 100)}% effective
              </span>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="recent" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="recent">Recent Learnings</TabsTrigger>
          <TabsTrigger value="up">UP Flow</TabsTrigger>
          <TabsTrigger value="across">ACROSS Flow</TabsTrigger>
          <TabsTrigger value="down">DOWN Flow</TabsTrigger>
        </TabsList>

        {/* Recent Learnings */}
        <TabsContent value="recent" className="space-y-3">
          {(recentLearnings.length > 0 ? recentLearnings : (upFlow?.recentLearnings || [])).map((learning) => (
            <Card key={learning.id} className="p-4">
              <div className="flex items-start justify-between mb-2">
                <div className="flex items-center gap-2">
                  <Badge variant="outline">{learning.agentName}</Badge>
                  <Badge 
                    variant={
                      learning.flowDirection === 'UP' ? 'default' :
                      learning.flowDirection === 'ACROSS' ? 'secondary' :
                      'outline'
                    }
                  >
                    {learning.flowDirection === 'UP' && <ArrowUp className="w-3 h-3 mr-1" />}
                    {learning.flowDirection === 'ACROSS' && <ArrowRight className="w-3 h-3 mr-1" />}
                    {learning.flowDirection === 'DOWN' && <ArrowDown className="w-3 h-3 mr-1" />}
                    {learning.flowDirection}
                  </Badge>
                </div>
                <span className="text-xs text-muted-foreground">
                  {new Date(learning.timestamp).toLocaleDateString()}
                </span>
              </div>
              <p className="text-sm">{learning.pattern}</p>
              <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                <span>Reused: {learning.timesReused} times</span>
                <span>Effectiveness: {Math.round(learning.effectiveness * 100)}%</span>
              </div>
            </Card>
          ))}
        </TabsContent>

        {/* UP Flow Details */}
        <TabsContent value="up" className="space-y-3">
          <Card>
            <CardHeader>
              <CardTitle>Strategic Patterns → CEO</CardTitle>
              <CardDescription>
                Important insights that influence platform strategy
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {upFlow?.recentLearnings.map((learning) => (
                <div key={learning.id} className="p-3 bg-blue-500/5 rounded-lg border border-blue-500/20">
                  <div className="flex items-center gap-2 mb-2">
                    <Badge>{learning.agentName}</Badge>
                    <ArrowUp className="w-4 h-4 text-blue-500" />
                    <Badge variant="outline">CEO Agent #0</Badge>
                  </div>
                  <p className="text-sm">{learning.pattern}</p>
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>

        {/* ACROSS Flow Details */}
        <TabsContent value="across" className="space-y-3">
          <Card>
            <CardHeader>
              <CardTitle>Tactical Solutions → Peers</CardTitle>
              <CardDescription>
                Practical fixes shared between agents
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {acrossFlow?.recentLearnings.map((learning) => (
                <div key={learning.id} className="p-3 bg-purple-500/5 rounded-lg border border-purple-500/20">
                  <div className="flex items-center gap-2 mb-2">
                    <Badge>{learning.agentName}</Badge>
                    <ArrowRight className="w-4 h-4 text-purple-500" />
                    <div className="flex gap-1">
                      {learning.recipients.slice(0, 3).map((r) => (
                        <Badge key={r} variant="outline" className="text-xs">{r}</Badge>
                      ))}
                      {learning.recipients.length > 3 && (
                        <Badge variant="outline" className="text-xs">
                          +{learning.recipients.length - 3}
                        </Badge>
                      )}
                    </div>
                  </div>
                  <p className="text-sm">{learning.pattern}</p>
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>

        {/* DOWN Flow Details */}
        <TabsContent value="down" className="space-y-3">
          <Card>
            <CardHeader>
              <CardTitle>Best Practices → All Agents</CardTitle>
              <CardDescription>
                Standard practices distributed to entire system
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {downFlow?.recentLearnings.map((learning) => (
                <div key={learning.id} className="p-3 bg-green-500/5 rounded-lg border border-green-500/20">
                  <div className="flex items-center gap-2 mb-2">
                    <Badge>{learning.agentName}</Badge>
                    <ArrowDown className="w-4 h-4 text-green-500" />
                    <Badge variant="outline">All 113 Agents</Badge>
                  </div>
                  <p className="text-sm font-medium mb-1">Best Practice:</p>
                  <p className="text-sm">{learning.pattern}</p>
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Knowledge Flow Diagram */}
      <Card>
        <CardHeader>
          <CardTitle>Knowledge Flow Architecture</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center gap-6 py-4">
            <div className="text-center">
              <div className="w-24 h-24 rounded-full bg-primary/20 flex items-center justify-center mb-2">
                <span className="text-2xl font-bold">CEO</span>
              </div>
              <p className="text-sm text-muted-foreground">Agent #0</p>
            </div>

            <div className="flex items-center gap-12">
              <div className="flex flex-col items-center">
                <ArrowUp className="w-8 h-8 text-blue-500 mb-2" />
                <Badge className="bg-blue-500">UP</Badge>
                <p className="text-xs mt-1">Strategic</p>
              </div>

              <div className="flex flex-col items-center">
                <ArrowRight className="w-8 h-8 text-purple-500 mb-2" />
                <Badge className="bg-purple-500">ACROSS</Badge>
                <p className="text-xs mt-1">Tactical</p>
              </div>

              <div className="flex flex-col items-center">
                <ArrowDown className="w-8 h-8 text-green-500 mb-2" />
                <Badge className="bg-green-500">DOWN</Badge>
                <p className="text-xs mt-1">Standards</p>
              </div>
            </div>

            <div className="grid grid-cols-4 gap-4">
              {['Layer Agents', 'Expert Agents', 'Operational', 'Life CEO'].map((group) => (
                <div key={group} className="text-center">
                  <div className="w-16 h-16 rounded-lg bg-muted flex items-center justify-center mb-1">
                    <Brain className="w-6 h-6" />
                  </div>
                  <p className="text-xs text-muted-foreground">{group}</p>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
