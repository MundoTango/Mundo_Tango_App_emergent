/**
 * Use Visual Editor Conversation Hook
 * MB.MD Phase 2B - Oct 28, 2025
 * 
 * Fetches or creates a shared Mr Blue conversation for Visual Editor AI features
 * Used by AITab, UnifiedVoiceModal, and ElementInspector
 * 
 * 🚨 ARCHITECT FIX: Uses optional context to prevent crashes when called outside VE provider
 */

import { useEffect } from 'react';
import { useVisualEditorOptional } from '@/contexts/VisualEditorContext';
import { useToast } from '@/hooks/use-toast';

export function useVisualEditorConversation() {
  const visualEditorContext = useVisualEditorOptional(); // 🚨 Optional - won't throw
  const { toast } = useToast();

  useEffect(() => {
    if (!visualEditorContext) return;

    const { 
      activeConversationId, 
      setActiveConversationId, 
      conversationPromiseRef // 🚨 ARCHITECT FIX v2: Use shared promise ref
    } = visualEditorContext;

    // Already loaded - skip
    if (activeConversationId !== null) {
      console.log('✅ [VE Conversation] Already loaded:', activeConversationId);
      return;
    }

    // 🚨 ARCHITECT FIX v2: If another component is fetching, await that promise instead
    if (conversationPromiseRef.current) {
      console.log('⏳ [VE Conversation] Another fetch in progress, awaiting...');
      conversationPromiseRef.current.then(conversationId => {
        console.log('✅ [VE Conversation] Resolved from shared promise:', conversationId);
        setActiveConversationId(conversationId);
      }).catch(err => {
        console.error('❌ [VE Conversation] Shared fetch failed:', err);
      });
      return;
    }

    // 🚨 ARCHITECT FIX v2: Create THE SINGLE fetch promise and store it synchronously
    const fetchPromise = (async () => {
      try {
        console.log('🔍 [VE Conversation] Initiating fetch (first caller)...');
        
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
        return conversation.id;
      } catch (error) {
        console.error('❌ [VE Conversation] Failed to load:', error);
        toast({
          title: 'Conversation Error',
          description: 'Failed to initialize Visual Editor AI. Please refresh the page.',
          variant: 'destructive'
        });
        throw error;
      } finally {
        // Clear the ref when done
        conversationPromiseRef.current = null;
      }
    })();

    // Store promise IMMEDIATELY (synchronous - prevents race)
    conversationPromiseRef.current = fetchPromise;
  }, [visualEditorContext, toast]);

  return visualEditorContext?.activeConversationId;
}
