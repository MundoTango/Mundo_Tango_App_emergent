/**
 * VISUAL EDITOR PAGE - Split-Pane Replit-Style Layout
 * 
 * Layout:
 * - Left: Live preview iframe (resizable)
 * - Right: Editor tabs (Preview, Deploy, Git, Pages, Shell, Files, AI)
 */

import { useState, useEffect } from 'react';
import { useLocation } from 'wouter';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';
import TabSystem, { EditorTab } from '@/components/visual-editor/TabSystem';
import PreviewTab from '@/components/visual-editor/PreviewTab';
import DeployTab from '@/components/visual-editor/DeployTab';
import GitTab from '@/components/visual-editor/GitTab';
import PagesTab from '@/components/visual-editor/PagesTab';
import ShellTab from '@/components/visual-editor/ShellTab';
import FilesTabConnected from '@/components/visual-editor/FilesTabConnected';
import MrBlueAITab from '@/components/visual-editor/MrBlueAITab';
import ConsoleTab from '@/components/visual-editor/ConsoleTab';
import SecretsTab from '@/components/visual-editor/SecretsTab';
import CommandPalette from '@/components/visual-editor/CommandPalette';
import MultiplayerPresence from '@/components/visual-editor/MultiplayerPresence';
import RemoteCursors from '@/components/visual-editor/RemoteCursors';
import { GripVertical } from 'lucide-react';
import { useKeyboardShortcuts, ShortcutAction } from '@/hooks/useKeyboardShortcuts';
import { useMultiplayer } from '@/hooks/useMultiplayer';

interface SelectedElement {
  tag: string;
  id?: string;
  className?: string;
  innerHTML?: string;
  xpath: string;
  filePath?: string;
}

