import React from 'react';
import DashboardLayout from '@/layouts/DashboardLayout';
import { GuestOnboardingFlow } from '@/components/GuestOnboarding/GuestOnboardingFlow';
import { useTranslation } from 'react-i18next';

export default function GuestOnboarding() {
  const { t } = useTranslation();
  return (
    <DashboardLayout>
      <GuestOnboardingFlow />
    </DashboardLayout>
  );
}