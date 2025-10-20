import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link, useLocation } from "wouter";
import { MessageCircle, Search, Plus, MoreVertical, Check, CheckCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import DashboardLayout from "@/layouts/DashboardLayout";
import { Card } from "@/components/ui/card";

interface Conversation {
  id: number;
  userId: number;
  userName: string;
  userAvatar?: string;
  lastMessage: string;
  lastMessageTime: string;
  unreadCount: number;
  isOnline: boolean;
  isRead: boolean;
}

export default function MessagesPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [, setLocation] = useLocation();

  // Fetch conversations from API
  const { data: conversations, isLoading } = useQuery<Conversation[]>({
    queryKey: ["/api/messages/conversations"],
  });

  // Filter conversations by search
  const filteredConversations = conversations?.filter((conv) =>
    conv.userName.toLowerCase().includes(searchQuery.toLowerCase())
  ) || [];

  // Format time display (e.g., "2h ago", "Yesterday")
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

  return (
    <DashboardLayout>
      <div className="min-h-screen bg-gradient-to-br from-turquoise-50 via-cyan-50 to-blue-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
        {/* Header */}
        <div className="bg-gradient-to-r from-turquoise-500 to-cyan-500 dark:from-turquoise-700 dark:to-cyan-700 text-white">
          <div className="container mx-auto px-4 py-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div>
                <h1 className="text-2xl sm:text-3xl font-bold mb-1">
                  Messages
                </h1>
                <p className="text-turquoise-100 text-sm sm:text-base">
                  Stay connected with your tango community
                </p>
              </div>
              <Button
                onClick={() => setLocation("/messages/new")}
                className="bg-white text-turquoise-600 hover:bg-turquoise-50 whitespace-nowrap w-full sm:w-auto min-h-[44px]"
                data-testid="button-new-message"
              >
                <Plus className="w-4 h-4 mr-2" />
                New Message
              </Button>
            </div>
          </div>
        </div>

        <div className="container mx-auto px-4 py-6">
          {/* Search Bar */}
          <div className="mb-6">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <Input
                type="text"
                placeholder="Search conversations..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 min-h-[44px] text-base"
                data-testid="input-search-messages"
              />
            </div>
          </div>

          {/* Conversations List */}
          {isLoading ? (
            <div className="space-y-3">
              {[1, 2, 3, 4, 5].map((i) => (
                <Card key={i} className="p-4 animate-pulse" data-testid={`skeleton-conversation-${i}`}>
                  <div className="flex gap-3">
                    <div className="w-12 h-12 bg-gray-200 dark:bg-gray-700 rounded-full shrink-0" />
                    <div className="flex-1 space-y-2">
                      <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/3" />
                      <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-2/3" />
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          ) : filteredConversations.length === 0 ? (
            <div className="text-center py-16">
              <MessageCircle className="w-16 h-16 sm:w-20 sm:h-20 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
              <h3 className="text-lg sm:text-xl font-semibold text-gray-700 dark:text-gray-300 mb-2">
                {searchQuery ? "No conversations found" : "No messages yet"}
              </h3>
              <p className="text-gray-500 dark:text-gray-400 mb-6 text-sm sm:text-base">
                {searchQuery
                  ? "Try adjusting your search"
                  : "Start a conversation with someone in the community"}
              </p>
              <Button
                onClick={() => setLocation("/messages/new")}
                data-testid="button-start-conversation"
                className="min-h-[44px]"
              >
                <Plus className="w-4 h-4 mr-2" />
                Start Conversation
              </Button>
            </div>
          ) : (
            <div className="space-y-2">
              {filteredConversations.map((conversation) => (
                <Link
                  href={`/messages/${conversation.id}`}
                  key={conversation.id}
                >
                  <Card
                    className="p-4 hover:shadow-md transition-shadow cursor-pointer active:scale-[0.98] transition-transform"
                    data-testid={`conversation-card-${conversation.id}`}
                  >
                    <div className="flex gap-3 items-start">
                      {/* Avatar with online status */}
                      <div className="relative shrink-0">
                        <Avatar className="w-12 h-12 sm:w-14 sm:h-14">
                          <AvatarImage
                            src={conversation.userAvatar}
                            alt={conversation.userName}
                          />
                          <AvatarFallback className="bg-turquoise-100 dark:bg-turquoise-900 text-turquoise-700 dark:text-turquoise-300">
                            {conversation.userName.substring(0, 2).toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        {conversation.isOnline && (
                          <div
                            className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-white dark:border-gray-800 rounded-full"
                            data-testid={`online-indicator-${conversation.id}`}
                          />
                        )}
                      </div>

                      {/* Message Preview */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2 mb-1">
                          <h3
                            className={`font-semibold text-sm sm:text-base truncate ${
                              conversation.unreadCount > 0
                                ? "text-gray-900 dark:text-white"
                                : "text-gray-700 dark:text-gray-300"
                            }`}
                            data-testid={`conversation-name-${conversation.id}`}
                          >
                            {conversation.userName}
                          </h3>
                          <span
                            className="text-xs text-gray-500 dark:text-gray-400 shrink-0"
                            data-testid={`conversation-time-${conversation.id}`}
                          >
                            {formatTime(conversation.lastMessageTime)}
                          </span>
                        </div>

                        <div className="flex items-center justify-between gap-2">
                          <p
                            className={`text-sm truncate ${
                              conversation.unreadCount > 0
                                ? "text-gray-900 dark:text-white font-medium"
                                : "text-gray-600 dark:text-gray-400"
                            }`}
                            data-testid={`conversation-preview-${conversation.id}`}
                          >
                            {conversation.lastMessage}
                          </p>

                          {/* Unread badge or read status */}
                          {conversation.unreadCount > 0 ? (
                            <Badge
                              variant="default"
                              className="bg-turquoise-600 hover:bg-turquoise-700 shrink-0 min-w-[20px] h-5 flex items-center justify-center px-1.5"
                              data-testid={`unread-badge-${conversation.id}`}
                            >
                              {conversation.unreadCount}
                            </Badge>
                          ) : conversation.isRead ? (
                            <CheckCheck
                              className="w-4 h-4 text-turquoise-600 dark:text-turquoise-400 shrink-0"
                              data-testid={`read-indicator-${conversation.id}`}
                            />
                          ) : (
                            <Check
                              className="w-4 h-4 text-gray-400 shrink-0"
                              data-testid={`sent-indicator-${conversation.id}`}
                            />
                          )}
                        </div>
                      </div>
                    </div>
                  </Card>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
