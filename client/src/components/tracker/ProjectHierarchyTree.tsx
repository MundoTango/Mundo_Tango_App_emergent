// ESA Agent #65: Project Hierarchy Tree Visualization
// System → Area → Epic → Story → Task with agent filtering

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { GlassCard } from '@/components/glass/GlassComponents';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { 
  ChevronRight, 
  ChevronDown, 
  Layers, 
  FolderOpen, 
  ListTodo, 
  FileText, 
  CheckSquare, 
  Filter, 
  X 
} from 'lucide-react';
import { Link } from 'wouter';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

type TreeNode = {
  id: number;
  key: string;
  name?: string;
  summary?: string;
  title?: string;
  status: string;
  assignedAgentId?: string | null;
  teamAgentIds?: string[];
  children?: TreeNode[];
  type: 'system' | 'area' | 'epic' | 'story' | 'task';
  count?: number;
};

const AGENT_OPTIONS = [
  { value: 'all', label: 'All Agents' },
  { value: 'agent-1', label: 'Agent #1 (Database)' },
  { value: 'agent-2', label: 'Agent #2 (API)' },
  { value: 'agent-8', label: 'Agent #8 (Frontend)' },
  { value: 'agent-11', label: 'Agent #11 (UI/UX)' },
  { value: 'agent-21', label: 'Agent #21 (User Management)' },
  { value: 'agent-31', label: 'Agent #31 (AI Core)' },
  { value: 'agent-65', label: 'Agent #65 (Project Tracker)' },
];

