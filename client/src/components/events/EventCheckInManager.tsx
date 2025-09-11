import React, { useState, useEffect } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { 
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from '@/components/ui/dialog';
import { 
  CheckCircle, 
  Users, 
  Clock,
  QrCode,
  MapPin,
  UserCheck,
  Music,
  GraduationCap,
  Mic,
  Star,
  Home,
  Search
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';
import { format } from 'date-fns';
import type { EventCheckIn, ApiResponse } from '../../../shared/apiTypes';

const PARTICIPANT_ROLES = [
  { value: 'attendee', label: 'Attendee', icon: Users },
  { value: 'dj', label: 'DJ', icon: Music },
  { value: 'teacher', label: 'Teacher', icon: GraduationCap },
  { value: 'musician', label: 'Musician', icon: Mic },
  { value: 'performer', label: 'Performer', icon: Star },
  { value: 'host', label: 'Host', icon: Home },
  { value: 'volunteer', label: 'Volunteer', icon: UserCheck },
  { value: 'organizer', label: 'Co-Organizer', icon: Users }
];

interface EventCheckInManagerProps {
  eventId: number;
  isEventOwner?: boolean;
  isEventActive?: boolean; // True if event is happening now or recently started
  userCheckedIn?: boolean;
  eventStarted?: boolean;
}

export default function EventCheckInManager({
  eventId,
  isEventOwner = false,
  isEventActive = false,
  userCheckedIn = false,
  eventStarted = false
}: EventCheckInManagerProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [showCheckInDialog, setShowCheckInDialog] = useState(false);
  const [showBulkCheckIn, setShowBulkCheckIn] = useState(false);
  const [checkInRole, setCheckInRole] = useState('attendee');
  const [checkInNotes, setCheckInNotes] = useState('');
  const [searchUser, setSearchUser] = useState('');
  const [selectedUsers, setSelectedUsers] = useState<number[]>([]);

  // Fetch check-ins data
  const { data: checkInsData, isLoading } = useQuery<ApiResponse<EventCheckIn[]>>({
    queryKey: [`/api/events/${eventId}/checkins`],
    enabled: isEventOwner || isEventActive,
    refetchInterval: isEventActive ? 30000 : false // Refresh every 30s during event
  });

  const checkIns = checkInsData?.data || [];

  // Self check-in mutation
  const selfCheckInMutation = useMutation({
    mutationFn: async ({ role, notes }: { role?: string; notes?: string }) => {
      return apiRequest(`/api/events/${eventId}/checkin`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ role, notes })
      });
    },
    onSuccess: (data) => {
      toast({
        title: "Checked In Successfully",
        description: `Welcome to the event! Check-in time: ${format(new Date(data.data.checkInTime), 'h:mm a')}`
      });
      
      setShowCheckInDialog(false);
      setCheckInRole('attendee');
      setCheckInNotes('');
      queryClient.invalidateQueries({ queryKey: [`/api/events/${eventId}/checkins`] });
      queryClient.invalidateQueries({ queryKey: ['/api/events'] });
    },
    onError: (error: any) => {
      toast({
        title: "Check-in Failed",
        description: error.message || 'Unable to check in at this time',
        variant: "destructive"
      });
    }
  });

  // Manual check-in mutation (for organizers)
  const manualCheckInMutation = useMutation({
    mutationFn: async ({ userId, role, notes }: { userId: number; role?: string; notes?: string }) => {
      return apiRequest(`/api/events/${eventId}/checkin/manual`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, role, notes })
      });
    },
    onSuccess: () => {
      toast({
        title: "User Checked In",
        description: "User has been manually checked in to the event"
      });
      
      queryClient.invalidateQueries({ queryKey: [`/api/events/${eventId}/checkins`] });
    },
    onError: (error: any) => {
      toast({
        title: "Check-in Failed", 
        description: error.message || 'Failed to check in user',
        variant: "destructive"
      });
    }
  });

  const handleSelfCheckIn = () => {
    selfCheckInMutation.mutate({ role: checkInRole, notes: checkInNotes });
  };

  const handleManualCheckIn = (userId: number, role: string, notes?: string) => {
    manualCheckInMutation.mutate({ userId, role, notes });
  };

  // Calculate check-in statistics
  const totalCheckIns = checkIns.length;
  const roleBreakdown = checkIns.reduce((acc, checkIn) => {
    const role = checkIn.role || 'attendee';
    acc[role] = (acc[role] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const recentCheckIns = checkIns
    .filter(checkIn => {
      const checkInTime = new Date(checkIn.checkInTime);
      const thirtyMinutesAgo = new Date(Date.now() - 30 * 60 * 1000);
      return checkInTime > thirtyMinutesAgo;
    })
    .sort((a, b) => new Date(b.checkInTime).getTime() - new Date(a.checkInTime).getTime());

  return (
    <div className="space-y-4">
      {/* Check-In Status Card */}
      <Card className="glassmorphic-card border-turquoise-200/50">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg flex items-center gap-2">
              <UserCheck className="h-5 w-5 text-turquoise-600" />
              Event Check-In
              {totalCheckIns > 0 && (
                <Badge variant="secondary" className="bg-turquoise-100 text-turquoise-800">
                  {totalCheckIns} checked in
                </Badge>
              )}
            </CardTitle>

            {/* Event Status */}
            <div className="flex items-center gap-2">
              {eventStarted && (
                <Badge className="bg-green-100 text-green-800 border-green-200">
                  <CheckCircle className="h-3 w-3 mr-1" />
                  Event Active
                </Badge>
              )}
            </div>
          </div>
        </CardHeader>

        <CardContent className="space-y-4">
          {/* User Check-In Status */}
          {userCheckedIn ? (
            <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
              <div className="flex items-center gap-2">
                <CheckCircle className="h-5 w-5 text-green-600" />
                <span className="font-medium text-green-800">You're checked in!</span>
              </div>
              <div className="text-sm text-green-600 mt-1">
                Welcome to the event. Enjoy your time!
              </div>
            </div>
          ) : (
            // Check-In Button for Active Events
            (isEventActive || eventStarted) && (
              <Dialog open={showCheckInDialog} onOpenChange={setShowCheckInDialog}>
                <DialogTrigger asChild>
                  <Button 
                    className="w-full bg-gradient-to-r from-turquoise-500 to-cyan-600 hover:from-turquoise-600 hover:to-cyan-700"
                    disabled={!isEventActive && !eventStarted}
                  >
                    <UserCheck className="mr-2 h-4 w-4" />
                    Check In to Event
                  </Button>
                </DialogTrigger>

                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Check In to Event</DialogTitle>
                  </DialogHeader>

                  <div className="space-y-4">
                    <div>
                      <label className="text-sm font-medium mb-2 block">Your Role</label>
                      <Select value={checkInRole} onValueChange={setCheckInRole}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select your role" />
                        </SelectTrigger>
                        <SelectContent>
                          {PARTICIPANT_ROLES.map(role => {
                            const Icon = role.icon;
                            return (
                              <SelectItem key={role.value} value={role.value}>
                                <div className="flex items-center gap-2">
                                  <Icon className="h-4 w-4" />
                                  {role.label}
                                </div>
                              </SelectItem>
                            );
                          })}
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <label className="text-sm font-medium mb-2 block">Notes (optional)</label>
                      <Textarea
                        placeholder="Any special notes or requirements..."
                        value={checkInNotes}
                        onChange={(e) => setCheckInNotes(e.target.value)}
                        rows={2}
                      />
                    </div>

                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        onClick={() => setShowCheckInDialog(false)}
                        className="flex-1"
                      >
                        Cancel
                      </Button>
                      <Button
                        onClick={handleSelfCheckIn}
                        disabled={selfCheckInMutation.isPending}
                        className="flex-1 bg-gradient-to-r from-turquoise-500 to-cyan-600"
                      >
                        {selfCheckInMutation.isPending ? 'Checking In...' : 'Check In'}
                      </Button>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>
            )
          )}

          {/* Check-In Statistics */}
          {totalCheckIns > 0 && (
            <div className="grid grid-cols-2 gap-4">
              <div className="p-3 bg-gradient-to-r from-turquoise-50 to-cyan-50 rounded-lg text-center">
                <div className="font-semibold text-lg text-turquoise-700">{totalCheckIns}</div>
                <div className="text-sm text-turquoise-600">Total Check-ins</div>
              </div>
              <div className="p-3 bg-gradient-to-r from-cyan-50 to-blue-50 rounded-lg text-center">
                <div className="font-semibold text-lg text-cyan-700">{recentCheckIns.length}</div>
                <div className="text-sm text-cyan-600">Last 30 min</div>
              </div>
            </div>
          )}

          {/* Role Breakdown */}
          {Object.keys(roleBreakdown).length > 0 && (
            <div>
              <div className="text-sm font-medium mb-2">Roles</div>
              <div className="flex flex-wrap gap-1">
                {Object.entries(roleBreakdown).map(([role, count]) => {
                  const roleInfo = PARTICIPANT_ROLES.find(r => r.value === role);
                  const Icon = roleInfo?.icon || Users;
                  return (
                    <Badge 
                      key={role} 
                      variant="outline" 
                      className="text-xs border-turquoise-200"
                    >
                      <Icon className="h-3 w-3 mr-1" />
                      {roleInfo?.label || role}: {count}
                    </Badge>
                  );
                })}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Event Owner Check-In Management */}
      {isEventOwner && (
        <Card className="glassmorphic-card border-turquoise-200/50">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg">Check-In Management</CardTitle>
              
              {(isEventActive || eventStarted) && (
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setShowBulkCheckIn(!showBulkCheckIn)}
                    className="border-turquoise-300 text-turquoise-700 hover:bg-turquoise-50"
                  >
                    Manual Check-In
                  </Button>
                  
                  <Button
                    variant="outline"
                    size="sm"
                    className="border-turquoise-300 text-turquoise-700 hover:bg-turquoise-50"
                    onClick={() => {
                      toast({ 
                        title: "QR Code Feature", 
                        description: "QR code check-in will be available in the next update" 
                      });
                    }}
                  >
                    <QrCode className="h-4 w-4 mr-1" />
                    QR Code
                  </Button>
                </div>
              )}
            </div>
          </CardHeader>

          <CardContent>
            {/* Manual Check-In Interface */}
            {showBulkCheckIn && (isEventActive || eventStarted) && (
              <div className="mb-6 p-4 bg-turquoise-50 border border-turquoise-200 rounded-lg">
                <h4 className="font-medium mb-3">Manual Check-In</h4>
                <div className="space-y-3">
                  <Input
                    placeholder="Search by name, email, or user ID..."
                    value={searchUser}
                    onChange={(e) => setSearchUser(e.target.value)}
                    className="border-turquoise-300 focus:border-turquoise-500"
                  />
                  
                  <div className="text-center py-2 text-sm text-gray-500">
                    Manual check-in functionality will be enhanced in the next update
                  </div>
                </div>
              </div>
            )}

            {/* Recent Check-Ins */}
            {isLoading ? (
              <div className="text-center py-4 text-gray-500">
                Loading check-ins...
              </div>
            ) : checkIns.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <UserCheck className="h-12 w-12 mx-auto mb-3 text-gray-300" />
                <p>No check-ins yet</p>
                <p className="text-sm mt-1">
                  {eventStarted ? "Check-ins will appear here as people arrive" : "Check-ins will be available when the event starts"}
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="font-medium">
                    Check-ins ({totalCheckIns})
                  </h4>
                  {recentCheckIns.length > 0 && (
                    <Badge variant="outline" className="text-xs border-green-200 text-green-700">
                      {recentCheckIns.length} recent
                    </Badge>
                  )}
                </div>

                {checkIns.slice(0, 10).map((checkIn) => (
                  <div 
                    key={checkIn.id}
                    className="flex items-center justify-between p-3 bg-white border border-turquoise-100 rounded-lg"
                  >
                    <div className="flex items-center gap-3">
                      <Avatar className="h-10 w-10">
                        <AvatarImage src={checkIn.user?.profileImage} />
                        <AvatarFallback>
                          {checkIn.user?.name?.[0] || checkIn.user?.username?.[0] || '?'}
                        </AvatarFallback>
                      </Avatar>
                      
                      <div>
                        <div className="font-medium">
                          {checkIn.user?.name || checkIn.user?.username}
                        </div>
                        <div className="text-sm text-gray-500 flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {format(new Date(checkIn.checkInTime), 'MMM d, h:mm a')}
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      {checkIn.role && checkIn.role !== 'attendee' && (
                        <Badge variant="outline" className="text-xs">
                          {PARTICIPANT_ROLES.find(r => r.value === checkIn.role)?.label || checkIn.role}
                        </Badge>
                      )}
                      
                      {recentCheckIns.some(recent => recent.id === checkIn.id) && (
                        <Badge className="text-xs bg-green-100 text-green-800 border-green-200">
                          Recent
                        </Badge>
                      )}
                    </div>
                  </div>
                ))}

                {checkIns.length > 10 && (
                  <div className="text-center pt-2">
                    <Button 
                      variant="ghost" 
                      size="sm"
                      className="text-turquoise-600 hover:bg-turquoise-50"
                    >
                      View All {totalCheckIns} Check-ins
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