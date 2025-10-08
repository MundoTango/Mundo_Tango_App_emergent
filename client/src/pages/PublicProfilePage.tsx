import { useRoute } from "wouter";
import { useQuery } from "@tanstack/react-query";
import DashboardLayout from "@/layouts/DashboardLayout";
import ProfileHead from "@/components/profile/ProfileHead";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent } from "@/components/ui/tabs";
import { RoleEmojiDisplay } from "@/components/ui/RoleEmojiDisplay";
import { Users } from "lucide-react";
import PostFeed from "@/components/moments/PostFeed";

interface PublicUser {
  id: number;
  name: string;
  username: string;
  email: string;
  profileImage?: string;
  bio?: string;
  city?: string;
  country?: string;
  tangoRoles?: string[];
  yearsOfDancing?: number;
  leaderLevel?: number;
  followerLevel?: number;
  createdAt: string;
}

export default function PublicProfilePage() {
  // Support multiple route patterns: /u/:username, /profile/:userId, /public-profile/:userId
  const [matchUsername, paramsUsername] = useRoute("/u/:username");
  const [matchUserId, paramsUserId] = useRoute("/profile/:userId");
  const [matchPublicProfile, paramsPublicProfile] = useRoute("/public-profile/:userId");
  
  const username = paramsUsername?.username;
  const userId = paramsUserId?.userId || paramsPublicProfile?.userId;
  
  // Use username if available, otherwise use userId
  const identifier = username || userId;
  const isUserId = !username && !!userId;

  // Fetch public user profile
  const { data: userData, isLoading: userLoading, error } = useQuery({
    queryKey: ['/api/public-profile', identifier, isUserId],
    queryFn: async () => {
      // If we have a userId, fetch by ID; otherwise by username
      const endpoint = isUserId 
        ? `/api/users/${identifier}` 
        : `/api/public-profile/${identifier}`;
        
      const response = await fetch(endpoint, {
        credentials: 'include'
      });
      
      if (!response.ok) {
        if (response.status === 404) {
          throw new Error('User not found');
        }
        throw new Error('Failed to fetch user profile');
      }
      
      const result = await response.json();
      return result.data as PublicUser;
    },
    enabled: !!identifier
  });

  // Fetch user stats
  const { data: statsData } = useQuery({
    queryKey: ['/api/user/stats', userData?.id],
    queryFn: async () => {
      if (!userData?.id) return {};
      
      const response = await fetch(`/api/users/${userData.id}/stats`, {
        credentials: 'include'
      });
      
      if (!response.ok) return {};
      
      const result = await response.json();
      return result.data || {};
    },
    enabled: !!userData?.id
  });

  if (!matchUsername && !matchUserId && !matchPublicProfile) {
    return <div>Page not found</div>;
  }

  if (userLoading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-gray-600 dark:text-gray-300 text-lg">Loading profile...</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  if (error || !userData) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <Users className="h-16 w-16 text-gray-300 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-[var(--color-text)] dark:text-white mb-2">User Not Found</h2>
            <p className="text-gray-600 dark:text-gray-300">
              {error?.message === 'User not found' 
                ? `No user found with username @${username}`
                : 'This profile is not available or may be private.'
              }
            </p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Public Profile Header */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
          <div className="flex items-center space-x-2">
            <Users className="h-5 w-5 text-blue-600" />
            <p className="text-blue-800 font-medium">
              This is the public profile of @{userData.username}
            </p>
          </div>
        </div>

        {/* Profile Head Component */}
        <ProfileHead
          user={userData}
          activeTab="posts"
          onTabChange={() => {}}
          onEditProfile={() => {}}
          onAddTravelDetails={() => {}}
        />

        {/* Enhanced Tango Roles Display */}
        {userData.tangoRoles && userData.tangoRoles.length > 0 && (
          <Card>
            <CardContent className="p-6">
              <h3 className="text-lg font-semibold mb-4">Tango Roles</h3>
              <div className="flex justify-center">
                <RoleEmojiDisplay 
                  tangoRoles={userData.tangoRoles} 
                  size="lg"
                  maxRoles={10}
                  className="justify-center"
                />
              </div>
            </CardContent>
          </Card>
        )}

        {/* Profile Content - Unified PostFeed */}
        <Tabs value="posts" className="space-y-4">
          <TabsContent value="posts" className="space-y-4">
            <PostFeed 
              context={{ 
                type: 'profile', 
                userId: userData.id 
              }}
            />
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
}