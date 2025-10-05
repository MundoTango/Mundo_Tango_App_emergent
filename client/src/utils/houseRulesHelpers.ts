import {
  Clock,
  PawPrint,
  Cigarette,
  Car,
  Users,
  Volume2,
  Sparkles,
  PartyPopper,
  CheckCircle2,
  type LucideIcon
} from 'lucide-react';

// Map database slug categories to display labels
export const CATEGORY_SLUG_TO_DISPLAY: Record<string, string> = {
  'check-in-out': 'Check-in/Check-out',
  'pets': 'Pets',
  'smoking': 'Smoking',
  'parking': 'Parking',
  'events': 'Events & Parties',
  'noise': 'Noise & Quiet Hours',
  'guests': 'Guest Limits',
  'general': 'Cleaning & Maintenance',
};

// Map display labels back to slugs (for creating new rules)
export const CATEGORY_DISPLAY_TO_SLUG: Record<string, string> = {
  'Check-in/Check-out': 'check-in-out',
  'Pets': 'pets',
  'Smoking': 'smoking',
  'Parking': 'parking',
  'Events & Parties': 'events',
  'Noise & Quiet Hours': 'noise',
  'Guest Limits': 'guests',
  'Cleaning & Maintenance': 'general',
};

// Map display labels to icons
export const CATEGORY_ICONS: Record<string, LucideIcon> = {
  'Check-in/Check-out': Clock,
  'Pets': PawPrint,
  'Smoking': Cigarette,
  'Parking': Car,
  'Events & Parties': PartyPopper,
  'Noise & Quiet Hours': Volume2,
  'Guest Limits': Users,
  'Cleaning & Maintenance': Sparkles,
};

// Map display labels to Tailwind color classes
export const CATEGORY_COLORS: Record<string, string> = {
  'Check-in/Check-out': 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
  'Pets': 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
  'Smoking': 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
  'Parking': 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200',
  'Events & Parties': 'bg-pink-100 text-pink-800 dark:bg-pink-900 dark:text-pink-200',
  'Noise & Quiet Hours': 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
  'Guest Limits': 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-200',
  'Cleaning & Maintenance': 'bg-cyan-100 text-cyan-800 dark:bg-cyan-900 dark:text-cyan-200',
};

/**
 * Convert database category slug to display label
 * @param slug - Database category slug (e.g., "check-in-out")
 * @returns Display label (e.g., "Check-in/Check-out")
 */
export function getCategoryDisplayLabel(slug: string): string {
  return CATEGORY_SLUG_TO_DISPLAY[slug] || slug;
}

/**
 * Get icon component for a category
 * @param categorySlug - Database category slug
 * @returns Lucide icon component
 */
export function getCategoryIcon(categorySlug: string): LucideIcon {
  const displayLabel = getCategoryDisplayLabel(categorySlug);
  return CATEGORY_ICONS[displayLabel] || CheckCircle2;
}

/**
 * Get Tailwind color classes for a category badge
 * @param categorySlug - Database category slug
 * @returns Tailwind CSS classes string
 */
export function getCategoryColor(categorySlug: string): string {
  const displayLabel = getCategoryDisplayLabel(categorySlug);
  return CATEGORY_COLORS[displayLabel] || 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
}
