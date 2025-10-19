/**
 * Feature Unlock Helper
 * MB.MD Phase 4: Deployment - Oct 19, 2025
 * 
 * Toast notification shown when user unlocks new platform features
 * Uses shadcn toast for consistent notification styling
 */

import { Button } from '@/components/ui/button';
import { toast } from '@/hooks/use-toast';
import { Sparkles } from 'lucide-react';

interface FeatureUnlockProps {
  feature: string;
  icon?: React.ReactNode;
  description: string;
  cta?: string;
  onExplore?: () => void;
}

export function showFeatureUnlock({
  feature,
  icon,
  description,
  cta = 'Explore',
  onExplore
}: FeatureUnlockProps) {
  // SECURITY FIX: Use string-only content for toast (shadcn toast expects strings)
  const title = `✨ New Feature Unlocked!`;
  const descriptionText = `${feature}\n${description}`;

  toast({
    title,
    description: descriptionText,
    action: onExplore ? (
      <Button onClick={onExplore} size="sm" data-testid="button-explore-feature">
        {cta}
      </Button>
    ) : undefined,
    duration: 8000
  });
}

// Usage example:
// showFeatureUnlock({
//   feature: 'Messaging',
//   description: 'You can now send direct messages to other dancers!',
//   cta: 'Send Message',
//   onExplore: () => router.push('/messages')
// });
