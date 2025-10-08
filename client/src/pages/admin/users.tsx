// ESA LIFE CEO 61x21 - Phase 19: User Management Page
import { useState, useEffect } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { queryClient } from '@/lib/queryClient';
import AdminLayout from '@/components/admin/AdminLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Checkbox } from '@/components/ui/checkbox';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';
import {
  Search,
  Filter,
  Download,
  Upload,
  MoreHorizontal,
  UserPlus,
  UserX,
  Shield,
  Mail,
  Key,
  Ban,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Clock,
  TrendingUp,
  TrendingDown,
  Users,
  UserCheck,
  Activity,
  Globe,
  CreditCard,
  Calendar,
  ChevronDown,
  Eye,
  Edit,
  Trash,
  RefreshCw,
  Send,
  FileText,
  History
} from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';

interface User {
  id: number;
  name: string;
  email: string;
  username: string;
  profileImage?: string;
  roles: string[];
  isVerified: boolean;
  isActive: boolean;
  suspended: boolean;
  createdAt: string;
  lastLoginAt?: string;
  city?: string;
  country?: string;
  subscriptionTier?: string;
  subscriptionStatus?: string;
  tangoRoles?: string[];
  formStatus?: number;
  warningCount?: number;
  reportCount?: number;
}

interface UserStats {
  total: number;
  active: number;
  verified: number;
  suspended: number;
  newToday: number;
  newThisWeek: number;
  newThisMonth: number;
  byRole: Record<string, number>;
  byCountry: Record<string, number>;
  bySubscription: Record<string, number>;
}

