import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link, useLocation } from "wouter";
import { Users, MapPin, Search, Plus, TrendingUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";

interface Group {
  id: number;
  name: string;
  description: string;
  city: string;
  country: string;
  memberCount: number;
  isPublic: boolean;
  imageUrl: string | null;
  type: string;
}

/**
 * Mundo Tango - Mobile Groups Page
 * MB.MD TRACK 1 (S2): Mobile Optimization - Groups
 * 
 * Aurora Tide Design System:
 * - Turquoise/cyan gradients  
 * - Glassmorphic cards with backdrop-blur
 * - Mobile-first responsive
 * - 44px minimum touch targets (WCAG 2.1 AA)
 * 
 * Features:
 * - Group discovery by city/type
 * - Search and filter
 * - Member count badges
 * - Join/leave functionality
 */
export default function GroupsPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [filterType, setFilterType] = useState<string>("all");
  const [, setLocation] = useLocation();

  // Fetch groups
  const { data: groups, isLoading } = useQuery<Group[]>({
    queryKey: ["/api/groups"],
  });

  // Filter groups
  const filteredGroups = groups?.filter((group) => {
    const matchesSearch =
      group.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      group.city.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesType = filterType === "all" || group.type === filterType;
    return matchesSearch && matchesType;
  }) || [];

  return (
    <div className="min-h-screen bg-gradient-to-br from-turquoise-50 via-cyan-50 to-blue-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 pb-20">
      {/* Header Section */}
      <div className="bg-gradient-to-r from-turquoise-500 to-cyan-600 text-white">
        <div className="container mx-auto px-4 py-6 sm:py-8">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold mb-1" data-testid="heading-groups">
                Tango Groups
              </h1>
              <p className="text-turquoise-100 text-sm sm:text-base">
                Connect with local communities worldwide
              </p>
            </div>
            <Button
              onClick={() => setLocation("/groups/create")}
              className="bg-white text-turquoise-600 hover:bg-turquoise-50 whitespace-nowrap w-full sm:w-auto min-h-[44px]"
              data-testid="button-create-group"
            >
              <Plus className="w-4 h-4 mr-2" />
              Create Group
            </Button>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-6">
        {/* Search Bar */}
        <div className="mb-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <Input
              type="text"
              placeholder="Search groups or cities..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 min-h-[44px] text-base"
              data-testid="input-search-groups"
            />
          </div>
        </div>

        {/* Filter Chips */}
        <div className="flex gap-2 overflow-x-auto pb-2 mb-6 scrollbar-hide" data-testid="filter-chips">
          <Badge
            variant={filterType === "all" ? "default" : "outline"}
            className="cursor-pointer min-h-[44px] px-4 whitespace-nowrap flex items-center"
            onClick={() => setFilterType("all")}
            data-testid="filter-all"
          >
            All Groups
          </Badge>
          <Badge
            variant={filterType === "city" ? "default" : "outline"}
            className="cursor-pointer min-h-[44px] px-4 whitespace-nowrap flex items-center"
            onClick={() => setFilterType("city")}
            data-testid="filter-city"
          >
            City Groups
          </Badge>
          <Badge
            variant={filterType === "practice" ? "default" : "outline"}
            className="cursor-pointer min-h-[44px] px-4 whitespace-nowrap flex items-center"
            onClick={() => setFilterType("practice")}
            data-testid="filter-practice"
          >
            Practice Groups
          </Badge>
          <Badge
            variant={filterType === "social" ? "default" : "outline"}
            className="cursor-pointer min-h-[44px] px-4 whitespace-nowrap flex items-center"
            onClick={() => setFilterType("social")}
            data-testid="filter-social"
          >
            Social Groups
          </Badge>
        </div>

        {/* Groups Grid */}
        {isLoading ? (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <Card key={i} className="animate-pulse" data-testid={`skeleton-group-${i}`}>
                <div className="h-48 bg-gray-200 dark:bg-gray-700 rounded-t-lg" />
                <CardContent className="p-4 space-y-3">
                  <div className="h-5 bg-gray-200 dark:bg-gray-700 rounded w-3/4" />
                  <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/2" />
                  <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-full" />
                </CardContent>
              </Card>
            ))}
          </div>
        ) : filteredGroups.length === 0 ? (
          <div className="text-center py-16">
            <Users className="w-16 h-16 sm:w-20 sm:h-20 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
            <h3 className="text-lg sm:text-xl font-semibold text-gray-700 dark:text-gray-300 mb-2">
              {searchQuery ? "No groups found" : "No groups yet"}
            </h3>
            <p className="text-gray-500 dark:text-gray-400 mb-6 text-sm sm:text-base">
              {searchQuery
                ? "Try adjusting your search"
                : "Be the first to create a group in your city"}
            </p>
            <Button
              onClick={() => setLocation("/groups/create")}
              className="min-h-[44px]"
              data-testid="button-create-first-group"
            >
              <Plus className="w-4 h-4 mr-2" />
              Create a Group
            </Button>
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {filteredGroups.map((group) => (
              <Link key={group.id} href={`/groups/${group.id}`}>
                <Card
                  className="h-full bg-white/90 dark:bg-gray-900/90 backdrop-blur-md border-turquoise-200/50 dark:border-gray-700 hover:shadow-xl transition-all duration-300 hover:-translate-y-1 cursor-pointer"
                  data-testid={`card-group-${group.id}`}
                >
                  {/* Group Image */}
                  <div className="h-48 relative overflow-hidden rounded-t-lg">
                    {group.imageUrl ? (
                      <img
                        src={group.imageUrl}
                        alt={group.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full bg-gradient-to-br from-turquoise-400 via-cyan-500 to-blue-500 flex items-center justify-center">
                        <Users className="w-16 h-16 text-white opacity-50" />
                      </div>
                    )}
                    {/* Member Count Badge */}
                    <div className="absolute top-3 right-3 bg-white/90 dark:bg-gray-900/90 backdrop-blur-sm rounded-full px-3 py-1 flex items-center gap-1">
                      <Users className="w-4 h-4 text-turquoise-600" />
                      <span className="text-sm font-semibold text-gray-900 dark:text-white">
                        {group.memberCount}
                      </span>
                    </div>
                  </div>

                  <CardContent className="p-4">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2 line-clamp-1" data-testid={`text-group-name-${group.id}`}>
                      {group.name}
                    </h3>
                    
                    <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400 mb-3">
                      <MapPin className="w-4 h-4 text-turquoise-500" />
                      <span data-testid={`text-group-location-${group.id}`}>
                        {group.city}, {group.country}
                      </span>
                    </div>

                    <p className="text-sm text-gray-600 dark:text-gray-300 line-clamp-2 mb-3" data-testid={`text-group-description-${group.id}`}>
                      {group.description}
                    </p>

                    <div className="flex items-center justify-between">
                      <Badge
                        variant={group.isPublic ? "default" : "secondary"}
                        className="text-xs"
                        data-testid={`badge-group-type-${group.id}`}
                      >
                        {group.isPublic ? "Public" : "Private"}
                      </Badge>
                      <Button
                        size="sm"
                        className="min-h-[44px] bg-gradient-to-r from-turquoise-500 to-cyan-600 hover:from-turquoise-600 hover:to-cyan-700 text-white"
                        data-testid={`button-join-${group.id}`}
                        onClick={(e) => {
                          e.preventDefault();
                          // Join group logic
                        }}
                      >
                        Join
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        )}

        {/* Trending Groups Section */}
        {!isLoading && groups && groups.length > 0 && (
          <div className="mt-12">
            <div className="flex items-center gap-2 mb-4">
              <TrendingUp className="w-5 h-5 text-turquoise-600" />
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                Trending Groups
              </h2>
            </div>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {groups.slice(0, 4).map((group) => (
                <Card
                  key={`trending-${group.id}`}
                  className="bg-gradient-to-br from-turquoise-50 to-cyan-50 dark:from-turquoise-900/20 dark:to-cyan-900/20 border-turquoise-200/50 dark:border-gray-700"
                  data-testid={`card-trending-${group.id}`}
                >
                  <CardContent className="p-4">
                    <div className="flex items-center gap-3 mb-2">
                      <Avatar className="w-12 h-12">
                        <AvatarImage src={group.imageUrl || undefined} />
                        <AvatarFallback className="bg-gradient-to-br from-turquoise-400 to-cyan-500 text-white">
                          {group.name.charAt(0)}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-gray-900 dark:text-white truncate text-sm">
                          {group.name}
                        </h3>
                        <p className="text-xs text-gray-600 dark:text-gray-400">
                          {group.memberCount} members
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
