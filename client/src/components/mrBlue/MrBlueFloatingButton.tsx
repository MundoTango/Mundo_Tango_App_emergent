import { useState } from 'react';
import { Sparkles, X, Search, Bot, Wrench } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/useAuth';
// Temporarily disabled due to React version conflict with @react-three packages
// TODO: Fix by downgrading @react-three/fiber and @react-three/drei to React 18 compatible versions
// import { MrBlueAvatar } from '@/lib/mrBlue/avatar/MrBlueAvatar';
import { VisualPageEditor } from '@/lib/mrBlue/visualEditor/VisualPageEditor';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { isSuperAdmin } from '@/utils/accessControl';

/**
 * ESA Mr Blue - Universal AI Companion (ALL Users)
 * 
 * For Regular Users: Life CEO agents, platform search, AI help
 * For Super Admins: Visual editor, site builder, admin powers
 */

export function MrBlueFloatingButton() {
  console.log('🔵 [MR BLUE] Component executing - START');
  const { user } = useAuth();
  console.log('🔵 [MR BLUE] User from hook:', user);
  const [isOpen, setIsOpen] = useState(false);
  const [visualEditMode, setVisualEditMode] = useState(false);

  const isAdmin = isSuperAdmin(user);
  console.log('🔵 [MR BLUE] isAdmin:', isAdmin);
  
  // TEST MODE: Always show (bypassing access control for debugging)
  const testMode = true;
  console.log('🔵 [MR BLUE] testMode:', testMode, 'user:', !!user);
  
  if (!testMode && !user) {
    console.log('🔵 [MR BLUE] RETURNING NULL - no user');
    return null;
  }

  console.log('🔵 [MR BLUE] RENDERING BUTTON');
  return (
    <>
      {/* TEST: Simple div to verify positioning */}
      <div 
        className="fixed bottom-6 right-6 z-[9999] w-16 h-16 bg-red-500 rounded-full shadow-2xl"
        data-testid="mr-blue-test-div"
        style={{ backgroundColor: 'red', width: '64px', height: '64px' }}
      >
        TEST
      </div>

      {/* Mr Blue Panel */}
      {isOpen && (
        <Card className="fixed bottom-24 right-6 w-96 max-h-[600px] shadow-2xl z-50 animate-in slide-in-from-right">
          <CardContent className="p-0">
            <div className="flex items-center justify-between p-4 border-b">
              <div className="flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-blue-500" />
                <h3 className="font-semibold">Mr Blue AI Companion</h3>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsOpen(false)}
                data-testid="button-close-mr-blue"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>

            <Tabs defaultValue={isAdmin ? "avatar" : "lifeceo"} className="w-full">
              {/* Role-based Tab Layout */}
              <TabsList className={`grid w-full ${isAdmin ? 'grid-cols-4' : 'grid-cols-3'}`}>
                {/* Regular User Tabs */}
                <TabsTrigger value="lifeceo">
                  <Bot className="h-4 w-4 mr-2" />
                  Life CEO
                </TabsTrigger>
                <TabsTrigger value="search">
                  <Search className="h-4 w-4 mr-2" />
                  Search
                </TabsTrigger>
                <TabsTrigger value="avatar">
                  <Sparkles className="h-4 w-4 mr-2" />
                  AI Chat
                </TabsTrigger>
                
                {/* Admin-Only Tab */}
                {isAdmin && (
                  <TabsTrigger value="admin">
                    <Wrench className="h-4 w-4 mr-2" />
                    Admin
                  </TabsTrigger>
                )}
              </TabsList>

              {/* Life CEO Tab - All Users */}
              <TabsContent value="lifeceo" className="p-4">
                <div className="space-y-4">
                  <h3 className="font-semibold text-lg">Your Life CEO Agents</h3>
                  <p className="text-sm text-muted-foreground">
                    16 specialized AI agents helping you manage your life
                  </p>
                  <div className="grid grid-cols-2 gap-2">
                    <Button variant="outline" size="sm">📅 Schedule Agent</Button>
                    <Button variant="outline" size="sm">💰 Finance Agent</Button>
                    <Button variant="outline" size="sm">🏋️ Health Agent</Button>
                    <Button variant="outline" size="sm">🎯 Goals Agent</Button>
                  </div>
                </div>
              </TabsContent>

              {/* Platform Search Tab - All Users */}
              <TabsContent value="search" className="p-4">
                <div className="space-y-4">
                  <h3 className="font-semibold text-lg">Search Platform</h3>
                  <div className="space-y-2">
                    <input 
                      type="text" 
                      placeholder="Search events, users, posts..."
                      className="w-full px-3 py-2 border rounded-lg"
                    />
                    <p className="text-xs text-muted-foreground">
                      Search across all platform content
                    </p>
                  </div>
                </div>
              </TabsContent>

              {/* AI Chat Tab - All Users */}
              <TabsContent value="avatar" className="p-4">
                <div className="h-[400px] flex items-center justify-center bg-gradient-to-br from-blue-50 to-purple-50 dark:from-blue-950 dark:to-purple-950 rounded-lg border-2 border-dashed border-blue-300 dark:border-blue-700">
                  <div className="text-center p-8">
                    <Sparkles className="h-16 w-16 mx-auto mb-4 text-blue-500" />
                    <h3 className="text-lg font-semibold mb-2">AI Assistant</h3>
                    <p className="text-sm text-muted-foreground max-w-xs">
                      Chat with Mr Blue for help with the platform
                    </p>
                  </div>
                </div>
              </TabsContent>

              {/* Admin Tab - Super Admins Only */}
              {isAdmin && (
                <TabsContent value="admin" className="p-4 space-y-4">
                  <h3 className="font-semibold text-lg">Admin Powers</h3>
                  
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Visual Page Editor</label>
                    <Button
                      onClick={() => {
                        setVisualEditMode(!visualEditMode);
                        setIsOpen(false);
                      }}
                      variant={visualEditMode ? "destructive" : "default"}
                      className="w-full"
                      data-testid="button-toggle-visual-editor"
                    >
                      {visualEditMode ? 'Exit Edit Mode' : 'Enter Edit Mode'}
                    </Button>
                  </div>

                  <div className="space-y-2">
                    <Button 
                      variant="outline" 
                      className="w-full justify-start"
                      onClick={() => window.location.href = '/admin/mr-blue'}
                      data-testid="button-admin-dashboard"
                    >
                      🎨 Admin Dashboard
                    </Button>
                    <Button 
                      variant="outline" 
                      className="w-full justify-start"
                      onClick={() => window.location.href = '/admin/site-builder'}
                      data-testid="button-site-builder"
                    >
                      🌐 AI Site Builder
                    </Button>
                  </div>
                </TabsContent>
              )}
            </Tabs>
          </CardContent>
        </Card>
      )}

      {/* Visual Editor Overlay */}
      <VisualPageEditor 
        enabled={visualEditMode}
        onToggle={setVisualEditMode}
      />
    </>
  );
}

export default MrBlueFloatingButton;
