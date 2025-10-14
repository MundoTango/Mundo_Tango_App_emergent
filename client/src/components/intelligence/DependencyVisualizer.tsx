/**
 * DEPENDENCY VISUALIZER
 * MB.MD Phase 9 - Track 75
 * 
 * Interactive dependency graph with D3-style visualization
 */

import { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Network, GitBranch, AlertTriangle, CheckCircle } from 'lucide-react';

interface Node {
  id: string;
  label: string;
  color: string;
  size: number;
}

interface Edge {
  from: string;
  to: string;
  label: string;
  color: string;
}

export default function DependencyVisualizer() {
  const [graph, setGraph] = useState<{ nodes: Node[]; edges: Edge[] } | null>(null);
  const [selectedNode, setSelectedNode] = useState<Node | null>(null);

  const mapMutation = useMutation({
    mutationFn: async (entities: any[]) => {
      const result = await apiRequest('/api/phase9/dependency/map', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ entities }),
      });
      return result.json();
    },
    onSuccess: async (data) => {
      // Generate visualization
      const vizResult = await apiRequest('/api/phase9/dependency/visualize', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ graph: data }),
      });
      const vizData = await vizResult.json();
      setGraph(vizData);
    },
  });

  const optimizeMutation = useMutation({
    mutationFn: async (graphData: any) => {
      const result = await apiRequest('/api/phase9/dependency/optimize', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ graph: graphData }),
      });
      return result.json();
    },
  });

  const handleMapDependencies = () => {
    const sampleEntities = [
      { id: 'task-1', name: 'Authentication System', type: 'task', metadata: { requires: ['database'] } },
      { id: 'task-2', name: 'User Dashboard', type: 'task', metadata: { requires: ['auth'] } },
      { id: 'agent-110', name: 'Code Intelligence', type: 'agent', metadata: {} },
      { id: 'api-auth', name: 'Auth API', type: 'api', metadata: {} },
    ];
    
    mapMutation.mutate(sampleEntities);
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Dependency Visualizer</h1>
          <p className="text-muted-foreground">
            Interactive dependency graph analysis
          </p>
        </div>
        
        <div className="flex gap-2">
          <Button
            onClick={handleMapDependencies}
            disabled={mapMutation.isPending}
            data-testid="button-map-dependencies"
          >
            <Network className="mr-2 h-4 w-4" />
            {mapMutation.isPending ? 'Mapping...' : 'Map Dependencies'}
          </Button>
          
          {graph && (
            <Button
              variant="outline"
              onClick={() => optimizeMutation.mutate(graph)}
              disabled={optimizeMutation.isPending}
              data-testid="button-optimize"
            >
              <CheckCircle className="mr-2 h-4 w-4" />
              Optimize
            </Button>
          )}
        </div>
      </div>

      {/* Graph Visualization */}
      <div className="grid gap-4 lg:grid-cols-3">
        {/* Graph Canvas */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <GitBranch className="h-5 w-5" />
              Dependency Graph
            </CardTitle>
          </CardHeader>
          <CardContent>
            {!graph ? (
              <div className="flex items-center justify-center h-96 bg-muted rounded-lg">
                <div className="text-center text-muted-foreground">
                  <Network className="h-12 w-12 mx-auto mb-2 opacity-50" />
                  <p>Click "Map Dependencies" to visualize</p>
                </div>
              </div>
            ) : (
              <div className="relative h-96 bg-muted rounded-lg p-4" data-testid="graph-canvas">
                {/* Simple SVG visualization */}
                <svg className="w-full h-full">
                  {/* Draw edges */}
                  {graph.edges.map((edge, i) => {
                    const fromNode = graph.nodes.find(n => n.id === edge.from);
                    const toNode = graph.nodes.find(n => n.id === edge.to);
                    if (!fromNode || !toNode) return null;
                    
                    const x1 = (i * 100) % 600;
                    const y1 = Math.floor(i / 6) * 100 + 50;
                    const x2 = ((i + 1) * 100) % 600;
                    const y2 = Math.floor((i + 1) / 6) * 100 + 50;
                    
                    return (
                      <line
                        key={`edge-${i}`}
                        x1={x1}
                        y1={y1}
                        x2={x2}
                        y2={y2}
                        stroke={edge.color}
                        strokeWidth="2"
                        markerEnd="url(#arrowhead)"
                      />
                    );
                  })}
                  
                  {/* Draw nodes */}
                  {graph.nodes.map((node, i) => {
                    const x = (i * 100) % 600;
                    const y = Math.floor(i / 6) * 100 + 50;
                    
                    return (
                      <g key={node.id} data-testid={`node-${node.id}`}>
                        <circle
                          cx={x}
                          cy={y}
                          r={node.size}
                          fill={node.color}
                          onClick={() => setSelectedNode(node)}
                          className="cursor-pointer hover:opacity-80 transition-opacity"
                        />
                        <text
                          x={x}
                          y={y + 35}
                          textAnchor="middle"
                          className="text-xs fill-current"
                        >
                          {node.label.slice(0, 12)}
                        </text>
                      </g>
                    );
                  })}
                  
                  {/* Arrow marker */}
                  <defs>
                    <marker
                      id="arrowhead"
                      markerWidth="10"
                      markerHeight="7"
                      refX="9"
                      refY="3.5"
                      orient="auto"
                    >
                      <polygon points="0 0, 10 3.5, 0 7" fill="#6b7280" />
                    </marker>
                  </defs>
                </svg>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Node Details & Optimizations */}
        <div className="space-y-4">
          {/* Selected Node */}
          {selectedNode && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Node Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <div>
                  <span className="text-sm font-medium">ID:</span>
                  <p className="text-sm text-muted-foreground">{selectedNode.id}</p>
                </div>
                <div>
                  <span className="text-sm font-medium">Label:</span>
                  <p className="text-sm text-muted-foreground">{selectedNode.label}</p>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium">Status:</span>
                  <div
                    className="h-3 w-3 rounded-full"
                    style={{ backgroundColor: selectedNode.color }}
                  />
                </div>
              </CardContent>
            </Card>
          )}

          {/* Optimization Suggestions */}
          {optimizeMutation.data?.suggestions && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <AlertTriangle className="h-4 w-4" />
                  Optimizations
                </CardTitle>
                <CardDescription>
                  {optimizeMutation.data.suggestions.length} suggestions
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                {optimizeMutation.data.suggestions.map((sugg: any, i: number) => (
                  <div key={i} className="p-3 border rounded-lg" data-testid={`suggestion-${i}`}>
                    <Badge className="mb-2">{sugg.type}</Badge>
                    <p className="text-sm">{sugg.description}</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      Impact: {sugg.impact}
                    </p>
                  </div>
                ))}
              </CardContent>
            </Card>
          )}

          {/* Graph Stats */}
          {graph && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Graph Statistics</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Nodes:</span>
                  <span className="font-medium">{graph.nodes.length}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Edges:</span>
                  <span className="font-medium">{graph.edges.length}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Complexity:</span>
                  <span className="font-medium">
                    {graph.edges.length / graph.nodes.length > 1.5 ? 'High' : 'Moderate'}
                  </span>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
