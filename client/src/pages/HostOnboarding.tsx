import React, { useState, useRef, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Check, Home, MapPin, Camera, DollarSign, Calendar, Shield, Sparkles } from 'lucide-react';
import PropertyTypeStep from '@/components/host-onboarding/PropertyTypeStep';
import PropertyDetailsStep from '@/components/host-onboarding/PropertyDetailsStep';
import LocationStep from '@/components/host-onboarding/LocationStep';
import AmenitiesStep from '@/components/host-onboarding/AmenitiesStep';
import PhotosStep from '@/components/host-onboarding/PhotosStep';
import PricingStep from '@/components/host-onboarding/PricingStep';
import AvailabilityStep from '@/components/host-onboarding/AvailabilityStep';
import ReviewStep from '@/components/host-onboarding/ReviewStep';
import { useMutation } from '@tanstack/react-query';
import { apiRequest, queryClient } from '@/lib/queryClient';
import { useLocation } from 'wouter';
import { toast } from '@/hooks/use-toast';
import DashboardLayout from '@/layouts/DashboardLayout';
import { FadeIn, ScaleIn, StaggerContainer } from '@/components/animations/FramerMotionWrappers';
import { GlassCard } from '@/components/glass/GlassComponents';
import { MagneticButton, PulseButton } from '@/components/interactions/MicroInteractions';
import { useTranslation } from 'react-i18next';
import { useScrollReveal } from '@/hooks/useScrollReveal';
import { Helmet } from 'react-helmet';

interface OnboardingData {
  // Property basics
  propertyType: string;
  roomType: string;
  title: string;
  description: string;
  
  // Location
  address: string;
  city: string;
  state: string;
  country: string;
  zipCode: string;
  latitude?: number;
  longitude?: number;
  
  // Details
  maxGuests: number;
  bedrooms: number;
  beds: number;
  bathrooms: number;
  
  // Amenities
  amenities: string[];
  
  // Photos & Media
  photos: File[];
  mediaOrder?: string[];
  thumbnailIndex?: number;
  
  // Pricing
  basePrice: number;
  cleaningFee: number;
  currency: string;
  
  // Availability
  instantBook: boolean;
  minimumStay: number;
  availableDates: Date[];
  
  // External listings
  airbnbUrl?: string;
  vrboUrl?: string;
}

const STEPS = [
  { id: 'property-type', title: 'Property Type', icon: Home },
  { id: 'property-details', title: 'Property Details', icon: Home },
  { id: 'location', title: 'Location', icon: MapPin },
  { id: 'amenities', title: 'Amenities', icon: Sparkles },
  { id: 'photos', title: 'Photos', icon: Camera },
  { id: 'pricing', title: 'Pricing', icon: DollarSign },
  { id: 'availability', title: 'Availability', icon: Calendar },
  { id: 'review', title: 'Review & Submit', icon: Shield },
];

