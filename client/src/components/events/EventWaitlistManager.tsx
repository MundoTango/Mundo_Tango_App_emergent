import React, { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { 
  Clock, 
  Users, 
  ArrowUp, 
  ArrowDown, 
  X,
  Bell,
  BellOff
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';
import type { EventWaitlist, ApiResponse } from '@/shared/apiTypes';

interface EventWaitlistManagerProps {
  eventId: number;
  isEventOwner?: boolean;
  isEventFull?: boolean;
  maxAttendees?: number;
  currentAttendees?: number;
  userWaitlistStatus?: {
    isOnWaitlist: boolean;
    position?: number;
  };
}

export default function EventWaitlistManager({
  eventId,
  isEventOwner = false,
  isEventFull = false,
  maxAttendees,
  currentAttendees = 0,
  userWaitlistStatus
}: EventWaitlistManagerProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [showWaitlistDetails, setShowWaitlistDetails] = useState(false);

  // Fetch waitlist data
  const { data: waitlistData, isLoading } = useQuery<ApiResponse<EventWaitlist[]>>({
    queryKey: [`/api/events/${eventId}/waitlist`],
    enabled: isEventOwner || showWaitlistDetails,
    staleTime: 30000 // Refresh every 30 seconds
  });

  const waitlist = waitlistData?.data || [];

  // Join/Leave waitlist mutation
  const waitlistMutation = useMutation({
    mutationFn: async (action: 'join' | 'leave') => {
      return apiRequest(`/api/events/${eventId}/waitlist`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action })
      });
    },
    onSuccess: (data, action) => {
      const message = action === 'join' 
        ? `Added to waitlist at position ${data.data?.position || 'unknown'}` 
        : 'Removed from waitlist';
      
      toast({
        title: "Waitlist Updated",
        description: message
      });
      
      queryClient.invalidateQueries({ queryKey: [`/api/events/${eventId}/waitlist`] });
      queryClient.invalidateQueries({ queryKey: ['/api/events'] });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || 'Failed to update waitlist status',
        variant: "destructive"
      });
    }
  });

  // Promote user from waitlist mutation (event owners only)
  const promoteMutation = useMutation({
    mutationFn: async (userId: number) => {
      return apiRequest(`/api/events/${eventId}/waitlist/${userId}/promote`, {
        method: 'POST'
      });
    },
    onSuccess: () => {
      toast({
        title: "User Promoted",
        description: "User has been moved from waitlist to attendees"
      });
      
      queryClient.invalidateQueries({ queryKey: [`/api/events/${eventId}/waitlist`] });
      queryClient.invalidateQueries({ queryKey: ['/api/events'] });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || 'Failed to promote user',
        variant: "destructive"
      });
    }
  });

  const handleJoinWaitlist = () => {
    waitlistMutation.mutate('join');
  };

  const handleLeaveWaitlist = () => {
    waitlistMutation.mutate('leave');
  };

  const handlePromoteUser = (userId: number) => {
    if (window.confirm('Promote this user from waitlist to attendees?')) {
      promoteMutation.mutate(userId);
    }
  };

  // Calculate waitlist statistics
  const waitlistCount = waitlist.length;
  const availableSpots = maxAttendees ? Math.max(0, maxAttendees - currentAttendees) : 0;
  const estimatedWaitTime = Math.ceil(waitlistCount / Math.max(1, availableSpots)) * 24; // Rough estimate in hours

  return (
    <div className="space-y-4">
      {/* Waitlist Status Card */}
      <Card className="glassmorphic-card border-turquoise-200/50">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg flex items-center gap-2">
              <Clock className="h-5 w-5 text-turquoise-600" />
              Event Waitlist
              {waitlistCount > 0 && (
                <Badge variant="secondary" className="bg-turquoise-100 text-turquoise-800">
                  {waitlistCount} waiting
                </Badge>
              )}
            </CardTitle>
            
            {isEventOwner && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowWaitlistDetails(!showWaitlistDetails)}
                className="text-turquoise-600 hover:bg-turquoise-50"
              >
                {showWaitlistDetails ? 'Hide Details' : 'Manage'}
              </Button>
            )}
          </div>
        </CardHeader>
        
        <CardContent className="space-y-4">
          {/* Event Capacity Info */}
          {maxAttendees && (
            <div className="flex items-center justify-between p-3 bg-gradient-to-r from-turquoise-50 to-cyan-50 rounded-lg">
              <div className="flex items-center gap-2">
                <Users className="h-4 w-4 text-turquoise-600" />
                <span className="font-medium">Capacity</span>
              </div>
              <div className="text-right">
                <div className="font-semibold">
                  {currentAttendees} / {maxAttendees}
                </div>
                <div className="text-sm text-gray-600">
                  {availableSpots > 0 ? `${availableSpots} spots left` : 'Event Full'}
                </div>
              </div>
            </div>
          )}

          {/* User Waitlist Status */}
          {userWaitlistStatus?.isOnWaitlist && (
            <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
              <div className="flex items-center justify-between">
                <div>
                  <div className="font-medium text-yellow-800">
                    You're on the waitlist
                  </div>
                  <div className="text-sm text-yellow-600">
                    Position #{userWaitlistStatus.position} • 
                    {estimatedWaitTime > 0 && (
                      <span className="ml-1">
                        Est. wait: {estimatedWaitTime < 24 ? `${estimatedWaitTime}h` : `${Math.ceil(estimatedWaitTime / 24)}d`}
                      </span>
                    )}
                  </div>
                </div>
                
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleLeaveWaitlist}
                  disabled={waitlistMutation.isPending}
                  className="border-yellow-300 text-yellow-700 hover:bg-yellow-100"
                >
                  Leave Waitlist
                </Button>
              </div>
            </div>
          )}

          {/* Join Waitlist Button */}
          {!userWaitlistStatus?.isOnWaitlist && isEventFull && (
            <Button
              onClick={handleJoinWaitlist}
              disabled={waitlistMutation.isPending}
              className="w-full bg-gradient-to-r from-turquoise-500 to-cyan-600 hover:from-turquoise-600 hover:to-cyan-700"
            >
              <Clock className="mr-2 h-4 w-4" />
              {waitlistMutation.isPending ? 'Joining...' : 'Join Waitlist'}
            </Button>
          )}

          {/* Waitlist Info for Non-Full Events */}
          {!isEventFull && waitlistCount > 0 && (
            <div className="text-center text-sm text-gray-600 p-2 bg-gray-50 rounded">
              {waitlistCount} {waitlistCount === 1 ? 'person' : 'people'} on waitlist
            </div>
          )}
        </CardContent>
      </Card>

      {/* Waitlist Management (Event Owners Only) */}
      {isEventOwner && showWaitlistDetails && (
        <Card className="glassmorphic-card border-turquoise-200/50">
          <CardHeader>
            <CardTitle className="text-lg">Waitlist Management</CardTitle>
          </CardHeader>
          
          <CardContent>
            {isLoading ? (
              <div className="text-center py-4 text-gray-500">
                Loading waitlist...
              </div>
            ) : waitlist.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <Clock className="h-12 w-12 mx-auto mb-3 text-gray-300" />
                <p>No one on the waitlist yet</p>
                <p className="text-sm mt-1">People will be added here when your event is full</p>
              </div>
            ) : (
              <div className="space-y-3">
                {waitlist.map((entry, index) => (
                  <div 
                    key={entry.id}
                    className="flex items-center justify-between p-3 bg-white border border-turquoise-100 rounded-lg hover:shadow-md transition-shadow"
                  >
                    <div className="flex items-center gap-3">
                      <div className="flex items-center justify-center w-8 h-8 bg-turquoise-100 text-turquoise-700 rounded-full text-sm font-semibold">
                        #{entry.position}
                      </div>
                      
                      <Avatar className="h-10 w-10">
                        <AvatarImage src={entry.user?.profileImage} />
                        <AvatarFallback>
                          {entry.user?.name?.[0] || entry.user?.username?.[0] || '?'}
                        </AvatarFallback>
                      </Avatar>
                      
                      <div>
                        <div className="font-medium">{entry.user?.name || entry.user?.username}</div>
                        <div className="text-sm text-gray-500">
                          Joined {new Date(entry.joinedAt).toLocaleDateString()}
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      {entry.notificationsSent && (
                        <Badge variant="outline" className="text-xs">
                          <Bell className="h-3 w-3 mr-1" />
                          Notified
                        </Badge>
                      )}
                      
                      <Button
                        size="sm"
                        onClick={() => handlePromoteUser(entry.userId)}
                        disabled={promoteMutation.isPending || availableSpots === 0}
                        className="bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white"
                      >
                        <ArrowUp className="h-3 w-3 mr-1" />
                        Promote
                      </Button>
                    </div>
                  </div>
                ))}
                
                {/* Bulk Actions */}
                {waitlist.length > 1 && (
                  <div className="flex gap-2 pt-3 border-t border-turquoise-100">
                    <Button
                      variant="outline"
                      size="sm"
                      className="border-turquoise-300 text-turquoise-700 hover:bg-turquoise-50"
                      onClick={() => {
                        // TODO: Implement notify all functionality
                        toast({ title: "Feature Coming Soon", description: "Bulk notify functionality will be available soon" });
                      }}
                    >
                      <Bell className="h-3 w-3 mr-1" />
                      Notify All
                    </Button>
                    
                    <Button
                      variant="outline"
                      size="sm"
                      className="border-turquoise-300 text-turquoise-700 hover:bg-turquoise-50"
                      onClick={() => {
                        // TODO: Implement promote multiple functionality
                        toast({ title: "Feature Coming Soon", description: "Bulk promote functionality will be available soon" });
                      }}
                    >
                      <ArrowUp className="h-3 w-3 mr-1" />
                      Promote Next {Math.min(availableSpots, 3)}
                    </Button>
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}