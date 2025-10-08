# Aurora Tide Design System - Maintenance Playbook

**Version:** 1.0  
**Last Updated:** October 8, 2025  
**Framework:** ESA LIFE CEO 61x21

---

## 🎯 Purpose

This playbook provides guidelines for maintaining and evolving the Aurora Tide Design System. Follow these procedures to ensure consistency, accessibility, and performance as the platform grows.

---

## 📋 Daily Maintenance

### 1. Monitor Component Usage
```bash
# Run component audit weekly
npm run component:audit

# Check for design token compliance
npm run tokens:validate
```

**Action Items:**
- Review audit report for new components without tokens
- Identify components below 80% design system compliance
- Flag components for refactoring

### 2. Accessibility Monitoring
```bash
# Run WCAG validation
npm run validate:wcag client/src

# Run ESLint accessibility checks
npm run lint:a11y
```

**Action Items:**
- Fix any new WCAG violations immediately
- Review and fix ESLint accessibility errors
- Maintain 100% WCAG 2.1 AA compliance

### 3. Visual Regression Testing
```bash
# Run visual regression tests
npm run backstop:test

# If changes detected, review and approve
npm run backstop:approve  # Only after manual review
```

**Action Items:**
- Review any visual differences
- Approve intentional changes
- Reject and fix unintentional changes

---

## 🔄 Weekly Tasks

### 1. Design Token Review
**Schedule:** Every Monday

```bash
# Review token usage
npm run tokens:build
npm run design:validate
```

**Checklist:**
- [ ] Review new color additions
- [ ] Check for hardcoded values in new code
- [ ] Validate dark mode support in new components
- [ ] Update token documentation if needed

### 2. Component Library Health
**Schedule:** Every Wednesday

```bash
# Check component health
npm run component:audit
npm run ladle  # Review component playground
```

**Checklist:**
- [ ] Review new components added this week
- [ ] Ensure all new components use GlassCard where appropriate
- [ ] Verify all interactive elements have data-testid
- [ ] Check animation consistency

### 3. Customer Journey Analysis
**Schedule:** Every Friday

```bash
# Analyze user journeys
npm run journey:analyze
```

**Checklist:**
- [ ] Review friction scores for all journeys
- [ ] Identify journeys with >30% friction
- [ ] Plan improvements for high-friction areas
- [ ] Track improvement metrics over time

---

## 🚀 Monthly Tasks

### 1. Performance Audit
**Schedule:** First Monday of each month

```bash
# Run performance tests
npm run test:performance

# Check bundle sizes
npm run build
```

**Checklist:**
- [ ] Review Core Web Vitals metrics
- [ ] Identify performance regressions
- [ ] Optimize heavy components
- [ ] Update lazy loading strategy if needed

### 2. Accessibility Deep Dive
**Schedule:** Second Monday of each month

```bash
# Comprehensive accessibility audit
npm run a11y:dual
npm run validate:wcag client/src
```

**Checklist:**
- [ ] Test with screen readers (NVDA, JAWS)
- [ ] Validate keyboard navigation
- [ ] Check color contrast ratios
- [ ] Test with browser accessibility tools
- [ ] Document any findings

### 3. Design System Documentation Update
**Schedule:** Last Friday of each month

**Checklist:**
- [ ] Update component documentation in Ladle
- [ ] Add new design patterns discovered
- [ ] Update migration guides
- [ ] Review and update this playbook

---

## 🛠️ Adding New Components

### Standard Procedure

1. **Design Token Usage**
   ```tsx
   // ✅ Good - Use design tokens
   className="bg-ocean-500 text-neutral-900 dark:text-neutral-100"
   
   // ❌ Bad - Hardcoded values
   className="bg-cyan-500 text-black"
   ```

2. **Dark Mode Support**
   ```tsx
   // Always include dark mode variants
   className="bg-white dark:bg-neutral-900 text-black dark:text-white"
   ```

3. **Accessibility Requirements**
   ```tsx
   // Add semantic data-testid
   <button data-testid="button-submit">Submit</button>
   
   // Ensure keyboard support for interactive elements
   <div 
     role="button" 
     tabIndex={0}
     onClick={handleClick}
     onKeyDown={(e) => {
       if (e.key === 'Enter' || e.key === ' ') {
         handleClick(e);
       }
     }}
   >
   ```

4. **Use Standardized Components**
   ```tsx
   // Use GlassCard for glass effects
   <GlassCard depth={2}>Content</GlassCard>
   
   // Use motion variants for animations
   <FadeIn>Animated Content</FadeIn>
   ```

5. **Add Ladle Story**
   ```bash
   # Create component story
   # client/src/components/YourComponent.stories.tsx
   ```

---

## 🔧 Migration Procedures

### When Adding New Features

1. **Before Coding**
   ```bash
   # Ensure you have latest design tokens
   npm run tokens:build
   
   # Review existing components
   npm run ladle
   ```

2. **During Development**
   - Use design tokens exclusively
   - Include dark mode from the start
   - Add data-testid to all interactive elements
   - Follow established patterns

3. **After Completion**
   ```bash
   # Run migrations if needed
   npm run migrate:tokens client/src/components/YourComponent.tsx
   npm run migrate:dark-mode client/src/components/YourComponent.tsx
   npm run migrate:testids client/src/components/YourComponent.tsx
   
   # Validate
   npm run validate:wcag client/src/components/YourComponent.tsx
   npm run lint:a11y
   ```

