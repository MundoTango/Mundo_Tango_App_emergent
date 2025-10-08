/**
 * MemberActionsDropdown Component
 * ESA Layer 22: Group Management - Admin Actions
 * Aurora Tide Design System Compliance
 * 
 * Features:
 * - Glassmorphic dropdown with blur effects
 * - Role management actions for admins/owners
 * - MT Ocean Theme gradients
 * - i18next internationalization
 * - Dark mode support
 * - CASL ability integration for permission checks
 */

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { useTranslation } from "react-i18next";
import { 
  MoreVertical, 
  Shield, 
  ShieldCheck, 
  User, 
  UserMinus,
  Crown,
  Ban
} from "lucide-react";
import { useState } from "react";

interface MemberActionsDropdownProps {
  memberId: number;
  memberUsername: string;
  currentRole: 'member' | 'moderator' | 'admin' | 'owner';
  currentUserRole: string;
  onChangeRole?: (role: 'member' | 'moderator' | 'admin') => void;
  onRemove?: () => void;
  onBan?: () => void;
}

export const MemberActionsDropdown = ({
  memberId,
  memberUsername,
  currentRole,
  currentUserRole,
  onChangeRole,
  onRemove,
  onBan,
}: MemberActionsDropdownProps) => {
  const { t } = useTranslation();
  const [open, setOpen] = useState(false);

  // Permission checks (ESA Layer 6: Authorization)
  const canManageRoles = currentUserRole === 'admin' || currentUserRole === 'owner';
  const canRemoveMembers = currentUserRole === 'admin' || currentUserRole === 'owner';
  const canBanMembers = currentUserRole === 'admin' || currentUserRole === 'owner';
  const isOwner = currentUserRole === 'owner';
  const isMemberOwner = currentRole === 'owner';

  // Owners cannot be managed (except by transferring ownership - not in this dropdown)
  if (isMemberOwner || !canManageRoles) {
    return null;
  }

  const handleRoleChange = (newRole: 'member' | 'moderator' | 'admin') => {
    onChangeRole?.(newRole);
    setOpen(false);
  };

  const handleRemove = () => {
    onRemove?.();
    setOpen(false);
  };

  const handleBan = () => {
    onBan?.();
    setOpen(false);
  };

  return (
    <DropdownMenu open={open} onOpenChange={setOpen}>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8 hover:bg-[var(--color-primary)]/20 dark:hover:bg-cyan-400/20 transition-colors"
          data-testid={`button-member-actions-${memberId}`}
        >
          <MoreVertical className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      
      <DropdownMenuContent 
        align="end" 
        className="w-56 bg-[var(--color-surface)]/80 dark:bg-gray-900/80 backdrop-blur-xl border-cyan-500/20 dark:border-cyan-400/20"
        data-testid={`dropdown-member-actions-content-${memberId}`}
      >
        <DropdownMenuLabel className="text-[var(--color-text-secondary)] dark:text-gray-300">
          {t('members.actions.title', 'Member Actions')}
          <div className="text-xs font-normal text-gray-500 dark:text-gray-400 mt-1">
            @{memberUsername}
          </div>
        </DropdownMenuLabel>
        
        <DropdownMenuSeparator className="bg-gray-200 dark:bg-gray-700" />

        {/* Role Management Section */}
        {canManageRoles && (
          <>
            <DropdownMenuLabel className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">
              {t('members.actions.changeRole', 'Change Role')}
            </DropdownMenuLabel>

            {/* Make Member */}
            {currentRole !== 'member' && (
              <DropdownMenuItem
                onClick={() => handleRoleChange('member')}
                className="flex items-center gap-2 cursor-pointer hover:bg-[var(--color-primary)]/10 dark:hover:bg-cyan-400/10"
                data-testid={`action-make-member-${memberId}`}
              >
                <User className="h-4 w-4 text-gray-600 dark:text-gray-400" />
                <span>{t('members.actions.makeMember', 'Make Member')}</span>
              </DropdownMenuItem>
            )}

            {/* Make Moderator */}
            {currentRole !== 'moderator' && (
              <DropdownMenuItem
                onClick={() => handleRoleChange('moderator')}
                className="flex items-center gap-2 cursor-pointer hover:bg-[var(--color-primary)]/10 dark:hover:bg-cyan-400/10"
                data-testid={`action-make-moderator-${memberId}`}
              >
                <Shield className="h-4 w-4 text-[var(--color-primary-hover)] dark:text-cyan-400" />
                <span>{t('members.actions.makeModerator', 'Make Moderator')}</span>
              </DropdownMenuItem>
            )}

            {/* Make Admin (Owner only) */}
            {currentRole !== 'admin' && isOwner && (
              <DropdownMenuItem
                onClick={() => handleRoleChange('admin')}
                className="flex items-center gap-2 cursor-pointer hover:bg-orange-500/10 dark:hover:bg-orange-400/10"
                data-testid={`action-make-admin-${memberId}`}
              >
                <ShieldCheck className="h-4 w-4 text-orange-600 dark:text-orange-400" />
                <span>{t('members.actions.makeAdmin', 'Make Admin')}</span>
              </DropdownMenuItem>
            )}

            <DropdownMenuSeparator className="bg-gray-200 dark:bg-gray-700" />
          </>
        )}

        {/* Moderation Actions Section */}
        {(canRemoveMembers || canBanMembers) && (
          <>
            <DropdownMenuLabel className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">
              {t('members.actions.moderation', 'Moderation')}
            </DropdownMenuLabel>

            {/* Remove Member */}
            {canRemoveMembers && (
              <DropdownMenuItem
                onClick={handleRemove}
                className="flex items-center gap-2 cursor-pointer hover:bg-red-500/10 dark:hover:bg-red-400/10 text-red-600 dark:text-red-400"
                data-testid={`action-remove-member-${memberId}`}
              >
                <UserMinus className="h-4 w-4" />
                <span>{t('members.actions.remove', 'Remove from Group')}</span>
              </DropdownMenuItem>
            )}

            {/* Ban Member (Owner only) */}
            {canBanMembers && isOwner && (
              <DropdownMenuItem
                onClick={handleBan}
                className="flex items-center gap-2 cursor-pointer hover:bg-red-600/10 dark:hover:bg-red-500/10 text-red-700 dark:text-red-500"
                data-testid={`action-ban-member-${memberId}`}
              >
                <Ban className="h-4 w-4" />
                <span>{t('members.actions.ban', 'Ban from Group')}</span>
              </DropdownMenuItem>
            )}
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
