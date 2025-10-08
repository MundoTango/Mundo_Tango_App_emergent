import type { Story } from '@ladle/react';
import { motion } from 'framer-motion';
import { 
  FadeIn, 
  FadeInUp, 
  ScaleIn, 
  SlideInLeft, 
  SlideInRight,
  StaggerContainer,
  StaggerItem,
  AnimatedCard,
  AnimatedButton
} from '@/components/motion/MotionWrappers';
import { GlassCard } from '@/components/glass/GlassComponents';

export const FadeInAnimation: Story = () => (
  <div className="p-8 bg-gradient-to-br from-cyan-500 via-teal-500 to-blue-600 min-h-screen">
    <h2 className="text-2xl font-bold text-white mb-6">Fade In Animation</h2>
    <FadeIn className="max-w-md">
      <GlassCard depth={2} className="p-6">
        <h3 className="text-xl font-semibold mb-3">Smooth Fade In</h3>
        <p className="text-neutral-700 dark:text-neutral-600 dark:text-neutral-300">
          This card fades in smoothly using the FadeIn wrapper component.
        </p>
      </GlassCard>
    </FadeIn>
  </div>
);

export const FadeInUpAnimation: Story = () => (
  <div className="p-8 bg-gradient-to-br from-cyan-500 via-teal-500 to-blue-600 min-h-screen">
    <h2 className="text-2xl font-bold text-white mb-6">Fade In Up Animation</h2>
    <div className="grid md:grid-cols-3 gap-6">
      {[0, 0.1, 0.2].map((delay, i) => (
        <FadeInUp key={i} delay={delay}>
          <GlassCard depth={2} className="p-6">
            <h3 className="text-lg font-semibold mb-2">Card {i + 1}</h3>
            <p className="text-sm text-neutral-700 dark:text-neutral-600 dark:text-neutral-300">
              Delay: {delay}s
            </p>
          </GlassCard>
        </FadeInUp>
      ))}
    </div>
  </div>
);

export const ScaleInAnimation: Story = () => (
  <div className="p-8 bg-gradient-to-br from-cyan-500 via-teal-500 to-blue-600 min-h-screen">
    <h2 className="text-2xl font-bold text-white mb-6">Scale In Animation</h2>
    <ScaleIn className="max-w-md">
      <GlassCard depth={3} className="p-8 text-center">
        <h3 className="text-2xl font-bold mb-3">Welcome!</h3>
        <p className="text-neutral-700 dark:text-neutral-600 dark:text-neutral-300">
          This card scales in from 95% to 100% with a fade effect.
        </p>
      </GlassCard>
    </ScaleIn>
  </div>
);

export const SlideInAnimations: Story = () => (
  <div className="p-8 bg-gradient-to-br from-cyan-500 via-teal-500 to-blue-600 min-h-screen">
    <h2 className="text-2xl font-bold text-white mb-6">Slide In Animations</h2>
    <div className="grid md:grid-cols-2 gap-8">
      <SlideInLeft>
        <GlassCard depth={2} className="p-6">
          <h3 className="text-lg font-semibold mb-2">Slide From Left</h3>
          <p className="text-sm text-neutral-700 dark:text-neutral-600 dark:text-neutral-300">
            Enters from the left with a spring easing.
          </p>
        </GlassCard>
      </SlideInLeft>
      
      <SlideInRight>
        <GlassCard depth={2} className="p-6">
          <h3 className="text-lg font-semibold mb-2">Slide From Right</h3>
          <p className="text-sm text-neutral-700 dark:text-neutral-600 dark:text-neutral-300">
            Enters from the right with a spring easing.
          </p>
        </GlassCard>
      </SlideInRight>
    </div>
  </div>
);

