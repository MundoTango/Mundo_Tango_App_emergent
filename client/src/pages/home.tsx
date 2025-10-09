import { useState, useEffect } from "react";
import UnifiedTopBar from "@/components/navigation/UnifiedTopBar";
import Sidebar from "@/components/layout/sidebar";
import CreatePost from "@/components/feed/create-post";
import StoryViewer from "@/components/feed/story-viewer";
import { useQuery } from "@tanstack/react-query";
import PostFeed from "@/components/moments/PostFeed";
import { GlassCard } from "@/components/glass/GlassComponents";
import { FadeIn } from "@/components/animations/FramerMotionWrappers";

export default function Home() {
  // MT Ocean Theme Restored - July 22, 2025 9:20PM - v4 with service worker update
  // Force cache refresh with service worker update
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    const savedTheme = localStorage.getItem('theme');
    return (savedTheme as 'light' | 'dark') || 'light';
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
          />
        )}
        
        <main className={`flex-1 transition-all duration-300 ${
          isSidebarOpen ? 'lg:ml-64' : ''
        }`}>
          <div className="max-w-2xl mx-auto p-4 space-y-6">
            {/* Stories Section */}
            {stories && stories.length > 0 && (
              <FadeIn delay={0.1}>
                <GlassCard depth={1} className="p-4">
                  <StoryViewer stories={stories} />
                </GlassCard>
              </FadeIn>
            )}

            {/* Create Post */}
            <FadeIn delay={0.2}>
              <GlassCard depth={2}>
                <CreatePost />
              </GlassCard>
            </FadeIn>

            {/* Unified PostFeed */}
            <FadeIn delay={0.3}>
              <PostFeed context={{ type: 'feed' }} />
            </FadeIn>
          </div>
        </main>
      </div>
    </div>
  );
}