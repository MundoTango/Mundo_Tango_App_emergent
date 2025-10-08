import React from 'react';
import DashboardLayout from '@/layouts/DashboardLayout';
import EventInvitationManager from '@/components/events/EventInvitationManager';
import { Helmet } from 'react-helmet';

export default function InvitationsPage() {
  return (
    <>
      <Helmet>
        <title>Invitations | Life CEO</title>
      </Helmet>
      
    <DashboardLayout>
      <div className="max-w-6xl mx-auto p-6">
        <EventInvitationManager />
      </div>
    </DashboardLayout>
  
    </>
  );
}