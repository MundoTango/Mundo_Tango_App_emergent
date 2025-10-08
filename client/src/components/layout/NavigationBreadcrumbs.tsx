import React from 'react';
import { Link, useLocation } from 'wouter';
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb';
import { ChevronRight } from 'lucide-react';

// Define breadcrumb mapping for all routes
const ROUTE_LABELS: Record<string, string> = {
  // Main
  '/': 'Home',
  '/profile': 'Profile',
  '/search': 'Search',
  '/settings': 'Settings',
  '/notifications': 'Notifications',
  
  // Authentication
  '/login': 'Login',
  '/auth/login': 'Login',
  '/register': 'Register',
  '/auth/register': 'Register',
  
  // User Management
  '/home': 'Home',
  '/onboarding': 'Onboarding',
  '/resume': 'Resume',
  '/public-resume': 'Public Resume',
  '/public-profile': 'Public Profile',
  '/profile-switcher': 'Profile Switcher',
  
  // Events
  '/events': 'Events',
  '/events/discover': 'Discover Events',
  '/teacher': 'Teacher Dashboard',
  '/organizer': 'Organizer Dashboard',
  
  // Housing
  '/housing-marketplace': 'Housing Marketplace',
  '/host-onboarding': 'Host Onboarding',
  '/guest-onboarding': 'Guest Onboarding',
  
  // Social
  '/friends': 'Friends',
  '/friendship': 'Friendship',
  '/messages': 'Messages',
  '/groups': 'Groups',
  '/invitations': 'Invitations',
  
  // Community
  '/community': 'Community',
  '/community-world-map': 'World Map',
  '/create-community': 'Create Community',
  '/tango-communities': 'Tango Communities',
  '/tango-stories': 'Tango Stories',
  
  // Content & Timeline
  '/moments': 'Moments',
  '/memories': 'Memories',
  '/unified-memories': 'Unified Memories',
  '/enhanced-timeline': 'Timeline',
  '/posting-demo': 'Posting Demo',
  '/timeline-minimal': 'Timeline Minimal',
  '/landing': 'Landing',
  
  // Billing
  '/subscribe': 'Subscribe',
  '/settings/billing': 'Billing',
  '/checkout': 'Checkout',
  '/payment-methods': 'Payment Methods',
  '/invoices': 'Invoices',
  '/subscription': 'Subscription',
  
  // Admin
  '/admin': 'Admin Center',
  '/admin/promo-codes': 'Promo Codes',
  '/admin/subscription-analytics': 'Subscription Analytics',
  '/analytics': 'Analytics',
  '/agent-framework': 'Agent Framework',
  '/project-tracker': 'Project Tracker',
  '/stats': 'Statistics',
  '/global-statistics': 'Global Statistics',
  '/hierarchy': 'Hierarchy',
  
  // LifeCEO
  '/life-ceo': 'Life CEO',
  '/life-ceo-performance': 'Life CEO Performance',
  '/lifeceo': 'Life CEO',
  
  // Testing & Development
  '/media-upload-test': 'Media Upload Test',
  '/test-grouped-roles': 'Test Grouped Roles',
  '/ttfiles-demo': 'TTfiles Demo',
  '/feature-navigation': 'Feature Navigation',
  '/database-security': 'Database Security',
  
  // Legal
  '/code-of-conduct': 'Code of Conduct',
  '/terms': 'Terms of Service',
  '/privacy-policy': 'Privacy Policy',
  
  // Additional Platform
  '/travel-planner': 'Travel Planner',
  '/mobile-dashboard': 'Mobile Dashboard',
  '/error': 'Error',
  '/notion': 'Notion',
};

// Generate breadcrumb path from current location
function generateBreadcrumbPath(pathname: string): Array<{ label: string; href: string }> {
  const paths: Array<{ label: string; href: string }> = [
    { label: 'Home', href: '/' }
  ];
  
  // Don't show breadcrumbs on home page
  if (pathname === '/') {
    return [];
  }
  
  // Handle dynamic routes
  const segments = pathname.split('/').filter(Boolean);
  let currentPath = '';
  
  segments.forEach((segment, index) => {
    currentPath += `/${segment}`;
    
    // Check if this is a dynamic segment (starts with : or is a UUID/number)
    const isDynamic = segment.match(/^[0-9a-fA-F-]+$/) || segment.match(/^\d+$/);
    
    if (isDynamic) {
      // For dynamic segments, use a generic label
      const parentPath = segments.slice(0, index).join('/');
      if (parentPath === 'events') {
        paths.push({ label: 'Event Details', href: currentPath });
      } else if (parentPath === 'groups') {
        paths.push({ label: 'Group Details', href: currentPath });
      } else if (parentPath === 'friendship') {
        paths.push({ label: 'Friend', href: currentPath });
      } else if (parentPath === 'notion') {
        paths.push({ label: 'Entry', href: currentPath });
      } else if (parentPath === 'checkout') {
        paths.push({ label: segment.toUpperCase(), href: currentPath });
      } else {
        paths.push({ label: 'Details', href: currentPath });
      }
    } else {
      // Use the mapped label or fallback to formatted segment
      const label = ROUTE_LABELS[currentPath] || 
        segment.charAt(0).toUpperCase() + segment.slice(1).replace(/-/g, ' ');
      paths.push({ label, href: currentPath });
    }
  });
  
  return paths;
}

export default function NavigationBreadcrumbs() {
  const [location] = useLocation();
  const breadcrumbPath = generateBreadcrumbPath(location);
  
  // Don't render if no breadcrumbs (home page) or only one item
  if (breadcrumbPath.length <= 1) {
    return null;
  }
  
  return (
    <div className="w-full px-4 py-2 bg-gray-50 border-b dark:bg-neutral-800">
      <Breadcrumb>
        <BreadcrumbList>
          {breadcrumbPath.map((item, index) => {
            const isLast = index === breadcrumbPath.length - 1;
            
            return (
              <React.Fragment key={item.href}>
                <BreadcrumbItem>
                  {isLast ? (
                    <BreadcrumbPage className="text-gray-900 font-medium dark:text-neutral-100">
                      {item.label}
                    </BreadcrumbPage>
                  ) : (
                    <BreadcrumbLink asChild>
                      <Link 
                        href={item.href} 
                        className="text-gray-600 hover:text-gray-900 transition-colors dark:text-neutral-100"
                       data-testid="link-text-gray-600">
                        {item.label}
                      </Link>
                    </BreadcrumbLink>
                  )}
                </BreadcrumbItem>
                {!isLast && (
                  <BreadcrumbSeparator>
                    <ChevronRight className="h-4 w-4 text-gray-600 dark:text-gray-400" />
                  </BreadcrumbSeparator>
                )}
              </React.Fragment>
            );
          })}
        </BreadcrumbList>
      </Breadcrumb>
    </div>
  );
}