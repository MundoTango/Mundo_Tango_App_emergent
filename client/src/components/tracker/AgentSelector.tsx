import { useState, useMemo } from 'react';
import { Check, ChevronsUpDown, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { cn } from '@/lib/utils';

// ESA Agent #65: Agent Selector Component
// Hierarchical dropdown for selecting from 100 ESA agents

export interface Agent {
  id: string; // "agent-52"
  name: string; // "Agent #52 (Performance Lead)"
  division: string; // "Chief #2"
  domain?: string;
  capabilities?: string[];
  currentWorkload?: number;
  capacity?: number;
}

// Complete 100-agent hierarchy (sample - should be fetched from API)
const ESA_AGENTS: Agent[] = [
  // CEO
  { id: 'agent-0', name: 'Agent #0 (ESA CEO)', division: 'Leadership' },
  
  // Expert Agents (#10-16)
  { id: 'agent-10', name: 'Agent #10 (AI Research)', division: 'Experts', capabilities: ['research', 'ai'] },
  { id: 'agent-11', name: 'Agent #11 (Aurora Tide Design)', division: 'Experts', capabilities: ['design', 'ui'] },
  { id: 'agent-12', name: 'Agent #12 (Data Visualization)', division: 'Experts', capabilities: ['charts', 'viz'] },
  { id: 'agent-13', name: 'Agent #13 (Content & Media)', division: 'Experts', capabilities: ['media', 'content'] },
  { id: 'agent-14', name: 'Agent #14 (Code Quality)', division: 'Experts', capabilities: ['quality', 'lint'] },
  { id: 'agent-15', name: 'Agent #15 (Developer Experience)', division: 'Experts', capabilities: ['dx', 'tools'] },
  { id: 'agent-16', name: 'Agent #16 (Translation & i18n)', division: 'Experts', capabilities: ['i18n', 'translation'] },
  
  // Chief #2 Division (Core - Layers 11-20)
  { id: 'agent-51', name: 'Agent #51 (Testing Lead)', division: 'Chief #2', capabilities: ['testing', 'qa'] },
  { id: 'agent-52', name: 'Agent #52 (Performance Lead)', division: 'Chief #2', capabilities: ['performance', 'optimization'] },
  { id: 'agent-53', name: 'Agent #53 (i18n Lead)', division: 'Chief #2', capabilities: ['i18n', 'localization'] },
  { id: 'agent-54', name: 'Agent #54 (Accessibility Lead)', division: 'Chief #2', capabilities: ['a11y', 'wcag'] },
  
  // Agent #63, #65, #67
  { id: 'agent-63', name: 'Agent #63 (Sprint Management)', division: 'Chief #6', capabilities: ['sprints', 'agile'] },
  { id: 'agent-65', name: 'Agent #65 (Sprint & Resource Mgmt)', division: 'Chief #6', capabilities: ['resource', 'planning'] },
  { id: 'agent-67', name: 'Agent #67 (GitHub Expertise)', division: 'Chief #6', capabilities: ['github', 'integration'] },
  
  // Frontend Agents
  { id: 'agent-17', name: 'Agent #17 (UI/UX Components)', division: 'Chief #2', capabilities: ['ui', 'components'] },
  { id: 'agent-2', name: 'Agent #2 (API Structure)', division: 'Chief #1', capabilities: ['api', 'backend'] },
];

interface AgentSelectorProps {
  value?: string;
  onChange: (agentId: string) => void;
  showHierarchy?: boolean;
  filterByCapability?: string[];
  disabled?: boolean;
  placeholder?: string;
  'data-testid'?: string;
}

export function AgentSelector({
  value,
  onChange,
  showHierarchy = true,
  filterByCapability,
  disabled = false,
  placeholder = 'Select agent...',
  'data-testid': testId = 'select-agent',
}: AgentSelectorProps) {
  const [open, setOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  // Filter agents by capability if specified
  const filteredAgents = useMemo(() => {
    let agents = ESA_AGENTS;
    
    if (filterByCapability && filterByCapability.length > 0) {
      agents = agents.filter(agent =>
        agent.capabilities?.some(cap =>
          filterByCapability.includes(cap)
        )
      );
    }
    
    if (searchTerm) {
      const search = searchTerm.toLowerCase();
      agents = agents.filter(agent =>
        agent.name.toLowerCase().includes(search) ||
        agent.division.toLowerCase().includes(search) ||
        agent.capabilities?.some(cap => cap.toLowerCase().includes(search))
      );
    }
    
    return agents;
  }, [filterByCapability, searchTerm]);

  // Group agents by division if showHierarchy
  const groupedAgents = useMemo(() => {
    if (!showHierarchy) {
      return { 'All Agents': filteredAgents };
    }

    const groups: Record<string, Agent[]> = {};
    filteredAgents.forEach(agent => {
      const group = agent.division || 'Other';
      if (!groups[group]) {
        groups[group] = [];
      }
      groups[group].push(agent);
    });

    return groups;
  }, [filteredAgents, showHierarchy]);

  const selectedAgent = ESA_AGENTS.find(agent => agent.id === value);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="w-full justify-between"
          disabled={disabled}
          data-testid={testId}
        >
          {selectedAgent ? (
            <div className="flex items-center gap-2">
              <div className="flex h-6 w-6 items-center justify-center rounded-full bg-gradient-to-br from-cyan-400 to-blue-500 text-xs font-bold text-white">
                {selectedAgent.id.split('-')[1]}
              </div>
              <span>{selectedAgent.name}</span>
            </div>
          ) : (
            <span className="text-muted-foreground">{placeholder}</span>
          )}
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[400px] p-0" align="start">
        <Command>
          <CommandInput 
            placeholder="Search agents..." 
            value={searchTerm}
            onValueChange={setSearchTerm}
          />
          <CommandList>
            <CommandEmpty>No agent found.</CommandEmpty>
            {Object.entries(groupedAgents).map(([division, agents]) => (
              <CommandGroup key={division} heading={division}>
                {agents.map(agent => (
                  <CommandItem
                    key={agent.id}
                    value={agent.id}
                    onSelect={() => {
                      onChange(agent.id);
                      setOpen(false);
                    }}
                    data-testid={`option-${agent.id}`}
                  >
                    <Check
                      className={cn(
                        'mr-2 h-4 w-4',
                        value === agent.id ? 'opacity-100' : 'opacity-0'
                      )}
                    />
                    <div className="flex items-center gap-2">
                      <div className="flex h-6 w-6 items-center justify-center rounded-full bg-gradient-to-br from-cyan-400 to-blue-500 text-xs font-bold text-white">
                        {agent.id.split('-')[1]}
                      </div>
                      <div className="flex flex-col">
                        <span className="text-sm font-medium">{agent.name}</span>
                        {agent.capabilities && (
                          <span className="text-xs text-muted-foreground">
                            {agent.capabilities.join(', ')}
                          </span>
                        )}
                      </div>
                    </div>
                    {agent.currentWorkload !== undefined && (
                      <div className="ml-auto text-xs text-muted-foreground">
                        {agent.currentWorkload}h / {agent.capacity}h
                      </div>
                    )}
                  </CommandItem>
                ))}
              </CommandGroup>
            ))}
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}

// Multi-select variant for team agents
interface MultiAgentSelectorProps {
  value: string[];
  onChange: (agentIds: string[]) => void;
  exclude?: string[]; // Exclude these agents (e.g., primary agent)
  disabled?: boolean;
  'data-testid'?: string;
}

export function MultiAgentSelector({
  value,
  onChange,
  exclude = [],
  disabled = false,
  'data-testid': testId = 'select-team-agents',
}: MultiAgentSelectorProps) {
  const [open, setOpen] = useState(false);

  const availableAgents = ESA_AGENTS.filter(agent => !exclude.includes(agent.id));
  const selectedAgents = ESA_AGENTS.filter(agent => value.includes(agent.id));

  const toggleAgent = (agentId: string) => {
    if (value.includes(agentId)) {
      onChange(value.filter(id => id !== agentId));
    } else {
      onChange([...value, agentId]);
    }
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          className="w-full justify-between"
          disabled={disabled}
          data-testid={testId}
        >
          {selectedAgents.length > 0 ? (
            <div className="flex items-center gap-1">
              {selectedAgents.slice(0, 3).map(agent => (
                <div
                  key={agent.id}
                  className="flex h-6 w-6 items-center justify-center rounded-full bg-gradient-to-br from-cyan-400 to-blue-500 text-xs font-bold text-white"
                >
                  {agent.id.split('-')[1]}
                </div>
              ))}
              {selectedAgents.length > 3 && (
                <span className="text-sm text-muted-foreground">
                  +{selectedAgents.length - 3} more
                </span>
              )}
            </div>
          ) : (
            <span className="text-muted-foreground">Select team agents...</span>
          )}
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[400px] p-0" align="start">
        <Command>
          <CommandInput placeholder="Search agents..." />
          <CommandList>
            <CommandEmpty>No agent found.</CommandEmpty>
            <CommandGroup>
              {availableAgents.map(agent => (
                <CommandItem
                  key={agent.id}
                  value={agent.id}
                  onSelect={() => toggleAgent(agent.id)}
                  data-testid={`option-${agent.id}`}
                >
                  <Check
                    className={cn(
                      'mr-2 h-4 w-4',
                      value.includes(agent.id) ? 'opacity-100' : 'opacity-0'
                    )}
                  />
                  <div className="flex items-center gap-2">
                    <div className="flex h-6 w-6 items-center justify-center rounded-full bg-gradient-to-br from-cyan-400 to-blue-500 text-xs font-bold text-white">
                      {agent.id.split('-')[1]}
                    </div>
                    <span className="text-sm">{agent.name}</span>
                  </div>
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
