import { useEffect } from 'react';
import Shepherd from 'shepherd.js';
import 'shepherd.js/dist/css/shepherd.css';
import { useToast } from '@/hooks/use-toast';

/**
 * ESA Agent #74: Interactive Tours
 * Context-aware guided tours for all user roles
 */

export type TourType = 'welcome' | 'host' | 'teacher' | 'traveler' | 'local';

interface TourStep {
  id: string;
  title: string;
  text: string;
  attachTo?: { element: string; on: string };
  buttons?: Array<{ text: string; action: () => void; classes?: string }>;
}

const TOUR_DEFINITIONS: Record<TourType, TourStep[]> = {
  welcome: [
    {
      id: 'welcome-1',
      title: '👋 Welcome to Life CEO!',
      text: 'Let me show you around. This 60-second tour will help you get started.',
      buttons: [
        { text: 'Skip', action: function(this: any) { this.complete(); } },
        { text: 'Start Tour', action: function(this: any) { this.next(); }, classes: 'shepherd-button-primary' },
      ],
    },
    {
      id: 'welcome-2',
      title: '🤖 Meet Mr Blue',
      text: 'Your AI companion is always here to help. Click the blue button to ask anything!',
      attachTo: { element: '[data-testid="mr-blue-button"]', on: 'left' },
    },
    {
      id: 'welcome-3',
      title: '🎯 Your Dashboard',
      text: 'Access all your tools here - events, communities, travel plans, and more.',
      attachTo: { element: '[data-testid="user-dashboard"]', on: 'bottom' },
    },
    {
      id: 'welcome-4',
      title: '🌍 Explore Communities',
      text: 'Connect with people in cities worldwide. Join groups, attend events, make friends!',
      attachTo: { element: '[data-testid="communities-link"]', on: 'right' },
    },
    {
      id: 'welcome-5',
      title: '✨ Visual Editor',
      text: 'Admins can edit pages visually - just like Figma! No coding required.',
      attachTo: { element: '[data-testid="visual-editor-toggle"]', on: 'left' },
    },
    {
      id: 'welcome-6',
      title: '🚀 You\'re All Set!',
      text: 'Ready to explore? Start by joining your first community or creating an event!',
      buttons: [
        { text: 'Finish', action: function(this: any) { this.complete(); }, classes: 'shepherd-button-primary' },
      ],
    },
  ],

  host: [
    {
      id: 'host-1',
      title: '🎉 Create Amazing Events',
      text: 'As a host, you can create tango events, socials, and more. Let\'s see how!',
    },
    {
      id: 'host-2',
      title: '📅 Event Creation',
      text: 'Click here to create your first event. Fill in details, set capacity, and publish!',
      attachTo: { element: '[data-testid="button-create-event"]', on: 'bottom' },
    },
    {
      id: 'host-3',
      title: '👥 Manage RSVPs',
      text: 'Track attendees, send updates, and manage your guest list in real-time.',
      attachTo: { element: '[data-testid="event-rsvps"]', on: 'left' },
    },
    {
      id: 'host-4',
      title: '💰 Event Analytics',
      text: 'See who\'s coming, track engagement, and optimize your events for success!',
      attachTo: { element: '[data-testid="event-analytics"]', on: 'top' },
    },
  ],

  teacher: [
    {
      id: 'teacher-1',
      title: '🎓 Share Your Skills',
      text: 'List private lessons, workshops, and classes. Let\'s set up your teaching profile!',
    },
    {
      id: 'teacher-2',
      title: '📚 Create Listings',
      text: 'Add your teaching services here - set rates, availability, and class details.',
      attachTo: { element: '[data-testid="button-create-listing"]', on: 'bottom' },
    },
    {
      id: 'teacher-3',
      title: '📆 Manage Bookings',
      text: 'Accept students, schedule sessions, and grow your teaching business!',
      attachTo: { element: '[data-testid="teacher-bookings"]', on: 'right' },
    },
  ],

  traveler: [
    {
      id: 'traveler-1',
      title: '✈️ Plan Your Trip',
      text: 'Traveling soon? Let me show you how to connect with locals and find events!',
    },
    {
      id: 'traveler-2',
      title: '🗺️ Trip Planner',
      text: 'Create your itinerary, add events, find housing, and get local recommendations.',
      attachTo: { element: '[data-testid="trip-planner"]', on: 'bottom' },
    },
    {
      id: 'traveler-3',
      title: '🏠 Find Housing',
      text: 'Browse verified housing listings from local tango community members.',
      attachTo: { element: '[data-testid="housing-search"]', on: 'left' },
    },
  ],

  local: [
    {
      id: 'local-1',
      title: '🏘️ Welcome Local!',
      text: 'Help travelers discover your city! Share recommendations and connect.',
    },
    {
      id: 'local-2',
      title: '💡 Add Recommendations',
      text: 'Share your favorite spots - milongas, restaurants, hidden gems!',
      attachTo: { element: '[data-testid="button-add-recommendation"]', on: 'bottom' },
    },
    {
      id: 'local-3',
      title: '🤝 Host Travelers',
      text: 'List your space or offer local guidance to visiting dancers.',
      attachTo: { element: '[data-testid="become-host"]', on: 'right' },
    },
  ],
};

export function useInteractiveTour(tourType: TourType) {
  const { toast } = useToast();

  useEffect(() => {
    const hasSeenTour = localStorage.getItem(`tour-completed-${tourType}`);
    if (hasSeenTour) return;

    const tour = new Shepherd.Tour({
      useModalOverlay: true,
      defaultStepOptions: {
        cancelIcon: {
          enabled: true,
        },
        classes: 'shepherd-theme-custom',
        scrollTo: { behavior: 'smooth', block: 'center' },
      },
    });

    const steps = TOUR_DEFINITIONS[tourType] || [];
    
    steps.forEach((step) => {
      tour.addStep({
        id: step.id,
        title: step.title,
        text: step.text,
        attachTo: step.attachTo,
        buttons: step.buttons || [
          {
            text: 'Back',
            action: tour.back,
          },
          {
            text: 'Next',
            action: tour.next,
            classes: 'shepherd-button-primary',
          },
        ],
      });
    });

    tour.on('complete', () => {
      localStorage.setItem(`tour-completed-${tourType}`, 'true');
      toast({
        title: "Tour Complete! 🎉",
        description: "You're all set to get started!",
      });
    });

    // Start tour after a short delay
    setTimeout(() => {
      tour.start();
    }, 500);

    return () => {
      tour.cancel();
    };
  }, [tourType, toast]);
}

export function startTour(tourType: TourType) {
  localStorage.removeItem(`tour-completed-${tourType}`);
  window.location.reload();
}