export const StaggerAnimation: Story = () => (
  <div className="p-8 bg-gradient-to-br from-cyan-500 via-teal-500 to-blue-600 min-h-screen">
    <h2 className="text-2xl font-bold text-white mb-6">Stagger Container Animation</h2>
    <StaggerContainer staggerDelay={0.1} className="grid md:grid-cols-3 gap-6">
      {[1, 2, 3, 4, 5, 6].map((num) => (
        <StaggerItem key={num}>
          <GlassCard depth={2} className="p-6">
            <h3 className="text-lg font-semibold mb-2">Item {num}</h3>
            <p className="text-sm text-neutral-700 dark:text-neutral-600 dark:text-neutral-300">
              Staggered entrance with 0.1s delay between items.
            </p>
          </GlassCard>
        </StaggerItem>
      ))}
    </StaggerContainer>
  </div>
);

export const InteractiveAnimations: Story = () => (
  <div className="p-8 bg-gradient-to-br from-cyan-500 via-teal-500 to-blue-600 min-h-screen">
    <h2 className="text-2xl font-bold text-white mb-6">Interactive Hover & Tap Animations</h2>
    
    <div className="space-y-8">
      <div>
        <h3 className="text-lg font-semibold text-white mb-4">Animated Card (Hover & Tap)</h3>
        <AnimatedCard className="max-w-md" data-testid="link-max-w-md">
          <GlassCard depth={2} className="p-6">
            <h4 className="text-lg font-semibold mb-2">Interactive Card</h4>
            <p className="text-sm text-neutral-700 dark:text-neutral-600 dark:text-neutral-300">
              Hover to scale up (102%), click to scale down (98%).
            </p>
          </GlassCard>
        </AnimatedCard>
      </div>

      <div>
        <h3 className="text-lg font-semibold text-white mb-4">Animated Buttons</h3>
        <div className="flex gap-4">
          <AnimatedButton className="px-6 py-3 bg-ocean-500 text-white rounded-lg font-semibold" data-testid="link-px-6">
            Primary Button
          </AnimatedButton>
          <AnimatedButton className="px-6 py-3 bg-white/10 backdrop-blur-lg border border-white/20 text-white rounded-lg font-semibold" data-testid="link-px-6">
            Glass Button
          </AnimatedButton>
        </div>
      </div>
    </div>
  </div>
);

export const SpringAnimations: Story = () => (
  <div className="p-8 bg-gradient-to-br from-cyan-500 via-teal-500 to-blue-600 min-h-screen">
    <h2 className="text-2xl font-bold text-white mb-6">Spring Animations</h2>
    
    <div className="grid md:grid-cols-3 gap-6">
      <motion.div
        initial={{ scale: 0, rotate: -180 }}
        animate={{ scale: 1, rotate: 0 }}
        transition={{ type: 'spring', stiffness: 300, damping: 30 }}
      >
        <GlassCard depth={2} className="p-6">
          <h3 className="text-lg font-semibold mb-2">Stiff Spring</h3>
          <p className="text-sm text-neutral-700 dark:text-neutral-600 dark:text-neutral-300">
            Stiffness: 300, Damping: 30
          </p>
        </GlassCard>
      </motion.div>

      <motion.div
        initial={{ scale: 0, rotate: -180 }}
        animate={{ scale: 1, rotate: 0 }}
        transition={{ type: 'spring', stiffness: 100, damping: 20 }}
      >
        <GlassCard depth={2} className="p-6">
          <h3 className="text-lg font-semibold mb-2">Gentle Spring</h3>
          <p className="text-sm text-neutral-700 dark:text-neutral-600 dark:text-neutral-300">
            Stiffness: 100, Damping: 20
          </p>
        </GlassCard>
      </motion.div>

      <motion.div
        initial={{ scale: 0, rotate: -180 }}
        animate={{ scale: 1, rotate: 0 }}
        transition={{ type: 'spring', stiffness: 400, damping: 10 }}
      >
        <GlassCard depth={2} className="p-6">
          <h3 className="text-lg font-semibold mb-2">Bouncy Spring</h3>
          <p className="text-sm text-neutral-700 dark:text-neutral-600 dark:text-neutral-300">
            Stiffness: 400, Damping: 10
          </p>
        </GlassCard>
      </motion.div>
    </div>
  </div>
);
