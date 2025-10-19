# Journey Agent Component Library
## MB.MD UI Component Specifications

**Created:** October 19, 2025  
**Purpose:** Reusable onboarding components for all 5 Journey Agents (J1-J5)  
**Components:** 6 core components

---

## 1. Journey Progress Ring

**Location:** `client/src/components/journey/JourneyProgressRing.tsx`

**Purpose:** Visual indicator of journey completion progress

**Props:**
```typescript
interface JourneyProgressRingProps {
  currentStep: number;
  totalSteps: number;
  journeyName: string;
  percentage: number;
  onClick?: () => void;
}
```

**Implementation:**
```typescript
import { CircularProgressbar, buildStyles } from 'react-circular-progressbar';
import 'react-circular-progressbar/dist/styles.css';

export function JourneyProgressRing({
  currentStep,
  totalSteps,
  journeyName,
  percentage,
  onClick
}: JourneyProgressRingProps) {
  return (
    <div 
      className="fixed top-4 right-4 w-16 h-16 cursor-pointer hover:scale-110 transition-transform z-50"
      onClick={onClick}
      data-testid="journey-progress-ring"
    >
      <CircularProgressbar
        value={percentage}
        text={`${currentStep}/${totalSteps}`}
        styles={buildStyles({
          textColor: 'hsl(var(--foreground))',
          pathColor: 'hsl(var(--primary))',
          trailColor: 'hsl(var(--muted))',
          textSize: '24px'
        })}
      />
      <p className="text-xs text-center mt-1 text-muted-foreground">
        {journeyName}
      </p>
    </div>
  );
}
```

**Dependencies:**
```bash
npm install react-circular-progressbar
```

---

## 2. Onboarding Wizard Modal

**Location:** `client/src/components/journey/OnboardingWizard.tsx`

**Purpose:** Multi-step wizard for guided user flows

**Props:**
```typescript
interface OnboardingWizardProps {
  journeyId: string;
  currentStep: number;
  totalSteps: number;
  canSkip?: boolean;
  onComplete: () => void;
  onSkip?: () => void;
  children: React.ReactNode; // WizardStep components
}

interface WizardStepProps {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
}
```

**Implementation:**
```typescript
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { ChevronLeft, ChevronRight, X } from 'lucide-react';

export function OnboardingWizard({
  journeyId,
  currentStep,
  totalSteps,
  canSkip = true,
  onComplete,
  onSkip,
  children
}: OnboardingWizardProps) {
  const [step, setStep] = useState(currentStep);
  const steps = Children.toArray(children);
  const progress = (step / totalSteps) * 100;

  return (
    <Dialog open={true} onOpenChange={(open) => !open && onSkip?.()}>
      <DialogContent className="sm:max-w-2xl">
        {/* Progress Bar */}
        <div className="space-y-2">
          <Progress value={progress} className="h-2" />
          <p className="text-sm text-muted-foreground text-right">
            Step {step} of {totalSteps}
          </p>
        </div>

        {/* Current Step Content */}
        <div className="py-6">
          {steps[step - 1]}
        </div>

        {/* Navigation */}
        <DialogFooter className="flex justify-between">
          <Button
            variant="ghost"
            onClick={() => setStep(step - 1)}
            disabled={step === 1}
          >
            <ChevronLeft className="mr-2 h-4 w-4" />
            Previous
          </Button>

          <div className="flex gap-2">
            {canSkip && (
              <Button variant="outline" onClick={onSkip}>
                Skip for now
              </Button>
            )}
            
            {step < totalSteps ? (
              <Button onClick={() => setStep(step + 1)}>
                Next
                <ChevronRight className="ml-2 h-4 w-4" />
              </Button>
            ) : (
              <Button onClick={onComplete}>
                Complete
              </Button>
            )}
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export function WizardStep({ title, subtitle, children }: WizardStepProps) {
  return (
    <div className="space-y-4">
      <DialogHeader>
        <DialogTitle className="text-2xl">{title}</DialogTitle>
        {subtitle && <DialogDescription>{subtitle}</DialogDescription>}
      </DialogHeader>
      <div className="space-y-4">
        {children}
      </div>
    </div>
  );
}
```

**Usage Example:**
```typescript
<OnboardingWizard
  journeyId="J1"
  currentStep={1}
  totalSteps={7}
  canSkip={true}
  onComplete={handleComplete}
  onSkip={handleSkip}
>
  <WizardStep title="Welcome!" subtitle="Let's set up your profile">
    <Input placeholder="Your name" />
  </WizardStep>
  
  <WizardStep title="Preferences" subtitle="Customize your experience">
    <Select>
      <SelectItem value="light">Light Theme</SelectItem>
      <SelectItem value="dark">Dark Theme</SelectItem>
    </Select>
  </WizardStep>
</OnboardingWizard>
```