export default function HostOnboarding() {
  const { t } = useTranslation();
  const [, setLocation] = useLocation();
  const [currentStep, setCurrentStep] = useState(0);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [onboardingData, setOnboardingData] = useState<Partial<OnboardingData>>({
    currency: 'USD',
    instantBook: false,
    minimumStay: 1,
    amenities: [],
    photos: [],
    availableDates: [],
  });

  const progressRef = useScrollReveal('.progress-indicator', {
    opacity: 0,
    scale: 0.95,
  }, {
    start: 'top 90%',
    once: true,
    respectReducedMotion: true,
  });

  const stepsRef = useScrollReveal('.step-indicator', {
    opacity: 0,
    y: 20,
  }, {
    stagger: 0.1,
    start: 'top 85%',
    once: true,
    respectReducedMotion: true,
  });

  const createHostHomeMutation = useMutation({
    mutationFn: async (data: Partial<OnboardingData>) => {
      try {
        console.log('Starting host home creation with data:', data);
        
        // First, upload photos
        const photoUrls: string[] = [];
        if (data.photos && data.photos.length > 0) {
          console.log('Uploading photos:', data.photos.length);
          setUploadProgress(10); // Start progress
          
          const formData = new FormData();
          data.photos.forEach((photo) => {
            formData.append('files', photo);
          });
          
          console.log('Sending photo upload request...');
          setUploadProgress(30); // Uploading
          
          const uploadResponse = await apiRequest('/api/upload/host-home-photos', {
            method: 'POST',
            body: formData
          });
          console.log('Upload response status:', uploadResponse.status);
          setUploadProgress(80); // Almost done
          
          const uploadData = await uploadResponse.json();
          console.log('Upload response data:', uploadData);
          setUploadProgress(100); // Complete
          
          if (uploadData.urls) {
            photoUrls.push(...uploadData.urls);
          }
        }

        // Then create the host home
        const hostHomeData = {
          ...data,
          photos: photoUrls,
          mediaOrder: data.mediaOrder || photoUrls, // Use custom order or uploaded order
          thumbnailMedia: data.thumbnailIndex !== undefined && photoUrls[data.thumbnailIndex] 
            ? photoUrls[data.thumbnailIndex] 
            : photoUrls[0], // Use selected thumbnail or first photo
          status: 'pending_review',
        };
        
        console.log('Creating host home with data:', hostHomeData);
        const response = await apiRequest('/api/host-homes', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: hostHomeData
        });
        console.log('Host home response status:', response.status);
        const result = await response.json();
        console.log('Host home creation result:', result);
        return result;
      } catch (error) {
        console.error('Error in createHostHomeMutation:', error);
        if (error instanceof Error) {
          console.error('Error stack:', error.stack);
        }
        throw error;
      }
    },
    onSuccess: () => {
      toast({
        title: 'Success!',
        description: 'Your property has been submitted for review. We\'ll notify you once it\'s approved.',
      });
      queryClient.invalidateQueries({ queryKey: ['/api/host-homes'] });
      setLocation('/host-dashboard');
    },
    onError: (error: any) => {
      toast({
        title: 'Error',
        description: error.message || 'Failed to create listing. Please try again.',
        variant: 'destructive',
      });
    },
  });

  const updateData = (stepData: Partial<OnboardingData>) => {
    setOnboardingData((prev) => ({ ...prev, ...stepData }));
  };

  const goToStep = (step: number) => {
    if (step >= 0 && step < STEPS.length) {
      setCurrentStep(step);
    }
  };

  const nextStep = () => {
    if (currentStep < STEPS.length - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  const previousStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSubmit = () => {
    createHostHomeMutation.mutate(onboardingData);
  };

  const progressPercentage = ((currentStep + 1) / STEPS.length) * 100;

  const renderStep = () => {
    switch (STEPS[currentStep].id) {
      case 'property-type':
        return <PropertyTypeStep data={onboardingData} updateData={updateData} />;
      case 'property-details':
        return <PropertyDetailsStep data={onboardingData} updateData={updateData} />;
      case 'location':
        return <LocationStep data={onboardingData} updateData={updateData} />;
      case 'amenities':
        return <AmenitiesStep data={onboardingData} updateData={updateData} />;
      case 'photos':
        return <PhotosStep data={onboardingData} updateData={updateData} />;
      case 'pricing':
        return <PricingStep data={onboardingData} updateData={updateData} />;
      case 'availability':
        return <AvailabilityStep data={onboardingData} updateData={updateData} />;
      case 'review':
        return <ReviewStep data={onboardingData} />;
      default:
        return null;
    }
  };

  return (
    <>
      <Helmet>
        <title>Host Onboarding | Life CEO</title>
      </Helmet>
      
    <DashboardLayout>
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-cyan-50/30 dark:from-slate-900 dark:to-slate-800">
        {/* Aurora Tide Header */}
        <FadeIn>
          <GlassCard depth={2} className="border-b border-cyan-200/30 dark:border-ocean-500/30 sticky top-0 z-10">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="flex items-center justify-between h-16">
                <div className="flex items-center">
                  <h1 className="text-xl font-semibold text-slate-900 dark:text-white">
                    {t('housing.host_onboarding.title', 'List Your Home')}
                  </h1>
                </div>
                <div className="flex items-center gap-4">
                  <span className="text-sm text-slate-600 dark:text-slate-400">
                    {t('housing.host_onboarding.step_progress', { 
                      defaultValue: 'Step {{current}} of {{total}}', 
                      current: currentStep + 1, 
                      total: STEPS.length 
                    })}
                  </span>
                  <MagneticButton
                    onClick={() => setLocation('/host-dashboard')}
                    strength={0.15}
                    className="glass-card glass-depth-1 border-cyan-200/30 dark:border-ocean-500/30 px-4 py-2 text-slate-700 dark:text-slate-300"
                    data-testid="button-save-exit"
                  >
                    {t('housing.host_onboarding.save_exit', 'Save & Exit')}
                  </MagneticButton>
                </div>
              </div>
            </div>
          </GlassCard>
        </FadeIn>

        {/* Aurora Tide Progress Bar */}
        <div ref={progressRef}>
          <ScaleIn delay={0.1}>
            <div className="progress-indicator bg-white/50 dark:bg-slate-800/50 border-b border-cyan-200/30 dark:border-ocean-500/30">
              <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="relative h-1 bg-slate-200 dark:bg-slate-700">
                  <div 
                    className="absolute inset-y-0 left-0 bg-gradient-to-r from-cyan-500 via-teal-500 to-blue-500 transition-all duration-300"
                    style={{ width: `${progressPercentage}%` }}
                    data-testid="onboarding-progress-bar"
                  />
                </div>
              </div>
            </div>
          </ScaleIn>
        </div>

      {/* Aurora Tide Step Indicators */}
      <div ref={stepsRef} className="bg-white/50 dark:bg-slate-800/50 border-b border-cyan-200/30 dark:border-ocean-500/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <StaggerContainer className="flex justify-between py-4 overflow-x-auto">
            {STEPS.map((step, index) => {
              const Icon = step.icon;
              const isCompleted = index < currentStep;
              const isCurrent = index === currentStep;
              
              return (
                <MagneticButton
                  key={step.id}
                  onClick={() => goToStep(index)}
                  strength={index <= currentStep ? 0.15 : 0}
                  className={`step-indicator flex flex-col items-center min-w-[100px] px-2 ${
                    index <= currentStep ? '' : 'cursor-not-allowed opacity-50'
                  }`}
                  disabled={index > currentStep}
                  data-testid={`step-indicator-${step.id}`}
                >
                  <div
                    className={`w-10 h-10 rounded-full flex items-center justify-center mb-2 transition-all duration-300 ${
                      isCompleted
                        ? 'bg-gradient-to-r from-cyan-500 to-teal-500 text-white'
                        : isCurrent
                        ? 'bg-gradient-to-r from-teal-500 to-blue-500 text-white'
                        : 'bg-slate-200 dark:bg-slate-700 text-slate-400 dark:text-slate-500'
                    }`}
                  >
                    {isCompleted ? <Check className="w-5 h-5" /> : <Icon className="w-5 h-5" />}
                  </div>
                  <span
                    className={`text-xs text-center transition-colors ${
                      isCurrent 
                        ? 'text-cyan-600 dark:text-cyan-400 font-medium' 
                        : 'text-slate-600 dark:text-slate-400'
                    }`}
                  >
                    {t(`housing.host_onboarding.steps.${step.id}`, step.title)}
                  </span>
                </MagneticButton>
              );
            })}
          </StaggerContainer>
        </div>
      </div>

      {/* Aurora Tide Step Content */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <ScaleIn delay={0.2}>
          <GlassCard 
            depth={3} 
            className="border-cyan-200/30 dark:border-ocean-500/30 p-6"
            data-testid="onboarding-step-content"
          >
            {renderStep()}
          </GlassCard>
        </ScaleIn>

        {/* Aurora Tide Navigation Buttons */}
        <div className="flex justify-between mt-6">
          <MagneticButton
            onClick={previousStep}
            disabled={currentStep === 0}
            strength={currentStep === 0 ? 0 : 0.15}
            className="glass-card glass-depth-2 border-cyan-200/30 dark:border-ocean-500/30 px-6 py-2 text-slate-700 dark:text-slate-300 disabled:opacity-50"
            data-testid="button-previous"
          >
            {t('housing.host_onboarding.previous', 'Previous')}
          </MagneticButton>
          
          {currentStep === STEPS.length - 1 ? (
            <div className="flex flex-col items-end gap-2">
              {createHostHomeMutation.isPending && uploadProgress > 0 && (
                <div className="w-64">
                  <div className="text-sm text-slate-600 dark:text-slate-400 mb-1">
                    {t('housing.host_onboarding.uploading_photos', { 
                      defaultValue: 'Uploading photos... {{progress}}%', 
                      progress: uploadProgress 
                    })}
                  </div>
                  <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-2">
                    <div 
                      className="bg-gradient-to-r from-cyan-500 via-teal-500 to-blue-500 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${uploadProgress}%` }}
                    />
                  </div>
                </div>
              )}
              <PulseButton
                onClick={handleSubmit}
                disabled={createHostHomeMutation.isPending}
                className="bg-gradient-to-r from-cyan-500 via-teal-500 to-blue-500 text-white font-semibold px-8 py-3"
                pulseColor="rgba(6, 182, 212, 0.6)"
                data-testid="button-submit"
              >
                {createHostHomeMutation.isPending 
                  ? t('housing.host_onboarding.submitting', 'Submitting...') 
                  : t('housing.host_onboarding.submit_listing', 'Submit Listing')
                }
              </PulseButton>
            </div>
          ) : (
            <PulseButton
              onClick={nextStep}
              className="bg-gradient-to-r from-cyan-500 via-teal-500 to-blue-500 text-white font-semibold px-8 py-3"
              pulseColor="rgba(6, 182, 212, 0.6)"
              data-testid="button-continue"
            >
              {t('housing.host_onboarding.continue', 'Continue')}
            </PulseButton>
          )}
        </div>
      </div>
      </div>
    </DashboardLayout>
  
    </>
  );
}