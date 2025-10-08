import { useLocation } from 'wouter';
import { useTranslation } from 'react-i18next';
import { Home, Heart, Users, MapPin, Coffee, ShoppingBag } from 'lucide-react';
import { GlassCard } from '@/components/glass/GlassComponents';
import { FadeIn, ScaleIn, StaggerContainer } from '@/components/animations/FramerMotionWrappers';
import { PulseButton, MagneticButton } from '@/components/interactions/MicroInteractions';

export function GuestOnboardingEntrance() {
  const [, setLocation] = useLocation();
  const { t } = useTranslation();

  const benefits = [
    {
      icon: Home,
      title: t('housing.guest_entrance.benefit_stay_title', 'Find the Perfect Stay'),
      description: t('housing.guest_entrance.benefit_stay_desc', 'Get personalized housing recommendations based on your preferences and budget')
    },
    {
      icon: Heart,
      title: t('housing.guest_entrance.benefit_locals_title', 'Connect with Locals'),
      description: t('housing.guest_entrance.benefit_locals_desc', 'Receive tailored recommendations from locals who share your interests')
    },
    {
      icon: Users,
      title: t('housing.guest_entrance.benefit_events_title', 'Join Community Events'),
      description: t('housing.guest_entrance.benefit_events_desc', 'Discover events that match your schedule and interests')
    },
    {
      icon: MapPin,
      title: t('housing.guest_entrance.benefit_explore_title', 'Explore Like a Local'),
      description: t('housing.guest_entrance.benefit_explore_desc', 'Access hidden gems and authentic experiences curated by the community')
    },
    {
      icon: Coffee,
      title: t('housing.guest_entrance.benefit_dietary_title', 'Dietary Preferences'),
      description: t('housing.guest_entrance.benefit_dietary_desc', 'Find restaurants and cafes that cater to your dietary needs')
    },
    {
      icon: ShoppingBag,
      title: t('housing.guest_entrance.benefit_shopping_title', 'Personalized Shopping'),
      description: t('housing.guest_entrance.benefit_shopping_desc', 'Discover local shops and markets that match your style')
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-cyan-50/30 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950 py-12">
      <div className="container mx-auto px-4 max-w-5xl">
        <FadeIn>
          <GlassCard depth={3} className="border-cyan-200/30 dark:border-cyan-500/30">
            <div className="p-8 md:p-12">
              <ScaleIn delay={0.1}>
                <div className="text-center space-y-6 mb-12">
                  <div className="mx-auto w-24 h-24 bg-gradient-to-br from-[var(--color-primary)] via-teal-500 to-[var(--color-ocean-500)] rounded-3xl flex items-center justify-center shadow-xl shadow-cyan-500/20">
                    <Users className="w-12 h-12 text-white" />
                  </div>
                  <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-cyan-600 via-teal-600 to-[var(--color-ocean-600)] bg-clip-text text-transparent">
                    {t('housing.guest_entrance.title', 'Welcome to Our Community!')}
                  </h1>
                  <p className="text-lg text-slate-600 dark:text-slate-400 max-w-3xl mx-auto">
                    {t('housing.guest_entrance.subtitle', 'Tell us about yourself to receive personalized recommendations for housing, events, and local experiences tailored just for you.')}
                  </p>
                </div>
              </ScaleIn>

              <StaggerContainer className="grid md:grid-cols-2 gap-6 mb-10" staggerDelay={0.08}>
                {benefits.map((benefit, index) => {
                  const Icon = benefit.icon;
                  const testId = index === 0 ? 'stay' : index === 1 ? 'locals' : index === 2 ? 'events' : index === 3 ? 'explore' : index === 4 ? 'dietary' : 'shopping';
                  return (
                    <GlassCard 
                      key={index} 
                      depth={1} 
                      className="p-5 border-cyan-200/20 dark:border-cyan-500/20 hover:border-[var(--color-ocean-300)]/40 dark:hover:border-cyan-400/40 transition-all duration-300"
                      data-testid={`card-benefit-${testId}`}
                    >
                      <div className="flex gap-4">
                        <div className="flex-shrink-0">
                          <div className="w-14 h-14 bg-gradient-to-br from-cyan-100 to-teal-100 dark:from-cyan-900/50 dark:to-teal-900/50 rounded-2xl flex items-center justify-center">
                            <Icon className="w-7 h-7 text-[var(--color-primary-hover)] dark:text-cyan-400" />
                          </div>
                        </div>
                        <div>
                          <h3 className="font-semibold text-slate-900 dark:text-white mb-1">{benefit.title}</h3>
                          <p className="text-sm text-slate-600 dark:text-slate-400">{benefit.description}</p>
                        </div>
                      </div>
                    </GlassCard>
                  );
                })}
              </StaggerContainer>

              <ScaleIn delay={0.4}>
                <GlassCard depth={1} className="p-6 mb-8 border-cyan-200/30 dark:border-cyan-500/30 bg-gradient-to-r from-cyan-50/50 to-teal-50/50 dark:from-cyan-950/30 dark:to-teal-950/30" data-testid="card-privacy-notice">
                  <p className="text-center text-slate-700 dark:text-slate-300">
                    <strong className="text-cyan-700 dark:text-cyan-400">🔒 {t('housing.guest_entrance.privacy_title', 'Your privacy matters:')}</strong>{' '}
                    {t('housing.guest_entrance.privacy_text', 'Your profile information is only visible to you and helps us provide better recommendations. You control what you share.')}
                  </p>
                </GlassCard>
              </ScaleIn>

              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <PulseButton
                  onClick={() => setLocation('/guest-onboarding')}
                  className="px-8 py-4 text-lg bg-gradient-to-r from-[var(--color-primary)] via-teal-500 to-[var(--color-ocean-500)] text-white font-semibold rounded-2xl shadow-lg shadow-cyan-500/30"
                  data-testid="button-start-onboarding"
                >
                  {t('housing.guest_entrance.button_start', 'Get Started - It only takes 2 minutes')}
                </PulseButton>
                <MagneticButton
                  onClick={() => setLocation('/community')}
                  strength={0.2}
                  className="glass-card glass-depth-1 border-cyan-200/30 dark:border-cyan-500/30 px-8 py-4 text-lg text-slate-700 dark:text-slate-300 font-medium"
                  data-testid="button-skip-onboarding"
                >
                  {t('housing.guest_entrance.button_skip', 'Maybe Later')}
                </MagneticButton>
              </div>
            </div>
          </GlassCard>
        </FadeIn>
      </div>
    </div>
  );
}
