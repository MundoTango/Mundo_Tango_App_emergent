import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Bell, Check, Trash2, Settings, Heart, MessageCircle, Users, Calendar, UserPlus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import DashboardLayout from "@/layouts/DashboardLayout";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

interface Notification {
  id: number;
  type: "like" | "comment" | "follow" | "event" | "group";
  title: string;
  message: string;
  actorId: number;
  actorName: string;
  actorAvatar?: string;
  targetId?: number;
  targetType?: string;
  isRead: boolean;
  createdAt: string;
}

export default function NotificationsPage() {
  const [activeTab, setActiveTab] = useState<"all" | "unread">("all");
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch notifications
  const { data: notifications = [], isLoading } = useQuery<Notification[]>({
    queryKey: ["/api/notifications"],
  });

  // Mark as read mutation
  const markAsReadMutation = useMutation({
    mutationFn: (notificationId: number) =>
      apiRequest(`/api/notifications/${notificationId}/read`, { method: "POST" }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/notifications"] });
      toast({
        title: "Marked as read",
        description: "Notification updated",
      });
    },
  });

  // Mark all as read mutation
  const markAllAsReadMutation = useMutation({
    mutationFn: () => apiRequest("/api/notifications/read-all", { method: "POST" }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/notifications"] });
      toast({
        title: "All marked as read",
        description: "You're all caught up!",
      });
    },
  });

  // Delete notification mutation
  const deleteNotificationMutation = useMutation({
    mutationFn: (notificationId: number) =>
      apiRequest(`/api/notifications/${notificationId}`, { method: "DELETE" }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/notifications"] });
      toast({
        title: "Notification deleted",
      });
    },
  });

  // Filter notifications
  const filteredNotifications = notifications.filter((notif) => {
    if (activeTab === "unread") return !notif.isRead;
    return true;
  });

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  // Format time
  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffMins < 1) return "Just now";
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays === 1) return "Yesterday";
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString();
  };

  // Get icon for notification type
  const getNotificationIcon = (type: string) => {
    const iconClass = "w-5 h-5";
    switch (type) {
      case "like":
        return <Heart className={`${iconClass} text-red-500`} />;
      case "comment":
        return <MessageCircle className={`${iconClass} text-blue-500`} />;
      case "follow":
        return <UserPlus className={`${iconClass} text-green-500`} />;
      case "event":
        return <Calendar className={`${iconClass} text-purple-500`} />;
      case "group":
        return <Users className={`${iconClass} text-orange-500`} />;
      default:
        return <Bell className={`${iconClass} text-gray-500`} />;
    }
  };

  return (
    <DashboardLayout>
      <div className="min-h-screen bg-gradient-to-br from-turquoise-50 via-cyan-50 to-blue-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
        {/* Header */}
        <div className="bg-gradient-to-r from-turquoise-500 to-cyan-500 dark:from-turquoise-700 dark:to-cyan-700 text-white">
          <div className="container mx-auto px-4 py-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div>
                <div className="flex items-center gap-3 mb-1">
                  <h1 className="text-2xl sm:text-3xl font-bold">
                    Notifications
                  </h1>
                  {unreadCount > 0 && (
                    <Badge
                      variant="secondary"
                      className="bg-white text-turquoise-600 font-bold"
                      data-testid="unread-count-badge"
                    >
                      {unreadCount}
                    </Badge>
                  )}
                </div>
                <p className="text-turquoise-100 text-sm sm:text-base">
                  Stay updated with your tango community
                </p>
              </div>
              <div className="flex gap-2 w-full sm:w-auto">
                <Button
                  onClick={() => markAllAsReadMutation.mutate()}
                  disabled={unreadCount === 0 || markAllAsReadMutation.isPending}
                  className="bg-white text-turquoise-600 hover:bg-turquoise-50 flex-1 sm:flex-none min-h-[44px]"
                  data-testid="button-mark-all-read"
                >
                  <Check className="w-4 h-4 mr-2" />
                  Mark All Read
                </Button>
              </div>
            </div>
          </div>
        </div>

        <div className="container mx-auto px-4 py-6">
          {/* Tabs */}
          <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as typeof activeTab)} className="mb-6">
            <TabsList className="grid w-full grid-cols-2 min-h-[44px]">
              <TabsTrigger
                value="all"
                className="min-h-[44px]"
                data-testid="tab-all"
              >
                All ({notifications.length})
              </TabsTrigger>
              <TabsTrigger
                value="unread"
                className="min-h-[44px]"
                data-testid="tab-unread"
              >
                Unread ({unreadCount})
              </TabsTrigger>
            </TabsList>

            <TabsContent value={activeTab} className="mt-6">
              {/* Notifications List */}
              {isLoading ? (
                <div className="space-y-3">
                  {[1, 2, 3, 4, 5].map((i) => (
                    <Card
                      key={i}
                      className="p-4 animate-pulse"
                      data-testid={`skeleton-notification-${i}`}
                    >
                      <div className="flex gap-3">
                        <div className="w-10 h-10 bg-gray-200 dark:bg-gray-700 rounded-full shrink-0" />
                        <div className="flex-1 space-y-2">
                          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-2/3" />
                          <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/2" />
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              ) : filteredNotifications.length === 0 ? (
                <div className="text-center py-16">
                  <Bell className="w-16 h-16 sm:w-20 sm:h-20 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
                  <h3 className="text-lg sm:text-xl font-semibold text-gray-700 dark:text-gray-300 mb-2">
                    {activeTab === "unread" ? "You're all caught up!" : "No notifications yet"}
                  </h3>
                  <p className="text-gray-500 dark:text-gray-400 text-sm sm:text-base">
                    {activeTab === "unread"
                      ? "All your notifications have been read"
                      : "When something happens, you'll see it here"}
                  </p>
                </div>
              ) : (
                <div className="space-y-2">
                  {filteredNotifications.map((notification) => (
                    <Card
                      key={notification.id}
                      className={`p-4 transition-all ${
                        !notification.isRead
                          ? "bg-turquoise-50/50 dark:bg-turquoise-900/10 border-turquoise-200 dark:border-turquoise-800"
                          : "hover:shadow-md"
                      }`}
                      data-testid={`notification-card-${notification.id}`}
                    >
                      <div className="flex gap-3">
                        {/* Actor Avatar + Icon */}
                        <div className="relative shrink-0">
                          <Avatar className="w-10 h-10 sm:w-12 sm:h-12">
                            <AvatarImage
                              src={notification.actorAvatar}
                              alt={notification.actorName}
                            />
                            <AvatarFallback className="bg-gray-200 dark:bg-gray-700">
                              {notification.actorName.substring(0, 2).toUpperCase()}
                            </AvatarFallback>
                          </Avatar>
                          <div className="absolute -bottom-1 -right-1 bg-white dark:bg-gray-800 rounded-full p-0.5">
                            {getNotificationIcon(notification.type)}
                          </div>
                        </div>

                        {/* Content */}
                        <div className="flex-1 min-w-0">
                          <p
                            className={`text-sm sm:text-base mb-1 ${
                              !notification.isRead
                                ? "font-semibold text-gray-900 dark:text-white"
                                : "text-gray-700 dark:text-gray-300"
                            }`}
                            data-testid={`notification-title-${notification.id}`}
                          >
                            <span className="font-bold">{notification.actorName}</span>{" "}
                            {notification.message}
                          </p>
                          <p
                            className="text-xs text-gray-500 dark:text-gray-400"
                            data-testid={`notification-time-${notification.id}`}
                          >
                            {formatTime(notification.createdAt)}
                          </p>
                        </div>

                        {/* Actions */}
                        <div className="flex gap-1 shrink-0">
                          {!notification.isRead && (
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => markAsReadMutation.mutate(notification.id)}
                              className="min-w-[44px] min-h-[44px]"
                              data-testid={`button-mark-read-${notification.id}`}
                            >
                              <Check className="w-4 h-4" />
                            </Button>
                          )}
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => deleteNotificationMutation.mutate(notification.id)}
                            className="min-w-[44px] min-h-[44px] text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20"
                            data-testid={`button-delete-${notification.id}`}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              )}
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </DashboardLayout>
  );
}
