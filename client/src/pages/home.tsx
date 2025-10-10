import { useState, useEffect } from "react";
import { useTranslation } from 'react-i18next';
import UnifiedTopBar from "@/components/navigation/UnifiedTopBar";
import Sidebar from "@/components/layout/sidebar";
import CreatePost from "@/components/feed/create-post";
import StoryViewer from "@/components/feed/story-viewer";
import { useQuery } from "@tanstack/react-query";
import PostFeed from "@/components/moments/PostFeed";
import { GlassCard } from "@/components/glass/GlassComponents";
import { FadeIn } from "@/components/animations/FramerMotionWrappers";

export default function Home() {
  const { t } = useTranslation();
  
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
    <div 
      className="min-h-screen bg-gradient-to-br from-turquoise-50 via-cyan-50 to-blue-50" 
      key="mt-ocean-theme-v2"
      data-testid="page-home"
    >
      <div data-testid="section-topbar">
        <UnifiedTopBar 
          onMenuToggle={() => setIsSidebarOpen(!isSidebarOpen)}
          theme={theme}
          onThemeToggle={toggleTheme}
          showMenuButton={true}
        />
      </div>
      
      <div className="flex" data-testid="container-layout">
        <div data-testid="section-sidebar">
          <Sidebar 
            isOpen={isSidebarOpen} 
            setIsOpen={setIsSidebarOpen}
            onClose={handleCloseSidebar}
          />
        </div>
        
        {/* Overlay for mobile */}
        {isSidebarOpen && (
          <div 
            className="fixed inset-0 bg-black bg-opacity-50 z-10 lg:hidden"
            onClick={handleCloseSidebar}
            data-testid="overlay-sidebar"
            aria-label={t('home.aria.close_sidebar', 'Close sidebar')}
          />
        )}
        
        <main 
          className={`flex-1 transition-all duration-300 ${
            isSidebarOpen ? 'lg:ml-64' : ''
          }`}
          data-testid="main-feed"
        >
          <div className="max-w-2xl mx-auto p-4 space-y-6" data-testid="container-feed-content">
            {/* Stories Section */}
            {stories && stories.length > 0 && (
              <FadeIn delay={0.1}>
                <div data-testid="section-stories">
                  <GlassCard depth={1} className="p-4" data-testid="card-stories">
                    <StoryViewer stories={stories} />
                  </GlassCard>
                </div>
              </FadeIn>
            )}

            {/* Create Post */}
            <FadeIn delay={0.2}>
              <div data-testid="section-create-post">
                <GlassCard depth={2} data-testid="card-create-post">
                  <CreatePost />
                </GlassCard>
              </div>
            </FadeIn>

            {/* Unified PostFeed */}
            <FadeIn delay={0.3}>
              <div data-testid="section-post-feed">
                <PostFeed context={{ type: 'feed' }} />
              </div>
            </FadeIn>
          </div>
        </main>
      </div>
    </div>
  );
}