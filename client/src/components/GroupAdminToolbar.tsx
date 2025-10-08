import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  Settings, 
  Users, 
  Shield, 
  Eye, 
  Camera, 
  MessageSquare, 
  Calendar,
  BarChart3,
  UserMinus,
  UserPlus,
  Crown,
  AlertTriangle,
  FileText,
  Image
} from 'lucide-react';

interface GroupAdminToolbarProps {
  group: {
    id: number;
    name: string;
    userRole: string;
    memberCount: number;
    isPrivate: boolean;
    description: string;
    coverImage?: string;
  };
  onUpdate: (updates: any) => void;
}

export const GroupAdminToolbar: React.FC<GroupAdminToolbarProps> = ({ group, onUpdate }) => {
  const [activeTab, setActiveTab] = useState('overview');
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  
  // Define administrative roles that can access group management
  const adminRoles = [
    'super_admin',    // Platform super administrators
    'admin',          // Platform administrators
    'moderator',      // Platform moderators
    'city_admin',     // City-specific administrators
    'group_admin',    // Group administrators
    'group_moderator' // Group moderators
  ];
  
  // Only show for users with administrative privileges
  if (!adminRoles.includes(group.userRole)) {
    return null;
  }

  const adminPermissions = {
    super_admin: {
      canModifyGroup: true,
      canManageMembers: true,
      canDeleteContent: true,
      canChangeSettings: true,
      canPromoteMembers: true,
      canViewAnalytics: true,
      canManageEvents: true,
      canModerateContent: true,
      canDeleteGroup: true,
      canTransferOwnership: true
    },
    admin: {
      canModifyGroup: true,
      canManageMembers: true,
      canDeleteContent: true,
      canChangeSettings: true,
      canPromoteMembers: true,
      canViewAnalytics: true,
      canManageEvents: true,
      canModerateContent: true,
      canDeleteGroup: false,
      canTransferOwnership: false
    },
    city_admin: {
      canModifyGroup: true,
      canManageMembers: true,
      canDeleteContent: true,
      canChangeSettings: true,
      canPromoteMembers: true,
      canViewAnalytics: true,
      canManageEvents: true,
      canModerateContent: true,
      canDeleteGroup: false,
      canTransferOwnership: false
    },
    group_admin: {
      canModifyGroup: true,
      canManageMembers: true,
      canDeleteContent: true,
      canChangeSettings: true,
      canPromoteMembers: true,
      canViewAnalytics: true,
      canManageEvents: true,
      canModerateContent: true,
      canDeleteGroup: false,
      canTransferOwnership: false
    },
    moderator: {
      canModifyGroup: false,
      canManageMembers: true,
      canDeleteContent: true,
      canChangeSettings: false,
      canPromoteMembers: false,
      canViewAnalytics: true,
      canManageEvents: true,
      canModerateContent: true,
      canDeleteGroup: false,
      canTransferOwnership: false
    },
    group_moderator: {
      canModifyGroup: false,
      canManageMembers: true,
      canDeleteContent: true,
      canChangeSettings: false,
      canPromoteMembers: false,
      canViewAnalytics: true,
      canManageEvents: true,
      canModerateContent: true,
      canDeleteGroup: false,
      canTransferOwnership: false
    }
  };

  const permissions = adminPermissions[group.userRole as keyof typeof adminPermissions];

  return (
    <div className="bg-gradient-to-r from-red-50 to-orange-50 border border-red-200 rounded-lg p-4 mb-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="flex items-center space-x-2">
            <Shield className="h-5 w-5 text-red-600" />
            <span className="font-semibold text-red-800">Admin Panel</span>
            <Badge variant="destructive" className="text-xs">
              {group.userRole}
            </Badge>
          </div>
          <div className="text-sm text-red-600">
            Managing "{group.name}"
          </div>
        </div>
        
        <Dialog open={isSettingsOpen} onOpenChange={setIsSettingsOpen}>
          <DialogTrigger asChild>
            <Button variant="outline" size="sm" className="border-red-200 text-red-700 hover:bg-red-50" data-testid="button-border-red-200">
              <Settings className="h-4 w-4 mr-2" />
              Group Management
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="flex items-center space-x-2">
                <Shield className="h-5 w-5 text-red-600" />
                <span>Group Administration - {group.name}</span>
              </DialogTitle>
            </DialogHeader>
            
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="grid w-full grid-cols-6">
                <TabsTrigger value="overview">Overview</TabsTrigger>
                <TabsTrigger value="members">Members</TabsTrigger>
                <TabsTrigger value="content">Content</TabsTrigger>
                <TabsTrigger value="settings">Settings</TabsTrigger>
                <TabsTrigger value="analytics">Analytics</TabsTrigger>
                <TabsTrigger value="moderation">Moderation</TabsTrigger>
              </TabsList>

              <TabsContent value="overview" className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <Card>
                    <CardHeader className="pb-3">
                      <CardTitle className="text-base flex items-center space-x-2">
                        <Users className="h-4 w-4" />
                        <span>Member Management</span>
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>Total Members:</span>
                        <span className="font-semibold">{group.memberCount}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span>Pending Requests:</span>
                        <span className="font-semibold">3</span>
                      </div>
                      <Button 
                        size="sm" 
                        className="w-full mt-2"
                        disabled={!permissions.canManageMembers}
                        onClick={() = data-testid="button-w-full"> setActiveTab('members')}
                      >
                        Manage Members
                      </Button>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader className="pb-3">
                      <CardTitle className="text-base flex items-center space-x-2">
                        <MessageSquare className="h-4 w-4" />
                        <span>Content Moderation</span>
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>Flagged Posts:</span>
                        <span className="font-semibold text-red-600">2</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span>Reports:</span>
                        <span className="font-semibold text-orange-600">1</span>
                      </div>
                      <Button 
                        size="sm" 
                        className="w-full mt-2"
                        disabled={!permissions.canModerateContent}
                        onClick={() = data-testid="button-w-full"> setActiveTab('moderation')}
                      >
                        Review Content
                      </Button>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader className="pb-3">
                      <CardTitle className="text-base flex items-center space-x-2">
                        <BarChart3 className="h-4 w-4" />
                        <span>Group Analytics</span>
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>Weekly Activity:</span>
                        <span className="font-semibold text-green-600">+15%</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span>Engagement Rate:</span>
                        <span className="font-semibold">78%</span>
                      </div>
                      <Button 
                        size="sm" 
                        className="w-full mt-2"
                        disabled={!permissions.canViewAnalytics}
                        onClick={() = data-testid="button-w-full"> setActiveTab('analytics')}
                      >
                        View Analytics
                      </Button>
                    </CardContent>
                  </Card>
                </div>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">Quick Actions</CardTitle>
                    <CardDescription>Common administrative tasks</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                      <Button 
                        variant="outline" 
                        size="sm"
                        disabled={!permissions.canManageEvents}
                        className="flex items-center space-x-2"
                       data-testid="button-flex">
                        <Calendar className="h-4 w-4" />
                        <span>Create Event</span>
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm"
                        disabled={!permissions.canModifyGroup}
                        className="flex items-center space-x-2"
                       data-testid="button-flex">
                        <Image className="h-4 w-4" />
                        <span>Update Photo</span>
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm"
                        disabled={!permissions.canManageMembers}
                        className="flex items-center space-x-2"
                       data-testid="button-flex">
                        <UserPlus className="h-4 w-4" />
                        <span>Invite Members</span>
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm"
                        disabled={!permissions.canChangeSettings}
                        className="flex items-center space-x-2"
                       data-testid="button-flex">
                        <Settings className="h-4 w-4" />
                        <span>Group Settings</span>
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="members" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle>Member Management</CardTitle>
                    <CardDescription>Manage group members, roles, and permissions</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <h4 className="font-semibold mb-2 flex items-center space-x-2">
                          <UserPlus className="h-4 w-4" />
                          <span>Pending Join Requests</span>
                          <Badge variant="secondary">3</Badge>
                        </h4>
                        <div className="space-y-2 border rounded-lg p-3 max-h-40 overflow-y-auto">
                          {[
                            { name: 'Maria Rodriguez', username: 'maria_tango', joinDate: '2 hours ago' },
                            { name: 'Carlos Mendez', username: 'carlos_m', joinDate: '1 day ago' },
                            { name: 'Ana Silva', username: 'ana_dancer', joinDate: '2 days ago' }
                          ].map((request, index) => (
                            <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded dark:bg-neutral-800">
                              <div>
                                <div className="font-medium text-sm">{request.name}</div>
                                <div className="text-xs text-gray-500">@{request.username}</div>
                              </div>
                              <div className="flex space-x-1">
                                <Button size="sm" variant="outline" className="h-7 px-2 text-xs" data-testid="button-h-7">Accept</Button>
                                <Button size="sm" variant="outline" className="h-7 px-2 text-xs" data-testid="button-h-7">Decline</Button>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>

                      <div>
                        <h4 className="font-semibold mb-2 flex items-center space-x-2">
                          <Crown className="h-4 w-4" />
                          <span>Role Management</span>
                        </h4>
                        <div className="space-y-2">
                          <div className="flex items-center space-x-2">
                            <Input 
                              placeholder="Search members..." 
                              className="flex-1 h-8" 
                            / data-testid="input-flex-1">
                            <Button size="sm" variant="outline" className="h-8" data-testid="button-h-8">
                              Search
                            </Button>
                          </div>
                          <Select data-testid="select-element">
                            <SelectTrigger className="h-8" data-testid="select-h-8">
                              <SelectValue placeholder="Assign role to member" / data-testid="select-element">
                            </SelectTrigger>
                            <SelectContent data-testid="select-element">
                              <SelectItem value="admin" data-testid="select-element">Admin</SelectItem>
                              <SelectItem value="moderator" data-testid="select-element">Moderator</SelectItem>
                              <SelectItem value="member" data-testid="select-element">Member</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                    </div>

                    <div>
                      <h4 className="font-semibold mb-2">Member Actions</h4>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                        <Button 
                          variant="outline" 
                          size="sm"
                          disabled={!permissions.canManageMembers}
                         data-testid="button-element">
                          Bulk Invite
                        </Button>
                        <Button 
                          variant="outline" 
                          size="sm"
                          disabled={!permissions.canManageMembers}
                         data-testid="button-element">
                          Export Members
                        </Button>
                        <Button 
                          variant="outline" 
                          size="sm"
                          disabled={!permissions.canPromoteMembers}
                         data-testid="button-element">
                          Promote Member
                        </Button>
                        <Button 
                          variant="outline" 
                          size="sm"
                          disabled={!permissions.canManageMembers}
                         data-testid="button-element">
                          Remove Member
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="content" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle>Content Management</CardTitle>
                    <CardDescription>Manage group content, posts, and media</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <h4 className="font-semibold mb-2">Recent Posts</h4>
                        <div className="border rounded-lg p-3 max-h-40 overflow-y-auto">
                          <div className="text-sm text-gray-600 dark:text-neutral-600 dark:text-neutral-400">
                            No posts to moderate
                          </div>
                        </div>
                      </div>
                      <div>
                        <h4 className="font-semibold mb-2">Media Gallery</h4>
                        <div className="border rounded-lg p-3 max-h-40 overflow-y-auto">
                          <div className="text-sm text-gray-600 dark:text-neutral-600 dark:text-neutral-400">
                            Group media will appear here
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="settings" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle>Group Settings</CardTitle>
                    <CardDescription>Configure group visibility, permissions, and preferences</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-4">
                        <div>
                          <label className="text-sm font-medium">Group Name</label>
                          <Input 
                            defaultValue={group.name} 
                            disabled={!permissions.canChangeSettings}
                            className="mt-1"
                          / data-testid="input-mt-1">
                        </div>
                        <div>
                          <label className="text-sm font-medium">Description</label>
                          <Textarea 
                            defaultValue={group.description} 
                            disabled={!permissions.canChangeSettings}
                            className="mt-1"
                            rows={3}
                          / data-testid="textarea-mt-1">
                        </div>
                      </div>
                      <div className="space-y-4">
                        <div>
                          <label className="text-sm font-medium">Privacy Level</label>
                          <Select disabled={!permissions.canChangeSettings} data-testid="select-element">
                            <SelectTrigger className="mt-1" data-testid="select-mt-1">
                              <SelectValue placeholder={group.isPrivate ? "Private" : "Public"} / data-testid="select-element">
                            </SelectTrigger>
                            <SelectContent data-testid="select-element">
                              <SelectItem value="public" data-testid="select-element">Public</SelectItem>
                              <SelectItem value="private" data-testid="select-element">Private</SelectItem>
                              <SelectItem value="invite-only" data-testid="select-element">Invite Only</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div>
                          <label className="text-sm font-medium">Member Approval</label>
                          <Select disabled={!permissions.canChangeSettings} data-testid="select-element">
                            <SelectTrigger className="mt-1" data-testid="select-mt-1">
                              <SelectValue placeholder="Auto-approve" / data-testid="select-element">
                            </SelectTrigger>
                            <SelectContent data-testid="select-element">
                              <SelectItem value="auto" data-testid="select-element">Auto-approve</SelectItem>
                              <SelectItem value="manual" data-testid="select-element">Manual approval</SelectItem>
                              <SelectItem value="invite-only" data-testid="select-element">Invite only</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                    </div>
                    
                    {permissions.canChangeSettings && (
                      <div className="pt-4 border-t">
                        <Button className="bg-blue-600 hover:bg-blue-700" data-testid="button-bg-blue-600">
                          Save Settings
                        </Button>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="analytics" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle>Group Analytics</CardTitle>
                    <CardDescription>Track group performance and member engagement</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div className="text-center p-4 border rounded-lg">
                        <div className="text-2xl font-bold text-blue-600">{group.memberCount}</div>
                        <div className="text-sm text-gray-600 dark:text-neutral-600 dark:text-neutral-400">Total Members</div>
                      </div>
                      <div className="text-center p-4 border rounded-lg">
                        <div className="text-2xl font-bold text-green-600">89%</div>
                        <div className="text-sm text-gray-600 dark:text-neutral-600 dark:text-neutral-400">Active Rate</div>
                      </div>
                      <div className="text-center p-4 border rounded-lg">
                        <div className="text-2xl font-bold text-purple-600">24</div>
                        <div className="text-sm text-gray-600 dark:text-neutral-600 dark:text-neutral-400">Posts This Week</div>
                      </div>
                      <div className="text-center p-4 border rounded-lg">
                        <div className="text-2xl font-bold text-orange-600">156</div>
                        <div className="text-sm text-gray-600 dark:text-neutral-600 dark:text-neutral-400">Total Interactions</div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="moderation" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                      <AlertTriangle className="h-5 w-5 text-red-600" / data-testid="link-h-5">
                      <span>Content Moderation</span>
                    </CardTitle>
                    <CardDescription>Review flagged content and member reports</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div className="text-sm text-gray-600 dark:text-neutral-600 dark:text-neutral-400">
                        No content flagged for review
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
};

export default GroupAdminToolbar;