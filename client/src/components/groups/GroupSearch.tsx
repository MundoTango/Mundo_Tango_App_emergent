import React, { useState, useEffect, useCallback } from 'react';
import { Search, X, Filter, MapPin, Users, Eye, ChevronDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

interface GroupSearchProps {
  onSearchResults: (results: any[]) => void;
  onClearFilters: () => void;
}

interface SearchFilters {
  query: string;
  city: string;
  roleType: string;
  minMembers: number;
  maxMembers: number;
  visibility: string;
}

export default function GroupSearch({ onSearchResults, onClearFilters }: GroupSearchProps) {
  const [filters, setFilters] = useState<SearchFilters>({
    query: '',
    city: '',
    roleType: '',
    minMembers: 0,
    maxMembers: 10000,
    visibility: 'all'
  });
  
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [suggestions, setSuggestions] = useState<any[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  
  const debounce = (func: Function, delay: number) => {
    let timeoutId: NodeJS.Timeout;
    return (...args: any[]) => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => func(...args), delay);
    };
  };
  
  const performSearch = useCallback(async (searchFilters: SearchFilters) => {
    console.log('🔍 Performing search with filters:', searchFilters);
    setIsSearching(true);
    
    try {
      const params = new URLSearchParams();
      if (searchFilters.query) params.append('q', searchFilters.query);
      if (searchFilters.city) params.append('city', searchFilters.city);
      if (searchFilters.roleType) params.append('roleType', searchFilters.roleType);
      if (searchFilters.minMembers > 0) params.append('minMembers', searchFilters.minMembers.toString());
      if (searchFilters.maxMembers < 10000) params.append('maxMembers', searchFilters.maxMembers.toString());
      if (searchFilters.visibility !== 'all') params.append('visibility', searchFilters.visibility);
      
      const response = await fetch(`/api/groups/search?${params.toString()}`);
      const data = await response.json();
      
      if (data.success) {
        console.log(`✅ Search returned ${data.data.length} results`);
        onSearchResults(data.data);
        
        if (searchFilters.query && data.data.length > 0) {
          setSuggestions(data.data.slice(0, 10));
          setShowSuggestions(true);
        }
      }
    } catch (error) {
      console.error('Search error:', error);
    } finally {
      setIsSearching(false);
    }
  }, [onSearchResults]);
  
  const debouncedSearch = useCallback(
    debounce((searchFilters: SearchFilters) => performSearch(searchFilters), 300),
    [performSearch]
  );
  
  useEffect(() => {
    if (filters.query || filters.city || filters.roleType || filters.minMembers > 0 || filters.maxMembers < 10000 || filters.visibility !== 'all') {
      debouncedSearch(filters);
    }
  }, [filters, debouncedSearch]);
  
  const updateFilter = (key: keyof SearchFilters, value: any) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };
  
  const clearAllFilters = () => {
    setFilters({
      query: '',
      city: '',
      roleType: '',
      minMembers: 0,
      maxMembers: 10000,
      visibility: 'all'
    });
    setSuggestions([]);
    setShowSuggestions(false);
    onClearFilters();
  };
  
  const activeFilterCount = Object.entries(filters).filter(([key, value]) => {
    if (key === 'query') return value !== '';
    if (key === 'minMembers') return value > 0;
    if (key === 'maxMembers') return value < 10000;
    if (key === 'visibility') return value !== 'all';
    return value !== '';
  }).length;
  
  return (
    <Card className="p-6 mb-6" data-testid="group-search-card">
      <div className="space-y-4">
        <div className="flex gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <Input
              type="text"
              placeholder="Search groups by name or description..."
              value={filters.query}
              onChange={(e) => updateFilter('query', e.target.value)}
              onFocus={() => suggestions.length > 0 && setShowSuggestions(true)}
              onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
              className="pl-10 pr-4"
              data-testid="input-search-query"
              aria-label="Search groups"
            />
            
            {showSuggestions && suggestions.length > 0 && (
              <div className="absolute top-full mt-2 w-full bg-white border rounded-lg shadow-lg z-50 max-h-80 overflow-y-auto dark:bg-neutral-900"
                   data-testid="search-suggestions">
                {suggestions.map((group) => (
                  <button
                    key={group.id}
                    className="w-full px-4 py-3 hover:bg-gray-50 text-left flex items-center gap-3 border-b last:border-b-0 dark:bg-neutral-800"
                    onClick={() => {
                      updateFilter('query', group.name);
                      setShowSuggestions(false);
                    }}
                    data-testid={`suggestion-${group.id}`}
                  >
                    <MapPin className="h-4 w-4 text-gray-400" />
                    <div>
                      <div className="font-medium">{group.name}</div>
                      <div className="text-sm text-gray-500">{group.city}, {group.country}</div>
                    </div>
                    <Badge variant="secondary" className="ml-auto">{group.memberCount} members</Badge>
                  </button>
                ))}
              </div>
            )}
          </div>
          
          <Button
            variant="outline"
            onClick={() => setShowAdvanced(!showAdvanced)}
            data-testid="button-toggle-filters"
            aria-label={showAdvanced ? "Hide advanced filters" : "Show advanced filters"}
          >
            <Filter className="h-4 w-4 mr-2" />
            Filters {activeFilterCount > 0 && `(${activeFilterCount})`}
            <ChevronDown className={`h-4 w-4 ml-2 transition-transform ${showAdvanced ? 'rotate-180' : ''}`} />
          </Button>
          
          {activeFilterCount > 0 && (
            <Button
              variant="ghost"
              onClick={clearAllFilters}
              data-testid="button-clear-filters"
              aria-label="Clear all filters"
            >
              <X className="h-4 w-4 mr-2" />
              Clear
            </Button>
          )}
        </div>
        
        {showAdvanced && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4 border-t" data-testid="advanced-filters">
            <div>
              <label className="text-sm font-medium mb-2 block">City</label>
              <Input
                type="text"
                placeholder="e.g., Buenos Aires"
                value={filters.city}
                onChange={(e) => updateFilter('city', e.target.value)}
                data-testid="input-filter-city"
                aria-label="Filter by city"
              />
            </div>
            
            <div>
              <label className="text-sm font-medium mb-2 block">Role Type</label>
              <Select value={filters.roleType} onValueChange={(value) => updateFilter('roleType', value)}>
                <SelectTrigger data-testid="select-role-type" aria-label="Filter by role type">
                  <SelectValue placeholder="All roles" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">All roles</SelectItem>
                  <SelectItem value="dancer">Dancers</SelectItem>
                  <SelectItem value="teacher">Teachers</SelectItem>
                  <SelectItem value="organizer">Organizers</SelectItem>
                  <SelectItem value="musician">Musicians</SelectItem>
                  <SelectItem value="dj">DJs</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <label className="text-sm font-medium mb-2 block">Visibility</label>
              <Select value={filters.visibility} onValueChange={(value) => updateFilter('visibility', value)}>
                <SelectTrigger data-testid="select-visibility" aria-label="Filter by visibility">
                  <SelectValue placeholder="All groups" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All groups</SelectItem>
                  <SelectItem value="public">Public only</SelectItem>
                  <SelectItem value="private">Private only</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <label className="text-sm font-medium mb-2 block">Min Members</label>
              <Input
                type="number"
                min="0"
                value={filters.minMembers || ''}
                onChange={(e) => updateFilter('minMembers', parseInt(e.target.value) || 0)}
                placeholder="0"
                data-testid="input-min-members"
                aria-label="Minimum number of members"
              />
            </div>
            
            <div>
              <label className="text-sm font-medium mb-2 block">Max Members</label>
              <Input
                type="number"
                min="0"
                value={filters.maxMembers === 10000 ? '' : filters.maxMembers}
                onChange={(e) => updateFilter('maxMembers', parseInt(e.target.value) || 10000)}
                placeholder="No limit"
                data-testid="input-max-members"
                aria-label="Maximum number of members"
              />
            </div>
          </div>
        )}
        
        {activeFilterCount > 0 && (
          <div className="flex flex-wrap gap-2 pt-4 border-t" data-testid="active-filters">
            {filters.query && (
              <Badge variant="secondary" className="gap-1">
                Query: {filters.query}
                <X className="h-3 w-3 cursor-pointer" onClick={() => updateFilter('query', '')} />
              </Badge>
            )}
            {filters.city && (
              <Badge variant="secondary" className="gap-1">
                City: {filters.city}
                <X className="h-3 w-3 cursor-pointer" onClick={() => updateFilter('city', '')} />
              </Badge>
            )}
            {filters.roleType && (
              <Badge variant="secondary" className="gap-1">
                Role: {filters.roleType}
                <X className="h-3 w-3 cursor-pointer" onClick={() => updateFilter('roleType', '')} />
              </Badge>
            )}
            {filters.minMembers > 0 && (
              <Badge variant="secondary" className="gap-1">
                Min: {filters.minMembers}
                <X className="h-3 w-3 cursor-pointer" onClick={() => updateFilter('minMembers', 0)} />
              </Badge>
            )}
            {filters.maxMembers < 10000 && (
              <Badge variant="secondary" className="gap-1">
                Max: {filters.maxMembers}
                <X className="h-3 w-3 cursor-pointer" onClick={() => updateFilter('maxMembers', 10000)} />
              </Badge>
            )}
          </div>
        )}
        
        {isSearching && (
          <div className="text-sm text-gray-500 text-center py-2" aria-live="polite">
            Searching...
          </div>
        )}
      </div>
    </Card>
  );
}
