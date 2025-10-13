import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Search, Lightbulb, Code, Users } from 'lucide-react';
import { apiRequest } from '@/lib/queryClient';

/**
 * TRACK 1: Agent #79 Quality Validator
 * Collaborative agent-to-agent problem solving
 * 
 * Features:
 * - Root cause analysis
 * - Pattern library search
 * - Solution suggestions with code
 * - Agent collaboration
 */

interface Pattern {
  id: string;
  issue: string;
  rootCause: string;
  solution: string;
  codeExample: string;
  similarityScore: number;
  timesReused: number;
  effectiveness: number;
  agentId: string;
}

interface RootCauseAnalysis {
  issue: string;
  rootCause: string;
  suggestedFix: string;
  relatedPatterns: Pattern[];
}

export default function QualityValidator() {
  const [issue, setIssue] = useState('');
  const [analysis, setAnalysis] = useState<RootCauseAnalysis | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [patterns, setPatterns] = useState<Pattern[]>([]);

  // Analyze issue and find root cause
  const analyzeIssue = async () => {
    setIsAnalyzing(true);
    try {
      const result = await apiRequest<RootCauseAnalysis>('/api/quality-validator/analyze', {
        method: 'POST',
        body: JSON.stringify({ issue })
      });
      setAnalysis(result);
    } catch (error) {
      console.error('Analysis failed:', error);
    } finally {
      setIsAnalyzing(false);
    }
  };

  // Search pattern library
  const searchPatterns = async (query: string) => {
    try {
      const results = await apiRequest<Pattern[]>('/api/quality-validator/search', {
        method: 'POST',
        body: JSON.stringify({ query })
      });
      setPatterns(results);
    } catch (error) {
      console.error('Pattern search failed:', error);
    }
  };

  // Ask peer agents for help
  const askPeerAgents = async (agentIds: string[]) => {
    try {
      await apiRequest('/api/quality-validator/collaborate', {
        method: 'POST',
        body: JSON.stringify({ issue, agentIds })
      });
    } catch (error) {
      console.error('Collaboration request failed:', error);
    }
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center gap-3">
        <Lightbulb className="w-8 h-8 text-primary" />
        <div>
          <h2 className="text-2xl font-bold">Quality Validator</h2>
          <p className="text-sm text-muted-foreground">
            Agent #79 - Collaborative Problem Solving
          </p>
        </div>
      </div>

      <Tabs defaultValue="analyze" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="analyze">Analyze Issue</TabsTrigger>
          <TabsTrigger value="patterns">Pattern Library</TabsTrigger>
          <TabsTrigger value="collaborate">Collaborate</TabsTrigger>
        </TabsList>

        {/* Tab 1: Root Cause Analysis */}
        <TabsContent value="analyze" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Root Cause Analysis</CardTitle>
              <CardDescription>
                Describe the issue and get AI-powered root cause analysis
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Describe the Issue:</label>
                <Input
                  value={issue}
                  onChange={(e) => setIssue(e.target.value)}
                  placeholder="e.g., Button click doesn't trigger form submission"
                  className="w-full"
                  data-testid="input-issue-description"
                />
              </div>

              <Button
                onClick={analyzeIssue}
                disabled={!issue || isAnalyzing}
                className="w-full"
                data-testid="button-analyze-issue"
              >
                {isAnalyzing ? 'Analyzing...' : 'Analyze Root Cause'}
              </Button>

              {analysis && (
                <div className="space-y-4 mt-6">
                  <div className="p-4 bg-destructive/10 rounded-lg">
                    <h4 className="font-semibold text-destructive mb-2">Root Cause:</h4>
                    <p className="text-sm">{analysis.rootCause}</p>
                  </div>

                  <div className="p-4 bg-primary/10 rounded-lg">
                    <h4 className="font-semibold text-primary mb-2">Suggested Fix:</h4>
                    <p className="text-sm">{analysis.suggestedFix}</p>
                  </div>

                  {analysis.relatedPatterns.length > 0 && (
                    <div>
                      <h4 className="font-semibold mb-2">Related Patterns:</h4>
                      <div className="space-y-2">
                        {analysis.relatedPatterns.map((pattern) => (
                          <Card key={pattern.id} className="p-4">
                            <div className="flex items-start justify-between">
                              <div className="flex-1">
                                <p className="font-medium">{pattern.issue}</p>
                                <p className="text-sm text-muted-foreground mt-1">
                                  {pattern.solution}
                                </p>
                              </div>
                              <Badge variant="secondary">
                                {Math.round(pattern.similarityScore * 100)}% match
                              </Badge>
                            </div>
                            {pattern.codeExample && (
                              <pre className="mt-2 p-2 bg-muted rounded text-xs overflow-x-auto">
                                <code>{pattern.codeExample}</code>
                              </pre>
                            )}
                          </Card>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Tab 2: Pattern Library Search */}
        <TabsContent value="patterns" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Pattern Library</CardTitle>
              <CardDescription>
                Search for proven solutions from past fixes
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex gap-2">
                <Input
                  value={searchQuery}
                  onChange={(e) => {
                    setSearchQuery(e.target.value);
                    if (e.target.value.length > 2) {
                      searchPatterns(e.target.value);
                    }
                  }}
                  placeholder="Search patterns... (e.g., form validation, API error)"
                  className="flex-1"
                  data-testid="input-pattern-search"
                />
                <Button variant="outline" size="icon">
                  <Search className="w-4 h-4" />
                </Button>
              </div>

              <div className="space-y-2">
                {patterns.map((pattern) => (
                  <Card key={pattern.id} className="p-4 hover:bg-accent transition-colors">
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex-1">
                        <h4 className="font-semibold">{pattern.issue}</h4>
                        <p className="text-sm text-muted-foreground mt-1">
                          Root Cause: {pattern.rootCause}
                        </p>
                      </div>
                      <div className="flex gap-2">
                        <Badge variant="outline">
                          <Code className="w-3 h-3 mr-1" />
                          {pattern.timesReused} reuses
                        </Badge>
                        <Badge variant="secondary">
                          {Math.round(pattern.effectiveness * 100)}% effective
                        </Badge>
                      </div>
                    </div>

                    <div className="p-3 bg-primary/5 rounded mt-2">
                      <p className="text-sm font-medium mb-1">Solution:</p>
                      <p className="text-sm">{pattern.solution}</p>
                    </div>

                    {pattern.codeExample && (
                      <details className="mt-2">
                        <summary className="cursor-pointer text-sm font-medium">
                          View Code Example
                        </summary>
                        <pre className="mt-2 p-3 bg-muted rounded text-xs overflow-x-auto">
                          <code>{pattern.codeExample}</code>
                        </pre>
                      </details>
                    )}
                  </Card>
                ))}

                {searchQuery && patterns.length === 0 && (
                  <p className="text-center text-muted-foreground py-8">
                    No patterns found. This might be a new issue - ask peer agents for help!
                  </p>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Tab 3: Agent Collaboration */}
        <TabsContent value="collaborate" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Agent Collaboration</CardTitle>
              <CardDescription>
                Request help from peer agents when no patterns exist
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                {[
                  { id: 'AGENT_1', name: 'Infrastructure', icon: '🏗️' },
                  { id: 'AGENT_2', name: 'Frontend', icon: '🎨' },
                  { id: 'AGENT_11', name: 'UI/UX', icon: '✨' },
                  { id: 'AGENT_14', name: 'Code Quality', icon: '🔍' },
                  { id: 'AGENT_31', name: 'AI Integration', icon: '🤖' },
                  { id: 'AGENT_54', name: 'Accessibility', icon: '♿' },
                ].map((agent) => (
                  <Button
                    key={agent.id}
                    variant="outline"
                    className="justify-start"
                    onClick={() => askPeerAgents([agent.id])}
                    data-testid={`button-ask-${agent.id.toLowerCase()}`}
                  >
                    <Users className="w-4 h-4 mr-2" />
                    <span className="mr-2">{agent.icon}</span>
                    Ask {agent.name}
                  </Button>
                ))}
              </div>

              <div className="p-4 bg-muted rounded-lg">
                <h4 className="font-semibold mb-2">How Collaboration Works:</h4>
                <ol className="text-sm space-y-1 list-decimal list-inside">
                  <li>Select relevant agent(s) for your issue</li>
                  <li>Agent #79 sends A2A message with context</li>
                  <li>Peer agent analyzes from their expertise</li>
                  <li>Solution returned with code examples</li>
                  <li>Pattern added to library for future reuse</li>
                </ol>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
