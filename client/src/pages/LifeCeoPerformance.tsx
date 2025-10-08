import React from 'react';
import { LifeCeoPerformanceDashboard } from '@/components/LifeCeoPerformanceDashboard';
import { Helmet } from 'react-helmet';

export default function LifeCeoPerformance() {
  return (
    <>
      <Helmet>
        <title>Life Ceo Performance | Life CEO</title>
      </Helmet>
      
    <div className="min-h-screen bg-gradient-to-br from-turquoise-50/50 via-cyan-50/50 to-white">
      <LifeCeoPerformanceDashboard />
    </div>
  
    </>
  );
}