/**
 * Use Visual Editor Conversation Hook
 * MB.MD Phase 2B - Oct 28, 2025
 * 
 * Fetches or creates a shared Mr Blue conversation for Visual Editor AI features
 * Used by AITab, UnifiedVoiceModal, and ElementInspector
 */

import { useEffect } from 'react';
import { useVisualEditor } from '@/contexts/VisualEditorContext';
import { useToast } from '@/hooks/use-toast';

export function useVisualEditorConversation() {
  const visualEditorContext = useVisualEditor();
  const { toast } = useToast();

  useEffect(() => {
    if (!visualEditorContext) return;

    const { activeConversationId, setActiveConversationId, isLoadingConversation } = visualEditorContext;

    // Already loaded or currently loading
    if (activeConversationId !== null || isLoadingConversation) {
      console.log('🎯 [VE Conversation] Already loaded or loading:', { activeConversationId, isLoadingConversation });
      return;
    }

    // Fetch or create conversation
    const loadConversation = async () => {
      try {
        console.log('🔍 [VE Conversation] Fetching Visual Editor conversation...');
        
        const response = await fetch('/api/mrblue/visual-editor/conversation', {
          credentials: 'include',
          headers: {
            'Accept': 'application/json'
          }
        });

        if (!response.ok) {
          throw new Error(`Failed to fetch conversation: ${response.statusText}`);
        }

        const conversation = await response.json();
        console.log('✅ [VE Conversation] Loaded conversation:', conversation.id);
        
        setActiveConversationId(conversation.id);
      } catch (error) {
        console.error('❌ [VE Conversation] Failed to load:', error);
        toast({
          title: 'Conversation Error',
          description: 'Failed to initialize Visual Editor AI. Please refresh the page.',
          variant: 'destructive'
        });
      }
    };

    loadConversation();
  }, [visualEditorContext, toast]);

  return visualEditorContext?.activeConversationId;
}
