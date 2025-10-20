import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { MapPin, Calendar, Heart, Edit, Camera, Mail } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAuth } from "@/hooks/useAuth";

interface UserProfile {
  id: number;
  username: string;
  email: string;
  fullName: string | null;
  bio: string | null;
  location: string | null;
  avatarUrl: string | null;
  coverImageUrl: string | null;
  tangoRole: string | null;
  experience: string | null;
  followers: number;
  following: number;
  posts: number;
}

/**
 * Mundo Tango - Mobile Profile Page
 * MB.MD TRACK 1 (S2): Mobile Optimization - Profile
 * 
 * Aurora Tide Design System:
 * - Turquoise/cyan gradients
 * - Glassmorphic cards with backdrop-blur
 * - Mobile-first responsive
 * - 44px minimum touch targets (WCAG 2.1 AA)
 * 
 * Features:
 * - Profile header with avatar & cover
 * - Stats cards (followers, following, posts)
 * - Tabbed content (Posts, Events, About)
 * - Edit profile button
 */
export default function ProfilePage() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState("posts");

  // Fetch user profile
  const { data: profile, isLoading } = useQuery<UserProfile>({
    queryKey: ["/api/users/profile", user?.id],
  });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-turquoise-50 via-cyan-50 to-blue-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
        <div className="container mx-auto px-4 py-6">
          <Card className="animate-pulse">
            <div className="h-48 bg-gray-200 dark:bg-gray-700 rounded-t-lg" />
            <CardContent className="p-6 space-y-4">
              <div className="w-24 h-24 bg-gray-200 dark:bg-gray-700 rounded-full -mt-16" />
              <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-1/3" />
              <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-2/3" />
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-turquoise-50 via-cyan-50 to-blue-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 pb-20">
      {/* Profile Header with Cover Image */}
      <div className="relative">
        {/* Cover Image */}
        <div className="h-48 sm:h-64 bg-gradient-to-r from-turquoise-500 to-cyan-600 relative overflow-hidden">
          {profile?.coverImageUrl ? (
            <img
              src={profile.coverImageUrl}
              alt="Cover"
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="absolute inset-0 bg-gradient-to-br from-turquoise-400 via-cyan-500 to-blue-500 opacity-80" />
          )}
          {/* Edit Cover Button */}
          <Button
            size="icon"
            variant="secondary"
            className="absolute top-4 right-4 min-h-[44px] min-w-[44px] rounded-full"
            data-testid="button-edit-cover"
          >
            <Camera className="w-5 h-5" />
          </Button>
        </div>

        {/* Profile Card */}
        <div className="container mx-auto px-4">
          <Card className="relative -mt-16 mb-6 bg-white/90 dark:bg-gray-900/90 backdrop-blur-md border-turquoise-200 dark:border-gray-700">
            <CardContent className="p-6">
              {/* Avatar & Basic Info */}
              <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4 mb-6">
                {/* Avatar */}
                <div className="relative">
                  <Avatar className="w-24 h-24 sm:w-32 sm:h-32 border-4 border-white dark:border-gray-800 shadow-xl">
                    <AvatarImage src={profile?.avatarUrl || undefined} />
                    <AvatarFallback className="text-2xl bg-gradient-to-br from-turquoise-400 to-cyan-500 text-white">
                      {profile?.fullName?.charAt(0) || profile?.username.charAt(0).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <Button
                    size="icon"
                    variant="secondary"
                    className="absolute bottom-0 right-0 min-w-[44px] min-h-[44px] rounded-full shadow-lg"
                    data-testid="button-edit-avatar"
                  >
                    <Camera className="w-5 h-5" />
                  </Button>
                </div>

                {/* Name & Bio */}
                <div className="flex-1 text-center sm:text-left">
                  <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white mb-1" data-testid="text-profile-name">
                    {profile?.fullName || profile?.username}
                  </h1>
                  <p className="text-gray-600 dark:text-gray-300 mb-2" data-testid="text-profile-username">
                    @{profile?.username}
                  </p>
                  {profile?.bio && (
                    <p className="text-gray-700 dark:text-gray-300 mb-3" data-testid="text-profile-bio">
                      {profile.bio}
                    </p>
                  )}
                  <div className="flex flex-wrap items-center justify-center sm:justify-start gap-3 text-sm text-gray-600 dark:text-gray-400">
                    {profile?.location && (
                      <span className="flex items-center gap-1" data-testid="text-profile-location">
                        <MapPin className="w-4 h-4" />
                        {profile.location}
                      </span>
                    )}
                    {profile?.tangoRole && (
                      <Badge variant="secondary" data-testid="badge-tango-role">
                        {profile.tangoRole}
                      </Badge>
                    )}
                    {profile?.experience && (
                      <Badge variant="outline" data-testid="badge-experience">
                        {profile.experience}
                      </Badge>
                    )}
                  </div>
                </div>

                {/* Edit Profile Button */}
                <Button
                  className="bg-gradient-to-r from-turquoise-500 to-cyan-600 hover:from-turquoise-600 hover:to-cyan-700 text-white min-h-[44px] whitespace-nowrap"
                  data-testid="button-edit-profile"
                >
                  <Edit className="w-4 h-4 mr-2" />
                  Edit Profile
                </Button>
              </div>

              {/* Stats Grid */}
              <div className="grid grid-cols-3 gap-3 sm:gap-6">
                <div className="text-center p-3 sm:p-4 rounded-lg bg-gradient-to-br from-turquoise-50 to-cyan-50 dark:from-turquoise-900/20 dark:to-cyan-900/20" data-testid="card-stat-posts">
                  <div className="text-2xl sm:text-3xl font-bold text-turquoise-600 dark:text-turquoise-400">
                    {profile?.posts || 0}
                  </div>
                  <div className="text-xs sm:text-sm text-gray-600 dark:text-gray-300">Posts</div>
                </div>
                <div className="text-center p-3 sm:p-4 rounded-lg bg-gradient-to-br from-cyan-50 to-blue-50 dark:from-cyan-900/20 dark:to-blue-900/20" data-testid="card-stat-followers">
                  <div className="text-2xl sm:text-3xl font-bold text-cyan-600 dark:text-cyan-400">
                    {profile?.followers || 0}
                  </div>
                  <div className="text-xs sm:text-sm text-gray-600 dark:text-gray-300">Followers</div>
                </div>
                <div className="text-center p-3 sm:p-4 rounded-lg bg-gradient-to-br from-blue-50 to-teal-50 dark:from-blue-900/20 dark:to-teal-900/20" data-testid="card-stat-following">
                  <div className="text-2xl sm:text-3xl font-bold text-blue-600 dark:text-blue-400">
                    {profile?.following || 0}
                  </div>
                  <div className="text-xs sm:text-sm text-gray-600 dark:text-gray-300">Following</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Tabbed Content */}
      <div className="container mx-auto px-4">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-3 mb-6 min-h-[44px]" data-testid="tabs-profile">
            <TabsTrigger value="posts" className="min-h-[44px]" data-testid="tab-posts">
              Posts
            </TabsTrigger>
            <TabsTrigger value="events" className="min-h-[44px]" data-testid="tab-events">
              Events
            </TabsTrigger>
            <TabsTrigger value="about" className="min-h-[44px]" data-testid="tab-about">
              About
            </TabsTrigger>
          </TabsList>

          <TabsContent value="posts" data-testid="content-posts">
            <div className="text-center py-16">
              <Heart className="w-16 h-16 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-300 mb-2">
                No posts yet
              </h3>
              <p className="text-gray-500 dark:text-gray-400">
                Share your tango moments with the community
              </p>
            </div>
          </TabsContent>

          <TabsContent value="events" data-testid="content-events">
            <div className="text-center py-16">
              <Calendar className="w-16 h-16 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-300 mb-2">
                No events yet
              </h3>
              <p className="text-gray-500 dark:text-gray-400">
                RSVP to events to see them here
              </p>
            </div>
          </TabsContent>

          <TabsContent value="about" data-testid="content-about">
            <Card className="bg-white/90 dark:bg-gray-900/90 backdrop-blur-md">
              <CardContent className="p-6 space-y-4">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                    Contact Information
                  </h3>
                  <div className="space-y-3">
                    <div className="flex items-center gap-3 text-gray-700 dark:text-gray-300">
                      <Mail className="w-5 h-5 text-turquoise-500" />
                      <span data-testid="text-email">{profile?.email}</span>
                    </div>
                  </div>
                </div>

                <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                    Tango Journey
                  </h3>
                  <div className="space-y-3 text-gray-700 dark:text-gray-300">
                    <div className="flex justify-between">
                      <span className="font-medium">Role:</span>
                      <span data-testid="text-tango-role">{profile?.tangoRole || "Not specified"}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="font-medium">Experience:</span>
                      <span data-testid="text-experience">{profile?.experience || "Not specified"}</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
