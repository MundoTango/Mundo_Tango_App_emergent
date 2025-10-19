/**
 * Life CEO Agents Tab - 16 Specialized AI Agents
 */

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Brain } from 'lucide-react';

export function LifeCEOAgentsTab() {
  const [searchQuery, setSearchQuery] = useState('');

  const { data, isLoading } = useQuery<{ success: boolean; agents: any[]; count: number }>({
    queryKey: ['/api/mr-blue/agents'],
  });

  const agents = data?.agents || [];
  const filteredAgents = agents.filter(agent =>
    agent.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="flex flex-col h-full bg-gray-50 dark:bg-gray-950 p-4">
      <div className="mb-4">
        <Input
          placeholder="Search agents..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>

      {isLoading ? (
        <div className="text-center py-12">Loading agents...</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredAgents.map((agent) => (
            <Card key={agent.id}>
              <CardHeader className="pb-3">
                <div className="flex items-center gap-3">
                  <Brain className="h-5 w-5 text-turquoise-600" />
                  <CardTitle className="text-sm">{agent.name}</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-xs mb-2">
                  {agent.description}
                </CardDescription>
                <div className="flex flex-wrap gap-1">
                  {agent.keywords.slice(0, 3).map((kw: string, idx: number) => (
                    <Badge key={idx} variant="secondary" className="text-xs">
                      {kw}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
