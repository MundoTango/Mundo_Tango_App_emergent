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
import { HomeErrorBoundary } from "@/components/errors/HomeErrorBoundary";

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
    // Log theme change for analytics
    console.log(t('home.analytics.theme_changed', `Theme changed to ${newTheme}`));
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
    <HomeErrorBoundary>
      <div 
        className="min-h-screen bg-gradient-to-br from-turquoise-50 via-cyan-50 to-blue-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900" 
        key="mt-ocean-theme-v2"
        data-testid="page-home"
        role="main"
        aria-label={t('home.aria.page', 'Home page')}
      >
        <div data-testid="section-topbar">
          <UnifiedTopBar 
            onMenuToggle={() => setIsSidebarOpen(!isSidebarOpen)}
            theme={theme}
            onThemeToggle={toggleTheme}
            showMenuButton={true}
            data-testid="button-toggle-menu"
          />
        </div>
        
        <div className="flex" data-testid="container-layout">
          <div data-testid="section-sidebar">
            <Sidebar 
              isOpen={isSidebarOpen} 
              setIsOpen={setIsSidebarOpen}
              onClose={handleCloseSidebar}
              data-testid="component-sidebar"
              aria-label={t('home.aria.navigation_sidebar', 'Navigation sidebar')}
            />
          </div>
          
          {isSidebarOpen && (
            <div 
              className="fixed inset-0 bg-black bg-opacity-50 z-10 lg:hidden"
              onClick={handleCloseSidebar}
              data-testid="overlay-sidebar"
              aria-label={t('home.aria.close_sidebar', 'Close sidebar')}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => e.key === 'Escape' && handleCloseSidebar()}
              title={t('home.tooltips.close_sidebar', 'Click or press Escape to close sidebar')}
            />
          )}
          
          <main 
            className={`flex-1 transition-all duration-300 ${
              isSidebarOpen ? 'lg:ml-64' : ''
            }`}
            data-testid="main-feed"
            aria-label={t('home.aria.main_feed', 'Main content feed')}
          >
            <div className="max-w-2xl mx-auto p-4 space-y-6" data-testid="container-feed-content">
              {stories && stories.length > 0 ? (
                <FadeIn delay={0.1}>
                  <section 
                    data-testid="section-stories"
                    aria-label={t('home.aria.stories', 'User stories')}
                  >
                    <GlassCard depth={1} className="p-4" data-testid="card-stories">
                      <StoryViewer stories={stories} data-testid="viewer-stories" />
                    </GlassCard>
                  </section>
                </FadeIn>
              ) : (
                <div data-testid="empty-state-stories" className="text-center py-8 text-gray-500 dark:text-gray-400">
                  <p>{t('home.empty.no_stories', 'No stories available')}</p>
                </div>
              )}

              <FadeIn delay={0.2}>
                <section 
                  data-testid="section-create-post"
                  aria-label={t('home.aria.create_post', 'Create new post')}
                >
                  <GlassCard depth={2} data-testid="card-create-post">
                    <CreatePost />
                  </GlassCard>
                </section>
              </FadeIn>

              <FadeIn delay={0.3}>
                <section 
                  data-testid="section-post-feed"
                  aria-label={t('home.aria.posts_feed', 'Posts from your network')}
                >
                  <PostFeed context={{ type: 'feed' }} />
                </section>
              </FadeIn>
            </div>
          </main>
        </div>
      </div>
    </HomeErrorBoundary>
  );
}