---

## 3. Contextual Tooltip

**Location:** `client/src/components/journey/ContextualTooltip.tsx`

**Purpose:** Smart tooltips that show once per user, dismissable

**Props:**
```typescript
interface ContextualTooltipProps {
  id: string; // Unique tooltip ID for localStorage tracking
  trigger: 'hover' | 'click' | 'auto';
  content: string;
  position?: 'top' | 'bottom' | 'left' | 'right';
  autoDismiss?: number; // Auto-dismiss after X seconds
  children: React.ReactNode;
}
```

**Implementation:**
```typescript
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { X } from 'lucide-react';

export function ContextualTooltip({
  id,
  trigger,
  content,
  position = 'top',
  autoDismiss = 5,
  children
}: ContextualTooltipProps) {
  const [shown, setShown] = useState(false);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    // Check if user has seen this tooltip
    const seen = localStorage.getItem(`tooltip-${id}`);
    if (seen) {
      setDismissed(true);
    } else if (trigger === 'auto') {
      // Auto-show after 1 second
      setTimeout(() => setShown(true), 1000);
    }
  }, [id, trigger]);

  useEffect(() => {
    if (shown && autoDismiss) {
      const timer = setTimeout(() => handleDismiss(), autoDismiss * 1000);
      return () => clearTimeout(timer);
    }
  }, [shown, autoDismiss]);

  const handleDismiss = () => {
    setShown(false);
    setDismissed(true);
    localStorage.setItem(`tooltip-${id}`, 'true');
  };

  if (dismissed) return <>{children}</>;

  return (
    <TooltipProvider>
      <Tooltip open={shown} onOpenChange={setShown}>
        <TooltipTrigger asChild>
          {children}
        </TooltipTrigger>
        <TooltipContent side={position} className="max-w-sm">
          <div className="flex items-start justify-between gap-2">
            <p className="text-sm">{content}</p>
            <button
              onClick={handleDismiss}
              className="text-muted-foreground hover:text-foreground"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
          <button
            onClick={handleDismiss}
            className="mt-2 text-xs text-muted-foreground hover:text-foreground"
          >
            Don't show again
          </button>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
```

**Usage Example:**
```typescript
<ContextualTooltip
  id="first-post-hint"
  trigger="auto"
  content="Share your first tango memory to connect with the community!"
  position="bottom"
  autoDismiss={5}
>
  <Button>Create Post</Button>
</ContextualTooltip>
```

---

## 4. Success Celebration

**Location:** `client/src/components/journey/SuccessCelebration.tsx`

**Purpose:** Full-screen celebration when journey step/milestones complete

**Props:**
```typescript
interface SuccessCelebrationProps {
  confetti?: boolean;
  message: string;
  submessage?: string;
  cta: string;
  onContinue: () => void;
  autoDismiss?: number; // Auto-continue after X seconds
}
```

**Implementation:**
```typescript
import Confetti from 'react-confetti';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { CheckCircle } from 'lucide-react';

export function SuccessCelebration({
  confetti = true,
  message,
  submessage,
  cta,
  onContinue,
  autoDismiss
}: SuccessCelebrationProps) {
  const [show, setShow] = useState(true);

  useEffect(() => {
    if (autoDismiss) {
      const timer = setTimeout(() => {
        setShow(false);
        onContinue();
      }, autoDismiss * 1000);
      return () => clearTimeout(timer);
    }
  }, [autoDismiss, onContinue]);

  if (!show) return null;

  return (
    <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center">
      {confetti && (
        <Confetti
          width={window.innerWidth}
          height={window.innerHeight}
          recycle={false}
          numberOfPieces={500}
        />
      )}

      <Card className="max-w-md w-full p-8 text-center space-y-6 animate-in fade-in zoom-in">
        <CheckCircle className="h-16 w-16 text-green-500 mx-auto" />
        
        <div className="space-y-2">
          <h2 className="text-3xl font-bold">{message}</h2>
          {submessage && (
            <p className="text-muted-foreground">{submessage}</p>
          )}
        </div>

        <Button onClick={onContinue} size="lg" className="w-full">
          {cta}
        </Button>

        {autoDismiss && (
          <p className="text-xs text-muted-foreground">
            Continuing automatically in {autoDismiss} seconds...
          </p>
        )}
      </Card>
    </div>
  );
}
```

**Dependencies:**
```bash
npm install react-confetti
```

