import { toast } from '@/hooks/use-toast';

/**
 * ESA Layer 16: Notification System Agent
 * Enhanced toast notifications for user feedback
 */

export const useToastNotifications = () => {
  const showSuccess = (message: string, description?: string) => {
    toast({
      title: message,
      description,
      duration: 3000,
      className: 'bg-gradient-to-r from-teal-400 to-cyan-600 text-white border-0',
    });
  };

  const showError = (message: string, description?: string) => {
    toast({
      title: message,
      description,
      variant: 'destructive',
      duration: 5000,
    });
  };

  const showInfo = (message: string, description?: string) => {
    toast({
      title: message,
      description,
      duration: 4000,
      className: 'bg-gradient-to-r from-blue-400 to-indigo-600 text-white border-0',
    });
  };

  const showWelcome = (userName: string) => {
    toast({
      title: `Welcome to Mundo Tango, ${userName}! 💃`,
      description: 'Start your tango journey by creating your first memory',
      duration: 6000,
      className: 'bg-gradient-to-r from-teal-400 via-cyan-500 to-blue-600 text-white border-0',
    });
  };

  const showAchievement = (achievement: string, points: number) => {
    toast({
      title: `🏆 Achievement Unlocked!`,
      description: `${achievement} (+${points} points)`,
      duration: 5000,
      className: 'bg-gradient-to-r from-yellow-400 to-orange-500 text-white border-0',
    });
  };

  return {
    showSuccess,
    showError,
    showInfo,
    showWelcome,
    showAchievement,
  };
};
