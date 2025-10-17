/**
 * USE VISUAL EDITOR HOOK
 * Detects ?edit=true URL parameter and activates Visual Editor overlay
 * Part of Phase 12 Autonomous Learning System
 */

import { useState, useEffect } from 'react';
import { useAuth } from './useAuth';

export function useVisualEditor() {
  const { user } = useAuth();
  const [isEditorActive, setIsEditorActive] = useState(false);

  useEffect(() => {
    // Check URL parameter
    const params = new URLSearchParams(window.location.search);
    const editMode = params.get('edit') === 'true';

    // Only activate for super admins
    if (editMode && user?.role === 'super_admin') {
      setIsEditorActive(true);
    } else {
      setIsEditorActive(false);
    }
  }, [user, window.location.search]);

  const toggleEditor = () => {
    const params = new URLSearchParams(window.location.search);
    
    if (isEditorActive) {
      params.delete('edit');
      setIsEditorActive(false);
    } else {
      params.set('edit', 'true');
      setIsEditorActive(true);
    }

    // Update URL without reload
    const newUrl = `${window.location.pathname}${params.toString() ? '?' + params.toString() : ''}`;
    window.history.pushState({}, '', newUrl);
  };

  const closeEditor = () => {
    const params = new URLSearchParams(window.location.search);
    params.delete('edit');
    setIsEditorActive(false);
    
    const newUrl = `${window.location.pathname}${params.toString() ? '?' + params.toString() : ''}`;
    window.history.pushState({}, '', newUrl);
  };

  return {
    isEditorActive,
    toggleEditor,
    closeEditor,
  };
}
