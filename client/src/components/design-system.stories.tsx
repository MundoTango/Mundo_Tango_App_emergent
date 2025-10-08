import type { Story } from '@ladle/react';
import { GlassCard } from '@/components/glass/GlassComponents';

export const Welcome: Story = () => (
  <div className="p-8 bg-gradient-to-br from-cyan-500 via-teal-500 to-blue-600 min-h-screen">
    <GlassCard depth={2} className="max-w-4xl mx-auto p-12">
      <h1 className="text-4xl font-bold mb-6 bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent">
        Aurora Tide Design System
      </h1>
      <p className="text-lg text-neutral-700 dark:text-neutral-600 dark:text-neutral-300 mb-8">
        Glassmorphic MT Ocean Theme with comprehensive design tokens,
        animations, and accessibility compliance (WCAG 2.1 AA).
      </p>
      
      <div className="grid md:grid-cols-2 gap-6">
        <div>
          <h2 className="text-xl font-semibold mb-3">Design Tokens</h2>
          <ul className="space-y-2 text-sm">
            <li>✅ Color primitives & semantic tokens</li>
            <li>✅ Spacing & typography system</li>
            <li>✅ Animation timing & easing</li>
            <li>✅ Light & dark theme support</li>
          </ul>
        </div>
        
        <div>
          <h2 className="text-xl font-semibold mb-3">Components</h2>
          <ul className="space-y-2 text-sm">
            <li>✅ GlassCard (4 depth levels)</li>
            <li>✅ Framer Motion wrappers</li>
            <li>✅ GSAP scroll animations</li>
            <li>✅ Micro-interactions</li>
          </ul>
        </div>
      </div>
      
      <div className="mt-8 p-4 bg-ocean-500/10 rounded-lg border border-cyan-400/20">
        <p className="text-sm">
          <strong>Token System:</strong> View generated tokens at{' '}
          <code className="px-2 py-1 bg-black/10 rounded">build/css/tokens.css</code>
        </p>
      </div>
    </GlassCard>
  </div>
);

export const ColorTokens: Story = () => (
  <div className="p-8 space-y-6">
    <h2 className="text-2xl font-bold mb-4">Color Tokens</h2>
    
    <div>
      <h3 className="text-lg font-semibold mb-3">Ocean Palette</h3>
      <div className="grid grid-cols-10 gap-2">
        {[50, 100, 200, 300, 400, 500, 600, 700, 800, 900].map(shade => (
          <div key={shade}>
            <div 
              className="h-16 rounded"
              style={{ backgroundColor: `var(--color-ocean-${shade})` }}
            />
            <p className="text-xs mt-1 text-center">{shade}</p>
          </div>
        ))}
      </div>
    </div>
    
    <div>
      <h3 className="text-lg font-semibold mb-3">Semantic Colors</h3>
      <div className="grid grid-cols-4 gap-4">
        <div>
          <div className="h-16 rounded" style={{ backgroundColor: 'var(--color-primary)' }} />
          <p className="text-sm mt-2">Primary</p>
        </div>
        <div>
          <div className="h-16 rounded" style={{ backgroundColor: 'var(--color-error)' }} />
          <p className="text-sm mt-2">Error</p>
        </div>
        <div>
          <div className="h-16 rounded" style={{ backgroundColor: 'var(--color-success)' }} />
          <p className="text-sm mt-2">Success</p>
        </div>
        <div>
          <div className="h-16 rounded" style={{ backgroundColor: 'var(--color-warning)' }} />
          <p className="text-sm mt-2">Warning</p>
        </div>
      </div>
    </div>
  </div>
);

export const GlassCards: Story = () => (
  <div className="p-8 bg-gradient-to-br from-cyan-500 via-teal-500 to-blue-600 min-h-screen">
    <h2 className="text-2xl font-bold text-white mb-6">GlassCard Depth Levels</h2>
    <div className="grid md:grid-cols-2 gap-6">
      {[1, 2, 3, 4].map(depth => (
        <GlassCard key={depth} depth={depth as 1 | 2 | 3 | 4} className="p-6">
          <h3 className="text-xl font-semibold mb-2">Depth {depth}</h3>
          <p className="text-neutral-700 dark:text-neutral-600 dark:text-neutral-300">
            {depth === 1 && 'Subtle - For nested content'}
            {depth === 2 && 'Primary - Default for cards'}
            {depth === 3 && 'Elevated - For modals & dialogs'}
            {depth === 4 && 'Maximum - For overlays'}
          </p>
        </GlassCard>
      ))}
    </div>
  </div>
);
