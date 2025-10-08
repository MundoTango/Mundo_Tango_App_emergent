// ESA LIFE CEO 61×21 - Phase 20: Gamification Page
import { useState, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { toast } from "@/hooks/use-toast";
import { 
  Trophy, 
  Award, 
  Target, 
  Zap, 
  Star, 
  TrendingUp,
  Calendar,
  Clock,
  Users,
  Medal,
  Crown,
  Flame,
  Gift,
  Shield,
  Heart,
  Music,
  MapPin,
  Camera,
  MessageCircle,
  Share2,
  ChevronUp,
  ChevronDown
} from "lucide-react";
import { format } from "date-fns";
import { useAuth } from "@/hooks/useAuth";

interface UserStats {
  totalPoints: number;
  currentLevel: number;
  levelProgress: number;
  weeklyPoints: number;
  monthlyPoints: number;
  streakDays: number;
  weeklyRank: number | null;
  monthlyRank: number | null;
  allTimeRank: number | null;
  statistics?: {
    postsCreated: number;
    eventsAttended: number;
    streamsHosted: number;
    videosWatched: number;
    helpfulVotes: number;
    achievementsUnlocked: number;
  };
}

interface Achievement {
  id: string;
  name: string;
  description: string;
  category: string;
  tier: string;
  iconUrl?: string;
  points: number;
  isSecret: boolean;
  unlockedAt?: string;
  progress?: number;
  showcased?: boolean;
}

interface Challenge {
  id: string;
  title: string;
  description: string;
  type: string;
  category: string;
  rewards: {
    points: number;
    badges?: string[];
  };
  startDate: string;
  endDate: string;
  currentParticipants: number;
  maxParticipants?: number;
  progress?: number;
  completed?: boolean;
}

interface LeaderboardEntry {
  rank: number;
  userId: number;
  score: number;
  user: {
    id: number;
    name: string;
    username: string;
    profileImage?: string;
  };
  change?: number;
}

export default function Gamification() {
  const { user } = useAuth();
  const [selectedLeaderboardType, setSelectedLeaderboardType] = useState("global");
  const [selectedLeaderboardPeriod, setSelectedLeaderboardPeriod] = useState("weekly");
  const [selectedAchievementCategory, setSelectedAchievementCategory] = useState("all");

  // Get user stats
  const { data: userStats, isLoading: loadingStats } = useQuery({
    queryKey: ["/api/gamification/users", user?.id, "stats"],
    queryFn: async () => {
      if (!user?.id) return null;
      const response = await fetch(`/api/gamification/users/${user.id}/stats`, {
        credentials: "include",
      });
      if (!response.ok) throw new Error("Failed to fetch user stats");
      const data = await response.json();
      return data.stats as UserStats;
    },
    enabled: !!user?.id,
  });

  // Get user achievements
  const { data: userAchievements, isLoading: loadingAchievements } = useQuery({
    queryKey: ["/api/gamification/users", user?.id, "achievements"],
    queryFn: async () => {
      if (!user?.id) return [];
      const response = await fetch(`/api/gamification/users/${user.id}/achievements`, {
        credentials: "include",
      });
      if (!response.ok) throw new Error("Failed to fetch achievements");
      const data = await response.json();
      return data.achievements as Achievement[];
    },
    enabled: !!user?.id,
  });

  // Get all achievements
  const { data: allAchievements, isLoading: loadingAllAchievements } = useQuery({
    queryKey: ["/api/gamification/achievements", selectedAchievementCategory],
    queryFn: async () => {
      const params = selectedAchievementCategory !== "all" ? `?category=${selectedAchievementCategory}` : "";
      const response = await fetch(`/api/gamification/achievements${params}`, {
        credentials: "include",
      });
      if (!response.ok) throw new Error("Failed to fetch achievements");
      const data = await response.json();
      return data.achievements as Achievement[];
    },
  });

  // Get active challenges
  const { data: challenges, isLoading: loadingChallenges } = useQuery({
    queryKey: ["/api/gamification/challenges"],
    queryFn: async () => {
      const response = await fetch("/api/gamification/challenges?status=active", {
        credentials: "include",
      });
      if (!response.ok) throw new Error("Failed to fetch challenges");
      const data = await response.json();
      return data.challenges as Challenge[];
    },
  });

  // Get leaderboard
  const { data: leaderboard, isLoading: loadingLeaderboard } = useQuery({
    queryKey: ["/api/gamification/leaderboards", selectedLeaderboardType, selectedLeaderboardPeriod],
    queryFn: async () => {
      const response = await fetch(
        `/api/gamification/leaderboards/${selectedLeaderboardType}/${selectedLeaderboardPeriod}`,
        { credentials: "include" }
      );
      if (!response.ok) throw new Error("Failed to fetch leaderboard");
      const data = await response.json();
      return data.leaderboard;
    },
  });

  // Join challenge mutation
  const joinChallengeMutation = useMutation({
    mutationFn: async (challengeId: string) => {
      return apiRequest(`/api/gamification/challenges/${challengeId}/join`, {
        method: "POST",
      });
    },
    onSuccess: () => {
      toast({
        title: "Challenge joined!",
        description: "Good luck completing the challenge!",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/gamification/challenges"] });
    },
    onError: (error: any) => {
      toast({
        title: "Failed to join challenge",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Update daily streak
  const updateStreakMutation = useMutation({
    mutationFn: async () => {
      if (!user?.id) throw new Error("Not authenticated");
      return apiRequest(`/api/gamification/users/${user.id}/streak`, {
        method: "POST",
      });
    },
    onSuccess: (data) => {
      toast({
        title: "Daily streak updated!",
        description: `${data.streak} day streak! Earned ${data.pointsEarned} points`,
      });
      queryClient.invalidateQueries({ queryKey: ["/api/gamification/users", user?.id] });
    },
  });

  const getLevelName = (level: number) => {
    if (level <= 5) return "Beginner";
    if (level <= 10) return "Intermediate";
    if (level <= 15) return "Advanced";
    if (level <= 19) return "Expert";
    return "Master";
  };

  const getTierColor = (tier: string) => {
    switch (tier) {
      case "bronze": return "text-orange-600 dark:text-orange-400";
      case "silver": return "text-gray-500 dark:text-gray-400";
      case "gold": return "text-yellow-500 dark:text-yellow-400";
      case "platinum": return "text-purple-600 dark:text-purple-400";
      default: return "text-gray-600 dark:text-gray-400";
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case "skill": return <Target className="h-4 w-4" />;
      case "community": return <Users className="h-4 w-4" />;
      case "event": return <Calendar className="h-4 w-4" />;
      case "special": return <Star className="h-4 w-4" />;
      default: return <Award className="h-4 w-4" />;
    }
  };

  const getRankChange = (change?: number) => {
    if (!change) return null;
    if (change > 0) {
      return <span className="text-green-600 flex items-center"><ChevronUp className="h-3 w-3" />+{change}</span>;
    }
    if (change < 0) {
      return <span className="text-red-600 flex items-center"><ChevronDown className="h-3 w-3" />{change}</span>;
    }
    return <span className="text-gray-400">-</span>;
  };

  useEffect(() => {
    // Update daily streak on mount
    if (user?.id) {
      updateStreakMutation.mutate();
    }
  }, [user?.id]);

  return (
    <div className="container mx-auto p-4 max-w-7xl" data-testid="gamification-page">
      {/* Header with User Stats */}
      <div className="mb-8">
        <div className="bg-gradient-to-r from-teal-500 to-cyan-600 rounded-lg p-6 text-white">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <Trophy className="h-8 w-8" />
                <div>
                  <p className="text-sm opacity-90">Total Points</p>
                  <p className="text-2xl font-bold">{userStats?.totalPoints || 0}</p>
                </div>
              </div>
            </div>
            
            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <Shield className="h-8 w-8" />
                <div>
                  <p className="text-sm opacity-90">Level {userStats?.currentLevel || 1}</p>
                  <p className="text-xl font-bold">{getLevelName(userStats?.currentLevel || 1)}</p>
                </div>
              </div>
              <Progress value={userStats?.levelProgress || 0} className="h-2 bg-white/20" />
            </div>
            
            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <Flame className="h-8 w-8" />
                <div>
                  <p className="text-sm opacity-90">Daily Streak</p>
                  <p className="text-2xl font-bold">{userStats?.streakDays || 0} days</p>
                </div>
              </div>
            </div>
            
            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <Medal className="h-8 w-8" />
                <div>
                  <p className="text-sm opacity-90">Weekly Rank</p>
                  <p className="text-2xl font-bold">#{userStats?.weeklyRank || "-"}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <Tabs defaultValue="achievements" className="space-y-6">
        <TabsList className="grid grid-cols-4 w-full max-w-md">
          <TabsTrigger value="achievements" data-testid="tab-achievements">
            <Award className="mr-2 h-4 w-4" />
            <span className="hidden sm:inline">Achievements</span>
          </TabsTrigger>
          <TabsTrigger value="challenges" data-testid="tab-challenges">
            <Target className="mr-2 h-4 w-4" />
            <span className="hidden sm:inline">Challenges</span>
          </TabsTrigger>
          <TabsTrigger value="leaderboard" data-testid="tab-leaderboard">
            <Trophy className="mr-2 h-4 w-4" />
            <span className="hidden sm:inline">Leaderboard</span>
          </TabsTrigger>
          <TabsTrigger value="stats" data-testid="tab-stats">
            <TrendingUp className="mr-2 h-4 w-4" />
            <span className="hidden sm:inline">Stats</span>
          </TabsTrigger>
        </TabsList>

        {/* Achievements Tab */}
        <TabsContent value="achievements" className="space-y-4">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-2xl font-bold">Achievements</h2>
            <div className="flex space-x-2">
              <Button
                variant={selectedAchievementCategory === "all" ? "default" : "outline"}
                size="sm"
                onClick={() => setSelectedAchievementCategory("all")}
              >
                All
              </Button>
              <Button
                variant={selectedAchievementCategory === "skill" ? "default" : "outline"}
                size="sm"
                onClick={() => setSelectedAchievementCategory("skill")}
              >
                Skills
              </Button>
              <Button
                variant={selectedAchievementCategory === "community" ? "default" : "outline"}
                size="sm"
                onClick={() => setSelectedAchievementCategory("community")}
              >
                Community
              </Button>
              <Button
                variant={selectedAchievementCategory === "event" ? "default" : "outline"}
                size="sm"
                onClick={() => setSelectedAchievementCategory("event")}
              >
                Events
              </Button>
            </div>
          </div>

          {loadingAllAchievements ? (
            <div className="text-center py-8">Loading achievements...</div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {allAchievements?.map((achievement) => {
                const isUnlocked = userAchievements?.some(ua => ua.id === achievement.id);
                return (
                  <Card 
                    key={achievement.id} 
                    className={`relative ${!isUnlocked ? "opacity-60" : ""}`}
                    data-testid={`achievement-${achievement.id}`}
                  >
                    <CardHeader className="pb-3">
                      <div className="flex justify-between items-start">
                        <div className="flex items-center space-x-3">
                          <div className={`p-2 rounded-lg bg-gray-100 dark:bg-gray-800 ${getTierColor(achievement.tier)}`}>
                            {getCategoryIcon(achievement.category)}
                          </div>
                          <div>
                            <CardTitle className="text-lg">{achievement.name}</CardTitle>
                            <Badge variant="secondary" className="mt-1">
                              {achievement.points} points
                            </Badge>
                          </div>
                        </div>
                        {isUnlocked && (
                          <Badge className="bg-green-600">Unlocked</Badge>
                        )}
                      </div>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        {achievement.description}
                      </p>
                      {!isUnlocked && achievement.progress !== undefined && (
                        <div className="mt-3">
                          <Progress value={achievement.progress} className="h-2" />
                          <p className="text-xs text-gray-500 mt-1">{achievement.progress}% complete</p>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </TabsContent>

        {/* Challenges Tab */}
        <TabsContent value="challenges" className="space-y-4">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-2xl font-bold">Active Challenges</h2>
            <Badge variant="secondary">
              {challenges?.length || 0} Active
            </Badge>
          </div>

          {loadingChallenges ? (
            <div className="text-center py-8">Loading challenges...</div>
          ) : challenges && challenges.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {challenges.map((challenge) => (
                <Card key={challenge.id} data-testid={`challenge-${challenge.id}`}>
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <div>
                        <CardTitle className="text-lg">{challenge.title}</CardTitle>
                        <CardDescription>{challenge.description}</CardDescription>
                      </div>
                      <Badge variant={challenge.type === "daily" ? "default" : "secondary"}>
                        {challenge.type}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex items-center justify-between text-sm">
                      <span className="flex items-center">
                        <Clock className="mr-1 h-3 w-3" />
                        Ends {format(new Date(challenge.endDate), "MMM dd")}
                      </span>
                      <span className="flex items-center">
                        <Users className="mr-1 h-3 w-3" />
                        {challenge.currentParticipants} participants
                      </span>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <Gift className="h-4 w-4 text-yellow-600" />
                      <span className="text-sm">
                        {challenge.rewards.points} points
                        {challenge.rewards.badges && challenge.rewards.badges.length > 0 && 
                          ` + ${challenge.rewards.badges.length} badge${challenge.rewards.badges.length > 1 ? 's' : ''}`
                        }
                      </span>
                    </div>

                    {challenge.progress !== undefined ? (
                      <div>
                        <Progress value={challenge.progress} className="h-2" />
                        <p className="text-xs text-gray-500 mt-1">{challenge.progress}% complete</p>
                      </div>
                    ) : (
                      <Button 
                        className="w-full"
                        onClick={() => joinChallengeMutation.mutate(challenge.id)}
                        disabled={joinChallengeMutation.isPending}
                        data-testid={`button-join-${challenge.id}`}
                      >
                        Join Challenge
                      </Button>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <Card className="p-8 text-center">
              <Target className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">No Active Challenges</h3>
              <p className="text-gray-600 dark:text-gray-400">
                Check back later for new challenges!
              </p>
            </Card>
          )}
        </TabsContent>

        {/* Leaderboard Tab */}
        <TabsContent value="leaderboard" className="space-y-4">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-2xl font-bold">Leaderboard</h2>
            <div className="flex space-x-2">
              <select
                className="px-3 py-1 border rounded-md"
                value={selectedLeaderboardType}
                onChange={(e) => setSelectedLeaderboardType(e.target.value)}
                data-testid="select-leaderboard-type"
              >
                <option value="global">Global</option>
                <option value="city">City</option>
              </select>
              <select
                className="px-3 py-1 border rounded-md"
                value={selectedLeaderboardPeriod}
                onChange={(e) => setSelectedLeaderboardPeriod(e.target.value)}
                data-testid="select-leaderboard-period"
              >
                <option value="weekly">Weekly</option>
                <option value="monthly">Monthly</option>
                <option value="all-time">All Time</option>
              </select>
            </div>
          </div>

          {loadingLeaderboard ? (
            <div className="text-center py-8">Loading leaderboard...</div>
          ) : leaderboard && leaderboard.rankings ? (
            <Card>
              <ScrollArea className="h-[500px]">
                <div className="p-4 space-y-2">
                  {leaderboard.rankings.map((entry: LeaderboardEntry, index: number) => {
                    const isCurrentUser = entry.userId === user?.id;
                    return (
                      <div
                        key={entry.userId}
                        className={`flex items-center justify-between p-3 rounded-lg ${
                          isCurrentUser ? "bg-teal-50 dark:bg-teal-900/20 border border-teal-500" : 
                          index < 3 ? "bg-gray-50 dark:bg-gray-800" : ""
                        }`}
                        data-testid={`leaderboard-entry-${entry.userId}`}
                      >
                        <div className="flex items-center space-x-3">
                          <div className="text-center min-w-[40px]">
                            {entry.rank === 1 && <Crown className="h-5 w-5 text-yellow-500 mx-auto" />}
                            {entry.rank === 2 && <Medal className="h-5 w-5 text-gray-400 mx-auto" />}
                            {entry.rank === 3 && <Medal className="h-5 w-5 text-orange-600 mx-auto" />}
                            <span className={`font-bold ${entry.rank <= 3 ? "text-lg" : ""}`}>
                              #{entry.rank}
                            </span>
                          </div>
                          <Avatar>
                            <AvatarImage src={entry.user.profileImage} />
                            <AvatarFallback>{entry.user.name[0]}</AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="font-medium">{entry.user.name}</p>
                            <p className="text-sm text-gray-600 dark:text-gray-400">
                              @{entry.user.username}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center space-x-3">
                          {getRankChange(entry.change)}
                          <div className="text-right">
                            <p className="font-bold text-lg">{entry.score.toLocaleString()}</p>
                            <p className="text-xs text-gray-500">points</p>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </ScrollArea>
            </Card>
          ) : (
            <Card className="p-8 text-center">
              <Trophy className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">No Leaderboard Data</h3>
              <p className="text-gray-600 dark:text-gray-400">
                Start earning points to appear on the leaderboard!
              </p>
            </Card>
          )}
        </TabsContent>

        {/* Stats Tab */}
        <TabsContent value="stats" className="space-y-4">
          <h2 className="text-2xl font-bold mb-4">Your Statistics</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <Card data-testid="stats-posts">
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center">
                  <Camera className="mr-2 h-4 w-4" />
                  Posts Created
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-bold">{userStats?.statistics?.postsCreated || 0}</p>
              </CardContent>
            </Card>

            <Card data-testid="stats-events">
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center">
                  <Calendar className="mr-2 h-4 w-4" />
                  Events Attended
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-bold">{userStats?.statistics?.eventsAttended || 0}</p>
              </CardContent>
            </Card>

            <Card data-testid="stats-streams">
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center">
                  <Zap className="mr-2 h-4 w-4" />
                  Streams Hosted
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-bold">{userStats?.statistics?.streamsHosted || 0}</p>
              </CardContent>
            </Card>

            <Card data-testid="stats-videos">
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center">
                  <Music className="mr-2 h-4 w-4" />
                  Videos Watched
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-bold">{userStats?.statistics?.videosWatched || 0}</p>
              </CardContent>
            </Card>

            <Card data-testid="stats-helpful">
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center">
                  <Heart className="mr-2 h-4 w-4" />
                  Helpful Votes
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-bold">{userStats?.statistics?.helpfulVotes || 0}</p>
              </CardContent>
            </Card>

            <Card data-testid="stats-achievements">
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center">
                  <Award className="mr-2 h-4 w-4" />
                  Achievements
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-bold">{userStats?.statistics?.achievementsUnlocked || 0}</p>
              </CardContent>
            </Card>
          </div>

          <Card className="mt-6">
            <CardHeader>
              <CardTitle>Point History</CardTitle>
              <CardDescription>Your recent point transactions</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Feature coming soon - track all your point earnings and spending here!
              </p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}