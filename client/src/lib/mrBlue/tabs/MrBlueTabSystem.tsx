/**
 * Mr Blue Tab System with Role-Based Access
 * mb.md lines 1000-1007
 * 
 * Tab 1: Life CEO Agents (all users) - #75
 * Tab 2: Platform Search (all users) - #76
 * Tab 3: AI Chat (all users) - #73
 * Tab 4: Admin Tools (Super Admin only) - #77, #78
 */

import { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Brain, 
  Search, 
  MessageSquare, 
  Shield,
  Sparkles,
} from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { Badge } from '@/components/ui/badge';
import { MrBlueChatInterfaceEnhanced } from '../chat/MrBlueChatInterfaceEnhanced';
import { LifeCEOAgentsTab } from './LifeCEOAgentsTab';
import { PlatformSearchTab } from './PlatformSearchTab';
import { AdminToolsTab } from './AdminToolsTab';

export function MrBlueTabSystem() {
  const { user } = useAuth();
  const isSuperAdmin = user?.role === 'super_admin';
  const [activeTab, setActiveTab] = useState('chat');

  return (
    <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col h-full">
      {/* Tab Headers */}
      <TabsList className="grid w-full" style={{ 
        gridTemplateColumns: isSuperAdmin ? 'repeat(4, 1fr)' : 'repeat(3, 1fr)' 
      }}>
        <TabsTrigger value="chat" data-testid="tab-chat">
          <MessageSquare className="h-4 w-4 mr-2" />
          Chat
        </TabsTrigger>
        
        <TabsTrigger value="lifeceo" data-testid="tab-lifeceo">
          <Brain className="h-4 w-4 mr-2" />
          Life CEO
          <Badge variant="secondary" className="ml-2 text-xs">16</Badge>
        </TabsTrigger>
        
        <TabsTrigger value="search" data-testid="tab-search">
          <Search className="h-4 w-4 mr-2" />
          Search
        </TabsTrigger>

        {isSuperAdmin && (
          <TabsTrigger value="admin" data-testid="tab-admin">
            <Shield className="h-4 w-4 mr-2" />
            Admin
            <Badge variant="destructive" className="ml-2 text-xs">SA</Badge>
          </TabsTrigger>
        )}
      </TabsList>

      {/* Tab Content */}
      <TabsContent value="chat" className="flex-1 overflow-hidden mt-0">
        <MrBlueChatInterfaceEnhanced />
      </TabsContent>

      <TabsContent value="lifeceo" className="flex-1 overflow-hidden mt-0">
        <LifeCEOAgentsTab />
      </TabsContent>

      <TabsContent value="search" className="flex-1 overflow-hidden mt-0">
        <PlatformSearchTab />
      </TabsContent>

      {isSuperAdmin && (
        <TabsContent value="admin" className="flex-1 overflow-hidden mt-0">
          <AdminToolsTab />
        </TabsContent>
      )}
    </Tabs>
  );
}
