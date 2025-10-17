/**
 * COMMAND PALETTE (CLUI) - Quick Command Interface
 * Matches Replit's CLUI functionality - Triggered by Cmd+K
 */

import { useState, useEffect, useRef } from 'react';
import { Search, Terminal, FileText, GitBranch, Rocket, Key, Code2, Zap } from 'lucide-react';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';

interface Command {
  id: string;
  label: string;
  description: string;
  icon: any;
  action: () => void;
  category: string;
  keywords: string[];
}

interface CommandPaletteProps {
  isOpen: boolean;
  onClose: () => void;
  onTabChange: (tab: string) => void;
}

export default function CommandPalette({ isOpen, onClose, onTabChange }: CommandPaletteProps) {
  const [search, setSearch] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  const commands: Command[] = [
    {
      id: 'switch-console',
      label: 'Open Console',
      description: 'View workflow logs',
      icon: Terminal,
      action: () => { onTabChange('console'); onClose(); },
      category: 'Navigation',
      keywords: ['console', 'logs', 'output']
    },
    {
      id: 'switch-files',
      label: 'Open Files',
      description: 'Browse project files',
      icon: FileText,
      action: () => { onTabChange('files'); onClose(); },
      category: 'Navigation',
      keywords: ['files', 'explorer', 'tree']
    },
    {
      id: 'switch-git',
      label: 'Open Git',
      description: 'Version control',
      icon: GitBranch,
      action: () => { onTabChange('git'); onClose(); },
      category: 'Navigation',
      keywords: ['git', 'commit', 'push']
    },
    {
      id: 'switch-deploy',
      label: 'Open Deploy',
      description: 'Deploy your app',
      icon: Rocket,
      action: () => { onTabChange('deploy'); onClose(); },
      category: 'Navigation',
      keywords: ['deploy', 'publish', 'production']
    },
    {
      id: 'switch-secrets',
      label: 'Open Secrets',
      description: 'Manage environment variables',
      icon: Key,
      action: () => { onTabChange('secrets'); onClose(); },
      category: 'Navigation',
      keywords: ['secrets', 'env', 'keys']
    },
    {
      id: 'switch-shell',
      label: 'Open Shell',
      description: 'Terminal access',
      icon: Terminal,
      action: () => { onTabChange('shell'); onClose(); },
      category: 'Navigation',
      keywords: ['shell', 'terminal', 'bash']
    },
    {
      id: 'switch-ai',
      label: 'Open AI Assistant',
      description: 'Mr Blue AI help',
      icon: Zap,
      action: () => { onTabChange('ai'); onClose(); },
      category: 'Navigation',
      keywords: ['ai', 'assistant', 'mr blue', 'help']
    }
  ];

  const filteredCommands = commands.filter(cmd =>
    cmd.label.toLowerCase().includes(search.toLowerCase()) ||
    cmd.description.toLowerCase().includes(search.toLowerCase()) ||
    cmd.keywords.some(k => k.includes(search.toLowerCase()))
  );

  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
      setSearch('');
      setSelectedIndex(0);
    }
  }, [isOpen]);

  useEffect(() => {
    setSelectedIndex(0);
  }, [search]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex(i => (i + 1) % filteredCommands.length);
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex(i => (i - 1 + filteredCommands.length) % filteredCommands.length);
    } else if (e.key === 'Enter' && filteredCommands[selectedIndex]) {
      e.preventDefault();
      filteredCommands[selectedIndex].action();
    } else if (e.key === 'Escape') {
      onClose();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl p-0 bg-gray-900 border-gray-700">
        <div className="flex flex-col max-h-[500px]">
          {/* Search Input */}
          <div className="p-3 border-b border-gray-700">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input
                ref={inputRef}
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Type a command or search..."
                className="pl-10 bg-gray-800 border-gray-600 text-white"
                data-testid="input-command-palette"
              />
            </div>
          </div>

          {/* Commands List */}
          <div className="flex-1 overflow-auto">
            {filteredCommands.length === 0 ? (
              <div className="text-gray-500 text-center py-8">
                No commands found for "{search}"
              </div>
            ) : (
              filteredCommands.map((cmd, index) => {
                const Icon = cmd.icon;
                return (
                  <div
                    key={cmd.id}
                    onClick={() => cmd.action()}
                    className={`flex items-center gap-3 px-4 py-3 cursor-pointer transition-colors ${
                      index === selectedIndex
                        ? 'bg-blue-600 text-white'
                        : 'hover:bg-gray-800 text-gray-300'
                    }`}
                    data-testid={`command-${cmd.id}`}
                  >
                    <Icon className="w-5 h-5" />
                    <div className="flex-1">
                      <div className="font-semibold">{cmd.label}</div>
                      <div className="text-xs opacity-75">{cmd.description}</div>
                    </div>
                    <div className="text-xs opacity-50">{cmd.category}</div>
                  </div>
                );
              })
            )}
          </div>

          {/* Footer */}
          <div className="p-2 border-t border-gray-700 bg-gray-800 text-xs text-gray-400 flex items-center justify-between">
            <span>Press Cmd+K to open command palette</span>
            <span>↑↓ Navigate • Enter Select • Esc Close</span>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
