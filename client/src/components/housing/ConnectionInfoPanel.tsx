import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ConnectionBadge } from './ConnectionBadge';
import { Users, Heart, Clock, Loader2 } from 'lucide-react';
import { Separator } from '@/components/ui/separator';

interface ConnectionInfoPanelProps {
  userId: number;
  hostId: number;
  hostName?: string;
}

export function ConnectionInfoPanel({ userId, hostId, hostName }: ConnectionInfoPanelProps) {
  const { data: connectionInfo, isLoading } = useQuery({
    queryKey: ['/api/users', userId, 'connection-info', hostId],
    queryFn: async () => {
      const res = await fetch(`/api/users/${userId}/connection-info/${hostId}`);
      if (!res.ok) throw new Error('Failed to fetch connection info');
      return res.json();
    },
    enabled: userId !== hostId, // Don't fetch if viewing own property
  });

  if (userId === hostId) {
    return null; // Don't show connection info on own properties
  }

  if (isLoading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center p-8">
          <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
        </CardContent>
      </Card>
    );
  }

  if (!connectionInfo) {
    return null;
  }

  return (
    <Card className="border-2 border-primary/10">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Users className="w-5 h-5 text-primary" />
            <CardTitle>Your Connection</CardTitle>
          </div>
          <ConnectionBadge 
            connectionDegree={connectionInfo.connectionDegree} 
            closenessScore={connectionInfo.closenessScore}
          />
        </div>
        <CardDescription>
          Your friendship level with {hostName || 'the host'}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {connectionInfo.isConnected ? (
          <>
            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-1 text-center p-3 rounded-lg bg-gradient-to-br from-pink-50 to-rose-50 dark:from-pink-950/20 dark:to-rose-950/20">
                <div className="flex items-center justify-center gap-1">
                  <Heart className="w-4 h-4 text-pink-500" />
                  <p className="text-2xl font-bold text-pink-600 dark:text-pink-400">
                    {connectionInfo.closenessScore}
                  </p>
                </div>
                <p className="text-xs text-muted-foreground">Closeness Score</p>
              </div>

              <div className="space-y-1 text-center p-3 rounded-lg bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-blue-950/20 dark:to-cyan-950/20">
                <div className="flex items-center justify-center gap-1">
                  <Users className="w-4 h-4 text-blue-500" />
                  <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                    {connectionInfo.mutualFriends}
                  </p>
                </div>
                <p className="text-xs text-muted-foreground">Mutual Friends</p>
              </div>

              <div className="space-y-1 text-center p-3 rounded-lg bg-gradient-to-br from-purple-50 to-indigo-50 dark:from-purple-950/20 dark:to-indigo-950/20">
                <div className="flex items-center justify-center gap-1">
                  <Clock className="w-4 h-4 text-purple-500" />
                  <p className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                    {connectionInfo.sharedMemories}
                  </p>
                </div>
                <p className="text-xs text-muted-foreground">Shared Memories</p>
              </div>
            </div>

            <Separator />

            <div className="space-y-2">
              <p className="text-sm font-medium">What this means:</p>
              {connectionInfo.connectionDegree === 1 && (
                <div className="flex items-start gap-2 p-3 rounded-lg bg-pink-50 dark:bg-pink-950/20">
                  <Heart className="w-4 h-4 text-pink-500 mt-0.5" />
                  <p className="text-sm text-muted-foreground">
                    You're direct friends! You have {connectionInfo.mutualFriends} mutual connections 
                    and {connectionInfo.sharedMemories} shared memories together.
                  </p>
                </div>
              )}
              {connectionInfo.connectionDegree === 2 && (
                <div className="flex items-start gap-2 p-3 rounded-lg bg-blue-50 dark:bg-blue-950/20">
                  <Users className="w-4 h-4 text-blue-500 mt-0.5" />
                  <p className="text-sm text-muted-foreground">
                    You're friends of friends with {connectionInfo.mutualFriends} mutual connections in common.
                  </p>
                </div>
              )}
              {connectionInfo.connectionDegree === 3 && (
                <div className="flex items-start gap-2 p-3 rounded-lg bg-purple-50 dark:bg-purple-950/20">
                  <Users className="w-4 h-4 text-purple-500 mt-0.5" />
                  <p className="text-sm text-muted-foreground">
                    You're in the same extended network, connected through mutual friends.
                  </p>
                </div>
              )}
            </div>
          </>
        ) : (
          <div className="text-center py-6 space-y-2">
            <Users className="w-12 h-12 text-muted-foreground mx-auto opacity-50" />
            <p className="text-sm text-muted-foreground">
              You're not connected with {hostName || 'this host'} yet.
            </p>
            <p className="text-xs text-muted-foreground">
              Send them a friend request to unlock friendship-restricted properties!
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
