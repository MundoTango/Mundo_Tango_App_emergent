import React, { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import DashboardLayout from '@/layouts/DashboardLayout';
import BeautifulPostCreator from '@/components/universal/BeautifulPostCreator';
import EnhancedPostFeed from '@/components/moments/EnhancedPostFeed';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Sparkles, Heart, Users, MapPin, Globe, Tag, TrendingUp } from 'lucide-react';
import { useQueryClient } from '@tanstack/react-query';

export default function MemoriesPage() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [refreshKey, setRefreshKey] = useState(0);

  if (!user) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-64">
          <p className="text-gray-500">Loading memories...</p>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Memories Header */}
        <div className="text-center space-y-4">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-turquoise-500 to-cyan-600 rounded-2xl mb-4">
            <Sparkles className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-turquoise-600 to-cyan-700 bg-clip-text text-transparent">
            Memories
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Share your precious moments with the Tango community
          </p>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <Card className="glassmorphic-card">
            <CardContent className="p-4 text-center">
              <div className="flex items-center justify-center w-12 h-12 bg-gradient-to-r from-turquoise-400 to-cyan-500 rounded-xl mx-auto mb-2">
                <Heart className="w-6 h-6 text-white" />
              </div>
              <div className="text-2xl font-bold text-turquoise-600">156</div>
              <div className="text-sm text-gray-600">Total Memories</div>
            </CardContent>
          </Card>
          
          <Card className="glassmorphic-card">
            <CardContent className="p-4 text-center">
              <div className="flex items-center justify-center w-12 h-12 bg-gradient-to-r from-cyan-400 to-blue-500 rounded-xl mx-auto mb-2">
                <Users className="w-6 h-6 text-white" />
              </div>
              <div className="text-2xl font-bold text-cyan-600">892</div>
              <div className="text-sm text-gray-600">Total Likes</div>
            </CardContent>
          </Card>
          
          <Card className="glassmorphic-card">
            <CardContent className="p-4 text-center">
              <div className="flex items-center justify-center w-12 h-12 bg-gradient-to-r from-blue-400 to-purple-500 rounded-xl mx-auto mb-2">
                <MapPin className="w-6 h-6 text-white" />
              </div>
              <div className="text-2xl font-bold text-blue-600">23</div>
              <div className="text-sm text-gray-600">Cities Visited</div>
            </CardContent>
          </Card>
          
          <Card className="glassmorphic-card">
            <CardContent className="p-4 text-center">
              <div className="flex items-center justify-center w-12 h-12 bg-gradient-to-r from-purple-400 to-pink-500 rounded-xl mx-auto mb-2">
                <Tag className="w-6 h-6 text-white" />
              </div>
              <div className="text-2xl font-bold text-purple-600">47</div>
              <div className="text-sm text-gray-600">Unique Tags</div>
            </CardContent>
          </Card>
        </div>

        {/* Trending Tags */}
        <Card className="glassmorphic-card">
          <CardContent className="p-6">
            <div className="flex items-center gap-3 mb-4">
              <TrendingUp className="w-5 h-5 text-turquoise-600" />
              <h3 className="text-lg font-semibold text-gray-900">Trending Tags</h3>
            </div>
            <div className="flex flex-wrap gap-2">
              {['milonga', 'practica', 'performance', 'workshop', 'festival', 'travel', 'music', 'fashion'].map((tag) => (
                <Button
                  key={tag}
                  variant="outline"
                  size="sm"
                  className="border-turquoise-200 text-turquoise-700 hover:bg-turquoise-50"
                >
                  #{tag}
                </Button>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Memory Creation Interface */}
        <BeautifulPostCreator 
          context={{ type: 'memory' }}
          user={user}
          onPostCreated={() => {
            setRefreshKey(prev => prev + 1);
            queryClient.invalidateQueries({ queryKey: ['/api/posts/feed'] });
          }}
        />
        
        {/* Memory Feed */}
        <EnhancedPostFeed key={refreshKey} />
      </div>
    </DashboardLayout>
  );
}