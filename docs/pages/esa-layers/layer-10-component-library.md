# ESA Layer 10: Component Library Agent 🧩

## Overview
Layer 10 manages the comprehensive component library built with shadcn/ui, Radix UI primitives, and Material UI, providing accessible, customizable, and reusable UI components.

## Core Responsibilities

### 1. Component Architecture
- Primitive component composition
- Compound component patterns
- Controlled/uncontrolled components
- Component documentation
- Storybook integration

### 2. Accessibility Features
- ARIA attributes management
- Keyboard navigation
- Focus management
- Screen reader support
- WCAG AA compliance

### 3. Component Variants
- Theme customization
- Size variations
- State management
- Animation integration
- Responsive behavior

## Open Source Packages

```json
{
  "@radix-ui/react-accordion": "^1.1.2",
  "@radix-ui/react-alert-dialog": "^1.0.5",
  "@radix-ui/react-aspect-ratio": "^1.0.3",
  "@radix-ui/react-avatar": "^1.0.4",
  "@radix-ui/react-checkbox": "^1.0.4",
  "@radix-ui/react-collapsible": "^1.0.3",
  "@radix-ui/react-context-menu": "^2.1.5",
  "@radix-ui/react-dialog": "^1.0.5",
  "@radix-ui/react-dropdown-menu": "^2.0.6",
  "@radix-ui/react-hover-card": "^1.0.7",
  "@radix-ui/react-label": "^2.0.2",
  "@radix-ui/react-menubar": "^1.0.4",
  "@radix-ui/react-navigation-menu": "^1.1.4",
  "@radix-ui/react-popover": "^1.0.7",
  "@radix-ui/react-progress": "^1.0.3",
  "@radix-ui/react-radio-group": "^1.1.3",
  "@radix-ui/react-scroll-area": "^1.0.5",
  "@radix-ui/react-select": "^2.0.0",
  "@radix-ui/react-separator": "^1.0.3",
  "@radix-ui/react-slider": "^1.1.2",
  "@radix-ui/react-slot": "^1.0.2",
  "@radix-ui/react-switch": "^1.0.3",
  "@radix-ui/react-tabs": "^1.0.4",
  "@radix-ui/react-toast": "^1.1.5",
  "@radix-ui/react-toggle": "^1.0.3",
  "@radix-ui/react-toggle-group": "^1.0.4",
  "@radix-ui/react-tooltip": "^1.0.7",
  "@mui/material": "^5.15.3",
  "@mui/icons-material": "^5.15.3",
  "@mui/x-date-pickers": "^6.18.7",
  "@emotion/react": "^11.11.3",
  "@emotion/styled": "^11.11.0",
  "lucide-react": "^0.303.0",
  "cmdk": "^0.2.0"
}
```

## Integration Points

- **Layer 8 (Client Framework)**: React components
- **Layer 9 (UI Framework)**: Tailwind styling
- **Layer 11 (Real-time)**: Live component updates
- **Layer 53 (i18n)**: Component localization
- **Layer 54 (Accessibility)**: ARIA compliance

## Core Components

### Dialog Component
```typescript
import * as Dialog from '@radix-ui/react-dialog';
import { X } from 'lucide-react';

export function Modal({ 
  open, 
  onOpenChange, 
  title, 
  children 
}: ModalProps) {
  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black/50 backdrop-blur-sm animate-fade-in" />
        <Dialog.Content className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-lg glass-card animate-slide-up">
          <Dialog.Title className="text-xl font-semibold mb-4">
            {title}
          </Dialog.Title>
          
          {children}
          
          <Dialog.Close asChild>
            <button 
              className="absolute top-4 right-4 p-1 rounded-lg hover:bg-white/10"
              aria-label="Close"
            >
              <X className="w-4 h-4" />
            </button>
          </Dialog.Close>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
```

