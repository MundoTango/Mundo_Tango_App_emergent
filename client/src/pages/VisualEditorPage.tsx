/**
 * VISUAL EDITOR PAGE - Split-Pane Replit-Style Layout
 * 
 * Layout:
 * - Left: Live preview iframe (resizable)
 * - Right: Editor tabs (Preview, Deploy, Git, Pages, Shell, Files, AI)
 */

import { useState, useEffect, useRef } from 'react';
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
import { ChatInterface } from '@/components/mrBlue/ChatInterface';
import ConsoleTab from '@/components/visual-editor/ConsoleTab';
import SecretsTab from '@/components/visual-editor/SecretsTab';
// BuildApprovalModal removed - Autonomous execution (Agent #131 - Oct 24, 2025)
import CommandPalette from '@/components/visual-editor/CommandPalette';
import MultiplayerPresence from '@/components/visual-editor/MultiplayerPresence';
import RemoteCursors from '@/components/visual-editor/RemoteCursors';
import { ElementInspector } from '@/components/visual-editor/ElementInspector';
import { AgentAttributionPanel } from '@/components/visual-editor/AgentAttributionPanel';
import { ActivityLogPanel, logActivity } from '@/components/visual-editor/ActivityLogPanel';
import { saveOrchestrator } from '@/services/SaveOrchestrator';
import { GripVertical, Save } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useMultiplayer } from '@/hooks/useMultiplayer';
import { injectOverlayScript } from '@/lib/visual-editor/iframeOverlay';
import { listenToIframe, sendToIframe, type ElementSelection, type StyleMutation } from '@/lib/visual-editor/iframeMessaging';
import { useVisualEditor } from '@/contexts/VisualEditorContext';

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
  const [activeTab, setActiveTab] = useState<EditorTab>('chat'); // 🔧 FIX #1: Mr Blue first!
  const [selectedElement, setSelectedElement] = useState<ElementSelection | null>(null);
  const [pendingStyles, setPendingStyles] = useState<StyleMutation[]>([]);
  const [previewUrl, setPreviewUrl] = useState('/');
  const [leftWidth, setLeftWidth] = useState(60); // percentage
  const [isDragging, setIsDragging] = useState(false);
  const [commandPaletteOpen, setCommandPaletteOpen] = useState(false);
  const iframeRef = useRef<HTMLIFrameElement>(null);
  // Build approval removed - autonomous execution (Agent #131 - Oct 24, 2025)
  
  // 🎨 VISUAL EDITOR CONTEXT: Bridge to Mr Blue (Oct 23, 2025)
  const visualEditorContext = useVisualEditor();
  
  // 🔧 FIX #2 (Oct 27): Inject SaveOrchestrator into context for ChatInterface
  useEffect(() => {
    if (visualEditorContext && !visualEditorContext.saveOrchestrator) {
      // Monkey-patch the context to add saveOrchestrator
      (visualEditorContext as any).saveOrchestrator = saveOrchestrator;
    }
  }, [visualEditorContext, saveOrchestrator]);

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

      // Code generated successfully - response handled by toast
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

  // Inject overlay script when iframe loads
  useEffect(() => {
    const iframe = iframeRef.current;
    if (!iframe) {
      console.log('⏳ Iframe ref not yet available');
      return;
    }

    const injectScript = () => {
      try {
        const doc = iframe.contentDocument || iframe.contentWindow?.document;
        if (!doc || !doc.body) {
          console.warn('⏳ Iframe document not ready yet');
          return false;
        }

        // Check if script already injected
        const existing = doc.getElementById('visual-editor-overlay');
        if (existing) {
          console.log('✅ Visual Editor overlay already injected');
          return true;
        }

        const script = doc.createElement('script');
        script.id = 'visual-editor-overlay';
        script.textContent = injectOverlayScript();
        doc.head.appendChild(script);
        console.log('🎨 Visual Editor overlay script injected successfully');
        return true;
      } catch (error) {
        console.error('❌ Failed to inject overlay script:', error);
        return false;
      }
    };

    // Try immediate injection with delay to ensure iframe is ready
    const attemptInjection = () => {
      const success = injectScript();
      if (!success) {
        // Retry after a short delay
        setTimeout(injectScript, 100);
      }
    };

    // Try now
    attemptInjection();
    
    // Also listen for load event
    const handleLoad = () => {
      console.log('📍 Iframe load event fired');
      injectScript();
    };

    iframe.addEventListener('load', handleLoad);

    return () => {
      iframe.removeEventListener('load', handleLoad);
    };
  }, [previewUrl]); // Don't include iframeRef.current - refs don't trigger re-renders!

  // Listen for messages from preview iframe
  useEffect(() => {
    return listenToIframe((message) => {
      if (message.type === 'ELEMENT_SELECTED') {
        setSelectedElement(message.element);
        
        // 🔥 UPDATE CONTEXT: This makes element visible to Mr Blue! (Oct 23, 2025)
        visualEditorContext.setSelectedElement(message.element);
        visualEditorContext.setPreviewPath(previewUrl);
        
        // 🔧 FIX #1: Don't auto-switch tabs - keep user on current tab
        // setActiveTab('inspector');
        logActivity({
          type: 'selection',
          description: `Selected ${message.element.tagName}${message.element.id ? '#' + message.element.id : ''}`
        });
      } else if (message.type === 'ELEMENT_TEXT_CHANGED') {
        logActivity({
          type: 'edit',
          description: `Edited text in ${message.element.tagName}`
        });
        
        // ✅ FIX #2 (Oct 27): Queue text change to SaveOrchestrator (not visualEditorContext!)
        saveOrchestrator.addChange({
          type: 'content',
          description: `Edit text in ${message.element.tagName}`,
          data: {
            xpath: message.element.xpath,
            tagName: message.element.tagName,
            oldText: message.element.textContent || '',
            newText: message.newText
          }
        });
        console.log(`✅ [Direct Edit] Queued text change, badge now shows ${saveOrchestrator.getPendingChanges().length}`);
        
        toast({
          title: 'Text Updated',
          description: 'Click SAVE to apply changes',
          duration: 2000
        });
      } else if (message.type === 'DELETE_ELEMENT_REQUEST') {
        // Confirm deletion
        if (confirm(`Delete this ${message.element.tagName} element?`)) {
          if (iframeRef.current) {
            sendToIframe(iframeRef.current, { 
              type: 'CONFIRM_DELETE',
              xpath: message.element.xpath 
            });
            setSelectedElement(null);
            
            // ✅ FIX #2 (Oct 27): Queue deletion to SaveOrchestrator
            saveOrchestrator.addChange({
              type: 'structure',
              description: `Delete ${message.element.tagName}`,
              data: {
                xpath: message.element.xpath,
                tagName: message.element.tagName,
                operation: 'delete'
              }
            });
            console.log(`✅ [Direct Edit] Queued deletion, badge now shows ${saveOrchestrator.getPendingChanges().length}`);
            
            toast({
              title: 'Element Deleted',
              description: 'Click SAVE to commit deletion',
              duration: 3000
            });
          }
        }
      } else if (message.type === 'READY') {
        console.log('✅ Visual Editor iframe ready and interactive');
        toast({
          title: 'Visual Editor Ready',
          description: 'Click any element to select it',
          duration: 2000
        });
      }
    });
  }, [toast]);

  // Apply style mutation
  const handleApplyStyle = (mutation: StyleMutation) => {
    if (iframeRef.current) {
      sendToIframe(iframeRef.current, { type: 'APPLY_STYLE', mutation });
      setPendingStyles(prev => [...prev, mutation]);
      
      // Add to SaveOrchestrator
      saveOrchestrator.addChange({
        type: 'style',
        description: `${mutation.property}: ${mutation.value}`,
        data: mutation
      });
      
      logActivity({
        type: 'style',
        description: `Applied style: ${mutation.property}`
      });
      
      toast({
        title: 'Style Applied',
        description: `${mutation.property}: ${mutation.value}`,
      });
    }
  };

  // Save all changes via SaveOrchestrator (Agent #8 Integration)
  const handleSave = async () => {
    const pendingChanges = saveOrchestrator.getPendingChanges();
    
    if (pendingChanges.length === 0) {
      toast({
        title: 'No Changes',
        description: 'Make some changes first',
        variant: 'destructive',
      });
      return;
    }

    // 🤖 AUTONOMOUS EXECUTION: No approval needed (Agent #131 - Oct 24, 2025)
    const aiBuildChanges = pendingChanges.filter(c => c.type === 'ai-build');
    
    if (aiBuildChanges.length > 0) {
      console.log('🤖 [Autonomous] Executing', aiBuildChanges.length, 'AI builds immediately (no approval)');
      toast({
        title: 'Autonomous Execution',
        description: `Mr Blue is applying ${aiBuildChanges.length} changes...`,
      });
    }

    // Proceed with save (all changes including AI builds)
    try {
      toast({
        title: 'Saving Changes...',
        description: `Saving ${pendingChanges.length} changes`,
      });
      
      const result = await saveOrchestrator.saveAll();
      
      if (result.success) {
        setPendingStyles([]);
        logActivity({
          type: 'style',
          description: result.message
        });
        toast({
          title: 'Changes Saved',
          description: result.message,
        });
      } else {
        throw new Error(result.message);
      }
    } catch (error) {
      toast({
        title: 'Save Failed',
        description: error instanceof Error ? error.message : 'Unknown error',
        variant: 'destructive',
      });
    }
  };

  // handleApproveBuild removed - autonomous execution (Agent #131 - Oct 24, 2025)

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
            <p className="text-xs text-gray-400">Cmd+Click to Select • Double-Click to Edit • Delete to Remove</p>
          </div>
        </div>
        
        {/* ✅ FIX #1 (Oct 27): Single SAVE button - removed duplicate */}
        <Button 
          onClick={handleSave}
          disabled={saveOrchestrator.getPendingChanges().length === 0}
          className="bg-gradient-to-r from-teal-500 to-cyan-500 hover:from-teal-600 hover:to-cyan-600 text-white font-semibold shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
          data-testid="button-save-all"
        >
          <Save className="h-4 w-4 mr-2" />
          SAVE
          {saveOrchestrator.getPendingChanges().length > 0 && (
            <span className="ml-2 px-2 py-0.5 bg-white/20 rounded-full text-xs font-bold">
              {saveOrchestrator.getPendingChanges().length}
            </span>
          )}
        </Button>
        
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
            ref={iframeRef}
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
          <div className="flex-1 overflow-auto p-4 space-y-4">
            {activeTab === 'inspector' && (
              <>
                <ElementInspector selectedElement={selectedElement} />
                <AgentAttributionPanel selectedElement={selectedElement} />
                <ActivityLogPanel />
              </>
            )}
            {activeTab === 'console' && <ConsoleTab />}
            {activeTab === 'deploy' && <DeployTab />}
            {activeTab === 'git' && <GitTab />}
            {activeTab === 'pages' && <PagesTab />}
            {activeTab === 'shell' && <ShellTab />}
            {activeTab === 'files' && <FilesTabConnected />}
            {activeTab === 'secrets' && <SecretsTab />}
            {activeTab === 'chat' && (
              <div className="h-full">
                {/* 🎯 WEEK 0 UNIFICATION: Use single ChatInterface component (Oct 24, 2025) */}
                <ChatInterface />
              </div>
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
        onTabChange={(tab) => setActiveTab(tab as EditorTab)}
      />

      {/* 🤖 BUILD APPROVAL MODAL REMOVED - Autonomous execution enabled (Agent #131 - Oct 24, 2025) */}
    </div>
  );
}
