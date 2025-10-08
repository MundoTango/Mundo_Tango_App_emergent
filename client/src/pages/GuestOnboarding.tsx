import React from 'react';
import DashboardLayout from '@/layouts/DashboardLayout';
import { GuestOnboardingFlow } from '@/components/GuestOnboarding/GuestOnboardingFlow';
import { Helmet } from 'react-helmet';

export default function GuestOnboarding() {
  return (
    <>
      <Helmet>
        <title>Guest Onboarding | Life CEO</title>
      </Helmet>
      
    <DashboardLayout>
      <GuestOnboardingFlow />
    </DashboardLayout>
  
    </>
  );
}