### Form Components
```typescript
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as Label from '@radix-ui/react-label';

// Form field component
export function FormField({ 
  label, 
  name, 
  register, 
  error, 
  ...props 
}: FormFieldProps) {
  return (
    <div className="space-y-2">
      <Label.Root htmlFor={name} className="text-sm font-medium">
        {label}
      </Label.Root>
      <input
        id={name}
        {...register(name)}
        className={cn(
          'w-full px-3 py-2 rounded-lg border bg-white/5',
          'focus:outline-none focus:ring-2 focus:ring-mt-ocean-300',
          error && 'border-red-500'
        )}
        {...props}
      />
      {error && (
        <p className="text-sm text-red-500">{error.message}</p>
      )}
    </div>
  );
}

// Select component
import * as Select from '@radix-ui/react-select';

export function SelectField({ 
  value, 
  onValueChange, 
  options, 
  placeholder 
}: SelectProps) {
  return (
    <Select.Root value={value} onValueChange={onValueChange}>
      <Select.Trigger className="w-full px-3 py-2 rounded-lg border bg-white/5 flex justify-between items-center">
        <Select.Value placeholder={placeholder} />
        <Select.Icon>
          <ChevronDown className="w-4 h-4" />
        </Select.Icon>
      </Select.Trigger>
      
      <Select.Portal>
        <Select.Content className="glass-card">
          <Select.Viewport>
            {options.map(option => (
              <Select.Item 
                key={option.value} 
                value={option.value}
                className="px-3 py-2 hover:bg-white/10 cursor-pointer"
              >
                <Select.ItemText>{option.label}</Select.ItemText>
              </Select.Item>
            ))}
          </Select.Viewport>
        </Select.Content>
      </Select.Portal>
    </Select.Root>
  );
}
```

### Data Display Components
```typescript
// Accordion
import * as Accordion from '@radix-ui/react-accordion';

export function FAQAccordion({ items }: { items: FAQItem[] }) {
  return (
    <Accordion.Root type="single" collapsible className="space-y-2">
      {items.map(item => (
        <Accordion.Item 
          key={item.id} 
          value={item.id}
          className="glass-card"
        >
          <Accordion.Header>
            <Accordion.Trigger className="w-full text-left p-4 hover:bg-white/5 flex justify-between items-center">
              {item.question}
              <ChevronDown className="w-4 h-4 transition-transform data-[state=open]:rotate-180" />
            </Accordion.Trigger>
          </Accordion.Header>
          <Accordion.Content className="px-4 pb-4">
            {item.answer}
          </Accordion.Content>
        </Accordion.Item>
      ))}
    </Accordion.Root>
  );
}

// Tabs
import * as Tabs from '@radix-ui/react-tabs';

export function TabsComponent({ tabs }: { tabs: Tab[] }) {
  return (
    <Tabs.Root defaultValue={tabs[0].value} className="w-full">
      <Tabs.List className="flex space-x-1 rounded-lg bg-white/10 p-1">
        {tabs.map(tab => (
          <Tabs.Trigger
            key={tab.value}
            value={tab.value}
            className="flex-1 px-3 py-2 rounded-md data-[state=active]:bg-white/20"
          >
            {tab.label}
          </Tabs.Trigger>
        ))}
      </Tabs.List>
      
      {tabs.map(tab => (
        <Tabs.Content
          key={tab.value}
          value={tab.value}
          className="mt-4"
        >
          {tab.content}
        </Tabs.Content>
      ))}
    </Tabs.Root>
  );
}
```

### Feedback Components
```typescript
// Toast notifications
import * as Toast from '@radix-ui/react-toast';

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<ToastMessage[]>([]);
  
  return (
    <Toast.Provider>
      {children}
      {toasts.map(toast => (
        <Toast.Root
          key={toast.id}
          open={true}
          onOpenChange={() => removeToast(toast.id)}
          className="glass-card p-4 animate-slide-up"
        >
          <Toast.Title className="font-semibold">
            {toast.title}
          </Toast.Title>
          <Toast.Description className="text-sm mt-1">
            {toast.description}
          </Toast.Description>
        </Toast.Root>
      ))}
      <Toast.Viewport className="fixed bottom-4 right-4 flex flex-col gap-2 w-96 max-w-[100vw] z-50" />
    </Toast.Provider>
  );
}

// Progress indicator
import * as Progress from '@radix-ui/react-progress';

export function ProgressBar({ value, max = 100 }: ProgressProps) {
  const percentage = (value / max) * 100;
  
  return (
    <Progress.Root className="h-2 w-full bg-white/10 rounded-full overflow-hidden">
      <Progress.Indicator
        className="h-full bg-mt-gradient transition-transform"
        style={{ transform: `translateX(-${100 - percentage}%)` }}
      />
    </Progress.Root>
  );
}
```

