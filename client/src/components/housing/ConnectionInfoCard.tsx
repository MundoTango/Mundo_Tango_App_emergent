import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Heart, Users, Calendar, MessageCircle, TrendingUp } from 'lucide-react';

interface ConnectionInfo {
  connectionDegree: number | null;
  closenessScore: number;
  mutualFriends: number;
  sharedMemories: number;
  sharedEvents: number;
  isConnected: boolean;
}

interface ConnectionInfoCardProps {
  connectionInfo: ConnectionInfo;
  hostName: string;
}

export function ConnectionInfoCard({ connectionInfo, hostName }: ConnectionInfoCardProps) {
  const { connectionDegree, closenessScore, mutualFriends, sharedMemories, sharedEvents, isConnected } = connectionInfo;

  const getDegreeDisplay = () => {
    if (!connectionDegree) return { label: 'Not Connected', color: 'bg-gray-100 text-gray-800' };
    if (connectionDegree === 1) return { label: '1st Degree (Direct Friend)', color: 'bg-pink-100 text-pink-800' };
    if (connectionDegree === 2) return { label: '2nd Degree (Friend of Friend)', color: 'bg-blue-100 text-blue-800' };
    if (connectionDegree === 3) return { label: '3rd Degree (Extended Network)', color: 'bg-purple-100 text-purple-800' };
    return { label: `${connectionDegree}th Degree`, color: 'bg-gray-100 text-gray-800' };
  };

  const getClosenessColor = () => {
    if (closenessScore >= 80) return 'text-green-600';
    if (closenessScore >= 60) return 'text-blue-600';
    if (closenessScore >= 40) return 'text-yellow-600';
    return 'text-gray-600';
  };

  const degree = getDegreeDisplay();

  if (!isConnected) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Users className="w-5 h-5" />
            Your Connection with {hostName}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-6">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4 dark:bg-neutral-800">
              <Users className="w-8 h-8 text-gray-600 dark:text-gray-400" />
            </div>
            <p className="text-gray-600 mb-2 dark:text-neutral-600 dark:text-neutral-400">You're not connected yet</p>
            <p className="text-sm text-muted-foreground">
              Send a friend request to {hostName} to build your connection!
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg flex items-center gap-2">
          <Heart className="w-5 h-5 text-pink-500" />
          Your Connection with {hostName}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Connection Degree */}
        <div className="flex items-center justify-between">
          <span className="text-sm text-muted-foreground">Connection Level</span>
          <Badge className={degree.color}>
            {degree.label}
          </Badge>
        </div>

        {/* Closeness Score */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground flex items-center gap-1">
              <TrendingUp className="w-4 h-4" />
              Closeness Score
            </span>
            <span className={`text-lg font-bold ${getClosenessColor()}`}>
              {closenessScore}/100
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className={`h-2 rounded-full transition-all ${
                closenessScore >= 80 ? 'bg-green-500' :
                closenessScore >= 60 ? 'bg-blue-500' :
                closenessScore >= 40 ? 'bg-yellow-500' :
                'bg-gray-400'
              }`}
              style={{ width: `${closenessScore}%` }}
            />
          </div>
          <p className="text-xs text-muted-foreground">
            Based on shared activities, events, and interactions
          </p>
        </div>

        {/* Connection Stats */}
        <div className="grid grid-cols-3 gap-4 pt-2">
          <div className="text-center">
            <div className="flex items-center justify-center mb-1">
              <Users className="w-4 h-4 text-blue-500" />
            </div>
            <div className="text-xl font-bold">{mutualFriends}</div>
            <div className="text-xs text-muted-foreground">Mutual Friends</div>
          </div>
          <div className="text-center">
            <div className="flex items-center justify-center mb-1">
              <Calendar className="w-4 h-4 text-purple-500" />
            </div>
            <div className="text-xl font-bold">{sharedEvents || 0}</div>
            <div className="text-xs text-muted-foreground">Shared Events</div>
          </div>
          <div className="text-center">
            <div className="flex items-center justify-center mb-1">
              <MessageCircle className="w-4 h-4 text-green-500" />
            </div>
            <div className="text-xl font-bold">{sharedMemories}</div>
            <div className="text-xs text-muted-foreground">Interactions</div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