**Usage Example:**
```typescript
<SuccessCelebration
  confetti={true}
  message="Welcome to Mundo Tango! 🎉"
  submessage="Your profile is ready. Let's explore the community!"
  cta="Start Exploring"
  onContinue={() => router.push('/memories')}
  autoDismiss={3}
/>
```

---

## 5. Feature Unlock Notification

**Location:** `client/src/components/journey/FeatureUnlock.tsx`

**Purpose:** Toast notification when user unlocks new features

**Props:**
```typescript
interface FeatureUnlockProps {
  feature: string;
  icon?: React.ReactNode;
  description: string;
  cta?: string;
  onExplore?: () => void;
}
```

**Implementation:**
```typescript
import { toast } from '@/hooks/use-toast';
import { Sparkles } from 'lucide-react';

export function showFeatureUnlock({
  feature,
  icon,
  description,
  cta = 'Explore',
  onExplore
}: FeatureUnlockProps) {
  toast({
    title: (
      <div className="flex items-center gap-2">
        <Sparkles className="h-5 w-5 text-yellow-500" />
        <span>New Feature Unlocked!</span>
      </div>
    ),
    description: (
      <div className="space-y-2">
        <p className="font-semibold">{feature}</p>
        <p className="text-sm">{description}</p>
      </div>
    ),
    action: onExplore && (
      <Button onClick={onExplore} size="sm">
        {cta}
      </Button>
    ),
    duration: 8000
  });
}
```

**Usage Example:**
```typescript
// When user completes first post
showFeatureUnlock({
  feature: 'Messaging',
  description: 'You can now send direct messages to other dancers!',
  cta: 'Send Message',
  onExplore: () => router.push('/messages')
});
```

---

## 6. Achievement Badge Display

**Location:** `client/src/components/journey/AchievementBadge.tsx`

**Purpose:** Show earned badges and milestones

**Props:**
```typescript
interface AchievementBadgeProps {
  badge: {
    id: string;
    name: string;
    description: string;
    icon: string;
    earnedAt: Date;
  };
  size?: 'sm' | 'md' | 'lg';
  showTooltip?: boolean;
}
```

**Implementation:**
```typescript
import { Badge } from '@/components/ui/badge';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

export function AchievementBadge({
  badge,
  size = 'md',
  showTooltip = true
}: AchievementBadgeProps) {
  const sizeClasses = {
    sm: 'text-2xl',
    md: 'text-4xl',
    lg: 'text-6xl'
  };

  const BadgeContent = (
    <div className="flex flex-col items-center gap-2">
      <span className={sizeClasses[size]}>{badge.icon}</span>
      <Badge variant="secondary" className="text-xs">
        {badge.name}
      </Badge>
    </div>
  );

  if (!showTooltip) return BadgeContent;

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger>
          {BadgeContent}
        </TooltipTrigger>
        <TooltipContent>
          <div className="space-y-1">
            <p className="font-semibold">{badge.name}</p>
            <p className="text-sm text-muted-foreground">{badge.description}</p>
            <p className="text-xs text-muted-foreground">
              Earned {new Date(badge.earnedAt).toLocaleDateString()}
            </p>
          </div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
```

**Usage Example:**
```typescript
<AchievementBadge
  badge={{
    id: 'first-post',
    name: 'Storyteller',
    description: 'Created your first post',
    icon: '📝',
    earnedAt: new Date()
  }}
  size="md"
  showTooltip={true}
/>
```

---

## 📦 Component Dependencies

**Install all required packages:**
```bash
npm install react-circular-progressbar react-confetti
```

**Existing shadcn/ui components used:**
- Dialog
- Button
- Progress
- Tooltip
- Card
- Badge
- Select
- Input

---

## 🎨 Styling Guidelines

**All components use MT Ocean theme:**
- Primary: `hsl(var(--primary))` - Turquoise (#5EEAD4)
- Secondary: `hsl(var(--secondary))` - Cyan (#155E75)
- Background: `hsl(var(--background))` - Dark mode ready
- Foreground: `hsl(var(--foreground))` - Text color

**Animations:**
- Use `animate-in`, `fade-in`, `zoom-in` from Tailwind
- Smooth transitions (`transition-transform`, `transition-colors`)
- Confetti for major milestones only

---

## ✅ Testing Checklist

**Each component must have:**
- [ ] `data-testid` attributes for testing
- [ ] Keyboard navigation support (accessibility)
- [ ] Mobile responsive design
- [ ] Dark mode compatibility
- [ ] localStorage persistence (where applicable)
- [ ] Error boundary protection

---

**Created by:** Agent #64  
**Status:** ✅ COMPONENT LIBRARY COMPLETE  
**Files to Create:** 6 component files  
**Estimated Build Time:** 2 hours