export default function VisualEditorPage() {
  const [location, navigate] = useLocation();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState<EditorTab>('ai');
  const [selectedElement, setSelectedElement] = useState<SelectedElement | null>(null);
  const [previewUrl, setPreviewUrl] = useState('/');
  const [leftWidth, setLeftWidth] = useState(60); // percentage
  const [isDragging, setIsDragging] = useState(false);
  const [commandPaletteOpen, setCommandPaletteOpen] = useState(false);

  // Keyboard shortcuts
  const handleShortcut = (action: ShortcutAction) => {
    const tabMap: Record<string, EditorTab> = {
      'tab-1': 'preview',
      'tab-2': 'console',
      'tab-3': 'deploy',
      'tab-4': 'git',
      'tab-5': 'shell',
      'tab-6': 'files',
      'tab-7': 'secrets',
      'tab-8': 'ai'
    };

    if (action in tabMap) {
      setActiveTab(tabMap[action]);
    } else if (action === 'close') {
      navigate('/');
    } else if (action === 'refresh') {
      setPreviewUrl(prev => prev + '?t=' + Date.now());
    }
  };

  // Cmd+K for Command Palette
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setCommandPaletteOpen(true);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  useKeyboardShortcuts({
    onShortcut: handleShortcut,
    enabled: true
  });

  // Multiplayer collaboration - ACTIVATED!
  const { broadcastCursor, broadcastSelection, broadcastPageChange } = useMultiplayer({
    page: previewUrl,
    enabled: true // Re-enabled - multiplayer is live!
  });

  // Broadcast cursor movement - ACTIVATED!
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      broadcastCursor(e.clientX, e.clientY);
    };
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, [broadcastCursor]);

  // Broadcast page changes - ACTIVATED!
  useEffect(() => {
    broadcastPageChange(previewUrl);
  }, [previewUrl, broadcastPageChange]);

  // Handle split pane resize
  const handleMouseDown = () => setIsDragging(true);
  
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isDragging) return;
      const newWidth = (e.clientX / window.innerWidth) * 100;
      if (newWidth > 30 && newWidth < 80) {
        setLeftWidth(newWidth);
      }
    };

    const handleMouseUp = () => setIsDragging(false);

    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      return () => {
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
      };
    }
  }, [isDragging]);

  // AI Code Generation with file path detection
  const handleGenerateCode = async (prompt: string) => {
    if (!selectedElement) {
      toast({
        title: "No Element Selected",
        description: "Please select an element first",
        variant: "destructive"
      });
      return;
    }

    try {
      // Detect file path from current preview URL
      const urlPath = new URL(previewUrl, window.location.origin).pathname;
      const filePath = detectFilePath(urlPath);

      const response = await apiRequest('/api/visual-editor/generate-code', {
        method: 'POST',
        body: JSON.stringify({
          changes: [{
            id: Date.now().toString(),
            timestamp: new Date(),
            elementSelector: selectedElement.xpath,
            elementPath: selectedElement.xpath,
            componentName: filePath, // Fixed: use actual file path
            changeType: 'style',
            before: {},
            after: { prompt },
            element: selectedElement
          }]
        })
      });

      toast({
        title: "Code Generated",
        description: `AI generated changes for ${filePath}`,
        duration: 3000
      });

      console.log('Generated code:', response);
    } catch (error) {
      toast({
        title: "Generation Failed",
        description: error instanceof Error ? error.message : "Unknown error",
        variant: "destructive"
      });
    }
  };

  // Detect file path from URL route
  const detectFilePath = (urlPath: string): string => {
    const routeMap: Record<string, string> = {
      '/': 'client/src/pages/HomePage.tsx',
      '/memories': 'client/src/pages/MemoriesPage.tsx',
      '/events': 'client/src/pages/EventsPage.tsx',
      '/groups': 'client/src/pages/GroupsPage.tsx',
      '/friends': 'client/src/pages/FriendsPage.tsx',
      '/messages': 'client/src/pages/MessagesPage.tsx',
      '/profile': 'client/src/pages/ProfilePage.tsx'
    };
    
    return routeMap[urlPath] || 'client/src/pages/HomePage.tsx';
  };

  // Listen for messages from preview iframe
  useEffect(() => {
    const handleMessage = (e: MessageEvent) => {
      if (e.data.type === 'ELEMENT_SELECTED') {
        setSelectedElement(e.data.element);
        setActiveTab('ai');
      }
    };

    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, []);

  return (
    <div className="h-screen flex flex-col bg-gray-900">
      {/* Remote cursors overlay */}
      <RemoteCursors page={previewUrl} />
      {/* Header */}
      <div className="bg-gray-800 border-b border-gray-700 px-4 py-2 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
            <span className="text-xl">✨</span>
          </div>
          <div>
            <h1 className="text-white font-semibold">Visual Editor</h1>
            <p className="text-xs text-gray-400">AI-Powered Development Environment</p>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <MultiplayerPresence page={previewUrl} />
          <div className="text-sm text-gray-400">
            Preview: <span className="text-white font-mono">{previewUrl}</span>
          </div>
        </div>
      </div>

      {/* Split Pane Layout */}
      <div className="flex-1 flex relative overflow-hidden">
        {/* Left: Live Preview */}
        <div 
          className="bg-white dark:bg-gray-900 relative"
          style={{ width: `${leftWidth}%` }}
        >
          <iframe
            src={previewUrl}
            title="Live Preview"
            className="w-full h-full border-none"
            data-testid="visual-editor-preview"
          />
        </div>

        {/* Resize Handle */}
        <div
          className={`w-1 bg-gray-700 hover:bg-blue-500 cursor-col-resize flex items-center justify-center group relative ${
            isDragging ? 'bg-blue-500' : ''
          }`}
          onMouseDown={handleMouseDown}
        >
          <GripVertical className="w-4 h-4 text-gray-500 group-hover:text-blue-400 absolute" />
        </div>

        {/* Right: Editor Tabs */}
        <div 
          className="bg-gray-900 flex flex-col"
          style={{ width: `${100 - leftWidth}%` }}
        >
          {/* Tab Navigation */}
          <TabSystem
            activeTab={activeTab}
            onTabChange={setActiveTab}
            onClose={() => window.location.href = previewUrl}
          />

          {/* Tab Content */}
          <div className="flex-1 overflow-auto">
            {activeTab === 'preview' && <PreviewTab currentPath={previewUrl} />}
            {activeTab === 'console' && <ConsoleTab />}
            {activeTab === 'deploy' && <DeployTab />}
            {activeTab === 'git' && <GitTab />}
            {activeTab === 'pages' && <PagesTab />}
            {activeTab === 'shell' && <ShellTab />}
            {activeTab === 'files' && <FilesTabConnected />}
            {activeTab === 'secrets' && <SecretsTab />}
            {activeTab === 'ai' && (
              <MrBlueAITab
                selectedElement={selectedElement}
                currentPage={previewUrl}
                onGenerateCode={handleGenerateCode}
              />
            )}
          </div>

          {/* Footer */}
          <div className="p-3 border-t border-gray-700 bg-gray-800">
            <div className="flex items-center gap-2 text-xs text-gray-400">
              <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
              AI-powered by OpenAI GPT-4o • Replit-style UI
            </div>
          </div>
        </div>
      </div>

      {/* Command Palette (Cmd+K) */}
      <CommandPalette
        isOpen={commandPaletteOpen}
        onClose={() => setCommandPaletteOpen(false)}
        onTabChange={setActiveTab}
      />
    </div>
  );
}