export default function AdminUsersPage() {
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedUsers, setSelectedUsers] = useState<number[]>([]);
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterRole, setFilterRole] = useState('all');
  const [filterSubscription, setFilterSubscription] = useState('all');
  const [sortBy, setSortBy] = useState('createdAt');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [page, setPage] = useState(1);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [showBulkActions, setShowBulkActions] = useState(false);

  // Fetch users
  const { data: usersData, isLoading: loadingUsers, refetch: refetchUsers } = useQuery({
    queryKey: ['/api/admin/users', { searchQuery, filterStatus, filterRole, filterSubscription, sortBy, sortOrder, page }],
    queryFn: async () => {
      const params = new URLSearchParams({
        search: searchQuery,
        status: filterStatus,
        role: filterRole,
        subscription: filterSubscription,
        sortBy,
        sortOrder,
        page: page.toString(),
        limit: '20'
      });
      const response = await fetch(`/api/admin/users?${params}`, {
        credentials: 'include'
      });
      if (!response.ok) throw new Error('Failed to fetch users');
      return response.json();
    }
  });

  // Fetch user statistics
  const { data: stats } = useQuery({
    queryKey: ['/api/admin/users/stats'],
  });

  // User actions mutations
  const suspendUserMutation = useMutation({
    mutationFn: async ({ userId, reason }: { userId: number; reason: string }) => {
      return apiRequest(`/api/admin/users/${userId}/suspend`, {
        method: 'POST',
        body: { reason }
      });
    },
    onSuccess: () => {
      toast({ title: 'User suspended successfully' });
      queryClient.invalidateQueries({ queryKey: ['/api/admin/users'] });
    },
    onError: () => {
      toast({ title: 'Failed to suspend user', variant: 'destructive' });
    }
  });

  const verifyUserMutation = useMutation({
    mutationFn: async (userId: number) => {
      return apiRequest(`/api/admin/users/${userId}/verify`, {
        method: 'POST'
      });
    },
    onSuccess: () => {
      toast({ title: 'User verified successfully' });
      queryClient.invalidateQueries({ queryKey: ['/api/admin/users'] });
    }
  });

  const resetPasswordMutation = useMutation({
    mutationFn: async (userId: number) => {
      return apiRequest(`/api/admin/users/${userId}/reset-password`, {
        method: 'POST'
      });
    },
    onSuccess: () => {
      toast({ title: 'Password reset email sent' });
    }
  });

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedUsers(usersData?.users?.map((u: User) => u.id) || []);
    } else {
      setSelectedUsers([]);
    }
  };

  const handleSelectUser = (userId: number, checked: boolean) => {
    if (checked) {
      setSelectedUsers([...selectedUsers, userId]);
    } else {
      setSelectedUsers(selectedUsers.filter(id => id !== userId));
    }
  };

  const handleBulkAction = async (action: string) => {
    if (selectedUsers.length === 0) {
      toast({ title: 'No users selected', variant: 'destructive' });
      return;
    }

    try {
      await apiRequest('/api/admin/users/bulk-action', {
        method: 'POST',
        body: {
          userIds: selectedUsers,
          action
        }
      });
      
      toast({ title: `Bulk action completed for ${selectedUsers.length} users` });
      setSelectedUsers([]);
      refetchUsers();
    } catch (error) {
      toast({ title: 'Bulk action failed', variant: 'destructive' });
    }
  };

  const getStatusBadge = (user: User) => {
    if (user.suspended) {
      return <Badge variant="destructive">Suspended</Badge>;
    }
    if (!user.isActive) {
      return <Badge variant="secondary">Inactive</Badge>;
    }
    if (user.isVerified) {
      return <Badge className="bg-green-500">Verified</Badge>;
    }
    return <Badge variant="outline">Pending</Badge>;
  };

  const getSubscriptionBadge = (tier?: string, status?: string) => {
    if (!tier) return null;
    
    const colors = {
      free: 'bg-[var(--color-surface-elevated)] dark:bg-gray-8000',
      basic: 'bg-blue-500',
      enthusiast: 'bg-purple-500',
      professional: 'bg-amber-500',
      enterprise: 'bg-red-500'
    };

    return (
      <Badge className={cn(colors[tier as keyof typeof colors] || 'bg-[var(--color-surface-elevated)] dark:bg-gray-8000')}>
        {tier}
        {status === 'past_due' && ' ⚠'}
      </Badge>
    );
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-teal-600 to-cyan-600 text-transparent bg-clip-text">
              User Management
            </h1>
            <p className="text-gray-600 dark:text-gray-300 mt-1">
              Manage platform users, roles, and permissions
            </p>
          </div>
          
          <div className="flex gap-3">
            <Button variant="outline" onClick={() => refetchUsers()}>
              <RefreshCw className="w-4 h-4 mr-2" />
              Refresh
            </Button>
            <Button variant="outline">
              <Download className="w-4 h-4 mr-2" />
              Export
            </Button>
            <Button className="bg-gradient-to-r from-[var(--color-primary)] to-cyan-500 text-white">
              <UserPlus className="w-4 h-4 mr-2" />
              Add User
            </Button>
          </div>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="border-teal-100">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-300">
                  Total Users
                </CardTitle>
                <Users className="w-4 h-4 text-[var(--color-primary)]" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-[var(--color-text)] dark:text-white">
                {stats?.total?.toLocaleString() || 0}
              </div>
              <div className="flex items-center mt-2 text-sm">
                <TrendingUp className="w-4 h-4 text-green-500 mr-1" />
                <span className="text-green-600">+{stats?.newThisMonth || 0} this month</span>
              </div>
            </CardContent>
          </Card>

          <Card className="border-cyan-100">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-300">
                  Active Users
                </CardTitle>
                <Activity className="w-4 h-4 text-[var(--color-primary)]" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-[var(--color-text)] dark:text-white">
                {stats?.active?.toLocaleString() || 0}
              </div>
              <div className="text-sm text-gray-500 dark:text-gray-400 mt-2">
                {((stats?.active / stats?.total) * 100).toFixed(1)}% of total
              </div>
            </CardContent>
          </Card>

          <Card className="border-green-100">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-300">
                  Verified Users
                </CardTitle>
                <CheckCircle className="w-4 h-4 text-green-500" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-[var(--color-text)] dark:text-white">
                {stats?.verified?.toLocaleString() || 0}
              </div>
              <div className="text-sm text-gray-500 dark:text-gray-400 mt-2">
                {((stats?.verified / stats?.total) * 100).toFixed(1)}% verified
              </div>
            </CardContent>
          </Card>

          <Card className="border-red-100">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-300">
                  Suspended
                </CardTitle>
                <Ban className="w-4 h-4 text-red-500" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-[var(--color-text)] dark:text-white">
                {stats?.suspended || 0}
              </div>
              <div className="text-sm text-red-600 mt-2">
                {stats?.suspended > 0 ? 'Requires review' : 'No issues'}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters and Search */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex flex-col lg:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <Input
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search by name, email, or username..."
                    className="pl-10"
                    data-testid="admin-user-search"
                  />
                </div>
              </div>
              
              <div className="flex gap-3">
                <Select value={filterStatus} onValueChange={setFilterStatus}>
                  <SelectTrigger className="w-40" data-testid="filter-status">
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="verified">Verified</SelectItem>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="suspended">Suspended</SelectItem>
                  </SelectContent>
                </Select>

                <Select value={filterRole} onValueChange={setFilterRole}>
                  <SelectTrigger className="w-40" data-testid="filter-role">
                    <SelectValue placeholder="Role" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Roles</SelectItem>
                    <SelectItem value="user">User</SelectItem>
                    <SelectItem value="organizer">Organizer</SelectItem>
                    <SelectItem value="teacher">Teacher</SelectItem>
                    <SelectItem value="moderator">Moderator</SelectItem>
                    <SelectItem value="admin">Admin</SelectItem>
                  </SelectContent>
                </Select>

                <Select value={filterSubscription} onValueChange={setFilterSubscription}>
                  <SelectTrigger className="w-40" data-testid="filter-subscription">
                    <SelectValue placeholder="Subscription" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Tiers</SelectItem>
                    <SelectItem value="free">Free</SelectItem>
                    <SelectItem value="basic">Basic</SelectItem>
                    <SelectItem value="enthusiast">Enthusiast</SelectItem>
                    <SelectItem value="professional">Professional</SelectItem>
                    <SelectItem value="enterprise">Enterprise</SelectItem>
                  </SelectContent>
                </Select>

                <Button
                  variant={showBulkActions ? 'default' : 'outline'}
                  onClick={() => setShowBulkActions(!showBulkActions)}
                >
                  <Filter className="w-4 h-4 mr-2" />
                  Bulk Actions
                </Button>
              </div>
            </div>

            {/* Bulk Actions Bar */}
            {showBulkActions && selectedUsers.length > 0 && (
              <div className="mt-4 p-4 bg-gradient-to-r from-teal-50 to-cyan-50 rounded-lg border border-teal-200">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-[var(--color-primary-hover)]">
                    {selectedUsers.length} user(s) selected
                  </span>
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleBulkAction('verify')}
                    >
                      <CheckCircle className="w-4 h-4 mr-1" />
                      Verify
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleBulkAction('suspend')}
                      className="text-orange-600 hover:text-orange-700"
                    >
                      <AlertTriangle className="w-4 h-4 mr-1" />
                      Suspend
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleBulkAction('delete')}
                      className="text-red-600 hover:text-red-700"
                    >
                      <Trash className="w-4 h-4 mr-1" />
                      Delete
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleBulkAction('email')}
                    >
                      <Mail className="w-4 h-4 mr-1" />
                      Email
                    </Button>
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Users Table */}
        <Card>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="bg-gradient-to-r from-teal-50/50 to-cyan-50/50">
                    {showBulkActions && (
                      <TableHead className="w-12">
                        <Checkbox
                          checked={selectedUsers.length === usersData?.users?.length}
                          onCheckedChange={handleSelectAll}
                          data-testid="select-all-users"
                        />
                      </TableHead>
                    )}
                    <TableHead>User</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Role</TableHead>
                    <TableHead>Subscription</TableHead>
                    <TableHead>Location</TableHead>
                    <TableHead>Joined</TableHead>
                    <TableHead>Last Active</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {loadingUsers ? (
                    <TableRow>
                      <TableCell colSpan={showBulkActions ? 9 : 8} className="text-center py-8">
                        <div className="flex items-center justify-center">
                          <RefreshCw className="w-5 h-5 animate-spin text-[var(--color-primary)] mr-2" />
                          Loading users...
                        </div>
                      </TableCell>
                    </TableRow>
                  ) : usersData?.users?.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={showBulkActions ? 9 : 8} className="text-center py-8 text-gray-500 dark:text-gray-400">
                        No users found
                      </TableCell>
                    </TableRow>
                  ) : (
                    usersData?.users?.map((user: User) => (
                      <TableRow key={user.id} className="hover:bg-[var(--color-surface-elevated)]">
                        {showBulkActions && (
                          <TableCell>
                            <Checkbox
                              checked={selectedUsers.includes(user.id)}
                              onCheckedChange={(checked) => handleSelectUser(user.id, checked as boolean)}
                              data-testid={`select-user-${user.id}`}
                            />
                          </TableCell>
                        )}
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <Avatar className="w-10 h-10">
                              <AvatarImage src={user.profileImage} />
                              <AvatarFallback className="bg-gradient-to-br from-[var(--color-primary)] to-cyan-500 text-white">
                                {user.name?.charAt(0).toUpperCase()}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <div className="font-medium text-[var(--color-text)] dark:text-white">{user.name}</div>
                              <div className="text-sm text-gray-500 dark:text-gray-400">{user.email}</div>
                              <div className="text-xs text-gray-400">@{user.username}</div>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>{getStatusBadge(user)}</TableCell>
                        <TableCell>
                          <Badge variant="outline">
                            {user.roles?.[0] || 'user'}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          {getSubscriptionBadge(user.subscriptionTier, user.subscriptionStatus)}
                        </TableCell>
                        <TableCell>
                          {user.city && user.country ? (
                            <div className="flex items-center gap-1 text-sm text-gray-600 dark:text-gray-300">
                              <Globe className="w-3 h-3" />
                              {user.city}, {user.country}
                            </div>
                          ) : (
                            <span className="text-gray-400">-</span>
                          )}
                        </TableCell>
                        <TableCell>
                          <div className="text-sm text-gray-600 dark:text-gray-300">
                            {format(new Date(user.createdAt), 'MMM d, yyyy')}
                          </div>
                        </TableCell>
                        <TableCell>
                          {user.lastLoginAt ? (
                            <div className="text-sm text-gray-600 dark:text-gray-300">
                              {format(new Date(user.lastLoginAt), 'MMM d, h:mm a')}
                            </div>
                          ) : (
                            <span className="text-gray-400">Never</span>
                          )}
                        </TableCell>
                        <TableCell className="text-right">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button 
                                variant="ghost" 
                                size="icon"
                                data-testid={`user-actions-${user.id}`}
                              >
                                <MoreHorizontal className="w-4 h-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="w-48">
                              <DropdownMenuLabel>Actions</DropdownMenuLabel>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem onClick={() => setSelectedUser(user)}>
                                <Eye className="w-4 h-4 mr-2" />
                                View Details
                              </DropdownMenuItem>
                              <DropdownMenuItem>
                                <Edit className="w-4 h-4 mr-2" />
                                Edit User
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => resetPasswordMutation.mutate(user.id)}>
                                <Key className="w-4 h-4 mr-2" />
                                Reset Password
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              {!user.isVerified && (
                                <DropdownMenuItem 
                                  onClick={() => verifyUserMutation.mutate(user.id)}
                                  className="text-green-600"
                                >
                                  <CheckCircle className="w-4 h-4 mr-2" />
                                  Verify User
                                </DropdownMenuItem>
                              )}
                              {!user.suspended ? (
                                <DropdownMenuItem 
                                  onClick={() => suspendUserMutation.mutate({ 
                                    userId: user.id, 
                                    reason: 'Admin action' 
                                  })}
                                  className="text-orange-600"
                                >
                                  <Ban className="w-4 h-4 mr-2" />
                                  Suspend User
                                </DropdownMenuItem>
                              ) : (
                                <DropdownMenuItem className="text-green-600">
                                  <CheckCircle className="w-4 h-4 mr-2" />
                                  Unsuspend User
                                </DropdownMenuItem>
                              )}
                              <DropdownMenuSeparator />
                              <DropdownMenuItem className="text-red-600">
                                <Trash className="w-4 h-4 mr-2" />
                                Delete User
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>

            {/* Pagination */}
            {usersData?.totalPages > 1 && (
              <div className="flex items-center justify-between px-6 py-4 border-t">
                <div className="text-sm text-gray-600 dark:text-gray-300">
                  Showing {((page - 1) * 20) + 1} to {Math.min(page * 20, usersData?.total)} of {usersData?.total} users
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setPage(page - 1)}
                    disabled={page === 1}
                  >
                    Previous
                  </Button>
                  {[...Array(Math.min(5, usersData?.totalPages))].map((_, i) => {
                    const pageNum = i + 1;
                    return (
                      <Button
                        key={pageNum}
                        variant={page === pageNum ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => setPage(pageNum)}
                      >
                        {pageNum}
                      </Button>
                    );
                  })}
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setPage(page + 1)}
                    disabled={page === usersData?.totalPages}
                  >
                    Next
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
}