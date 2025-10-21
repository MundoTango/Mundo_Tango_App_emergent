import { useState } from 'react';
import { useParams } from 'wouter';
import { MapPin, UserCircle, Users, CalendarDays, Sparkles } from 'lucide-react';
import JourneyWizard from '@/components/journeys/JourneyWizard';

export default function JourneyPage() {
  const params = useParams<{ journeyId: string }>();
  // Support both numeric (1-5) and letter (J1-J5) journey IDs
  const rawId = params.journeyId;
  const journeyId = (rawId?.match(/^\d$/) ? `J${rawId}` : rawId) as 'J1' | 'J2' | 'J3' | 'J4' | 'J5';
  
  const journeys = {
    J1: {
      title: 'Welcome Guide',
      description: 'Get started with Mundo Tango and learn the basics',
      icon: <MapPin className="h-8 w-8 text-white" />,
      steps: [
        {
          id: 1,
          title: 'Welcome',
          description: 'Welcome to Mundo Tango! Let\'s get you started on your tango journey.',
          action: 'Watch the welcome video',
        },
        {
          id: 2,
          title: 'Platform Tour',
          description: 'Learn about the main features and how to navigate the platform.',
          action: 'Take a quick tour',
        },
        {
          id: 3,
          title: 'Set Your Preferences',
          description: 'Customize your experience by setting your preferences.',
          action: 'Configure settings',
        },
        {
          id: 4,
          title: 'Connect Your Profile',
          description: 'Link your social accounts and complete your basic profile.',
          action: 'Add connections',
        },
        {
          id: 5,
          title: 'You\'re Ready!',
          description: 'Congratulations! You\'re all set to start using Mundo Tango.',
          action: 'Explore the platform',
        },
      ],
    },
    J2: {
      title: 'Profile Setup',
      description: 'Create your complete tango profile and showcase your dance journey',
      icon: <UserCircle className="h-8 w-8 text-white" />,
      steps: [
        {
          id: 1,
          title: 'Basic Info',
          description: 'Add your name, location, and profile picture.',
        },
        {
          id: 2,
          title: 'Tango Experience',
          description: 'Tell us about your tango background and skill level.',
        },
        {
          id: 3,
          title: 'Dance Preferences',
          description: 'Set your preferred roles, styles, and music preferences.',
        },
        {
          id: 4,
          title: 'Bio & Interests',
          description: 'Write your bio and add your tango interests and goals.',
        },
        {
          id: 5,
          title: 'Photos & Videos',
          description: 'Upload photos and videos of your dancing.',
        },
        {
          id: 6,
          title: 'Privacy Settings',
          description: 'Configure who can see your profile and contact you.',
        },
        {
          id: 7,
          title: 'Profile Complete',
          description: 'Your profile is ready! Start connecting with other dancers.',
        },
      ],
    },
    J3: {
      title: 'Community Connection',
      description: 'Find and connect with dancers in your area and worldwide',
      icon: <Users className="h-8 w-8 text-white" />,
      steps: [
        {
          id: 1,
          title: 'Find Dancers',
          description: 'Discover dancers in your city and around the world.',
        },
        {
          id: 2,
          title: 'Join Groups',
          description: 'Join groups based on your location and interests.',
        },
        {
          id: 3,
          title: 'Connect',
          description: 'Send connection requests and start building your network.',
        },
        {
          id: 4,
          title: 'Engage',
          description: 'Like, comment, and share posts from the community.',
        },
      ],
    },
    J4: {
      title: 'First Event',
      description: 'Discover and attend your first tango event through Mundo Tango',
      icon: <CalendarDays className="h-8 w-8 text-white" />,
      steps: [
        {
          id: 1,
          title: 'Browse Events',
          description: 'Explore upcoming milongas, classes, and festivals.',
        },
        {
          id: 2,
          title: 'Event Details',
          description: 'Check event information, location, and attendees.',
        },
        {
          id: 3,
          title: 'RSVP',
          description: 'Register for your first event and add it to your calendar.',
        },
        {
          id: 4,
          title: 'Prepare',
          description: 'Get ready for the event and connect with other attendees.',
        },
        {
          id: 5,
          title: 'Attend & Share',
          description: 'Go to the event and share your experience with the community.',
        },
        {
          id: 6,
          title: 'Reflection',
          description: 'Reflect on your experience and plan your next event.',
        },
      ],
    },
    J5: {
      title: 'Advanced Features',
      description: 'Master advanced platform features and maximize your Mundo Tango experience',
      icon: <Sparkles className="h-8 w-8 text-white" />,
      steps: [
        {
          id: 1,
          title: 'Create Events',
          description: 'Learn how to create and manage your own tango events.',
        },
        {
          id: 2,
          title: 'Group Management',
          description: 'Create and moderate groups for your community.',
        },
        {
          id: 3,
          title: 'Content Creation',
          description: 'Share high-quality posts, photos, and videos.',
        },
        {
          id: 4,
          title: 'Mr Blue AI',
          description: 'Use the Mr Blue AI assistant for personalized recommendations.',
        },
        {
          id: 5,
          title: 'Analytics',
          description: 'Track your engagement and growth on the platform.',
        },
        {
          id: 6,
          title: 'Premium Features',
          description: 'Explore premium features and subscription options.',
        },
        {
          id: 7,
          title: 'Housing & Travel',
          description: 'Use housing and travel features for tango trips.',
        },
        {
          id: 8,
          title: 'Expert Status',
          description: 'Congratulations! You\'re now a Mundo Tango expert.',
        },
      ],
    },
  };
  
  const journey = journeys[journeyId];
  
  if (!journey) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Journey Not Found</h1>
          <p className="text-gray-600 dark:text-gray-400">The journey you're looking for doesn't exist.</p>
        </div>
      </div>
    );
  }
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-cyan-50 to-blue-100 dark:from-gray-900 dark:to-gray-800 py-12 px-4">
      <JourneyWizard
        journeyId={journeyId}
        title={journey.title}
        description={journey.description}
        icon={journey.icon}
        steps={journey.steps}
        onComplete={() => {
          console.log(`Journey ${journeyId} completed!`);
        }}
      />
    </div>
  );
}
