import type { Story } from '@ladle/react';

export const ColorTokens: Story = () => (
  <div className="p-8">
    <h2 className="text-2xl font-bold mb-6">Design Token Colors</h2>
    
    <div className="space-y-8">
      <div>
        <h3 className="text-lg font-semibold mb-4">Ocean Palette</h3>
        <div className="grid grid-cols-5 md:grid-cols-10 gap-2">
          {[50, 100, 200, 300, 400, 500, 600, 700, 800, 900].map((shade) => (
            <div key={shade} className="text-center">
              <div 
                className="h-16 rounded-lg mb-2 border border-neutral-200"
                style={{ backgroundColor: `var(--color-ocean-${shade})` }}
              />
              <div className="text-xs font-mono">{shade}</div>
            </div>
          ))}
        </div>
      </div>

      <div>
        <h3 className="text-lg font-semibold mb-4">Neutral Grays</h3>
        <div className="grid grid-cols-6 md:grid-cols-11 gap-2">
          {[0, 50, 100, 200, 300, 400, 500, 600, 700, 800, 900].map((shade) => (
            <div key={shade} className="text-center">
              <div 
                className="h-16 rounded-lg mb-2 border border-neutral-200"
                style={{ backgroundColor: `var(--color-neutral-${shade})` }}
              />
              <div className="text-xs font-mono">{shade}</div>
            </div>
          ))}
        </div>
      </div>

      <div>
        <h3 className="text-lg font-semibold mb-4">Semantic Colors</h3>
        <div className="grid md:grid-cols-4 gap-4">
          <div className="text-center">
            <div className="h-20 rounded-lg mb-2" style={{ backgroundColor: 'var(--color-ocean-500)' }} />
            <div className="text-sm font-semibold">Primary</div>
            <div className="text-xs font-mono text-neutral-500">ocean-500</div>
          </div>
          <div className="text-center">
            <div className="h-20 rounded-lg mb-2" style={{ backgroundColor: 'var(--color-error)' }} />
            <div className="text-sm font-semibold">Error</div>
            <div className="text-xs font-mono text-neutral-500">error</div>
          </div>
          <div className="text-center">
            <div className="h-20 rounded-lg mb-2" style={{ backgroundColor: 'var(--color-success)' }} />
            <div className="text-sm font-semibold">Success</div>
            <div className="text-xs font-mono text-neutral-500">success</div>
          </div>
          <div className="text-center">
            <div className="h-20 rounded-lg mb-2" style={{ backgroundColor: 'var(--color-warning)' }} />
            <div className="text-sm font-semibold">Warning</div>
            <div className="text-xs font-mono text-neutral-500">warning</div>
          </div>
        </div>
      </div>
    </div>
  </div>
);

export const SpacingTokens: Story = () => (
  <div className="p-8">
    <h2 className="text-2xl font-bold mb-6">Spacing Scale</h2>
    <div className="space-y-4">
      {[1, 2, 3, 4, 6, 8, 12, 16, 24].map((value) => (
        <div key={value} className="flex items-center gap-4">
          <div className="w-20 text-sm font-mono">spacing-{value}</div>
          <div 
            className="bg-ocean-500 h-8"
            style={{ width: `var(--spacing-${value})` }}
          />
          <div className="text-sm text-neutral-500">
            {value === 1 && '0.25rem'}
            {value === 2 && '0.5rem'}
            {value === 3 && '0.75rem'}
            {value === 4 && '1rem'}
            {value === 6 && '1.5rem'}
            {value === 8 && '2rem'}
            {value === 12 && '3rem'}
            {value === 16 && '4rem'}
            {value === 24 && '6rem'}
          </div>
        </div>
      ))}
    </div>
  </div>
);

