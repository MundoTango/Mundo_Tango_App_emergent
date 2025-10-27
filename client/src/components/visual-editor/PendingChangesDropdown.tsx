/**
 * Pending Changes Dropdown
 * Shows queued changes with ability to remove individual items
 * MB.MD Phase: UX Enhancement - Queue Management
 */

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { ChevronDown, X, FileEdit, MessageSquare, Code, Sparkles, Clock } from 'lucide-react';
import type { PendingChange } from '@/services/SaveOrchestrator';
import { saveOrchestrator } from '@/services/SaveOrchestrator';

interface PendingChangesDropdownProps {
  pendingCount: number;
  onSave: () => void;
  disabled?: boolean;
}

export function PendingChangesDropdown({ pendingCount, onSave, disabled }: PendingChangesDropdownProps) {
  const [changes, setChanges] = useState<PendingChange[]>([]);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    // Load changes when dropdown opens
    if (isOpen) {
      const currentChanges = saveOrchestrator.getPendingChanges();
      setChanges(currentChanges);
    }

    // Subscribe to changes
    const updateChanges = (updatedChanges: PendingChange[]) => {
      setChanges(updatedChanges);
    };

    const unsubscribe = saveOrchestrator.subscribe(updateChanges);
    return unsubscribe;
  }, [isOpen]);

  const handleRemoveChange = (changeId: string) => {
    saveOrchestrator.removeChange(changeId);
  };

  const handleClearAll = () => {
    if (confirm('Are you sure you want to remove all pending changes?')) {
      saveOrchestrator.clearAllChanges();
      setIsOpen(false);
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'style': return <FileEdit className="w-4 h-4" />;
      case 'content': return <MessageSquare className="w-4 h-4" />;
      case 'structure': return <Code className="w-4 h-4" />;
      case 'ai-build': return <Sparkles className="w-4 h-4" />;
      case 'chat': return <MessageSquare className="w-4 h-4" />;
      default: return <FileEdit className="w-4 h-4" />;
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'style': return 'bg-yellow-100 text-yellow-800';
      case 'content': return 'bg-green-100 text-green-800';
      case 'structure': return 'bg-blue-100 text-blue-800';
      case 'ai-build': return 'bg-purple-100 text-purple-800';
      case 'chat': return 'bg-pink-100 text-pink-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const formatTimestamp = (timestamp: number) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    
    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    const diffHours = Math.floor(diffMins / 60);
    if (diffHours < 24) return `${diffHours}h ago`;
    return date.toLocaleDateString();
  };

  if (pendingCount === 0) {
    return (
      <Button
        onClick={onSave}
        disabled={disabled || pendingCount === 0}
        className="bg-green-600 hover:bg-green-700"
        data-testid="button-save"
      >
        💾 SAVE
      </Button>
    );
  }

  return (
    <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
      <div className="flex gap-1">
        <Button
          onClick={onSave}
          disabled={disabled || pendingCount === 0}
          className="bg-green-600 hover:bg-green-700 rounded-r-none"
          data-testid="button-save"
        >
          💾 SAVE ({pendingCount})
        </Button>
        <DropdownMenuTrigger asChild>
          <Button
            disabled={disabled || pendingCount === 0}
            className="bg-green-600 hover:bg-green-700 rounded-l-none px-2 border-l border-green-700"
            data-testid="button-pending-changes-dropdown"
          >
            <ChevronDown className="w-4 h-4" />
          </Button>
        </DropdownMenuTrigger>
      </div>

      <DropdownMenuContent align="end" className="w-[400px]">
        <DropdownMenuLabel className="flex items-center justify-between">
          <span>Pending Changes ({changes.length})</span>
          {changes.length > 0 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={handleClearAll}
              className="text-red-600 hover:text-red-700 h-6 px-2"
            >
              Clear All
            </Button>
          )}
        </DropdownMenuLabel>
        <DropdownMenuSeparator />

        {changes.length === 0 ? (
          <div className="p-4 text-center text-gray-500">
            No pending changes
          </div>
        ) : (
          <ScrollArea className="max-h-[400px]">
            {changes.map((change) => (
              <DropdownMenuItem
                key={change.id}
                className="flex items-start gap-3 p-3 cursor-default focus:bg-gray-50"
                onSelect={(e) => e.preventDefault()}
              >
                <div className="flex-1 space-y-1">
                  <div className="flex items-center gap-2">
                    {getTypeIcon(change.type)}
                    <Badge variant="secondary" className={`text-xs ${getTypeColor(change.type)}`}>
                      {change.type}
                    </Badge>
                    <div className="flex items-center gap-1 text-xs text-gray-500 ml-auto">
                      <Clock className="w-3 h-3" />
                      {formatTimestamp(change.timestamp)}
                    </div>
                  </div>
                  <p className="text-sm font-medium text-gray-900 line-clamp-2">
                    {change.description}
                  </p>
                  {change.data?.filePath && (
                    <p className="text-xs text-gray-500 font-mono truncate">
                      {change.data.filePath}
                    </p>
                  )}
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleRemoveChange(change.id);
                  }}
                  className="text-red-600 hover:text-red-700 h-6 w-6 p-0"
                  data-testid={`button-remove-change-${change.id}`}
                >
                  <X className="w-4 h-4" />
                </Button>
              </DropdownMenuItem>
            ))}
          </ScrollArea>
        )}

        <DropdownMenuSeparator />
        <div className="p-2 text-xs text-gray-500 text-center">
          Click SAVE to commit all changes to Git
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
