/**
 * Activity Log Panel
 * Tracks user actions for agent coordination
 * MB.MD Track 1 - Activity Tracking
 */

import { useState, useEffect } from 'react';
import { CollapsiblePanel } from './CollapsiblePanel';
import { Activity, Clock } from 'lucide-react';

interface ActivityEntry {
  id: string;
  type: 'selection' | 'edit' | 'delete' | 'style' | 'chat';
  description: string;
  timestamp: number;
}

export function ActivityLogPanel() {
  const [activities, setActivities] = useState<ActivityEntry[]>([]);

  // Subscribe to activity events
  useEffect(() => {
    const handleActivity = (event: CustomEvent<ActivityEntry>) => {
      setActivities(prev => [event.detail, ...prev].slice(0, 20)); // Keep last 20
    };

    window.addEventListener('visual-editor:activity' as any, handleActivity);
    return () => window.removeEventListener('visual-editor:activity' as any, handleActivity);
  }, []);

  return (
    <CollapsiblePanel 
      title="Activity Log" 
      icon={<Activity className="w-4 h-4" />}
      defaultMinimized={true}
    >
      <div className="space-y-2 max-h-64 overflow-y-auto">
        {activities.length === 0 ? (
          <p className="text-sm text-gray-400">
            No activities yet. Start editing to see your actions logged here.
          </p>
        ) : (
          activities.map(activity => (
            <div 
              key={activity.id} 
              className="flex items-start gap-2 p-2 bg-gray-750 rounded text-xs"
            >
              <Clock className="w-3 h-3 text-gray-400 mt-0.5" />
              <div className="flex-1">
                <div className="text-white">{activity.description}</div>
                <div className="text-gray-500">
                  {formatTimestamp(activity.timestamp)}
                </div>
              </div>
              <div className={`px-1.5 py-0.5 rounded text-xs ${getTypeColor(activity.type)}`}>
                {activity.type}
              </div>
            </div>
          ))
        )}
      </div>

      {activities.length > 0 && (
        <div className="pt-2 border-t border-gray-700 mt-2">
          <button 
            onClick={() => setActivities([])}
            className="text-xs text-gray-400 hover:text-white"
            data-testid="button-clear-activity-log"
          >
            Clear Log
          </button>
        </div>
      )}
    </CollapsiblePanel>
  );
}

/**
 * Log an activity
 */
export function logActivity(entry: Omit<ActivityEntry, 'id' | 'timestamp'>) {
  const fullEntry: ActivityEntry = {
    ...entry,
    id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    timestamp: Date.now()
  };

  window.dispatchEvent(
    new CustomEvent('visual-editor:activity', { detail: fullEntry })
  );
}

function formatTimestamp(timestamp: number): string {
  const now = Date.now();
  const diff = now - timestamp;
  
  if (diff < 1000) return 'just now';
  if (diff < 60000) return `${Math.floor(diff / 1000)}s ago`;
  if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`;
  return new Date(timestamp).toLocaleTimeString();
}

function getTypeColor(type: ActivityEntry['type']): string {
  switch (type) {
    case 'selection': return 'bg-blue-900 text-blue-300';
    case 'edit': return 'bg-yellow-900 text-yellow-300';
    case 'delete': return 'bg-red-900 text-red-300';
    case 'style': return 'bg-purple-900 text-purple-300';
    case 'chat': return 'bg-green-900 text-green-300';
    default: return 'bg-gray-700 text-gray-300';
  }
}
