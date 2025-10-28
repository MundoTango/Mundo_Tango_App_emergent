/**
 * MB.MD Compliance Dashboard
 * Squad D: Governance & QA - Oct 27, 2025
 * FIX: Wait for authentication before querying
 */

import { useQuery } from '@tanstack/react-query';
import { useAuth } from '@/hooks/useAuth';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

export function MBMDDashboard() {
  const { user, isLoading: isAuthLoading } = useAuth();
  
  const { data, isLoading, error } = useQuery({
    queryKey: ['/api/mbmd/dashboard'],
    queryFn: async () => {
      const res = await fetch('/api/mbmd/dashboard', {
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}: ${res.statusText}`);
      return res.json();
    },
    enabled: !!user, // Only run query when user is authenticated
    staleTime: 30000, // Cache for 30 seconds
  });

  if (isAuthLoading) {
    return <div className="p-8">Authenticating...</div>;
  }

  if (!user) {
    return <div className="p-8">Please log in to view the dashboard.</div>;
  }

  if (isLoading) {
    return <div className="p-8">Loading dashboard...</div>;
  }

  if (error) {
    return <div className="p-8 text-red-600">Error loading dashboard: {String(error)}</div>;
  }

  const { sessions, stats } = data || { sessions: [], stats: {} };

  return (
    <div className="p-8 max-w-7xl mx-auto">
      <h1 className="text-3xl font-bold mb-6 bg-gradient-to-r from-cyan-600 to-blue-600 bg-clip-text text-transparent">
        MB.MD Compliance Dashboard
      </h1>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Total Sessions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{stats.total || 0}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Completed</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-green-600">{stats.completed || 0}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm">In Progress</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-blue-600">{stats.inProgress || 0}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Compliance Rate</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-purple-600">{stats.complianceRate || 0}%</div>
          </CardContent>
        </Card>
      </div>

      {/* Sessions List */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Sessions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {sessions.map((session: any) => (
              <div
                key={session.id}
                className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50"
              >
                <div className="flex-1">
                  <div className="font-semibold">{session.feature}</div>
                  <div className="text-sm text-gray-600">
                    Session #{session.id} • {session.executionMode || 'FOCUSED'}
                  </div>
                </div>

                <Badge
                  variant={
                    session.status === 'complete'
                      ? 'default'
                      : session.status === 'failed'
                      ? 'destructive'
                      : 'secondary'
                  }
                >
                  {session.status}
                </Badge>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default MBMDDashboard;
