import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Sparkles, Wand2, Globe, CreditCard, BookOpen, Shield } from 'lucide-react';
import { AdminSuperpowers } from '@/lib/mrBlue/admin/AdminSuperpowers';
import { AISiteBuilder } from '@/lib/mrBlue/siteBuilder/AISiteBuilder';
import { SubscriptionManager } from '@/lib/mrBlue/subscriptions/SubscriptionManager';
import { VisualPageEditor } from '@/lib/mrBlue/visualEditor/VisualPageEditor';
// Temporarily disabled due to React version conflict with @react-three packages
// TODO: Fix by downgrading @react-three/fiber and @react-three/drei to React 18 compatible versions
// import { MrBlueAvatar } from '@/lib/mrBlue/avatar/MrBlueAvatar';
import { startTour, TourType } from '@/lib/mrBlue/tours/InteractiveTour';
import { useAuth } from '@/contexts/auth-context';
import { Button } from '@/components/ui/button';

/**
 * ESA Mr Blue Dashboard - Super Admin Control Center
 * Access to all 8 Mr Blue agents (Agents #73-80)
 */

export default function MrBlueDashboard() {
  const { user } = useAuth();
  const [visualEditMode, setVisualEditMode] = useState(false);

  const isSuperAdmin = user?.profile?.role === 'super_admin' || 
                       user?.profile?.primary_role === 'super_admin';

  if (!isSuperAdmin) {
    return (
      <div className="container mx-auto py-8">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5" />
              Access Denied
            </CardTitle>
            <CardDescription>
              This page is only accessible to Super Administrators
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 space-y-6" data-testid="mr-blue-dashboard">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-3">
            <Sparkles className="h-8 w-8 text-blue-500" />
            Mr Blue AI Dashboard
          </h1>
          <p className="text-muted-foreground mt-1">
            Your intelligent platform assistant with 8 specialized agents
          </p>
        </div>
        <Button
          onClick={() => setVisualEditMode(!visualEditMode)}
          variant={visualEditMode ? "destructive" : "default"}
          data-testid="button-toggle-editor"
        >
          <Wand2 className="h-4 w-4 mr-2" />
          {visualEditMode ? 'Exit Edit Mode' : 'Visual Editor'}
        </Button>
      </div>

      {/* Main Dashboard */}
      <Tabs defaultValue="avatar" className="w-full">
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="avatar" className="flex items-center gap-2">
            <Sparkles className="h-4 w-4" />
            Avatar
          </TabsTrigger>
          <TabsTrigger value="admin" className="flex items-center gap-2">
            <Shield className="h-4 w-4" />
            Admin Powers
          </TabsTrigger>
          <TabsTrigger value="builder" className="flex items-center gap-2">
            <Globe className="h-4 w-4" />
            Site Builder
          </TabsTrigger>
          <TabsTrigger value="subscription" className="flex items-center gap-2">
            <CreditCard className="h-4 w-4" />
            Subscriptions
          </TabsTrigger>
          <TabsTrigger value="tours" className="flex items-center gap-2">
            <BookOpen className="h-4 w-4" />
            Tours
          </TabsTrigger>
          <TabsTrigger value="validation" className="flex items-center gap-2">
            <Shield className="h-4 w-4" />
            Validation
          </TabsTrigger>
        </TabsList>

        {/* Agent #73: 3D Avatar */}
        <TabsContent value="avatar" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Agent #73: 3D AI Avatar</CardTitle>
              <CardDescription>
                Your personal AI companion with voice input/output
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[500px] flex items-center justify-center bg-gradient-to-br from-blue-50 to-purple-50 dark:from-blue-950 dark:to-purple-950 rounded-lg border-2 border-dashed border-blue-300 dark:border-blue-700">
                <div className="text-center p-8">
                  <Sparkles className="h-20 w-20 mx-auto mb-4 text-blue-500 animate-pulse" />
                  <h3 className="text-xl font-semibold mb-2">3D Avatar Coming Soon</h3>
                  <p className="text-sm text-muted-foreground max-w-md">
                    Agent #73 (3D AI Avatar) is temporarily disabled while we update the @react-three packages for React 19 compatibility. This will be resolved soon!
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Agent #76: Admin Superpowers */}
        <TabsContent value="admin" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Agent #76: Admin Superpowers</CardTitle>
              <CardDescription>
                Control your platform with natural language commands
              </CardDescription>
            </CardHeader>
            <CardContent>
              <AdminSuperpowers userRole="super_admin" />
            </CardContent>
          </Card>
        </TabsContent>

        {/* Agent #77: AI Site Builder */}
        <TabsContent value="builder" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Agent #77: AI Site Builder</CardTitle>
              <CardDescription>
                Generate complete websites in under 30 seconds
              </CardDescription>
            </CardHeader>
            <CardContent>
              <AISiteBuilder onSiteGenerated={(site) => {
                console.log('Site generated:', site);
              }} />
            </CardContent>
          </Card>
        </TabsContent>

        {/* Agent #75: Subscription Manager */}
        <TabsContent value="subscription" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Agent #75: Subscription Manager</CardTitle>
              <CardDescription>
                Manage platform subscriptions and feature access
              </CardDescription>
            </CardHeader>
            <CardContent>
              <SubscriptionManager 
                currentTier="free" 
                onUpgrade={(tier) => console.log('Upgrade to:', tier)} 
              />
            </CardContent>
          </Card>
        </TabsContent>

        {/* Agent #74: Interactive Tours */}
        <TabsContent value="tours" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Agent #74: Interactive Tours</CardTitle>
              <CardDescription>
                Guide users through platform features
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <p className="text-sm text-muted-foreground mb-4">
                  Launch interactive tours to guide users through platform features
                </p>
                <div className="grid grid-cols-2 gap-4">
                  <Button onClick={() => startTour('welcome')}>
                    Start Welcome Tour
                  </Button>
                  <Button onClick={() => startTour('host')} variant="outline">
                    Start Host Tour
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Agent #79 & #80: Validation & Learning */}
        <TabsContent value="validation" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Agents #79 & #80: Quality & Learning</CardTitle>
              <CardDescription>
                Validation metrics and inter-agent learning insights
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid grid-cols-3 gap-4">
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm">Validations</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-2xl font-bold">247</p>
                      <p className="text-xs text-muted-foreground">Total checks run</p>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm">Learnings</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-2xl font-bold">1,432</p>
                      <p className="text-xs text-muted-foreground">Patterns captured</p>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm">Fix Success</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-2xl font-bold">98%</p>
                      <p className="text-xs text-muted-foreground">AI suggestions</p>
                    </CardContent>
                  </Card>
                </div>
                <Button className="w-full" variant="outline">
                  View Detailed Metrics
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Visual Editor Overlay */}
      <VisualPageEditor 
        enabled={visualEditMode}
        onToggle={setVisualEditMode}
      />
    </div>
  );
}
