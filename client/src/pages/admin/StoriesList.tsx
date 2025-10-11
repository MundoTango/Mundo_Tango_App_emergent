// ESA Agent #65 + #17: Stories List Page (Aurora Tide Compliant)
// Architecture: Task breakdown view with agent filtering

import { useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { GlassCard } from '@/components/glass/GlassComponents';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { ArrowUpDown, ArrowUp, ArrowDown, Search, Plus } from 'lucide-react';
import { useLocation } from 'wouter';
import Skeleton from 'react-loading-skeleton';
import { AgentSelector } from '@/components/tracker/AgentSelector';

type Story = {
  id: number;
  key: string;
  epicId: number | null;
  summary: string;
  status: string;
  priority: string;
  storyPoints: number | null;
  assignedAgentId: string | null;
  teamAgentIds: string[];
  createdAt: Date;
};

type SortConfig = {
  column: keyof Story;
  direction: 'asc' | 'desc';
};

export default function StoriesList() {
  const [, navigate] = useLocation();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [agentFilter, setAgentFilter] = useState<string>('');
  const [sortConfig, setSortConfig] = useState<SortConfig>({ column: 'createdAt', direction: 'desc' });

  const { data, isLoading } = useQuery<{ data: Story[] }>({
    queryKey: ['/api/tracker/stories'],
  });

  const stories = data?.data || [];

  // Filter and sort stories
  const filteredAndSortedStories = useMemo(() => {
    let filtered = stories;

    // Search filter
    if (searchTerm) {
      const search = searchTerm.toLowerCase();
      filtered = filtered.filter(
        story =>
          story.key.toLowerCase().includes(search) ||
          story.summary.toLowerCase().includes(search)
      );
    }

    // Status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter(story => story.status === statusFilter);
    }

    // Agent filter
    if (agentFilter) {
      filtered = filtered.filter(
        story =>
          story.assignedAgentId === agentFilter ||
          story.teamAgentIds?.includes(agentFilter)
      );
    }

    // Sorting
    const sorted = [...filtered].sort((a, b) => {
      const aVal = a[sortConfig.column] ?? '';
      const bVal = b[sortConfig.column] ?? '';

      if (typeof aVal === 'string' && typeof bVal === 'string') {
        return sortConfig.direction === 'asc'
          ? aVal.localeCompare(bVal)
          : bVal.localeCompare(aVal);
      }

      if (typeof aVal === 'number' && typeof bVal === 'number') {
        return sortConfig.direction === 'asc' ? aVal - bVal : bVal - aVal;
      }

      return 0;
    });

    return sorted;
  }, [stories, searchTerm, statusFilter, agentFilter, sortConfig]);

  const handleSort = (column: keyof Story) => {
    setSortConfig(prev => ({
      column,
      direction: prev.column === column && prev.direction === 'asc' ? 'desc' : 'asc',
    }));
  };

  const getSortIcon = (column: keyof Story) => {
    if (sortConfig.column !== column) {
      return <ArrowUpDown className="ml-1 h-4 w-4 text-gray-400" />;
    }
    return sortConfig.direction === 'asc' ? (
      <ArrowUp className="ml-1 h-4 w-4 text-turquoise-500" />
    ) : (
      <ArrowDown className="ml-1 h-4 w-4 text-turquoise-500" />
    );
  };

  // Aurora Tide Status Colors
  const getStatusBadge = (status: string) => {
    const statusColors = {
      to_do: 'bg-gradient-to-r from-gray-400 to-gray-500 text-white',
      in_progress: 'bg-gradient-to-r from-turquoise-500 to-ocean-600 text-white',
      done: 'bg-gradient-to-r from-green-500 to-emerald-600 text-white',
      cancelled: 'bg-gradient-to-r from-red-500 to-rose-600 text-white',
    };

    const statusLabels = {
      to_do: 'To Do',
      in_progress: 'In Progress',
      done: 'Done',
      cancelled: 'Cancelled',
    };

    return (
      <Badge className={statusColors[status as keyof typeof statusColors] || 'bg-gray-400'}>
        {statusLabels[status as keyof typeof statusLabels] || status}
      </Badge>
    );
  };

  const getPriorityBadge = (priority: string) => {
    const priorityColors = {
      low: 'bg-gradient-to-r from-gray-300 to-gray-400 text-gray-800',
      medium: 'bg-gradient-to-r from-yellow-400 to-amber-500 text-white',
      high: 'bg-gradient-to-r from-orange-500 to-red-500 text-white',
      critical: 'bg-gradient-to-r from-red-600 to-rose-700 text-white',
    };

    const priorityLabels = {
      low: 'Low',
      medium: 'Medium',
      high: 'High',
      critical: 'Critical',
    };

    return (
      <Badge className={priorityColors[priority as keyof typeof priorityColors] || 'bg-gray-400'}>
        {priorityLabels[priority as keyof typeof priorityLabels] || priority}
      </Badge>
    );
  };

  const getAgentName = (agentId: string) => {
    const agentNum = agentId.split('-')[1];
    return `Agent #${agentNum}`;
  };

  return (
    <div className="container mx-auto p-6 space-y-6" data-testid="page-stories-list">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">Stories</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Manage user stories and task assignments
          </p>
        </div>
        <Button
          onClick={() => navigate('/admin/projects?create=story')}
          className="bg-gradient-to-r from-turquoise-500 to-ocean-600 text-white hover:from-turquoise-600 hover:to-ocean-700"
          data-testid="button-create-story"
        >
          <Plus className="mr-2 h-4 w-4" />
          Create Story
        </Button>
      </div>

      {/* Filters */}
      <GlassCard depth={1} className="p-4" data-testid="card-filters">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search stories..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
              data-testid="input-search"
            />
          </div>

          {/* Status Filter */}
          <div>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full h-10 px-3 rounded-md border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
              data-testid="filter-status"
            >
              <option value="all">All Statuses</option>
              <option value="to_do">To Do</option>
              <option value="in_progress">In Progress</option>
              <option value="done">Done</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>

          {/* Agent Filter */}
          <div data-testid="filter-agent">
            <AgentSelector
              value={agentFilter}
              onChange={setAgentFilter}
              showHierarchy={true}
              placeholder="Filter by agent..."
            />
          </div>

          {/* Results count */}
          <div className="flex items-center justify-end text-sm text-gray-600 dark:text-gray-400">
            Showing {filteredAndSortedStories.length} of {stories.length} stories
          </div>
        </div>
      </GlassCard>

      {/* Table */}
      <GlassCard depth={2} className="overflow-hidden" data-testid="card-table">
        <div className="overflow-x-auto">
          <table className="w-full" data-testid="table-stories">
            <thead className="bg-gradient-to-r from-gray-100 to-gray-200 dark:from-gray-800 dark:to-gray-700">
              <tr>
                <th
                  className="px-6 py-3 text-left text-xs font-medium text-gray-700 dark:text-gray-300 uppercase tracking-wider cursor-pointer hover:bg-gray-200 dark:hover:bg-gray-600"
                  onClick={() => handleSort('key')}
                  data-testid="header-key"
                >
                  <div className="flex items-center">
                    Key
                    {getSortIcon('key')}
                  </div>
                </th>
                <th
                  className="px-6 py-3 text-left text-xs font-medium text-gray-700 dark:text-gray-300 uppercase tracking-wider cursor-pointer hover:bg-gray-200 dark:hover:bg-gray-600"
                  onClick={() => handleSort('summary')}
                  data-testid="header-summary"
                >
                  <div className="flex items-center">
                    Summary
                    {getSortIcon('summary')}
                  </div>
                </th>
                <th
                  className="px-6 py-3 text-left text-xs font-medium text-gray-700 dark:text-gray-300 uppercase tracking-wider cursor-pointer hover:bg-gray-200 dark:hover:bg-gray-600"
                  onClick={() => handleSort('status')}
                  data-testid="header-status"
                >
                  <div className="flex items-center">
                    Status
                    {getSortIcon('status')}
                  </div>
                </th>
                <th
                  className="px-6 py-3 text-left text-xs font-medium text-gray-700 dark:text-gray-300 uppercase tracking-wider cursor-pointer hover:bg-gray-200 dark:hover:bg-gray-600"
                  onClick={() => handleSort('priority')}
                  data-testid="header-priority"
                >
                  <div className="flex items-center">
                    Priority
                    {getSortIcon('priority')}
                  </div>
                </th>
                <th
                  className="px-6 py-3 text-left text-xs font-medium text-gray-700 dark:text-gray-300 uppercase tracking-wider cursor-pointer hover:bg-gray-200 dark:hover:bg-gray-600"
                  onClick={() => handleSort('assignedAgentId')}
                  data-testid="header-agent"
                >
                  <div className="flex items-center">
                    Assigned Agent
                    {getSortIcon('assignedAgentId')}
                  </div>
                </th>
                <th
                  className="px-6 py-3 text-left text-xs font-medium text-gray-700 dark:text-gray-300 uppercase tracking-wider cursor-pointer hover:bg-gray-200 dark:hover:bg-gray-600"
                  onClick={() => handleSort('storyPoints')}
                  data-testid="header-points"
                >
                  <div className="flex items-center">
                    Points
                    {getSortIcon('storyPoints')}
                  </div>
                </th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-700">
              {isLoading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <tr key={i}>
                    <td className="px-6 py-4" colSpan={6}>
                      <Skeleton height={20} />
                    </td>
                  </tr>
                ))
              ) : filteredAndSortedStories.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-8 text-center text-gray-500 dark:text-gray-400">
                    No stories found
                  </td>
                </tr>
              ) : (
                filteredAndSortedStories.map((story) => (
                  <tr
                    key={story.id}
                    className="hover:bg-gray-50 dark:hover:bg-gray-800 cursor-pointer transition-colors"
                    onClick={() => navigate(`/admin/projects/story/${story.id}`)}
                    data-testid={`row-story-${story.id}`}
                  >
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="font-mono text-sm font-medium text-turquoise-600 dark:text-turquoise-400">
                        {story.key}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-900 dark:text-gray-100 line-clamp-2">
                        {story.summary}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {getStatusBadge(story.status)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {getPriorityBadge(story.priority)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {story.assignedAgentId ? (
                        <div className="flex items-center gap-2">
                          <div className="flex h-6 w-6 items-center justify-center rounded-full bg-gradient-to-br from-cyan-400 to-blue-500 text-xs font-bold text-white">
                            {story.assignedAgentId.split('-')[1]}
                          </div>
                          <span className="text-sm text-gray-700 dark:text-gray-300">
                            {getAgentName(story.assignedAgentId)}
                          </span>
                        </div>
                      ) : (
                        <span className="text-sm text-gray-400">Unassigned</span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {story.storyPoints ? (
                        <Badge variant="outline" className="border-turquoise-500 text-turquoise-600 dark:text-turquoise-400">
                          {story.storyPoints} pts
                        </Badge>
                      ) : (
                        <span className="text-sm text-gray-400">-</span>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </GlassCard>
    </div>
  );
}