export function ProjectHierarchyTree() {
  const [expandedNodes, setExpandedNodes] = useState<Set<string>>(new Set());
  const [selectedAgent, setSelectedAgent] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');

  const { data: treeData, isLoading } = useQuery({
    queryKey: ['/api/tracker/tree', selectedAgent !== 'all' ? selectedAgent : null],
    queryFn: async () => {
      const url = selectedAgent !== 'all' 
        ? `/api/tracker/tree?agentId=${selectedAgent}`
        : '/api/tracker/tree';
      const response = await fetch(url);
      return response.json();
    },
  });

  const toggleNode = (nodeId: string) => {
    setExpandedNodes(prev => {
      const next = new Set(prev);
      if (next.has(nodeId)) {
        next.delete(nodeId);
      } else {
        next.add(nodeId);
      }
      return next;
    });
  };

  const expandAll = () => {
    const allNodeIds = new Set<string>();
    const collectNodeIds = (nodes: any[], type: string) => {
      nodes?.forEach((node: any) => {
        allNodeIds.add(`${type}-${node.id}`);
        if (type === 'system' && node.areas) collectNodeIds(node.areas, 'area');
        if (type === 'area' && node.epics) collectNodeIds(node.epics, 'epic');
        if (type === 'epic' && node.stories) collectNodeIds(node.stories, 'story');
      });
    };
    if (treeData?.data) {
      collectNodeIds(treeData.data, 'system');
    }
    setExpandedNodes(allNodeIds);
  };

  const collapseAll = () => {
    setExpandedNodes(new Set());
  };

  const getNodeIcon = (type: string) => {
    switch (type) {
      case 'system': return Layers;
      case 'area': return FolderOpen;
      case 'epic': return ListTodo;
      case 'story': return FileText;
      case 'task': return CheckSquare;
      default: return FileText;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'done': return 'bg-gradient-to-r from-green-500 to-emerald-600 text-white';
      case 'in_progress': return 'bg-gradient-to-r from-turquoise-500 to-ocean-600 text-white';
      case 'to_do': return 'bg-gradient-to-r from-gray-400 to-gray-500 text-white';
      default: return 'bg-gray-300 text-gray-800';
    }
  };

  const TreeNodeComponent = ({ node, type, level = 0 }: { node: any; type: string; level?: number }) => {
    const nodeId = `${type}-${node.id}`;
    const isExpanded = expandedNodes.has(nodeId);
    const Icon = getNodeIcon(type);
    const hasChildren = 
      (type === 'system' && node.areas?.length > 0) ||
      (type === 'area' && node.epics?.length > 0) ||
      (type === 'epic' && node.stories?.length > 0) ||
      (type === 'story' && node.tasks?.length > 0);

    const displayName = node.name || node.summary || node.title || node.key;
    
    // Search filter
    if (searchQuery && !displayName.toLowerCase().includes(searchQuery.toLowerCase())) {
      return null;
    }

    return (
      <div className="space-y-1">
        <div 
          className="group flex items-center gap-2 py-2 px-3 rounded-lg hover:bg-glass-light/40 transition-all cursor-pointer"
          style={{ paddingLeft: `${level * 24 + 12}px` }}
        >
          {hasChildren && (
            <button
              onClick={() => toggleNode(nodeId)}
              className="p-1 hover:bg-ocean-500/20 rounded transition-colors"
              data-testid={`tree-toggle-${nodeId}`}
            >
              {isExpanded ? (
                <ChevronDown className="w-4 h-4 text-turquoise-500" />
              ) : (
                <ChevronRight className="w-4 h-4 text-turquoise-500" />
              )}
            </button>
          )}
          
          {!hasChildren && <div className="w-6" />}
          
          <Icon className={`w-5 h-5 ${type === 'system' ? 'text-turquoise-500' : type === 'area' ? 'text-ocean-500' : 'text-gray-500'}`} />
          
          <Link href={type === 'story' ? `/admin/story/${node.id}` : type === 'epic' ? `/admin/epic/${node.id}` : '#'}>
            <span className="font-medium text-gray-800 dark:text-white hover:text-turquoise-600 dark:hover:text-turquoise-400 transition-colors">
              {node.key}
            </span>
          </Link>
          
          <span className="text-gray-600 dark:text-gray-300 flex-1 truncate">
            {displayName}
          </span>
          
          {node.status && (
            <Badge className={`${getStatusColor(node.status)} text-xs`}>
              {node.status.replace('_', ' ')}
            </Badge>
          )}
          
          {node.assignedAgentId && (
            <Badge variant="outline" className="text-xs border-turquoise-500 text-turquoise-700 dark:text-turquoise-300">
              {node.assignedAgentId}
            </Badge>
          )}
          
          {(type === 'system' && node.areaCount > 0) && (
            <Badge variant="secondary" className="text-xs">{node.areaCount} areas</Badge>
          )}
          {(type === 'area' && node.epicCount > 0) && (
            <Badge variant="secondary" className="text-xs">{node.epicCount} epics</Badge>
          )}
          {(type === 'epic' && node.storyCount > 0) && (
            <Badge variant="secondary" className="text-xs">{node.storyCount} stories</Badge>
          )}
          {(type === 'story' && node.taskCount > 0) && (
            <Badge variant="secondary" className="text-xs">{node.taskCount} tasks</Badge>
          )}
        </div>

        {isExpanded && (
          <div>
            {type === 'system' && node.areas?.map((area: any) => (
              <TreeNodeComponent key={area.id} node={area} type="area" level={level + 1} />
            ))}
            {type === 'area' && node.epics?.map((epic: any) => (
              <TreeNodeComponent key={epic.id} node={epic} type="epic" level={level + 1} />
            ))}
            {type === 'epic' && node.stories?.map((story: any) => (
              <TreeNodeComponent key={story.id} node={story} type="story" level={level + 1} />
            ))}
            {type === 'story' && node.tasks?.map((task: any) => (
              <TreeNodeComponent key={task.id} node={task} type="task" level={level + 1} />
            ))}
          </div>
        )}
      </div>
    );
  };

  if (isLoading) {
    return (
      <GlassCard className="p-6">
        <div className="flex items-center justify-center">
          <p className="text-gray-500">Loading hierarchical tree...</p>
        </div>
      </GlassCard>
    );
  }

  const systems = treeData?.data || [];

  return (
    <GlassCard className="p-6 space-y-4">
      <div className="flex items-center justify-between gap-4">
        <div className="flex-1 flex items-center gap-3">
          <Filter className="w-5 h-5 text-turquoise-500" />
          <Select value={selectedAgent} onValueChange={setSelectedAgent}>
            <SelectTrigger className="w-[250px]" data-testid="agent-filter">
              <SelectValue placeholder="Filter by agent" />
            </SelectTrigger>
            <SelectContent>
              {AGENT_OPTIONS.map(opt => (
                <SelectItem key={opt.value} value={opt.value}>
                  {opt.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          
          <Input
            placeholder="Search in tree..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-[200px]"
            data-testid="tree-search"
          />
          {searchQuery && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setSearchQuery('')}
            >
              <X className="w-4 h-4" />
            </Button>
          )}
        </div>

        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={expandAll}
            data-testid="tree-expand-all"
          >
            Expand All
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={collapseAll}
            data-testid="tree-collapse-all"
          >
            Collapse All
          </Button>
        </div>
      </div>

      <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
        {systems.length === 0 ? (
          <p className="text-gray-500 text-center py-8">No projects found</p>
        ) : (
          systems.map((system: any) => (
            <TreeNodeComponent key={system.id} node={system} type="system" />
          ))
        )}
      </div>
    </GlassCard>
  );
}
