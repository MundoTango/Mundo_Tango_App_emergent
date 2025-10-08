import type { Story } from '@ladle/react';
import { GlassCard } from '@/components/glass/GlassComponents';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

export const GlassCardDepths: Story = () => (
  <div className="p-8 bg-gradient-to-br from-cyan-500 via-teal-500 to-blue-600 min-h-screen">
    <h2 className="text-2xl font-bold text-white mb-6">Glass Card Depths</h2>
    <div className="grid md:grid-cols-3 gap-6">
      {[1, 2, 3].map((depth) => (
        <GlassCard key={depth} depth={depth as 1 | 2 | 3} className="p-6">
          <h3 className="text-lg font-semibold mb-3">Depth {depth}</h3>
          <p className="text-sm text-neutral-700 dark:text-neutral-300">
            Glassmorphic card with depth level {depth}. Higher depth creates stronger glass effect.
          </p>
        </GlassCard>
      ))}
    </div>
  </div>
);

export const GlassCardWithContent: Story = () => (
  <div className="p-8 bg-gradient-to-br from-cyan-500 via-teal-500 to-blue-600 min-h-screen">
    <h2 className="text-2xl font-bold text-white mb-6">Glass Card With Content</h2>
    <div className="max-w-md mx-auto">
      <GlassCard depth={2} className="p-8">
        <h3 className="text-2xl font-bold mb-4">Sign In</h3>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">Email</label>
            <Input 
              type="email" 
              placeholder="Enter your email"
              className="bg-white/10 border-white/20 text-white placeholder:text-white/60"
              data-testid="input-email"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">Password</label>
            <Input 
              type="password" 
              placeholder="Enter your password"
              className="bg-white/10 border-white/20 text-white placeholder:text-white/60"
              data-testid="input-password"
            />
          </div>
          <Button 
            className="w-full bg-white/20 hover:bg-white/30 border border-white/30"
            data-testid="button-submit"
          >
            Sign In
          </Button>
        </div>
      </GlassCard>
    </div>
  </div>
);

export const GlassCardLayering: Story = () => (
  <div className="p-8 bg-gradient-to-br from-cyan-500 via-teal-500 to-blue-600 min-h-screen">
    <h2 className="text-2xl font-bold text-white mb-6">Layered Glass Cards</h2>
    <div className="max-w-2xl mx-auto">
      <GlassCard depth={1} className="p-6">
        <h3 className="text-xl font-bold mb-4">Parent Card (Depth 1)</h3>
        <p className="mb-4 text-neutral-700 dark:text-neutral-300">
          This demonstrates how glass cards can be layered for depth hierarchy.
        </p>
        <GlassCard depth={2} className="p-4">
          <h4 className="font-semibold mb-2">Nested Card (Depth 2)</h4>
          <p className="text-sm text-neutral-700 dark:text-neutral-300">
            Higher depth values create stronger glass effects for visual hierarchy.
          </p>
        </GlassCard>
      </GlassCard>
    </div>
  </div>
);

export const GlassCardGrid: Story = () => (
  <div className="p-8 bg-gradient-to-br from-cyan-500 via-teal-500 to-blue-600 min-h-screen">
    <h2 className="text-2xl font-bold text-white mb-6">Glass Card Grid Layout</h2>
    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
      {Array.from({ length: 6 }).map((_, i) => (
        <GlassCard key={i} depth={2} className="p-6 hover:scale-105 transition-transform">
          <div className="text-4xl mb-3">🎨</div>
          <h3 className="text-lg font-semibold mb-2">Feature {i + 1}</h3>
          <p className="text-sm text-neutral-700 dark:text-neutral-300">
            Beautiful glassmorphic card with hover effect and consistent styling.
          </p>
        </GlassCard>
      ))}
    </div>
  </div>
);

export const DarkModeGlassCards: Story = () => (
  <div className="dark">
    <div className="p-8 bg-gradient-to-br from-slate-900 via-blue-900 to-slate-800 min-h-screen">
      <h2 className="text-2xl font-bold text-white mb-6">Dark Mode Glass Cards</h2>
      <div className="grid md:grid-cols-2 gap-6 max-w-4xl mx-auto">
        <GlassCard depth={2} className="p-6">
          <h3 className="text-lg font-semibold mb-3 text-white">Dark Mode Card</h3>
          <p className="text-sm text-neutral-300">
            Glass cards automatically adapt to dark mode with appropriate transparency and blur values.
          </p>
        </GlassCard>
        <GlassCard depth={3} className="p-6">
          <h3 className="text-lg font-semibold mb-3 text-white">Stronger Glass Effect</h3>
          <p className="text-sm text-neutral-300">
            Depth 3 provides maximum glass effect for important content areas in dark mode.
          </p>
        </GlassCard>
      </div>
    </div>
  </div>
);
