/**
 * Agent Attribution Panel
 * Shows which agents built the selected element
 * MB.MD Track 1 - Agent Attribution
 */

import { useState, useEffect } from 'react';
import { CollapsiblePanel } from './CollapsiblePanel';
import { Users, Code, FileText } from 'lucide-react';
import type { ElementSelection } from '@/lib/visual-editor/iframeMessaging';

interface AgentAttributionPanelProps {
  selectedElement: ElementSelection | null;
}

export function AgentAttributionPanel({ selectedElement }: AgentAttributionPanelProps) {
  if (!selectedElement) {
    return (
      <CollapsiblePanel title="Agent Attribution" icon={<Users className="w-4 h-4" />}>
        <p className="text-sm text-gray-400">
          Select an element to see which agents built it
        </p>
      </CollapsiblePanel>
    );
  }

  // 🚀 STREAM G: Query real agent attribution
  const [agents, setAgents] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  
  useEffect(() => {
    const fetchAttribution = async () => {
      if (!selectedElement) return;
      
      setLoading(true);
      try {
        const response = await fetch(`/api/components/attribution?xpath=${encodeURIComponent(selectedElement.xpath)}`, {
          credentials: 'include'
        });
        
        if (response.ok) {
          const data = await response.json();
          setAgents(data.agents || getAgentsForElement(selectedElement));
        } else {
          setAgents(getAgentsForElement(selectedElement));
        }
      } catch (error) {
        console.error('Failed to fetch attribution:', error);
        setAgents(getAgentsForElement(selectedElement));
      } finally {
        setLoading(false);
      }
    };
    
    fetchAttribution();
  }, [selectedElement]);

  return (
    <CollapsiblePanel title="Agent Attribution" icon={<Users className="w-4 h-4" />}>
      <div className="space-y-3">
        <div>
          <div className="text-xs text-gray-400 mb-2">Element: {selectedElement.tagName}</div>
          {selectedElement.id && (
            <div className="text-xs text-gray-500">ID: {selectedElement.id}</div>
          )}
        </div>

        <div className="space-y-2">
          <div className="text-xs font-semibold text-gray-300">Built by:</div>
          {agents.map((agent, idx) => (
            <div 
              key={idx} 
              className="flex items-start gap-2 p-2 bg-gray-750 rounded"
            >
              <Code className="w-4 h-4 text-blue-400 mt-0.5" />
              <div className="flex-1">
                <div className="text-sm text-white">{agent.name}</div>
                <div className="text-xs text-gray-400">{agent.role}</div>
                <div className="text-xs text-gray-500 mt-1">{agent.contribution}</div>
              </div>
            </div>
          ))}
        </div>

        <div className="pt-2 border-t border-gray-700">
          <button 
            onClick={async () => {
              try {
                const response = await fetch(`/api/components/history?xpath=${encodeURIComponent(selectedElement.xpath)}`, {
                  credentials: 'include'
                });
                const data = await response.json();
                console.log('Full attribution history:', data);
                // Future: Open modal with full history
                alert(`Full History for ${selectedElement.tagName}\n\n${data.history?.length || 0} changes found\n\nSee console for details`);
              } catch (error) {
                alert('Failed to load attribution history');
              }
            }}
            className="text-xs text-blue-400 hover:text-blue-300 transition-colors"
            data-testid="button-view-full-history"
          >
            View Full History →
          </button>
        </div>
      </div>
    </CollapsiblePanel>
  );
}

/**
 * Get agents responsible for an element (mock for now)
 */
function getAgentsForElement(element: ElementSelection) {
  // TODO: Query actual agent attribution from database
  // This is mock data for demonstration
  
  const baseAgents = [
    {
      name: 'Layout Agent #12',
      role: 'Structure & Positioning',
      contribution: 'Created element structure and positioning'
    }
  ];

  if (element.tagName === 'button') {
    return [
      ...baseAgents,
      {
        name: 'UI Component Agent #34',
        role: 'Button Styling',
        contribution: 'Applied Mundo Tango button styles and interactions'
      }
    ];
  }

  if (element.tagName === 'h1' || element.tagName === 'h2') {
    return [
      ...baseAgents,
      {
        name: 'Typography Agent #56',
        role: 'Text Styling',
        contribution: 'Applied heading styles and responsive sizing'
      }
    ];
  }

  return baseAgents;
}
