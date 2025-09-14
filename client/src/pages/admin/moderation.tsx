// ESA LIFE CEO 61x21 - Phase 19: Content Moderation Page
import { useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { queryClient } from '@/lib/queryClient';
import AdminLayout from '@/components/admin/AdminLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';
import {
  AlertTriangle,
  Shield,
  Flag,
  MessageSquare,
  Image,
  Video,
  FileText,
  User,
  Calendar,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  Eye,
  Trash,
  Ban,
  RefreshCw,
  Filter,
  Search,
  TrendingUp,
  Hash,
  MoreVertical,
  ChevronRight,
  UserX,
  AlertOctagon,
  ShieldAlert,
  ShieldCheck,
  Zap,
  Brain,
  FileWarning
} from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface ReportedContent {
  id: number;
  type: 'post' | 'comment' | 'message' | 'event' | 'profile';
  content: string;
  mediaUrls?: string[];
  reportedBy: {
    id: number;
    name: string;
    profileImage?: string;
  };
  reportedUser: {
    id: number;
    name: string;
    username: string;
    profileImage?: string;
    warningCount: number;
    isSuspended: boolean;
  };
  reason: string;
  category: 'spam' | 'harassment' | 'nsfw' | 'violence' | 'misinformation' | 'other';
  severity: 'low' | 'medium' | 'high' | 'critical';
  status: 'pending' | 'reviewing' | 'resolved' | 'escalated';
  aiFlags?: string[];
  reportCount: number;
  createdAt: string;
  reviewedBy?: string;
  reviewedAt?: string;
  action?: string;
}

interface ModerationStats {
  pendingReports: number;
  reviewingReports: number;
  resolvedToday: number;
  resolvedThisWeek: number;
  averageResponseTime: string;
  aiDetected: number;
  falsePositives: number;
  accuracy: number;
  topReportCategories: Array<{ category: string; count: number }>;
  activeReviewers: number;
}

export default function AdminModerationPage() {
  const { toast } = useToast();
  const [selectedTab, setSelectedTab] = useState('pending');
  const [selectedReport, setSelectedReport] = useState<ReportedContent | null>(null);
  const [filterCategory, setFilterCategory] = useState('all');
  const [filterSeverity, setFilterSeverity] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [reviewNote, setReviewNote] = useState('');
  const [showActionDialog, setShowActionDialog] = useState(false);
  const [selectedAction, setSelectedAction] = useState('');

  // Fetch moderation queue
  const { data: reportsData, isLoading, refetch } = useQuery({
    queryKey: ['/api/admin/moderation/reports', { status: selectedTab, category: filterCategory, severity: filterSeverity, search: searchQuery }],
    queryFn: async () => {
      const params = new URLSearchParams({
        status: selectedTab,
        category: filterCategory,
        severity: filterSeverity,
        search: searchQuery
      });
      const response = await fetch(`/api/admin/moderation/reports?${params}`, {
        credentials: 'include'
      });
      if (!response.ok) throw new Error('Failed to fetch reports');
      return response.json();
    }
  });

  // Fetch moderation statistics
  const { data: stats } = useQuery({
    queryKey: ['/api/admin/moderation/stats'],
  });

  // Moderation actions
  const moderateContentMutation = useMutation({
    mutationFn: async ({ reportId, action, note }: { reportId: number; action: string; note: string }) => {
      return apiRequest(`/api/admin/moderation/reports/${reportId}/action`, {
        method: 'POST',
        body: JSON.stringify({ action, note })
      });
    },
    onSuccess: () => {
      toast({ title: 'Action completed successfully' });
      queryClient.invalidateQueries({ queryKey: ['/api/admin/moderation'] });
      setShowActionDialog(false);
      setSelectedReport(null);
    },
    onError: () => {
      toast({ title: 'Failed to complete action', variant: 'destructive' });
    }
  });

  const handleAction = (action: string) => {
    if (!selectedReport) return;
    setSelectedAction(action);
    setShowActionDialog(true);
  };

  const confirmAction = () => {
    if (!selectedReport) return;
    moderateContentMutation.mutate({
      reportId: selectedReport.id,
      action: selectedAction,
      note: reviewNote
    });
  };

  const getSeverityBadge = (severity: string) => {
    const colors = {
      low: 'bg-blue-100 text-blue-700',
      medium: 'bg-yellow-100 text-yellow-700',
      high: 'bg-orange-100 text-orange-700',
      critical: 'bg-red-100 text-red-700'
    };
    return (
      <Badge className={cn(colors[severity as keyof typeof colors])}>
        {severity.toUpperCase()}
      </Badge>
    );
  };

  const getCategoryIcon = (category: string) => {
    const icons = {
      spam: MessageSquare,
      harassment: UserX,
      nsfw: AlertOctagon,
      violence: ShieldAlert,
      misinformation: FileWarning,
      other: Flag
    };
    const Icon = icons[category as keyof typeof icons] || Flag;
    return <Icon className="w-4 h-4" />;
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-teal-600 to-cyan-600 text-transparent bg-clip-text">
              Content Moderation
            </h1>
            <p className="text-gray-600 mt-1">
              Review reported content and maintain platform safety
            </p>
          </div>
          
          <div className="flex gap-3">
            <Button variant="outline" onClick={() => refetch()}>
              <RefreshCw className="w-4 h-4 mr-2" />
              Refresh
            </Button>
            <Button variant="outline">
              <Shield className="w-4 h-4 mr-2" />
              AI Settings
            </Button>
            <Button className="bg-gradient-to-r from-teal-500 to-cyan-500 text-white">
              <Filter className="w-4 h-4 mr-2" />
              Configure Filters
            </Button>
          </div>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="border-red-100">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-medium text-gray-600">
                  Pending Reports
                </CardTitle>
                <AlertTriangle className="w-4 h-4 text-red-500" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-gray-900">
                {stats?.pendingReports || 0}
              </div>
              <div className="text-sm text-red-600 mt-2">
                Requires immediate attention
              </div>
            </CardContent>
          </Card>

          <Card className="border-yellow-100">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-medium text-gray-600">
                  Under Review
                </CardTitle>
                <Eye className="w-4 h-4 text-yellow-500" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-gray-900">
                {stats?.reviewingReports || 0}
              </div>
              <div className="text-sm text-gray-500 mt-2">
                By {stats?.activeReviewers || 0} reviewers
              </div>
            </CardContent>
          </Card>

          <Card className="border-green-100">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-medium text-gray-600">
                  Resolved Today
                </CardTitle>
                <CheckCircle className="w-4 h-4 text-green-500" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-gray-900">
                {stats?.resolvedToday || 0}
              </div>
              <div className="text-sm text-gray-500 mt-2">
                Avg time: {stats?.averageResponseTime || 'N/A'}
              </div>
            </CardContent>
          </Card>

          <Card className="border-purple-100">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-medium text-gray-600">
                  AI Detection
                </CardTitle>
                <Brain className="w-4 h-4 text-purple-500" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-gray-900">
                {stats?.aiDetected || 0}
              </div>
              <div className="text-sm text-purple-600 mt-2">
                {stats?.accuracy || 0}% accuracy
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex flex-col lg:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <Input
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search reports by content or user..."
                    className="pl-10"
                    data-testid="moderation-search"
                  />
                </div>
              </div>
              
              <div className="flex gap-3">
                <Select value={filterCategory} onValueChange={setFilterCategory}>
                  <SelectTrigger className="w-40" data-testid="filter-category">
                    <SelectValue placeholder="Category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Categories</SelectItem>
                    <SelectItem value="spam">Spam</SelectItem>
                    <SelectItem value="harassment">Harassment</SelectItem>
                    <SelectItem value="nsfw">NSFW</SelectItem>
                    <SelectItem value="violence">Violence</SelectItem>
                    <SelectItem value="misinformation">Misinformation</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>

                <Select value={filterSeverity} onValueChange={setFilterSeverity}>
                  <SelectTrigger className="w-40" data-testid="filter-severity">
                    <SelectValue placeholder="Severity" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Severity</SelectItem>
                    <SelectItem value="low">Low</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="high">High</SelectItem>
                    <SelectItem value="critical">Critical</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Moderation Queue */}
        <Card>
          <CardHeader>
            <Tabs value={selectedTab} onValueChange={setSelectedTab}>
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="pending" className="relative">
                  Pending
                  {stats?.pendingReports > 0 && (
                    <Badge variant="destructive" className="ml-2 h-5 px-1">
                      {stats.pendingReports}
                    </Badge>
                  )}
                </TabsTrigger>
                <TabsTrigger value="reviewing">
                  Under Review
                  {stats?.reviewingReports > 0 && (
                    <Badge variant="secondary" className="ml-2 h-5 px-1">
                      {stats.reviewingReports}
                    </Badge>
                  )}
                </TabsTrigger>
                <TabsTrigger value="escalated">Escalated</TabsTrigger>
                <TabsTrigger value="resolved">Resolved</TabsTrigger>
              </TabsList>
            </Tabs>
          </CardHeader>
          
          <CardContent className="space-y-4">
            {isLoading ? (
              <div className="text-center py-8">
                <RefreshCw className="w-6 h-6 animate-spin text-teal-500 mx-auto mb-2" />
                <p className="text-gray-500">Loading reports...</p>
              </div>
            ) : reportsData?.reports?.length === 0 ? (
              <div className="text-center py-8">
                <ShieldCheck className="w-12 h-12 text-green-500 mx-auto mb-2" />
                <p className="text-gray-500">No reports in this category</p>
              </div>
            ) : (
              reportsData?.reports?.map((report: ReportedContent) => (
                <div
                  key={report.id}
                  className="border rounded-lg p-4 hover:bg-gray-50 transition-colors"
                  data-testid={`report-${report.id}`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      {/* Report Header */}
                      <div className="flex items-center gap-3 mb-3">
                        <Avatar className="w-10 h-10">
                          <AvatarImage src={report.reportedUser.profileImage} />
                          <AvatarFallback>
                            {report.reportedUser.name.charAt(0)}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <span className="font-medium">{report.reportedUser.name}</span>
                            <span className="text-sm text-gray-500">@{report.reportedUser.username}</span>
                            {report.reportedUser.warningCount > 0 && (
                              <Badge variant="outline" className="text-orange-600">
                                {report.reportedUser.warningCount} warnings
                              </Badge>
                            )}
                            {report.reportedUser.isSuspended && (
                              <Badge variant="destructive">Suspended</Badge>
                            )}
                          </div>
                          <div className="flex items-center gap-4 text-sm text-gray-500 mt-1">
                            <span className="flex items-center gap-1">
                              <Clock className="w-3 h-3" />
                              {format(new Date(report.createdAt), 'MMM d, h:mm a')}
                            </span>
                            <span className="flex items-center gap-1">
                              {getCategoryIcon(report.category)}
                              {report.category}
                            </span>
                            {getSeverityBadge(report.severity)}
                          </div>
                        </div>
                      </div>

                      {/* Content Preview */}
                      <div className="bg-gray-50 rounded-lg p-3 mb-3">
                        <div className="flex items-start gap-2 mb-2">
                          <Badge variant="outline">{report.type}</Badge>
                          {report.aiFlags && report.aiFlags.length > 0 && (
                            <div className="flex items-center gap-1">
                              <Zap className="w-3 h-3 text-purple-500" />
                              <span className="text-xs text-purple-600">
                                AI Detected: {report.aiFlags.join(', ')}
                              </span>
                            </div>
                          )}
                        </div>
                        <p className="text-sm text-gray-700 line-clamp-3">
                          {report.content}
                        </p>
                        {report.mediaUrls && report.mediaUrls.length > 0 && (
                          <div className="flex gap-2 mt-2">
                            {report.mediaUrls.slice(0, 3).map((url, idx) => (
                              <div key={idx} className="w-16 h-16 bg-gray-200 rounded flex items-center justify-center">
                                {url.includes('video') ? (
                                  <Video className="w-6 h-6 text-gray-400" />
                                ) : (
                                  <Image className="w-6 h-6 text-gray-400" />
                                )}
                              </div>
                            ))}
                            {report.mediaUrls.length > 3 && (
                              <div className="w-16 h-16 bg-gray-200 rounded flex items-center justify-center">
                                <span className="text-sm text-gray-600">
                                  +{report.mediaUrls.length - 3}
                                </span>
                              </div>
                            )}
                          </div>
                        )}
                      </div>

                      {/* Report Details */}
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4 text-sm">
                          <span className="text-gray-600">
                            Reported by: <span className="font-medium">{report.reportedBy.name}</span>
                          </span>
                          <span className="text-gray-600">
                            Reason: <span className="font-medium">{report.reason}</span>
                          </span>
                          {report.reportCount > 1 && (
                            <Badge variant="outline" className="text-red-600">
                              {report.reportCount} reports
                            </Badge>
                          )}
                        </div>

                        {/* Actions */}
                        <div className="flex items-center gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => setSelectedReport(report)}
                            data-testid={`view-report-${report.id}`}
                          >
                            <Eye className="w-4 h-4 mr-1" />
                            Review
                          </Button>
                          
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button size="sm" variant="ghost">
                                <MoreVertical className="w-4 h-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuLabel>Quick Actions</DropdownMenuLabel>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem 
                                onClick={() => handleAction('approve')}
                                className="text-green-600"
                              >
                                <CheckCircle className="w-4 h-4 mr-2" />
                                Approve Content
                              </DropdownMenuItem>
                              <DropdownMenuItem 
                                onClick={() => handleAction('remove')}
                                className="text-orange-600"
                              >
                                <Trash className="w-4 h-4 mr-2" />
                                Remove Content
                              </DropdownMenuItem>
                              <DropdownMenuItem 
                                onClick={() => handleAction('warn')}
                                className="text-yellow-600"
                              >
                                <AlertTriangle className="w-4 h-4 mr-2" />
                                Warn User
                              </DropdownMenuItem>
                              <DropdownMenuItem 
                                onClick={() => handleAction('suspend')}
                                className="text-red-600"
                              >
                                <Ban className="w-4 h-4 mr-2" />
                                Suspend User
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem onClick={() => handleAction('escalate')}>
                                <ChevronRight className="w-4 h-4 mr-2" />
                                Escalate to Admin
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </CardContent>
        </Card>

        {/* Action Confirmation Dialog */}
        <Dialog open={showActionDialog} onOpenChange={setShowActionDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Confirm Moderation Action</DialogTitle>
              <DialogDescription>
                You are about to {selectedAction} this content. Please provide a reason for this action.
              </DialogDescription>
            </DialogHeader>
            
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium">Review Note</label>
                <Textarea
                  value={reviewNote}
                  onChange={(e) => setReviewNote(e.target.value)}
                  placeholder="Provide details about this moderation action..."
                  className="mt-1"
                  rows={4}
                />
              </div>
              
              {selectedAction === 'suspend' && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                  <p className="text-sm text-red-700">
                    <AlertTriangle className="w-4 h-4 inline mr-1" />
                    This will suspend the user's account immediately.
                  </p>
                </div>
              )}
            </div>
            
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowActionDialog(false)}>
                Cancel
              </Button>
              <Button 
                onClick={confirmAction}
                className="bg-gradient-to-r from-teal-500 to-cyan-500 text-white"
                disabled={!reviewNote.trim()}
              >
                Confirm Action
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </AdminLayout>
  );
}