### Navigation Components
```typescript
// Navigation menu
import * as NavigationMenu from '@radix-ui/react-navigation-menu';

export function NavMenu({ items }: { items: NavItem[] }) {
  return (
    <NavigationMenu.Root className="relative">
      <NavigationMenu.List className="flex space-x-1">
        {items.map(item => (
          <NavigationMenu.Item key={item.id}>
            {item.children ? (
              <>
                <NavigationMenu.Trigger className="px-3 py-2 hover:bg-white/10 rounded-lg">
                  {item.label}
                  <ChevronDown className="ml-1 w-3 h-3 inline" />
                </NavigationMenu.Trigger>
                <NavigationMenu.Content className="glass-card p-2 min-w-[200px]">
                  {item.children.map(child => (
                    <NavigationMenu.Link
                      key={child.id}
                      href={child.href}
                      className="block px-3 py-2 hover:bg-white/10 rounded"
                    >
                      {child.label}
                    </NavigationMenu.Link>
                  ))}
                </NavigationMenu.Content>
              </>
            ) : (
              <NavigationMenu.Link
                href={item.href}
                className="px-3 py-2 hover:bg-white/10 rounded-lg"
              >
                {item.label}
              </NavigationMenu.Link>
            )}
          </NavigationMenu.Item>
        ))}
      </NavigationMenu.List>
    </NavigationMenu.Root>
  );
}
```

### Overlay Components
```typescript
// Tooltip
import * as Tooltip from '@radix-ui/react-tooltip';

export function TooltipComponent({ 
  children, 
  content 
}: TooltipProps) {
  return (
    <Tooltip.Provider>
      <Tooltip.Root>
        <Tooltip.Trigger asChild>
          {children}
        </Tooltip.Trigger>
        <Tooltip.Portal>
          <Tooltip.Content
            className="glass px-2 py-1 rounded text-sm"
            sideOffset={5}
          >
            {content}
            <Tooltip.Arrow className="fill-white/10" />
          </Tooltip.Content>
        </Tooltip.Portal>
      </Tooltip.Root>
    </Tooltip.Provider>
  );
}

// Context menu
import * as ContextMenu from '@radix-ui/react-context-menu';

export function ContextMenuComponent({ 
  children, 
  items 
}: ContextMenuProps) {
  return (
    <ContextMenu.Root>
      <ContextMenu.Trigger asChild>
        {children}
      </ContextMenu.Trigger>
      
      <ContextMenu.Portal>
        <ContextMenu.Content className="glass-card p-1 min-w-[180px]">
          {items.map((item, index) => (
            item.separator ? (
              <ContextMenu.Separator 
                key={index} 
                className="h-px bg-white/20 my-1" 
              />
            ) : (
              <ContextMenu.Item
                key={item.id}
                onSelect={item.onSelect}
                className="px-2 py-1.5 hover:bg-white/10 rounded cursor-pointer"
              >
                {item.icon && <item.icon className="w-4 h-4 mr-2 inline" />}
                {item.label}
              </ContextMenu.Item>
            )
          ))}
        </ContextMenu.Content>
      </ContextMenu.Portal>
    </ContextMenu.Root>
  );
}
```

## Component Composition

```typescript
// Compound component pattern
const Card = ({ children, className }: CardProps) => (
  <div className={cn('glass-card', className)}>{children}</div>
);

Card.Header = ({ children }: { children: ReactNode }) => (
  <div className="mb-4 pb-4 border-b border-white/10">{children}</div>
);

Card.Body = ({ children }: { children: ReactNode }) => (
  <div className="space-y-4">{children}</div>
);

Card.Footer = ({ children }: { children: ReactNode }) => (
  <div className="mt-4 pt-4 border-t border-white/10">{children}</div>
);

export { Card };
```

## Accessibility Features

| Feature | Implementation |
|---------|---------------|
| Keyboard Navigation | Arrow keys, Tab, Enter, Escape |
| Screen Readers | ARIA labels and descriptions |
| Focus Management | Focus trap and restoration |
| Color Contrast | WCAG AA compliance |
| Motion Reduction | Respects prefers-reduced-motion |

## Testing

```typescript
describe('Component Library', () => {
  it('should handle keyboard navigation', async () => {
    render(<SelectField options={options} />);
    const trigger = screen.getByRole('combobox');
    
    await userEvent.tab();
    expect(trigger).toHaveFocus();
    
    await userEvent.keyboard('{Enter}');
    expect(screen.getByRole('listbox')).toBeVisible();
    
    await userEvent.keyboard('{ArrowDown}');
    expect(screen.getByRole('option', { name: options[0].label }))
      .toHaveAttribute('data-highlighted', 'true');
  });
});
```

## Next Steps

- [ ] Create Storybook documentation
- [ ] Add visual regression tests
- [ ] Implement component analytics
- [ ] Build theme customizer

---

**Status**: 🟢 Operational
**Dependencies**: Radix UI, Material UI, shadcn/ui
**Owner**: UI Team
**Last Updated**: September 2025