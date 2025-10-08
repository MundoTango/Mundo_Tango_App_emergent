/**
 * RoleChangeModal Component
 * ESA Layer 22: Group Management - Role Change Confirmation
 * Aurora Tide Design System - GlassCard Depth-3 (Elevated Modal)
 * 
 * Features:
 * - Glassmorphic modal with depth-3 elevation
 * - Framer Motion entrance animations
 * - Role change confirmation with visual feedback
 * - MT Ocean Theme gradients
 * - i18next internationalization
 * - Dark mode support
 * - CASL permission awareness
 */

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { GlassCard } from "@/components/glass/GlassComponents";
import { useTranslation } from "react-i18next";
import { Shield, ShieldCheck, User, Crown, AlertTriangle } from "lucide-react";
import { motion } from "framer-motion";

interface RoleChangeModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  memberUsername: string;
  currentRole: 'member' | 'moderator' | 'admin' | 'owner';
  targetRole: 'member' | 'moderator' | 'admin';
  onConfirm: () => void;
  isLoading?: boolean;
}

export const RoleChangeModal = ({
  open,
  onOpenChange,
  memberUsername,
  currentRole,
  targetRole,
  onConfirm,
  isLoading = false,
}: RoleChangeModalProps) => {
  const { t } = useTranslation();

  // Role display metadata
  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'owner':
        return <Crown className="h-6 w-6" />;
      case 'admin':
        return <ShieldCheck className="h-6 w-6" />;
      case 'moderator':
        return <Shield className="h-6 w-6" />;
      default:
        return <User className="h-6 w-6" />;
    }
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'owner':
        return 'text-purple-600 dark:text-purple-400';
      case 'admin':
        return 'text-orange-600 dark:text-orange-400';
      case 'moderator':
        return 'text-cyan-600 dark:text-cyan-400';
      default:
        return 'text-blue-600 dark:text-blue-400';
    }
  };

  const getRoleGradient = (role: string) => {
    switch (role) {
      case 'owner':
        return 'from-purple-500 to-pink-500';
      case 'admin':
        return 'from-orange-500 to-red-500';
      case 'moderator':
        return 'from-cyan-500 to-blue-500';
      default:
        return 'from-blue-500 to-teal-500';
    }
  };

  const isPromotion = 
    (targetRole === 'admin' && ['member', 'moderator'].includes(currentRole)) ||
    (targetRole === 'moderator' && currentRole === 'member');

  const isDemotion = 
    (targetRole === 'member' && ['moderator', 'admin'].includes(currentRole)) ||
    (targetRole === 'moderator' && currentRole === 'admin');

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent 
        className="sm:max-w-md bg-transparent border-0 shadow-none"
       
      >
        <GlassCard depth={3} className="p-6">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.2, ease: [0.34, 1.56, 0.64, 1] }}
          >
            <DialogHeader className="space-y-4">
              {/* Warning Icon for Demotions */}
              {isDemotion && (
                <div className="mx-auto p-3 rounded-full bg-yellow-500/20 dark:bg-yellow-400/20">
                  <AlertTriangle className="h-8 w-8 text-yellow-600 dark:text-yellow-400" />
                </div>
              )}

              <DialogTitle className="text-center text-xl font-semibold text-gray-900 dark:text-gray-100">
                {t('members.roleChange.title', 'Change Member Role?')}
              </DialogTitle>

              <DialogDescription className="text-center space-y-4">
                {/* Member Info */}
                <div className="text-base text-gray-700 dark:text-gray-600 dark:text-gray-300">
                  {t('members.roleChange.description', 'You are about to change the role of')}
                  <span className="font-semibold text-gray-900 dark:text-gray-100 mx-1">
                    @{memberUsername}
                  </span>
                </div>

                {/* Role Transition Visual */}
                <div className="flex items-center justify-center gap-4 py-4">
                  {/* Current Role */}
                  <div className="flex flex-col items-center gap-2">
                    <div className={`p-3 rounded-lg bg-gradient-to-br ${getRoleGradient(currentRole)} text-white`}>
                      {getRoleIcon(currentRole)}
                    </div>
                    <span className={`text-sm font-medium ${getRoleColor(currentRole)}`}>
                      {t(`members.role.${currentRole}`, currentRole)}
                    </span>
                  </div>

                  {/* Arrow */}
                  <motion.div
                    initial={{ x: -10, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    transition={{ delay: 0.1, duration: 0.3 }}
                  >
                    <svg 
                      className="h-8 w-8 text-gray-600 dark:text-gray-400 dark:text-gray-500" 
                      fill="none" 
                      viewBox="0 0 24 24" 
                      stroke="currentColor"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                    </svg>
                  </motion.div>

                  {/* Target Role */}
                  <div className="flex flex-col items-center gap-2">
                    <div className={`p-3 rounded-lg bg-gradient-to-br ${getRoleGradient(targetRole)} text-white`}>
                      {getRoleIcon(targetRole)}
                    </div>
                    <span className={`text-sm font-medium ${getRoleColor(targetRole)}`}>
                      {t(`members.role.${targetRole}`, targetRole)}
                    </span>
                  </div>
                </div>

                {/* Consequences Message */}
                <div className="text-sm text-gray-600 dark:text-gray-600 dark:text-gray-400 bg-gray-100/50 dark:bg-gray-800/50 rounded-lg p-3">
                  {isPromotion && (
                    <p>{t('members.roleChange.promotionNote', 'This will grant additional permissions to this member.')}</p>
                  )}
                  {isDemotion && (
                    <p>{t('members.roleChange.demotionNote', 'This will remove permissions from this member.')}</p>
                  )}
                  {!isPromotion && !isDemotion && (
                    <p>{t('members.roleChange.changeNote', 'This will update the member\'s permissions.')}</p>
                  )}
                </div>
              </DialogDescription>
            </DialogHeader>

            <DialogFooter className="mt-6 gap-2 sm:gap-0">
              <Button
                variant="outline"
                onClick={() => onOpenChange(false)}
                disabled={isLoading}
                className="border-gray-300 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-800"
               
              >
                {t('common.cancel', 'Cancel')}
              </Button>
              <Button
                onClick={() => {
                  onConfirm();
                  onOpenChange(false);
                }}
                disabled={isLoading}
                className={`bg-gradient-to-r ${getRoleGradient(targetRole)} text-white hover:opacity-90 transition-opacity`}
               
              >
                {isLoading ? (
                  <span className="flex items-center gap-2">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    {t('common.updating', 'Updating...')}
                  </span>
                ) : (
                  t('members.roleChange.confirm', 'Confirm Change')
                )}
              </Button>
            </DialogFooter>
          </motion.div>
        </GlassCard>
      </DialogContent>
    </Dialog>
  );
};
