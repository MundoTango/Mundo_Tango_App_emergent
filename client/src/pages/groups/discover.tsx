/**
 * Mundo Tango - Groups Discovery Page
 * MB.MD TRACK 2: TASK 4 - Frontend Integration
 * 
 * Features:
 * - City-based group discovery
 * - Join/Leave group functionality
 * - User's joined groups display
 * - Aurora Tide design system
 */

import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import UnifiedTopBar from "@/components/navigation/UnifiedTopBar";
import Sidebar from "@/components/layout/sidebar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { 
  Users, 
  MapPin, 
  Globe, 
  Search,
  UserPlus,
  UserMinus,
  Check
} from "lucide-react";
import { cn } from "@/lib/utils";
import { apiRequest } from "@/lib/queryClient";
import { GlassCard } from "@/components/glass/GlassComponents";
import { FadeIn } from "@/components/animations/FramerMotionWrappers";

interface Group {
  id: number;
  name: string;
  slug: string;
  description: string | null;
  city: string | null;
  country: string | null;
  memberCount: number;
  isPrivate: boolean;
  coverImage: string | null;
  type: string;
}

interface MyGroupsResponse {
  success: boolean;
  data: Array<{
    group: Group;
    memberRole: string;
  }>;
}

export default function GroupsDiscoveryPage() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    const savedTheme = localStorage.getItem('theme');
    return (savedTheme as 'light' | 'dark') || 'light';
  });
  const [joinedGroupIds, setJoinedGroupIds] = useState<Set<number>>(new Set());
  
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const toggleTheme = () => {
    const newTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(newTheme);
    localStorage.setItem('theme', newTheme);
    if (newTheme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  };

  // Fetch all groups
  const { data: allGroupsResponse, isLoading: loadingAllGroups } = useQuery<{ success: boolean; data: Group[] }>({
    queryKey: ['/api/groups'],
  });

  // Fetch user's groups
  const { data: myGroupsResponse } = useQuery<MyGroupsResponse>({
    queryKey: ['/api/groups/my'],
    enabled: !!user,
  });

  // Update joined groups set when data loads
  useEffect(() => {
    if (myGroupsResponse?.data) {
      const ids = new Set(myGroupsResponse.data.map(({ group }) => group.id));
      setJoinedGroupIds(ids);
    }
  }, [myGroupsResponse]);

  // Join group mutation
  const joinGroupMutation = useMutation({
    mutationFn: async (groupId: number) => {
      return apiRequest(`/api/groups/${groupId}/members`, {
        method: 'POST',
      });
    },
    onSuccess: (_, groupId) => {
      setJoinedGroupIds(prev => new Set([...prev, groupId]));
      queryClient.invalidateQueries({ queryKey: ['/api/groups/my'] });
      queryClient.invalidateQueries({ queryKey: ['/api/groups'] });
      toast({
        title: "Joined group! 🎉",
        description: "You're now a member of this group.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Failed to join group",
        description: error.message || "Please try again later",
        variant: "destructive",
      });
    },
  });

  // Leave group mutation
  const leaveGroupMutation = useMutation({
    mutationFn: async (groupId: number) => {
      return apiRequest(`/api/groups/${groupId}/members`, {
        method: 'DELETE',
      });
    },
    onSuccess: (_, groupId) => {
      setJoinedGroupIds(prev => {
        const newSet = new Set(prev);
        newSet.delete(groupId);
        return newSet;
      });
      queryClient.invalidateQueries({ queryKey: ['/api/groups/my'] });
      queryClient.invalidateQueries({ queryKey: ['/api/groups'] });
      toast({
        title: "Left group",
        description: "You're no longer a member of this group.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Failed to leave group",
        description: error.message || "Please try again later",
        variant: "destructive",
      });
    },
  });

  const allGroups = allGroupsResponse?.data || [];
  const myGroups = myGroupsResponse?.data || [];

  // Group by city
  const groupsByCity = allGroups.reduce((acc, group) => {
    const city = group.city || 'Other Cities';
    if (!acc[city]) {
      acc[city] = [];
    }
    acc[city].push(group);
    return acc;
  }, {} as Record<string, Group[]>);

  const handleCloseSidebar = () => {
    setIsSidebarOpen(false);
  };

  const handleJoinToggle = (group: Group) => {
    if (joinedGroupIds.has(group.id)) {
      leaveGroupMutation.mutate(group.id);
    } else {
      joinGroupMutation.mutate(group.id);
    }
  };

  return (
    <div 
      className="min-h-screen bg-gradient-to-br from-turquoise-50 via-cyan-50 to-blue-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900"
      data-testid="page-groups-discover"
    >
      <UnifiedTopBar 
        onMenuToggle={() => setIsSidebarOpen(!isSidebarOpen)}
        theme={theme}
        onThemeToggle={toggleTheme}
        showMenuButton={true}
      />
      
      <div className="flex">
        <Sidebar 
          isOpen={isSidebarOpen} 
          setIsOpen={setIsSidebarOpen}
          onClose={handleCloseSidebar}
        />
        
        {isSidebarOpen && (
          <div 
            className="fixed inset-0 bg-black bg-opacity-50 z-10 lg:hidden"
            onClick={handleCloseSidebar}
          />
        )}
        
        <main 
          className={`flex-1 transition-all duration-300 ${
            isSidebarOpen ? 'lg:ml-64' : ''
          } p-6`}
        >
          <div className="max-w-6xl mx-auto space-y-6">
            {/* Header */}
            <FadeIn>
              <div className="text-center mb-8">
                <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-2">
                  Discover Groups
                </h1>
                <p className="text-gray-600 dark:text-gray-400">
                  Find and join tango communities in your city
                </p>
              </div>
            </FadeIn>

            {/* My Groups */}
            {myGroups.length > 0 && (
              <FadeIn delay={0.1}>
                <GlassCard depth={2} className="p-6" data-testid="section-my-groups">
                  <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                    <Users className="h-6 w-6 text-cyan-500" />
                    My Groups
                  </h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {myGroups.map(({ group }) => (
                      <Card 
                        key={group.id} 
                        className="hover:shadow-lg transition-shadow bg-white/80 dark:bg-gray-800/80 backdrop-blur"
                        data-testid={`card-my-group-${group.id}`}
                      >
                        <CardContent className="p-4">
                          <div className="flex items-start justify-between mb-3">
                            <div className="flex-1">
                              <h3 className="font-semibold text-lg text-gray-900 dark:text-white">
                                {group.name}
                              </h3>
                              {group.city && (
                                <p className="text-sm text-gray-500 dark:text-gray-400 flex items-center gap-1 mt-1">
                                  <MapPin className="h-3 w-3" />
                                  {group.city}, {group.country}
                                </p>
                              )}
                            </div>
                            <Badge variant="secondary" className="bg-green-100 text-green-700">
                              <Check className="h-3 w-3 mr-1" />
                              Joined
                            </Badge>
                          </div>
                          {group.description && (
                            <p className="text-sm text-gray-600 dark:text-gray-300 line-clamp-2 mb-3">
                              {group.description}
                            </p>
                          )}
                          <div className="flex items-center justify-between text-sm">
                            <span className="text-gray-500 flex items-center gap-1">
                              <Users className="h-4 w-4" />
                              {group.memberCount} members
                            </span>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </GlassCard>
              </FadeIn>
            )}

            {/* Discover Groups by City */}
            <FadeIn delay={0.2}>
              <GlassCard depth={2} className="p-6" data-testid="section-discover-groups">
                <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-6 flex items-center gap-2">
                  <Globe className="h-6 w-6 text-cyan-500" />
                  Discover Groups
                </h2>

                {loadingAllGroups ? (
                  <div className="space-y-6">
                    {[1, 2, 3].map((i) => (
                      <div key={i} className="animate-pulse">
                        <div className="h-6 bg-gray-300 dark:bg-gray-700 rounded w-32 mb-4" />
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                          {[1, 2, 3].map((j) => (
                            <div key={j} className="h-40 bg-gray-200 dark:bg-gray-700 rounded" />
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : Object.keys(groupsByCity).length === 0 ? (
                  <div className="text-center py-12 text-gray-500 dark:text-gray-400">
                    <Globe className="h-16 w-16 mx-auto mb-4 opacity-50" />
                    <p>No groups available yet. Be the first to create one!</p>
                  </div>
                ) : (
                  <div className="space-y-8" data-testid="list-discover-groups">
                    {Object.entries(groupsByCity).map(([city, cityGroups]) => (
                      <div key={city}>
                        <h3 className="text-xl font-semibold text-gray-800 dark:text-gray-200 mb-4 flex items-center gap-2">
                          <MapPin className="h-5 w-5 text-cyan-600" />
                          {city}
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                          {cityGroups.map((group) => {
                            const isJoined = joinedGroupIds.has(group.id);
                            const isProcessing = 
                              joinGroupMutation.isPending || 
                              leaveGroupMutation.isPending;

                            return (
                              <Card 
                                key={group.id}
                                className={cn(
                                  "hover:shadow-lg transition-all bg-white/90 dark:bg-gray-800/90 backdrop-blur",
                                  isJoined && "ring-2 ring-cyan-500"
                                )}
                                data-testid={`card-group-${group.id}`}
                              >
                                <CardContent className="p-4">
                                  <div className="mb-3">
                                    <h4 className="font-semibold text-lg text-gray-900 dark:text-white mb-1">
                                      {group.name}
                                    </h4>
                                    {group.description && (
                                      <p className="text-sm text-gray-600 dark:text-gray-300 line-clamp-2">
                                        {group.description}
                                      </p>
                                    )}
                                  </div>
                                  
                                  <div className="flex items-center justify-between mb-3 text-sm text-gray-500 dark:text-gray-400">
                                    <span className="flex items-center gap-1">
                                      <Users className="h-4 w-4" />
                                      {group.memberCount} members
                                    </span>
                                    {group.isPrivate && (
                                      <Badge variant="secondary">Private</Badge>
                                    )}
                                  </div>

                                  <Button
                                    onClick={() => handleJoinToggle(group)}
                                    disabled={isProcessing}
                                    className={cn(
                                      "w-full",
                                      isJoined 
                                        ? "bg-gray-200 hover:bg-gray-300 text-gray-700 dark:bg-gray-700 dark:hover:bg-gray-600 dark:text-gray-200"
                                        : "bg-gradient-to-r from-cyan-500 to-cyan-600 hover:from-cyan-600 hover:to-cyan-700 text-white"
                                    )}
                                    data-testid={`button-join-group-${group.id}`}
                                  >
                                    {isJoined ? (
                                      <>
                                        <UserMinus className="h-4 w-4 mr-2" />
                                        Leave Group
                                      </>
                                    ) : (
                                      <>
                                        <UserPlus className="h-4 w-4 mr-2" />
                                        Join Group
                                      </>
                                    )}
                                  </Button>
                                </CardContent>
                              </Card>
                            );
                          })}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </GlassCard>
            </FadeIn>
          </div>
        </main>
      </div>
    </div>
  );
}
