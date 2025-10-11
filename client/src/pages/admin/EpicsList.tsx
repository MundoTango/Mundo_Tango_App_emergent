// ESA Agent #65 + #17: Epics List Page (Aurora Tide Compliant)
// Architecture: docs/features/project-tracker/pages/epics-list-architecture.md

import { useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { GlassCard } from '@/components/glass/GlassComponents';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ArrowUpDown, ArrowUp, ArrowDown, Search, Filter, Plus } from 'lucide-react';
import { useLocation } from 'wouter';
import Skeleton from 'react-loading-skeleton';

type Epic = {
  id: number;
  key: string;
  summary: string;
  description: string | null;
  status: string;
  priority: string;
  labels: string[];
  storyCount?: number;
  createdAt: Date;
  dueDate?: Date;
};

type SortConfig = {
  column: keyof Epic | 'storyCount';
  direction: 'asc' | 'desc';
};

export default function EpicsList() {
  const [, navigate] = useLocation();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [priorityFilter, setPriorityFilter] = useState<string>('all');
  const [sortConfig, setSortConfig] = useState<SortConfig>({ column: 'createdAt', direction: 'desc' });

  const { data, isLoading } = useQuery<{ data: Epic[] }>({
    queryKey: ['/api/tracker/epics'],
  });

  const epics = data?.data || [];

  // Filter and sort epics
  const filteredAndSortedEpics = useMemo(() => {
    let filtered = epics;

    // Search filter
    if (searchTerm) {
      const search = searchTerm.toLowerCase();
      filtered = filtered.filter(
        epic =>
          epic.key.toLowerCase().includes(search) ||
          epic.summary.toLowerCase().includes(search)
      );
    }

    // Status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter(epic => epic.status === statusFilter);
    }

    // Priority filter
    if (priorityFilter !== 'all') {
      filtered = filtered.filter(epic => epic.priority === priorityFilter);
    }

    // Sorting
    const sorted = [...filtered].sort((a, b) => {
      const aVal = a[sortConfig.column as keyof Epic] ?? '';
      const bVal = b[sortConfig.column as keyof Epic] ?? '';

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
  }, [epics, searchTerm, statusFilter, priorityFilter, sortConfig]);

  const handleSort = (column: keyof Epic | 'storyCount') => {
    setSortConfig(prev => ({
      column,
      direction: prev.column === column && prev.direction === 'asc' ? 'desc' : 'asc',
    }));
  };

  const getSortIcon = (column: keyof Epic | 'storyCount') => {
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

  return (
    <div className="container mx-auto p-6 space-y-6" data-testid="page-epics-list">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">Epics</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Manage project epics and track progress
          </p>
        </div>
        <Button
          onClick={() => navigate('/admin/projects?create=epic')}
          className="bg-gradient-to-r from-turquoise-500 to-ocean-600 text-white hover:from-turquoise-600 hover:to-ocean-700"
          data-testid="button-create-epic"
        >
          <Plus className="mr-2 h-4 w-4" />
          Create Epic
        </Button>
      </div>

      {/* Filters */}
      <GlassCard depth={1} className="p-4" data-testid="card-filters">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search epics..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
              data-testid="input-search"
            />
          </div>

          {/* Status Filter */}
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger data-testid="filter-status">
              <Filter className="mr-2 h-4 w-4" />
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Statuses</SelectItem>
              <SelectItem value="to_do">To Do</SelectItem>
              <SelectItem value="in_progress">In Progress</SelectItem>
              <SelectItem value="done">Done</SelectItem>
              <SelectItem value="cancelled">Cancelled</SelectItem>
            </SelectContent>
          </Select>

          {/* Priority Filter */}
          <Select value={priorityFilter} onValueChange={setPriorityFilter}>
            <SelectTrigger data-testid="filter-priority">
              <Filter className="mr-2 h-4 w-4" />
              <SelectValue placeholder="Filter by priority" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Priorities</SelectItem>
              <SelectItem value="low">Low</SelectItem>
              <SelectItem value="medium">Medium</SelectItem>
              <SelectItem value="high">High</SelectItem>
              <SelectItem value="critical">Critical</SelectItem>
            </SelectContent>
          </Select>

          {/* Results count */}
          <div className="flex items-center justify-end text-sm text-gray-600 dark:text-gray-400">
            Showing {filteredAndSortedEpics.length} of {epics.length} epics
          </div>
        </div>
      </GlassCard>

      {/* Table */}
      <GlassCard depth={2} className="overflow-hidden" data-testid="card-table">
        <div className="overflow-x-auto">
          <table className="w-full" data-testid="table-epics">
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
                  onClick={() => handleSort('storyCount')}
                  data-testid="header-stories"
                >
                  <div className="flex items-center">
                    Stories
                    {getSortIcon('storyCount')}
                  </div>
                </th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-700">
              {isLoading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <tr key={i}>
                    <td className="px-6 py-4" colSpan={5}>
                      <Skeleton height={20} />
                    </td>
                  </tr>
                ))
              ) : filteredAndSortedEpics.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-8 text-center text-gray-500 dark:text-gray-400">
                    No epics found
                  </td>
                </tr>
              ) : (
                filteredAndSortedEpics.map((epic) => (
                  <tr
                    key={epic.id}
                    className="hover:bg-gray-50 dark:hover:bg-gray-800 cursor-pointer transition-colors"
                    onClick={() => navigate(`/admin/projects/epics/${epic.id}`)}
                    data-testid={`row-epic-${epic.id}`}
                  >
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="font-mono text-sm font-medium text-turquoise-600 dark:text-turquoise-400">
                        {epic.key}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-900 dark:text-gray-100 line-clamp-2">
                        {epic.summary}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {getStatusBadge(epic.status)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {getPriorityBadge(epic.priority)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <Badge variant="outline" className="border-turquoise-500 text-turquoise-600 dark:text-turquoise-400">
                        {epic.storyCount || 0} {epic.storyCount === 1 ? 'story' : 'stories'}
                      </Badge>
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
