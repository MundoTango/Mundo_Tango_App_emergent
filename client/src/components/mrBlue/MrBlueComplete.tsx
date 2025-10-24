/**
 * ESA Mr Blue AI Companion - COMPLETE REBUILD
 * mb.md specification implementation
 * 10 Tabs + Chat Interface + Backend Integration + WCAG 2.1 AA
 */

import { useState, useEffect } from 'react';
import { 
  Sparkles, X, Maximize2, Minimize2,
  MessageSquare, Map, CreditCard, Search, Code, Palette, Wand2, 
  CheckCircle2, Brain, Shield
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useAuth } from '@/hooks/useAuth';
import { isSuperAdmin } from '@/utils/accessControl';
import { ChatInterface } from './ChatInterface';
import ToursTab from './tabs/ToursTab';
import SubscriptionsTab from './tabs/SubscriptionsTab';
import SiteBuilderTab from './tabs/SiteBuilderTab';
import VisualEditorTab from './tabs/VisualEditorTab';
import AvatarAITab from './tabs/AvatarAITab';
import QualityTab from './tabs/QualityTab';
import SearchTab from './tabs/SearchTab';
import LifeCEOTab from './tabs/LifeCEOTab';
import AdminTab from './tabs/AdminTab';

// ============ MAIN COMPONENT ============
export function MrBlueComplete() {
  const [isOpen, setIsOpen] = useState(false);
  const [isMaximized, setIsMaximized] = useState(false);
  const [activeTab, setActiveTab] = useState('chat');
  const { user } = useAuth();
  const isAdmin = user && isSuperAdmin(user);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.ctrlKey && e.key === 'k') {
        e.preventDefault();
        setIsOpen(true);
      }
      if (e.key === 'Escape' && isOpen) {
        setIsOpen(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen]);

  return (
    <>
      {/* Floating Button */}
      <Button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 z-50 h-14 w-14 rounded-full bg-gradient-to-br from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 shadow-lg shadow-cyan-500/50 hover:shadow-xl hover:shadow-cyan-500/60 transition-all duration-300"
        data-testid="button-open-mrblue"
        aria-label="Open Mr Blue AI Assistant"
      >
        <Sparkles className="h-6 w-6 text-white" />
      </Button>

      {/* Modal Dialog */}
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent 
          className={`p-0 gap-0 border-0 flex flex-col bg-gradient-to-br from-cyan-50 via-blue-50 to-teal-50 ${
            isMaximized ? 'w-screen h-screen max-w-none' : 'w-[95vw] h-[85vh] max-w-6xl'
          }`}
          data-testid="dialog-mrblue"
          aria-describedby="mrblue-description"
        >
          <DialogTitle className="sr-only">Mr Blue AI Companion</DialogTitle>
          <DialogDescription id="mrblue-description" className="sr-only">
            Your intelligent AI assistant with 16 Life CEO agents, featuring chat, tours, subscriptions, search, site builder, visual editor, avatar AI, quality controls, and admin tools.
          </DialogDescription>
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-cyan-200 bg-white/50 backdrop-blur-sm">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-full bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center">
                <Sparkles className="h-6 w-6 text-white" />
              </div>
              <div>
                <h2 className="text-xl font-bold bg-gradient-to-r from-cyan-600 to-blue-600 bg-clip-text text-transparent">
                  Mr Blue AI Companion
                </h2>
                <p className="text-sm text-gray-600">
                  Your intelligent assistant + 16 Life CEO agents
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setIsMaximized(!isMaximized)}
                className="h-8 w-8"
                data-testid="button-toggle-maximize"
                aria-label={isMaximized ? "Minimize window" : "Maximize window"}
              >
                {isMaximized ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setIsOpen(false)}
                className="h-8 w-8"
                data-testid="button-close-mrblue"
                aria-label="Close Mr Blue"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Content Area */}
          <div className="flex-1 overflow-hidden flex flex-col">
            <Tabs value={activeTab} onValueChange={setActiveTab} className="h-full w-full flex flex-col">
              {/* Tab Navigation */}
              <TabsList className="w-full justify-start rounded-none border-b border-cyan-200 bg-white/30 p-2 overflow-x-auto flex-shrink-0">
                <TabsTrigger value="chat" className="gap-2" data-testid="tab-chat">
                  <MessageSquare className="h-4 w-4" />
                  <span className="hidden sm:inline">Chat</span>
                </TabsTrigger>
                <TabsTrigger value="tours" className="gap-2" data-testid="tab-tours">
                  <Map className="h-4 w-4" />
                  <span className="hidden sm:inline">Tours</span>
                </TabsTrigger>
                <TabsTrigger value="subscriptions" className="gap-2" data-testid="tab-subscriptions">
                  <CreditCard className="h-4 w-4" />
                  <span className="hidden sm:inline">Subscriptions</span>
                </TabsTrigger>
                <TabsTrigger value="search" className="gap-2" data-testid="tab-search">
                  <Search className="h-4 w-4" />
                  <span className="hidden sm:inline">Search</span>
                </TabsTrigger>
                <TabsTrigger value="life-ceo" className="gap-2" data-testid="tab-lifeceo">
                  <Brain className="h-4 w-4" />
                  <span className="hidden sm:inline">Life CEO</span>
                </TabsTrigger>
                {isAdmin && (
                  <>
                    <TabsTrigger value="site-builder" className="gap-2" data-testid="tab-sitebuilder">
                      <Code className="h-4 w-4" />
                      <span className="hidden sm:inline">Site Builder</span>
                    </TabsTrigger>
                    <TabsTrigger value="visual-editor" className="gap-2" data-testid="tab-visualeditor">
                      <Palette className="h-4 w-4" />
                      <span className="hidden sm:inline">Visual Editor</span>
                    </TabsTrigger>
                    <TabsTrigger value="avatar-ai" className="gap-2" data-testid="tab-avatar">
                      <Wand2 className="h-4 w-4" />
                      <span className="hidden sm:inline">Avatar AI</span>
                    </TabsTrigger>
                    <TabsTrigger value="quality" className="gap-2" data-testid="tab-quality">
                      <CheckCircle2 className="h-4 w-4" />
                      <span className="hidden sm:inline">Quality</span>
                    </TabsTrigger>
                  </>
                )}
                {isAdmin && (
                  <TabsTrigger value="admin" className="gap-2" data-testid="tab-admin">
                    <Shield className="h-4 w-4" />
                    <span className="hidden sm:inline">Admin</span>
                  </TabsTrigger>
                )}
              </TabsList>

              {/* Tab Content */}
              <TabsContent value="chat" className="flex-1 m-0 p-0 min-h-[500px]">
                <ChatInterface />
              </TabsContent>
              <TabsContent value="tours" className="flex-1 m-0 p-4 min-h-[500px] overflow-auto">
                <ToursTab />
              </TabsContent>
              <TabsContent value="subscriptions" className="flex-1 m-0 p-4 min-h-[500px] overflow-auto">
                <SubscriptionsTab />
              </TabsContent>
              <TabsContent value="search" className="flex-1 m-0 p-4 min-h-[500px] overflow-auto">
                <SearchTab />
              </TabsContent>
              <TabsContent value="life-ceo" className="flex-1 m-0 p-4 min-h-[500px] overflow-auto">
                <LifeCEOTab />
              </TabsContent>
              {isAdmin && (
                <>
                  <TabsContent value="site-builder" className="flex-1 m-0 p-4 min-h-[500px] overflow-auto">
                    <SiteBuilderTab />
                  </TabsContent>
                  <TabsContent value="visual-editor" className="flex-1 m-0 p-4 min-h-[500px] overflow-auto">
                    <VisualEditorTab />
                  </TabsContent>
                  <TabsContent value="avatar-ai" className="flex-1 m-0 p-4 min-h-[500px] overflow-auto">
                    <AvatarAITab />
                  </TabsContent>
                  <TabsContent value="quality" className="flex-1 m-0 p-4 min-h-[500px] overflow-auto">
                    <QualityTab />
                  </TabsContent>
                </>
              )}
              {isAdmin && (
                <TabsContent value="admin" className="flex-1 m-0 p-4 min-h-[500px] overflow-auto">
                  <AdminTab />
                </TabsContent>
              )}
            </Tabs>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
