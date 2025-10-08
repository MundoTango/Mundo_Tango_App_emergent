import { useState, useEffect } from "react";
import UnifiedTopBar from "@/components/navigation/UnifiedTopBar";
import Sidebar from "@/components/layout/sidebar";
import CreatePost from "@/components/feed/create-post";
import StoryViewer from "@/components/feed/story-viewer";
import { useQuery } from "@tanstack/react-query";
import PostFeed from "@/components/moments/PostFeed";
import { Helmet } from 'react-helmet';

export default function Home() {
  // MT Ocean Theme Restored - July 22, 2025 9:20PM - v4 with service worker update
  // Force cache refresh with service worker update
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    const savedTheme = localStorage.getItem('theme');
    return (
    <>
      <Helmet>
        <title>Home | Life CEO</title>
      </Helmet>
      savedTheme as 'light' | 'dark'
    </>
  ) || 'light';
  });

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
  
  // Check for service worker updates on mount
  useEffect(() => {
    if ('serviceWorker' in navigator && navigator.serviceWorker.controller) {
      navigator.serviceWorker.addEventListener('controllerchange', () => {
        window.location.reload();
      });
    }
  }, []);

  const { data: storiesResponse } = useQuery({
    queryKey: ['/api/stories/following'],
  });

  const stories = (storiesResponse as any)?.data || [];

  const handleCloseSidebar = () => {
    setIsSidebarOpen(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-turquoise-50 via-cyan-50 to-blue-50" key="mt-ocean-theme-v2">
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
        
        {/* Overlay for mobile */}
        {isSidebarOpen && (
          <div 
            className="fixed inset-0 bg-black bg-opacity-50 z-10 lg:hidden"
            onClick={handleCloseSidebar}

        )}
        
        <main className={`flex-1 transition-all duration-300 ${
          isSidebarOpen ? 'lg:ml-64' : ''
        }`}>
          <div className="max-w-2xl mx-auto p-4 space-y-6">
            {/* Stories Section */}
            {stories && stories.length > 0 && (
              <div className="glassmorphic-card rounded-xl p-4 shadow-lg hover:shadow-xl transition-shadow duration-300">
                <StoryViewer stories={stories} />
              </div>
            )}

            {/* Create Post */}
            <div className="glassmorphic-card rounded-xl shadow-lg hover:shadow-xl transition-shadow duration-300">
              <CreatePost />
            </div>

            {/* Unified PostFeed */}
            <PostFeed context={{ type: 'feed' }} />
          </div>
        </main>
      </div>
    </div>
  );
}