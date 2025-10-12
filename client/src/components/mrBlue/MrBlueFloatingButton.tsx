import { useState } from 'react';
import { Sparkles, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/auth-context';
import { MrBlueAvatar } from '@/lib/mrBlue/avatar/MrBlueAvatar';
import { VisualPageEditor } from '@/lib/mrBlue/visualEditor/VisualPageEditor';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

/**
 * ESA Mr Blue - Floating Button (Global Component for Super Admins)
 * Provides access to all Mr Blue features: 3D Avatar, Visual Editor, Admin Powers
 */

export function MrBlueFloatingButton() {
  const { user } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [visualEditMode, setVisualEditMode] = useState(false);

  // Only show for super admins
  const isSuperAdmin = user?.profile?.role === 'super_admin' || 
                       user?.profile?.primary_role === 'super_admin';

  if (!isSuperAdmin) {
    return null;
  }

  return (
    <>
      {/* Floating Button */}
      <div 
        className="fixed bottom-6 right-6 z-50"
        data-testid="mr-blue-floating-button"
      >
        {!isOpen && (
          <Button
            onClick={() => setIsOpen(true)}
            size="lg"
            className="rounded-full w-16 h-16 shadow-2xl bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 transition-all duration-300 hover:scale-110"
            data-testid="button-open-mr-blue"
          >
            <Sparkles className="h-8 w-8" />
          </Button>
        )}
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

            <Tabs defaultValue="avatar" className="w-full">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="avatar">Avatar</TabsTrigger>
                <TabsTrigger value="editor">Editor</TabsTrigger>
                <TabsTrigger value="tools">Tools</TabsTrigger>
              </TabsList>

              <TabsContent value="avatar" className="p-4">
                <div className="h-[400px]">
                  <MrBlueAvatar 
                    onMessage={(text) => console.log('Mr Blue:', text)}
                    autoSpeak={true}
                  />
                </div>
              </TabsContent>

              <TabsContent value="editor" className="p-4 space-y-4">
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
                  <p className="text-xs text-muted-foreground">
                    Click any element on the page to edit it
                  </p>
                </div>
              </TabsContent>

              <TabsContent value="tools" className="p-4 space-y-3">
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
                <Button 
                  variant="outline" 
                  className="w-full justify-start"
                  onClick={() => window.location.href = '/settings?tab=subscription'}
                  data-testid="button-subscription"
                >
                  💳 Subscriptions
                </Button>
              </TabsContent>
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