### Refactoring Existing Code

1. **Identify Components**
   ```bash
   # Find components needing updates
   npm run component:audit
   ```

2. **Run Automated Migrations**
   ```bash
   # Migrate to tokens
   npm run migrate:tokens client/src/path/to/components
   
   # Add dark mode
   npm run migrate:dark-mode client/src/path/to/components
   
   # Add test IDs
   npm run migrate:testids client/src/path/to/components
   
   # Convert glass effects
   npm run migrate:glasscard client/src/path/to/components
   ```

3. **Manual Review**
   - Review automated changes
   - Fix edge cases
   - Test functionality

4. **Validate**
   ```bash
   npm run validate:wcag client/src/path/to/components
   npm run backstop:test
   ```

---

## 🚨 Emergency Procedures

### Critical Accessibility Issue

1. **Immediate Actions**
   ```bash
   # Identify affected components
   npm run validate:wcag client/src
   
   # Fix with automation if possible
   npm run fix:all-a11y
   ```

2. **Manual Fixes**
   - Fix reported issues immediately
   - Run validation after each fix
   - Document the issue and solution

3. **Prevention**
   - Add test coverage for the issue
   - Update this playbook with new checks
   - Review similar components

### Performance Regression

1. **Identify Bottleneck**
   ```bash
   npm run test:performance
   # Review metrics and identify slow components
   ```

2. **Optimize**
   - Add lazy loading if missing
   - Optimize heavy computations
   - Review animation performance
   - Check bundle size

3. **Validate**
   ```bash
   npm run test:performance
   # Confirm improvement
   ```

### Design Token Conflicts

1. **Identify Conflicts**
   ```bash
   npm run tokens:validate
   ```

2. **Resolve**
   - Check `tokens/` directory for duplicates
   - Ensure semantic tokens reference primitives correctly
   - Rebuild tokens

3. **Deploy**
   ```bash
   npm run tokens:build
   # Commit changes
   ```

---

## 📊 Key Metrics to Track

### Design System Health
- **Token Adoption Rate:** Target 100%
- **Dark Mode Coverage:** Target 95%+
- **GlassCard Adoption:** Target 80%+
- **Test ID Coverage:** Target 100%

### Accessibility
- **WCAG Compliance:** Target 100% (2.1 AA)
- **Keyboard Navigation:** All interactive elements
- **Screen Reader Support:** Full coverage

### Performance
- **LCP (Largest Contentful Paint):** < 2.5s
- **FID (First Input Delay):** < 100ms
- **CLS (Cumulative Layout Shift):** < 0.1
- **Bundle Size:** Monitor growth

### User Experience
- **Average Journey Friction:** < 25%
- **High Friction Journeys:** 0 journeys > 50%
- **Component Reusability:** 80%+ shared components

---

## 🔄 Quarterly Reviews

### Q1, Q2, Q3, Q4 Tasks

1. **Design System Evolution**
   - Review industry trends
   - Evaluate new design patterns
   - Plan major updates

2. **Token Architecture Review**
   - Assess token structure
   - Consider new token categories
   - Plan deprecations

3. **Component Library Optimization**
   - Identify underused components
   - Consolidate similar components
   - Plan component deprecations

4. **Accessibility Standards Update**
   - Review WCAG updates
   - Update validation rules
   - Plan compliance improvements

---

## 📚 Reference Commands

### Quick Reference
```bash
# Token & Design System
npm run tokens:build              # Build design tokens
npm run tokens:validate           # Validate tokens
npm run design:validate           # Full design validation

# Migration Tools
npm run migrate:tokens [path]     # Migrate to design tokens
npm run migrate:dark-mode [path]  # Add dark mode support
npm run migrate:testids [path]    # Add test IDs
npm run migrate:glasscard [path]  # Convert to GlassCard
npm run migrate:all               # Run all migrations

# Accessibility Fixes
npm run fix:page-titles           # Add page titles
npm run fix:contrast              # Fix contrast issues
npm run fix:keyboard              # Add keyboard support
npm run fix:all-a11y              # Run all accessibility fixes

# Validation & Testing
npm run validate:wcag [path]      # WCAG compliance check
npm run lint:a11y                 # Accessibility linting
npm run backstop:test             # Visual regression
npm run a11y:dual                 # Dual-engine accessibility

# Analysis & Documentation
npm run component:audit           # Component compliance audit
npm run journey:analyze           # Customer journey analysis
npm run ladle                     # Component playground
```

---

## 🎯 Success Criteria

### Design System is Healthy When:
✅ All components use design tokens (100%)  
✅ Dark mode coverage is 95%+  
✅ WCAG 2.1 AA compliance is 100%  
✅ All interactive elements have test IDs  
✅ GlassCard adoption is 80%+  
✅ Visual regression tests pass  
✅ No high-friction journeys (>50%)  
✅ Performance metrics meet targets

---

## 📝 Changelog

### Version 1.0 (October 8, 2025)
- Initial playbook creation
- ESA 61x21 Week 4 completion
- Full migration automation documented
- Accessibility procedures established

---

**Maintained by:** Design System Team  
**Contact:** Agent 11 (UI/UX Expert)  
**Framework:** ESA LIFE CEO 61x21
