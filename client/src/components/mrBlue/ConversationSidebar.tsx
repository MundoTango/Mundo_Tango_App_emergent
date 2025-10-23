/**
 * STREAM 1: Conversation Sidebar
 * ChatGPT-style sidebar with date grouping and search
 * MB.MD SIMULTANEOUS Build - October 23, 2025
 */

import { useState, useMemo } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Search, Plus, MessageSquare, Trash2 } from 'lucide-react';
import { isToday, isYesterday, subDays, format } from 'date-fns';

interface Conversation {
  id: number;
  name: string;
  description: string | null;
  createdAt: string;
  updatedAt: string;
}

interface ConversationSidebarProps {
  conversations: Conversation[];
  activeConversationId: number | null;
  onSelectConversation: (id: number) => void;
  onNewConversation: () => void;
  onDeleteConversation?: (id: number) => void;
  isCollapsed?: boolean;
}

interface GroupedConversations {
  today: Conversation[];
  yesterday: Conversation[];
  previous7Days: Conversation[];
  previous30Days: Conversation[];
  older: Conversation[];
}

export function ConversationSidebar({
  conversations,
  activeConversationId,
  onSelectConversation,
  onNewConversation,
  onDeleteConversation,
  isCollapsed = false
}: ConversationSidebarProps) {
  const [searchQuery, setSearchQuery] = useState('');

  // Group conversations by date
  const groupedConversations = useMemo((): GroupedConversations => {
    const groups: GroupedConversations = {
      today: [],
      yesterday: [],
      previous7Days: [],
      previous30Days: [],
      older: []
    };

    const now = new Date();
    const sevenDaysAgo = subDays(now, 7);
    const thirtyDaysAgo = subDays(now, 30);

    // Filter by search query first
    const filtered = conversations.filter(conv =>
      searchQuery === '' ||
      conv.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      conv.description?.toLowerCase().includes(searchQuery.toLowerCase())
    );

    // Sort by most recent first
    const sorted = [...filtered].sort(
      (a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
    );

    // Group by date
    sorted.forEach(conv => {
      const date = new Date(conv.updatedAt);
      
      if (isToday(date)) {
        groups.today.push(conv);
      } else if (isYesterday(date)) {
        groups.yesterday.push(conv);
      } else if (date > sevenDaysAgo) {
        groups.previous7Days.push(conv);
      } else if (date > thirtyDaysAgo) {
        groups.previous30Days.push(conv);
      } else {
        groups.older.push(conv);
      }
    });

    return groups;
  }, [conversations, searchQuery]);

  if (isCollapsed) {
    return (
      <div className="flex flex-col items-center gap-4 p-4 bg-[var(--chat-sidebar-bg)] border-r border-gray-700 h-full">
        <Button
          onClick={onNewConversation}
          size="icon"
          className="bg-[var(--mrblue-teal)] hover:bg-[var(--mrblue-cyan)]"
          data-testid="button-new-conversation-collapsed"
        >
          <Plus className="h-5 w-5" />
        </Button>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full w-[var(--chat-sidebar-width)] bg-[var(--chat-sidebar-bg)] border-r border-gray-700">
      {/* Header */}
      <div className="p-4 border-b border-gray-700 space-y-3">
        {/* New Chat Button */}
        <Button
          onClick={onNewConversation}
          className="w-full bg-[var(--mrblue-teal)] hover:bg-[var(--mrblue-cyan)] text-white"
          data-testid="button-new-conversation"
        >
          <Plus className="h-4 w-4 mr-2" />
          New Chat
        </Button>

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            type="search"
            placeholder="Search conversations..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9 bg-gray-800 border-gray-700 text-gray-300 placeholder:text-gray-500"
            data-testid="input-search-conversations"
          />
        </div>
      </div>

      {/* Conversation List */}
      <ScrollArea className="flex-1">
        <div className="p-2 space-y-4">
          {/* Today */}
          {groupedConversations.today.length > 0 && (
            <ConversationGroup
              title="Today"
              conversations={groupedConversations.today}
              activeId={activeConversationId}
              onSelect={onSelectConversation}
              onDelete={onDeleteConversation}
            />
          )}

          {/* Yesterday */}
          {groupedConversations.yesterday.length > 0 && (
            <ConversationGroup
              title="Yesterday"
              conversations={groupedConversations.yesterday}
              activeId={activeConversationId}
              onSelect={onSelectConversation}
              onDelete={onDeleteConversation}
            />
          )}

          {/* Previous 7 Days */}
          {groupedConversations.previous7Days.length > 0 && (
            <ConversationGroup
              title="Previous 7 Days"
              conversations={groupedConversations.previous7Days}
              activeId={activeConversationId}
              onSelect={onSelectConversation}
              onDelete={onDeleteConversation}
            />
          )}

          {/* Previous 30 Days */}
          {groupedConversations.previous30Days.length > 0 && (
            <ConversationGroup
              title="Previous 30 Days"
              conversations={groupedConversations.previous30Days}
              activeId={activeConversationId}
              onSelect={onSelectConversation}
              onDelete={onDeleteConversation}
            />
          )}

          {/* Older */}
          {groupedConversations.older.length > 0 && (
            <ConversationGroup
              title="Older"
              conversations={groupedConversations.older}
              activeId={activeConversationId}
              onSelect={onSelectConversation}
              onDelete={onDeleteConversation}
            />
          )}

          {/* Empty State */}
          {conversations.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              <MessageSquare className="h-12 w-12 mx-auto mb-3 opacity-50" />
              <p className="text-sm">No conversations yet</p>
              <p className="text-xs mt-1">Start a new chat to begin</p>
            </div>
          )}

          {/* No Search Results */}
          {searchQuery && conversations.length > 0 && Object.values(groupedConversations).every(g => g.length === 0) && (
            <div className="text-center py-8 text-gray-500">
              <Search className="h-12 w-12 mx-auto mb-3 opacity-50" />
              <p className="text-sm">No conversations found</p>
              <p className="text-xs mt-1">Try a different search term</p>
            </div>
          )}
        </div>
      </ScrollArea>
    </div>
  );
}

// Conversation Group Component
interface ConversationGroupProps {
  title: string;
  conversations: Conversation[];
  activeId: number | null;
  onSelect: (id: number) => void;
  onDelete?: (id: number) => void;
}

function ConversationGroup({ title, conversations, activeId, onSelect, onDelete }: ConversationGroupProps) {
  return (
    <div>
      {/* Group Title */}
      <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wide px-2 mb-2">
        {title}
      </h3>

      {/* Conversation Items */}
      <div className="space-y-1">
        {conversations.map((conv) => (
          <ConversationItem
            key={conv.id}
            conversation={conv}
            isActive={conv.id === activeId}
            onSelect={onSelect}
            onDelete={onDelete}
          />
        ))}
      </div>
    </div>
  );
}

// Conversation Item Component
interface ConversationItemProps {
  conversation: Conversation;
  isActive: boolean;
  onSelect: (id: number) => void;
  onDelete?: (id: number) => void;
}

function ConversationItem({ conversation, isActive, onSelect, onDelete }: ConversationItemProps) {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <div
      className={`group relative flex items-center gap-2 px-3 py-2 rounded-lg cursor-pointer transition-colors ${
        isActive
          ? 'bg-[var(--chat-border)] text-white'
          : 'text-[var(--chat-sidebar-text)] hover:bg-[var(--chat-sidebar-hover)]'
      }`}
      onClick={() => onSelect(conversation.id)}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      data-testid={`conversation-item-${conversation.id}`}
    >
      {/* Message Icon */}
      <MessageSquare className="h-4 w-4 flex-shrink-0" />

      {/* Conversation Name */}
      <span className="flex-1 text-sm truncate">
        {conversation.name || 'New Conversation'}
      </span>

      {/* Delete Button (on hover) */}
      {isHovered && onDelete && (
        <Button
          variant="ghost"
          size="sm"
          onClick={(e) => {
            e.stopPropagation();
            onDelete(conversation.id);
          }}
          className="h-6 w-6 p-0 opacity-0 group-hover:opacity-100 hover:bg-red-500/20 hover:text-red-400"
          data-testid={`button-delete-conversation-${conversation.id}`}
        >
          <Trash2 className="h-3 w-3" />
        </Button>
      )}
    </div>
  );
}