export const TypographyTokens: Story = () => (
  <div className="p-8">
    <h2 className="text-2xl font-bold mb-6">Typography Scale</h2>
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold mb-4">Font Sizes</h3>
        <div className="space-y-3">
          <div style={{ fontSize: 'var(--font-size-xs)' }}>Extra Small (xs) - 0.75rem</div>
          <div style={{ fontSize: 'var(--font-size-sm)' }}>Small (sm) - 0.875rem</div>
          <div style={{ fontSize: 'var(--font-size-base)' }}>Base - 1rem</div>
          <div style={{ fontSize: 'var(--font-size-lg)' }}>Large (lg) - 1.125rem</div>
          <div style={{ fontSize: 'var(--font-size-xl)' }}>Extra Large (xl) - 1.25rem</div>
          <div style={{ fontSize: 'var(--font-size-2xl)' }}>2X Large - 1.5rem</div>
          <div style={{ fontSize: 'var(--font-size-3xl)' }}>3X Large - 1.875rem</div>
          <div style={{ fontSize: 'var(--font-size-4xl)' }}>4X Large - 2.25rem</div>
        </div>
      </div>

      <div>
        <h3 className="text-lg font-semibold mb-4">Font Weights</h3>
        <div className="space-y-2">
          <div style={{ fontWeight: 'var(--font-weight-normal)' }}>Normal (400)</div>
          <div style={{ fontWeight: 'var(--font-weight-medium)' }}>Medium (500)</div>
          <div style={{ fontWeight: 'var(--font-weight-semibold)' }}>Semibold (600)</div>
          <div style={{ fontWeight: 'var(--font-weight-bold)' }}>Bold (700)</div>
        </div>
      </div>
    </div>
  </div>
);

export const BorderRadiusTokens: Story = () => (
  <div className="p-8">
    <h2 className="text-2xl font-bold mb-6">Border Radius Scale</h2>
    <div className="grid md:grid-cols-5 gap-4">
      {['sm', 'md', 'lg', 'xl', 'full'].map((size) => (
        <div key={size} className="text-center">
          <div 
            className="h-24 bg-ocean-500 mx-auto mb-2"
            style={{ 
              borderRadius: `var(--radius-${size})`,
              width: size === 'full' ? '6rem' : '100%'
            }}
          />
          <div className="text-sm font-semibold">radius-{size}</div>
          <div className="text-xs text-neutral-500">
            {size === 'sm' && '0.25rem'}
            {size === 'md' && '0.5rem'}
            {size === 'lg' && '1rem'}
            {size === 'xl' && '1.5rem'}
            {size === 'full' && '9999px'}
          </div>
        </div>
      ))}
    </div>
  </div>
);

export const AnimationTokens: Story = () => (
  <div className="p-8">
    <h2 className="text-2xl font-bold mb-6">Animation Durations</h2>
    <div className="space-y-4">
      {[
        { name: 't1', duration: '0.7s', label: 'Extra Slow' },
        { name: 't2', duration: '0.6s', label: 'Slow' },
        { name: 't3', duration: '0.5s', label: 'Medium' },
        { name: 't4', duration: '0.4s', label: 'Normal' },
        { name: 't5', duration: '0.3s', label: 'Fast' },
        { name: 't6', duration: '0.2s', label: 'Very Fast' },
        { name: 't7', duration: '0.1s', label: 'Instant' }
      ].map((item) => (
        <div key={item.name} className="flex items-center gap-4">
          <div className="w-32">
            <div className="text-sm font-mono">duration-{item.name}</div>
            <div className="text-xs text-neutral-500">{item.label}</div>
          </div>
          <div className="flex-1 bg-neutral-100 rounded-lg p-2">
            <div 
              className="h-8 bg-ocean-500 rounded"
              style={{
                animation: `slide var(--duration-${item.name}) var(--easing-ocean) infinite`
              }}
            />
          </div>
          <div className="text-sm text-neutral-500">{item.duration}</div>
        </div>
      ))}
    </div>
    <style>{`
      @keyframes slide {
        0%, 100% { transform: translateX(0); }
        50% { transform: translateX(200px); }
      }
    `}</style>
  </div>
);
