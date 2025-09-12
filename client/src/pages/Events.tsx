
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogTrigger } from '@/components/ui/dialog';
import { Plus, Calendar, List, Settings } from 'lucide-react';
import EventDiscoveryFeed from '@/components/events/EventDiscoveryFeed';
import EventCreationWizard from '@/components/events/EventCreationWizard';
import RecurringEventManager from '@/components/events/RecurringEventManager';
import { useAuth } from '@/hooks/useAuth';
import { toast } from '@/hooks/use-toast';

const Events: React.FC = () => {
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [showRecurringManager, setShowRecurringManager] = useState(false);
  const { user } = useAuth();

  const handleEventCreated = (eventData: any) => {
    setShowCreateDialog(false);
    toast({
      title: 'Event Created Successfully',
      description: `"${eventData.title}" has been created and published.`,
    });
  };

  const handleRecurringComplete = () => {
    setShowRecurringManager(false);
    toast({
      title: 'Recurring Events Set Up',
      description: 'Your recurring event series has been configured.',
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-turquoise-50">
      <div className="max-w-7xl mx-auto p-6">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-turquoise-400 to-cyan-500 bg-clip-text text-transparent">
              Events
            </h1>
            <p className="text-gray-600 mt-1">Discover and manage tango events</p>
          </div>

          <div className="flex gap-3">
            {user && (
              <>
                <Dialog open={showRecurringManager} onOpenChange={setShowRecurringManager}>
                  <DialogTrigger asChild>
                    <Button variant="outline" className="bg-white/50 border-white/30">
                      <Settings className="h-4 w-4 mr-2" />
                      Recurring Events
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                    <RecurringEventManager onComplete={handleRecurringComplete} />
                  </DialogContent>
                </Dialog>

                <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
                  <DialogTrigger asChild>
                    <Button className="bg-gradient-to-r from-turquoise-500 to-cyan-600 hover:from-turquoise-600 hover:to-cyan-700">
                      <Plus className="h-4 w-4 mr-2" />
                      Create Event
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                    <EventCreationWizard
                      onComplete={handleEventCreated}
                      onCancel={() => setShowCreateDialog(false)}
                    />
                  </DialogContent>
                </Dialog>
              </>
            )}
          </div>
        </div>

        {/* Main Content */}
        <Tabs defaultValue="discover" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3 bg-white/50 backdrop-blur-xl border border-white/20">
            <TabsTrigger 
              value="discover" 
              className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-turquoise-500 data-[state=active]:to-cyan-600 data-[state=active]:text-white"
            >
              <List className="h-4 w-4 mr-2" />
              Discover
            </TabsTrigger>
            <TabsTrigger 
              value="calendar"
              className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-turquoise-500 data-[state=active]:to-cyan-600 data-[state=active]:text-white"
            >
              <Calendar className="h-4 w-4 mr-2" />
              Calendar
            </TabsTrigger>
            <TabsTrigger 
              value="my-events"
              className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-turquoise-500 data-[state=active]:to-cyan-600 data-[state=active]:text-white"
            >
              <Settings className="h-4 w-4 mr-2" />
              My Events
            </TabsTrigger>
          </TabsList>

          <TabsContent value="discover" className="space-y-6">
            <EventDiscoveryFeed />
          </TabsContent>

          <TabsContent value="calendar" className="space-y-6">
            <Card className="bg-gradient-to-br from-white/90 via-white/80 to-turquoise-50/30 backdrop-blur-xl border border-white/20">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="h-5 w-5 text-turquoise-500" />
                  Event Calendar
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-center h-64 text-gray-500">
                  Calendar view coming soon...
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="my-events" className="space-y-6">
            {user ? (
              <Card className="bg-gradient-to-br from-white/90 via-white/80 to-turquoise-50/30 backdrop-blur-xl border border-white/20">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Settings className="h-5 w-5 text-turquoise-500" />
                    My Events
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-center h-64 text-gray-500">
                    Your organized events will appear here...
                  </div>
                </CardContent>
              </Card>
            ) : (
              <Card className="bg-gradient-to-br from-white/90 via-white/80 to-turquoise-50/30 backdrop-blur-xl border border-white/20">
                <CardContent className="flex flex-col items-center justify-center py-12">
                  <h3 className="text-lg font-semibold text-gray-600 mb-2">Sign in Required</h3>
                  <p className="text-gray-500 text-center mb-4">
                    Please sign in to manage your events
                  </p>
                  <Button onClick={() => window.location.href = '/auth/login'}>
                    Sign In
                  </Button>
                </CardContent>
              </Card>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Events;
