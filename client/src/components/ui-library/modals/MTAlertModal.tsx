// MT Ocean Alert Modal Component
// ESA LIFE CEO 61x21 - Alert & Notification Modals

import React, { useEffect } from 'react';
import { cn } from '@/lib/utils';
import { 
  CheckCircle2, 
  XCircle, 
  AlertTriangle, 
  Info, 
  Bell,
  Sparkles,
  Trophy,
  Heart,
  LucideIcon 
} from 'lucide-react';
import MTModalBase from './MTModalBase';
import MTButton from '../buttons/MTButton';

export interface MTAlertModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  message: string;
  type?: 'success' | 'error' | 'warning' | 'info' | 'celebration' | 'achievement';
  icon?: LucideIcon | React.ReactNode;
  actionText?: string;
  onAction?: () => void;
  autoClose?: boolean;
  autoCloseDelay?: number;
  showConfetti?: boolean;
  size?: 'xs' | 'sm' | 'md';
  'data-testid'?: string;
}

const MTAlertModal: React.FC<MTAlertModalProps> = ({
  isOpen,
  onClose,
  title,
  message,
  type = 'info',
  icon,
  actionText = 'OK',
  onAction,
  autoClose = false,
  autoCloseDelay = 3000,
  showConfetti = false,
  size = 'sm',
  'data-testid': testId = 'alert-modal'
}) => {
  useEffect(() => {
    if (autoClose && isOpen) {
      const timer = setTimeout(() => {
        onClose();
      }, autoCloseDelay);

      return () => clearTimeout(timer);
    }
  }, [autoClose, autoCloseDelay, isOpen, onClose]);

  const typeConfig = {
    success: {
      icon: CheckCircle2,
      iconColor: 'text-green-500',
      iconBg: 'bg-gradient-to-br from-green-100 to-emerald-100 dark:from-green-900/30 dark:to-emerald-900/30',
      borderColor: 'border-green-200 dark:border-green-800',
      gradientText: 'from-green-600 to-emerald-600'
    },
    error: {
      icon: XCircle,
      iconColor: 'text-red-500',
      iconBg: 'bg-gradient-to-br from-red-100 to-rose-100 dark:from-red-900/30 dark:to-rose-900/30',
      borderColor: 'border-red-200 dark:border-red-800',
      gradientText: 'from-red-600 to-rose-600'
    },
    warning: {
      icon: AlertTriangle,
      iconColor: 'text-amber-500',
      iconBg: 'bg-gradient-to-br from-amber-100 to-orange-100 dark:from-amber-900/30 dark:to-orange-900/30',
      borderColor: 'border-amber-200 dark:border-amber-800',
      gradientText: 'from-amber-600 to-orange-600'
    },
    info: {
      icon: Info,
      iconColor: 'text-blue-500',
      iconBg: 'bg-gradient-to-br from-blue-100 to-sky-100 dark:from-blue-900/30 dark:to-sky-900/30',
      borderColor: 'border-blue-200 dark:border-blue-800',
      gradientText: 'from-blue-600 to-sky-600'
    },
    celebration: {
      icon: Sparkles,
      iconColor: 'text-purple-500',
      iconBg: 'bg-gradient-to-br from-purple-100 to-pink-100 dark:from-purple-900/30 dark:to-pink-900/30',
      borderColor: 'border-purple-200 dark:border-purple-800',
      gradientText: 'from-purple-600 to-pink-600'
    },
    achievement: {
      icon: Trophy,
      iconColor: 'text-yellow-500',
      iconBg: 'bg-gradient-to-br from-yellow-100 to-amber-100 dark:from-yellow-900/30 dark:to-amber-900/30',
      borderColor: 'border-yellow-200 dark:border-yellow-800',
      gradientText: 'from-yellow-600 to-amber-600'
    }
  };

  const config = typeConfig[type];
  const Icon = icon || config.icon;

  const handleAction = () => {
    if (onAction) {
      onAction();
    }
    onClose();
  };

  return (
    <MTModalBase
      isOpen={isOpen}
      onClose={onClose}
      size={size}
      variant="glass"
      animationType="scale"
      showCloseButton={false}
      data-testid={testId}
    >
      <div 
        className={cn(
          'relative overflow-hidden rounded-2xl',
          config.borderColor,
          'border-2'
        )}
      >
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-5">
          <div className="absolute inset-0 bg-gradient-to-br from-teal-300 via-transparent to-blue-900" />
        </div>

        {/* Confetti Effect for Celebrations */}
        {showConfetti && type === 'celebration' && (
          <div className="absolute inset-0 pointer-events-none">
            <div className="animate-float-slow absolute top-4 left-4 text-2xl">🎉</div>
            <div className="animate-float-medium absolute top-8 right-8 text-xl">✨</div>
            <div className="animate-float-fast absolute bottom-4 left-8 text-2xl">🎊</div>
            <div className="animate-float-slow absolute bottom-8 right-4 text-xl">🌟</div>
          </div>
        )}

        <div className="relative p-6">
          {/* Icon with animated background */}
          <div className="flex justify-center mb-4">
            <div
              className={cn(
                'relative w-20 h-20 rounded-full flex items-center justify-center',
                config.iconBg,
                'backdrop-blur-sm',
                'animate-pulse-subtle'
              )}
            >
              {/* Glow effect */}
              <div className="absolute inset-0 rounded-full animate-ping opacity-20" 
                style={{ backgroundColor: config.iconColor }} 
              />
              
              {React.isValidElement(Icon) ? (
                Icon
              ) : Icon ? (
                <Icon className={cn('w-10 h-10 relative z-10', config.iconColor)} />
              ) : (
                <Bell className={cn('w-10 h-10 relative z-10', config.iconColor)} />
              )}
            </div>
          </div>

          {/* Content */}
          <div className="text-center mb-6">
            <h3 className={cn(
              'text-2xl font-bold mb-3',
              'bg-gradient-to-r bg-clip-text text-transparent',
              config.gradientText
            )}>
              {title}
            </h3>
            <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
              {message}
            </p>
          </div>

          {/* Progress Bar for Auto-close */}
          {autoClose && (
            <div className="mb-4">
              <div className="h-1 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                <div 
                  className={cn(
                    'h-full bg-gradient-to-r',
                    config.gradientText.replace('from-', 'from-').replace('to-', 'to-'),
                    'animate-countdown'
                  )}
                  style={{ 
                    animationDuration: `${autoCloseDelay}ms` 
                  }}
                />
              </div>
            </div>
          )}

          {/* Action Button */}
          <div className="flex justify-center">
            <MTButton
              variant="primary"
              onClick={handleAction}
              className="min-w-[120px]"
              data-testid={`${testId}-action`}
            >
              {actionText}
            </MTButton>
          </div>
        </div>
      </div>
    </MTModalBase>
  );
};

// Alert Stack Manager for multiple alerts
export const useAlertStack = () => {
  const [alerts, setAlerts] = React.useState<Array<{
    id: string;
    props: MTAlertModalProps;
  }>>([]);

  const showAlert = (props: Omit<MTAlertModalProps, 'isOpen' | 'onClose'>) => {
    const id = Date.now().toString();
    const alertProps: MTAlertModalProps = {
      ...props,
      isOpen: true,
      onClose: () => removeAlert(id)
    };

    setAlerts(prev => [...prev, { id, props: alertProps }]);
    return id;
  };

  const removeAlert = (id: string) => {
    setAlerts(prev => prev.filter(alert => alert.id !== id));
  };

  const AlertStack = () => (
    <>
      {alerts.map((alert, index) => (
        <div key={alert.id} style={{ zIndex: 100 + index }}>
          <MTAlertModal {...alert.props} />
        </div>
      ))}
    </>
  );

  return { showAlert, AlertStack };
};

export default MTAlertModal;