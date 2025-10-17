import { ReactNode, useEffect } from 'react';
import { useLocation, useRoute } from 'wouter';
import { useAuth } from '@/hooks/useAuth';
import { LoadingFallback } from '@/components/ui/loading';

interface ProtectedRouteProps {
  children: ReactNode;
  requireAdmin?: boolean;
  requireAuth?: boolean;
  redirectTo?: string;
}

export default function ProtectedRoute({ 
  children, 
  requireAdmin = false,
  requireAuth = true,
  redirectTo = '/login'
}: ProtectedRouteProps) {
  const { user, isLoading } = useAuth();
  const [, setLocation] = useLocation();
  const [match] = useRoute('*');

  useEffect(() => {
    if (!isLoading) {
      // Check authentication requirements
      if (requireAuth && !user) {
        // Store the attempted URL for redirect after login
        const returnUrl = encodeURIComponent(window.location.pathname + window.location.search);
        setLocation(`${redirectTo}?returnUrl=${returnUrl}`);
        return;
      }

      // Check admin requirements
      if (requireAdmin && (!user || !user.roles?.includes('admin'))) {
        setLocation('/');
        return;
      }
    }
  }, [isLoading, user, requireAuth, requireAdmin, redirectTo, setLocation]);

  // Show loading while checking auth
  if (isLoading) {
    return <LoadingFallback message="Checking authentication..." />;
  }

  // Don't render children if requirements aren't met
  if (requireAuth && !user) {
    return null;
  }

  if (requireAdmin && (!user || !user.roles?.includes('admin'))) {
    return null;
  }

  return <>{children}</>;
}

// Export a higher-order component for easier use with lazy-loaded components
export function withAuth<T extends {}>(
  Component: React.ComponentType<T>,
  options: Omit<ProtectedRouteProps, 'children'> = {}
) {
  return (props: T) => (
    <ProtectedRoute {...options}>
      <Component {...props} />
    </ProtectedRoute>
  );
}