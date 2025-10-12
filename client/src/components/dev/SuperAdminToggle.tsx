/**
 * ESA Dev Mode - Super Admin Toggle
 * For development testing only
 * Adds a floating toggle in dev mode to simulate Super Admin access
 */

import { useState, useEffect } from 'react';
import { Shield, ShieldOff } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';

export function SuperAdminToggle() {
  const [isDevSuperAdmin, setIsDevSuperAdmin] = useState(false);
  const { toast } = useToast();

  // Only show in development
  if (import.meta.env.PROD) {
    return null;
  }

  useEffect(() => {
    const savedMode = localStorage.getItem('dev_super_admin_mode');
    if (savedMode === 'true') {
      setIsDevSuperAdmin(true);
      // Set the env variable for access control
      (window as any).__DEV_SUPER_ADMIN__ = true;
    }
  }, []);

  const toggleSuperAdmin = () => {
    const newMode = !isDevSuperAdmin;
    setIsDevSuperAdmin(newMode);
    localStorage.setItem('dev_super_admin_mode', newMode.toString());
    
    // Set/unset the global flag
    if (newMode) {
      (window as any).__DEV_SUPER_ADMIN__ = true;
    } else {
      delete (window as any).__DEV_SUPER_ADMIN__;
    }

    toast({
      title: newMode ? "🔓 Super Admin Mode Enabled" : "🔒 Super Admin Mode Disabled",
      description: newMode 
        ? "ESA MindMap and Mr Blue now visible. Refresh to see changes."
        : "Super admin features hidden.",
    });

    // Reload to apply changes
    setTimeout(() => window.location.reload(), 1000);
  };

  return (
    <div 
      className="fixed top-20 left-4 z-50"
      data-testid="dev-super-admin-toggle"
    >
      <Button
        onClick={toggleSuperAdmin}
        variant={isDevSuperAdmin ? "default" : "outline"}
        size="sm"
        className={`gap-2 ${
          isDevSuperAdmin 
            ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white hover:from-purple-600 hover:to-pink-600' 
            : 'border-dashed'
        }`}
        data-testid="button-toggle-super-admin"
      >
        {isDevSuperAdmin ? (
          <>
            <Shield className="h-4 w-4" />
            <span className="text-xs">Super Admin ON</span>
          </>
        ) : (
          <>
            <ShieldOff className="h-4 w-4" />
            <span className="text-xs">Super Admin OFF</span>
          </>
        )}
      </Button>
    </div>
  );
}
