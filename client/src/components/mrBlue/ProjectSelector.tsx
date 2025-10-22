/**
 * Chat Project Selector
 * ChatGPT-style project dropdown with create/switch
 * MB.MD Track 3: Projects UI - Oct 21, 2025
 */

import { useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';
import { Input } from '@/components/ui/input';
import { Plus, FolderOpen, Check } from 'lucide-react';
import { queryClient, apiRequest } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';

interface Project {
  id: number;
  name: string;
  description: string | null;
}

interface ProjectSelectorProps {
  currentProjectId: number | null;
  onProjectChange: (projectId: number) => void;
}

export function ProjectSelector({ currentProjectId, onProjectChange }: ProjectSelectorProps) {
  const [isCreating, setIsCreating] = useState(false);
  const [newProjectName, setNewProjectName] = useState('');
  const { toast } = useToast();

  const { data: projects } = useQuery<Project[]>({
    queryKey: ['/api/chat/projects'],
    queryFn: async () => {
      const res = await fetch('/api/chat/projects', { credentials: 'include' });
      if (!res.ok) throw new Error('Failed to fetch projects');
      return res.json();
    },
  });

  const createProject = useMutation({
    mutationFn: async (name: string) => {
      const res = await apiRequest('/api/chat/projects', {
        method: 'POST',
        body: JSON.stringify({ name }),
      });
      return res.json();
    },
    onSuccess: (newProject: Project) => {
      queryClient.invalidateQueries({ queryKey: ['/api/chat/projects'] });
      onProjectChange(newProject.id);
      setIsCreating(false);
      setNewProjectName('');
      toast({
        title: 'Project Created',
        description: `Created "${newProject.name}"`,
      });
    },
  });

  const handleCreate = () => {
    if (newProjectName.trim()) {
      createProject.mutate(newProjectName.trim());
    }
  };

  const currentProject = projects?.find(p => p.id === currentProjectId);

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" className="w-full justify-between" data-testid="button-project-selector">
          <span className="flex items-center gap-2">
            <FolderOpen className="h-4 w-4" />
            {currentProject?.name || 'Select Project'}
          </span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-64">
        {projects?.map((project) => (
          <DropdownMenuItem
            key={project.id}
            onClick={() => onProjectChange(project.id)}
            className="flex items-center justify-between"
            data-testid={`project-${project.id}`}
          >
            <span>{project.name}</span>
            {project.id === currentProjectId && <Check className="h-4 w-4 text-cyan-500" />}
          </DropdownMenuItem>
        ))}
        
        <DropdownMenuSeparator />
        
        {isCreating ? (
          <div className="p-2 space-y-2">
            <Input
              placeholder="Project name..."
              value={newProjectName}
              onChange={(e) => setNewProjectName(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleCreate();
                if (e.key === 'Escape') setIsCreating(false);
              }}
              autoFocus
              data-testid="input-new-project-name"
            />
            <div className="flex gap-2">
              <Button size="sm" onClick={handleCreate} disabled={!newProjectName.trim()}>
                Create
              </Button>
              <Button size="sm" variant="outline" onClick={() => setIsCreating(false)}>
                Cancel
              </Button>
            </div>
          </div>
        ) : (
          <DropdownMenuItem onClick={() => setIsCreating(true)} data-testid="button-new-project">
            <Plus className="h-4 w-4 mr-2" />
            New Project
          </DropdownMenuItem>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
