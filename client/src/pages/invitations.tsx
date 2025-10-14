import React from 'react';
import DashboardLayout from '@/layouts/DashboardLayout';
import EventInvitationManager from '@/components/events/EventInvitationManager';
import { useTranslation } from 'react-i18next';

export default function InvitationsPage() {
  const { t } = useTranslation();
  return (
    <DashboardLayout>
      <div className="max-w-6xl mx-auto p-6">
        <EventInvitationManager />
      </div>
    </DashboardLayout>
  );
}