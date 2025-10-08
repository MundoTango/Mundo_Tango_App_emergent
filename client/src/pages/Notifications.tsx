// ESA LIFE CEO 61×21 AGENTS FRAMEWORK
// Layer 16: Notification System Agent - User Notifications Page
// Layer 9: UI Framework Agent - MT Ocean Theme Implementation

import { useState, useEffect } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { queryClient } from '@/lib/queryClient';
import { Bell, Check, Trash2, Users, Calendar, MessageSquare, Heart, X, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useToast } from '@/hooks/use-toast';
import { formatDistanceToNow } from 'date-fns';
import { cn } from '@/lib/utils';
import { io, Socket } from 'socket.io-client';
import { useAuth } from '@/hooks/useAuth';
import DashboardLayout from '@/components/esa/DashboardLayout';

interface Notification {
  id: number;
  userId: number;
  type: 'mention' | 'friend_request' | 'event_invite' | 'message' | 'like' | 'comment' | 'follow';
  title: string;
  message: string;
  actionUrl?: string;
  isRead: boolean;
  metadata?: any;
  createdAt: string;
}

const notificationIcons = {
  mention: MessageSquare,
  friend_request: Users,
  event_invite: Calendar,
  message: MessageSquare,
  like: Heart,
  comment: MessageSquare,
  follow: Users
};

const notificationColors = {
  mention: 'from-cyan-500/10 to-teal-600/10',
  friend_request: 'from-purple-500/10 to-pink-600/10',
  event_invite: 'from-blue-500/10 to-indigo-600/10',
  message: 'from-green-500/10 to-emerald-600/10',
  like: 'from-red-500/10 to-pink-600/10',
  comment: 'from-yellow-500/10 to-orange-600/10',
  follow: 'from-violet-500/10 to-purple-600/10'
};

