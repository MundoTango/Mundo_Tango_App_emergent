import React from 'react';
import { LifeCeoPerformanceDashboard } from '@/components/LifeCeoPerformanceDashboard';
import { useTranslation } from 'react-i18next';

export default function LifeCeoPerformance() {
  const { t } = useTranslation();
  return (
    <div className="min-h-screen bg-gradient-to-br from-turquoise-50/50 via-cyan-50/50 to-white">
      <LifeCeoPerformanceDashboard />
    </div>
  );
}