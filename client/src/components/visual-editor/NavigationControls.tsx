/**
 * VISUAL EDITOR NAVIGATION CONTROLS
 * Browser-style back/forward navigation
 * 
 * MB.MD Expert #11 (UI/UX Aurora) - Oct 24, 2025
 * MT Ocean Theme (#14B8A6 teal) with glassmorphic design
 */

import { ChevronLeft, ChevronRight, RotateCcw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useNavigationHistory } from '@/hooks/useNavigationHistory';
import { useToast } from '@/hooks/use-toast';

interface NavigationControlsProps {
  onNavigate?: (entry: any) => void; // Callback when navigation occurs
}

export function NavigationControls({ onNavigate }: NavigationControlsProps) {
  const { canGoBack, canGoForward, goBack, goForward, clearHistory } = useNavigationHistory();
  const { toast } = useToast();

  const handleBack = () => {
    const entry = goBack();
    if (entry) {
      toast({
        title: 'Navigated Back',
        description: `Returned to ${entry.type}: ${getEntryDescription(entry)}`,
      });
      onNavigate?.(entry);
    } else {
      toast({
        title: 'Cannot Go Back',
        description: 'No previous history available',
        variant: 'destructive',
      });
    }
  };

  const handleForward = () => {
    const entry = goForward();
    if (entry) {
      toast({
        title: 'Navigated Forward',
        description: `Advanced to ${entry.type}: ${getEntryDescription(entry)}`,
      });
      onNavigate?.(entry);
    } else {
      toast({
        title: 'Cannot Go Forward',
        description: 'No forward history available',
        variant: 'destructive',
      });
    }
  };

  const handleClear = () => {
    clearHistory();
    toast({
      title: 'History Cleared',
      description: 'All navigation history has been cleared',
    });
  };

  const getEntryDescription = (entry: any) => {
    switch (entry.type) {
      case 'element':
        return entry.data.id || entry.data.tag || 'Element';
      case 'page':
        return entry.data.title || entry.data.path || 'Page';
      case 'tab':
        return entry.data.tabLabel || entry.data.tabName || 'Tab';
      default:
        return 'Unknown';
    }
  };

  return (
    <div 
      className="flex items-center gap-1 px-2 py-1.5 bg-gray-800/50 backdrop-blur-sm rounded-lg border border-gray-700/50"
      data-testid="navigation-controls"
    >
      {/* Back Button */}
      <Button
        variant="ghost"
        size="sm"
        onClick={handleBack}
        disabled={!canGoBack}
        className="h-8 w-8 p-0 hover:bg-[#14B8A6]/10 hover:text-[#14B8A6] disabled:opacity-30 disabled:cursor-not-allowed transition-all"
        data-testid="button-nav-back"
        title="Go Back (Browser style)"
      >
        <ChevronLeft className="h-4 w-4" />
      </Button>

      {/* Forward Button */}
      <Button
        variant="ghost"
        size="sm"
        onClick={handleForward}
        disabled={!canGoForward}
        className="h-8 w-8 p-0 hover:bg-[#14B8A6]/10 hover:text-[#14B8A6] disabled:opacity-30 disabled:cursor-not-allowed transition-all"
        data-testid="button-nav-forward"
        title="Go Forward (Browser style)"
      >
        <ChevronRight className="h-4 w-4" />
      </Button>

      {/* Divider */}
      <div className="w-px h-5 bg-gray-700/50 mx-1" />

      {/* Clear History Button */}
      <Button
        variant="ghost"
        size="sm"
        onClick={handleClear}
        className="h-8 w-8 p-0 hover:bg-red-500/10 hover:text-red-400 transition-all"
        data-testid="button-nav-clear"
        title="Clear Navigation History"
      >
        <RotateCcw className="h-3.5 w-3.5" />
      </Button>
    </div>
  );
}
