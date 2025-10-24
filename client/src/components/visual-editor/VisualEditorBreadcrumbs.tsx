/**
 * VISUAL EDITOR BREADCRUMBS NAVIGATION
 * 
 * MB.MD Architecture:
 * - Browser-style back/forward controls
 * - Visual breadcrumb trail
 * - History dropdown menu
 * - MT Ocean theme styling
 * 
 * Created: October 24, 2025
 */

import { ChevronLeft, ChevronRight, MoreVertical, Trash2, Home } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import type { UseNavigationHistoryReturn } from '@/hooks/useNavigationHistory';
import { cn } from '@/lib/utils';

interface VisualEditorBreadcrumbsProps {
  navigationHistory: UseNavigationHistoryReturn;
  onNavigate?: (entry: any) => void;
  className?: string;
}

export function VisualEditorBreadcrumbs({
  navigationHistory,
  onNavigate,
  className
}: VisualEditorBreadcrumbsProps) {
  const {
    breadcrumbTrail,
    canGoBack,
    canGoForward,
    goBack,
    goForward,
    clearHistory,
    history,
    jumpTo
  } = navigationHistory;
  
  const handleBack = () => {
    const entry = goBack();
    if (entry && onNavigate) {
      onNavigate(entry);
    }
  };
  
  const handleForward = () => {
    const entry = goForward();
    if (entry && onNavigate) {
      onNavigate(entry);
    }
  };
  
  const handleJumpTo = (index: number) => {
    jumpTo(index);
    const entry = history.entries[index];
    if (entry && onNavigate) {
      onNavigate(entry);
    }
  };
  
  return (
    <div
      className={cn(
        "flex items-center gap-1 px-2 py-1.5 bg-gradient-to-r from-teal-500/5 to-cyan-500/5",
        "border-b border-teal-500/20 backdrop-blur-sm",
        className
      )}
      data-testid="visual-editor-breadcrumbs"
    >
      {/* Back/Forward Controls */}
      <div className="flex items-center gap-0.5 mr-2">
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className={cn(
                  "h-7 w-7 rounded-md transition-all",
                  canGoBack 
                    ? "hover:bg-teal-500/20 text-teal-600 dark:text-teal-400" 
                    : "opacity-30 cursor-not-allowed"
                )}
                onClick={handleBack}
                disabled={!canGoBack}
                data-testid="button-nav-back"
                aria-label="Navigate back"
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Back {canGoBack && `(${history.currentIndex + 1}/${history.entries.length})`}</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
        
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className={cn(
                  "h-7 w-7 rounded-md transition-all",
                  canGoForward 
                    ? "hover:bg-teal-500/20 text-teal-600 dark:text-teal-400" 
                    : "opacity-30 cursor-not-allowed"
                )}
                onClick={handleForward}
                disabled={!canGoForward}
                data-testid="button-nav-forward"
                aria-label="Navigate forward"
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Forward {canGoForward && `(${history.currentIndex + 1}/${history.entries.length})`}</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>
      
      {/* Breadcrumb Trail */}
      <div className="flex items-center gap-1 flex-1 overflow-x-auto scrollbar-thin">
        <Home 
          className="h-3.5 w-3.5 text-teal-600 dark:text-teal-400 flex-shrink-0" 
          aria-label="Home"
        />
        
        {breadcrumbTrail.length === 0 && (
          <span className="text-xs text-gray-500 dark:text-gray-400 ml-1">
            No navigation history
          </span>
        )}
        
        {breadcrumbTrail.map((entry, index) => {
          const isLast = index === breadcrumbTrail.length - 1;
          const absoluteIndex = history.currentIndex - (breadcrumbTrail.length - 1 - index);
          
          return (
            <div key={entry.id} className="flex items-center gap-1 flex-shrink-0">
              <ChevronRight className="h-3 w-3 text-gray-400" />
              
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <button
                      onClick={() => handleJumpTo(absoluteIndex)}
                      className={cn(
                        "px-2 py-0.5 rounded text-xs transition-all truncate max-w-[150px]",
                        isLast
                          ? "bg-teal-500/20 text-teal-700 dark:text-teal-300 font-medium"
                          : "hover:bg-teal-500/10 text-gray-600 dark:text-gray-400"
                      )}
                      data-testid={`breadcrumb-item-${index}`}
                      aria-label={`Navigate to ${entry.label}`}
                    >
                      {entry.icon && <span className="mr-1">{entry.icon}</span>}
                      {entry.label}
                    </button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <div className="text-xs">
                      <p className="font-semibold">{entry.label}</p>
                      <p className="text-gray-400">
                        {new Date(entry.timestamp).toLocaleTimeString()}
                      </p>
                      {entry.element && (
                        <p className="text-gray-400 mt-1">
                          XPath: {entry.element.xpath.substring(0, 30)}...
                        </p>
                      )}
                    </div>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
          );
        })}
      </div>
      
      {/* History Menu */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7 rounded-md hover:bg-teal-500/20"
            data-testid="button-history-menu"
            aria-label="History menu"
          >
            <MoreVertical className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-64">
          <div className="px-2 py-1.5 text-xs font-semibold text-gray-500">
            Navigation History ({history.entries.length})
          </div>
          <DropdownMenuSeparator />
          
          {history.entries.length === 0 ? (
            <div className="px-2 py-3 text-xs text-center text-gray-400">
              No history yet
            </div>
          ) : (
            <>
              <div className="max-h-64 overflow-y-auto">
                {history.entries.slice().reverse().map((entry, reverseIndex) => {
                  const index = history.entries.length - 1 - reverseIndex;
                  const isCurrent = index === history.currentIndex;
                  
                  return (
                    <DropdownMenuItem
                      key={entry.id}
                      onClick={() => handleJumpTo(index)}
                      className={cn(
                        "text-xs cursor-pointer",
                        isCurrent && "bg-teal-500/20 font-medium"
                      )}
                      data-testid={`history-item-${index}`}
                    >
                      <span className="mr-2">{entry.icon}</span>
                      <span className="flex-1 truncate">{entry.label}</span>
                      <span className="text-[10px] text-gray-400 ml-2">
                        {new Date(entry.timestamp).toLocaleTimeString()}
                      </span>
                    </DropdownMenuItem>
                  );
                })}
              </div>
              
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={clearHistory}
                className="text-xs text-red-600 dark:text-red-400"
                data-testid="button-clear-history"
              >
                <Trash2 className="h-3 w-3 mr-2" />
                Clear History
              </DropdownMenuItem>
            </>
          )}
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