export default function Notifications() {
  const { toast } = useToast();
  const { user } = useAuth();
  const [filter, setFilter] = useState<'all' | 'unread'>('all');
  const [socket, setSocket] = useState<Socket | null>(null);

  // ESA Layer 11: Real-time Features Agent - WebSocket connection
  useEffect(() => {
    if (!user) return;

    const newSocket = io({
      path: '/ws',
      transports: ['websocket', 'polling'],
      withCredentials: true
    });

    newSocket.on('connect', () => {
      console.log('🔌 [Notifications Page] WebSocket connected');
      newSocket.emit('authenticate', { userId: user.id });
    });

    newSocket.on('notification', (data) => {
      console.log('🔔 [Notifications Page] New notification received');
      queryClient.invalidateQueries({ queryKey: ['/api/notifications'] });
      toast({
        title: data.title,
        description: data.message,
      });
    });

    setSocket(newSocket);

    return () => {
      newSocket.disconnect();
    };
  }, [user, toast]);

  // Fetch notifications
  const { data: notificationsData, isLoading } = useQuery({
    queryKey: ['/api/notifications', filter],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (filter === 'unread') params.append('unread', 'true');
      
      const response = await fetch(`/api/notifications?${params}`, {
        credentials: 'include'
      });
      
      if (!response.ok) {
        throw new Error('Failed to fetch notifications');
      }
      
      return response.json();
    },
    refetchInterval: 30000 // Refresh every 30 seconds
  });

  // Mark as read mutation
  const markAsReadMutation = useMutation({
    mutationFn: async (notificationId: number) => {
      const response = await fetch(`/api/notifications/${notificationId}/read`, {
        method: 'PUT',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error('Failed to mark as read');
      }

      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/notifications'] });
      queryClient.invalidateQueries({ queryKey: ['/api/notifications/count'] });
    }
  });

  // Mark all as read mutation
  const markAllAsReadMutation = useMutation({
    mutationFn: async () => {
      const response = await fetch('/api/notifications/mark-all-read', {
        method: 'PUT',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error('Failed to mark all as read');
      }

      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/notifications'] });
      queryClient.invalidateQueries({ queryKey: ['/api/notifications/count'] });
      toast({
        title: "All notifications marked as read",
        description: "Your notification inbox is now clear",
      });
    }
  });

  // Delete notification mutation
  const deleteNotificationMutation = useMutation({
    mutationFn: async (notificationId: number) => {
      const response = await fetch(`/api/notifications/${notificationId}`, {
        method: 'DELETE',
        credentials: 'include'
      });

      if (!response.ok) {
        throw new Error('Failed to delete notification');
      }

      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/notifications'] });
      queryClient.invalidateQueries({ queryKey: ['/api/notifications/count'] });
      toast({
        title: "Notification deleted",
      });
    }
  });

  const notifications = notificationsData?.data || [];
  const unreadCount = notifications.filter((n: Notification) => !n.isRead).length;

  const handleNotificationClick = (notification: Notification) => {
    if (!notification.isRead) {
      markAsReadMutation.mutate(notification.id);
    }
    
    if (notification.actionUrl) {
      window.location.href = notification.actionUrl;
    }
  };

  return (
    <DashboardLayout>
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        {/* MT Ocean Theme Header */}
        <div className="relative mb-8 p-8 rounded-xl bg-gradient-to-r from-[#5EEAD4]/10 to-[#155E75]/10 backdrop-blur-sm border border-white/10">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-full bg-gradient-to-br from-[#5EEAD4] to-[#155E75] text-white">
                <Bell className="h-6 w-6" />
              </div>
              <div>
                <h1 className="text-3xl font-bold bg-gradient-to-r from-[#5EEAD4] to-[#155E75] bg-clip-text text-transparent">
                  Notifications
                </h1>
                <p className="text-muted-foreground mt-1">
                  {unreadCount > 0 ? `You have ${unreadCount} unread notifications` : 'All caught up!'}
                </p>
              </div>
            </div>
            
            {unreadCount > 0 && (
              <Button data-testid="button-backdrop"
                onClick={() => markAllAsReadMutation.mutate()}
                variant="outline"
                className="bg-white/50 backdrop-blur-sm hover:bg-white/70"
                disabled={markAllAsReadMutation.isPending}
              >
                <CheckCircle className="h-4 w-4 mr-2" />
                Mark all as read
              </Button>
            )}
          </div>
        </div>

        {/* Filter Tabs */}
        <Tabs value={filter} onValueChange={(v) => setFilter(v as 'all' | 'unread')} className="mb-6">
          <TabsList className="bg-white/50 backdrop-blur-sm">
            <TabsTrigger value="all" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-[#5EEAD4] data-[state=active]:to-[#155E75] data-[state=active]:text-white">
              All Notifications
            </TabsTrigger>
            <TabsTrigger value="unread" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-[#5EEAD4] data-[state=active]:to-[#155E75] data-[state=active]:text-white">
              Unread
              {unreadCount > 0 && (
                <Badge className="ml-2 bg-red-500 text-white">
                  {unreadCount}
                </Badge>
              )}
            </TabsTrigger>
          </TabsList>
        </Tabs>

        {/* Notifications List */}
        <ScrollArea className="h-[600px] pr-4">
          {isLoading ? (
            <div className="flex items-center justify-center h-64">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#5EEAD4]"></div>
            </div>
          ) : notifications.length === 0 ? (
            <Card className="p-12 text-center bg-white/50 backdrop-blur-sm border-white/20">
              <Bell className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">No notifications</h3>
              <p className="text-muted-foreground">
                {filter === 'unread' ? "You're all caught up!" : "You don't have any notifications yet"}
              </p>
            </Card>
          ) : (
            <div className="space-y-3">
              {notifications.map((notification: Notification) => {
                const Icon = notificationIcons[notification.type];
                const gradientColor = notificationColors[notification.type];
                
                return (
                  <Card
                    key={notification.id}
                    className={cn(
                      "p-4 cursor-pointer transition-all duration-200 hover:shadow-lg",
                      "bg-gradient-to-r backdrop-blur-sm border-white/20",
                      !notification.isRead && "border-l-4 border-l-[#5EEAD4]",
                      gradientColor
                    )}
                    onClick={() => handleNotificationClick(notification)}
                  >
                    <div className="flex items-start gap-3">
                      <div className={cn(
                        "p-2 rounded-full",
                        !notification.isRead ? "bg-gradient-to-br from-[#5EEAD4] to-[#155E75] text-white" : "bg-gray-100 text-gray-600"
                      )}>
                        <Icon className="h-4 w-4" />
                      </div>
                      
                      <div className="flex-1">
                        <div className="flex items-start justify-between">
                          <div>
                            <h4 className={cn(
                              "font-semibold",
                              !notification.isRead && "text-foreground"
                            )}>
                              {notification.title}
                            </h4>
                            <p className={cn(
                              "text-sm mt-1",
                              notification.isRead ? "text-muted-foreground" : "text-foreground/90"
                            )}>
                              {notification.message}
                            </p>
                            <p className="text-xs text-muted-foreground mt-2">
                              {formatDistanceToNow(new Date(notification.createdAt), { addSuffix: true })}
                            </p>
                          </div>
                          
                          <div className="flex items-center gap-1">
                            {!notification.isRead && (
                              <Button data-testid="button-h"
                                size="icon"
                                variant="ghost"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  markAsReadMutation.mutate(notification.id);
                                }}
                                className="h-8 w-8 hover:bg-white/50"
                              >
                                <Check className="h-4 w-4" />
                              </Button>
                            )}
                            <Button data-testid="button-h"
                              size="icon"
                              variant="ghost"
                              onClick={(e) => {
                                e.stopPropagation();
                                deleteNotificationMutation.mutate(notification.id);
                              }}
                              className="h-8 w-8 hover:bg-red-100 hover:text-red-600"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </Card>
                );
              })}
            </div>
          )}
        </ScrollArea>
      </div>
    </DashboardLayout>
  );
}