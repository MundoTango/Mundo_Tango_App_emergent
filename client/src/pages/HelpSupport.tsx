import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { 
  HelpCircle, 
  MessageCircle, 
  Mail, 
  Book, 
  ChevronDown, 
  ChevronRight,
  Search,
  Users,
  Calendar,
  Home,
  MapPin,
  Settings,
  CreditCard,
  Shield
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import DashboardLayout from '@/layouts/DashboardLayout';

interface FAQItem {
  question: string;
  answer: string;
  category: string;
}

const HelpSupport = () => {
  const { t } = useTranslation();
  const [searchQuery, setSearchQuery] = useState('');

  const faqCategories = [
    { id: 'getting-started', name: 'Getting Started', icon: Book },
    { id: 'events', name: 'Events & Classes', icon: Calendar },
    { id: 'housing', name: 'Housing', icon: Home },
    { id: 'community', name: 'Community', icon: Users },
    { id: 'account', name: 'Account & Settings', icon: Settings },
    { id: 'payments', name: 'Payments', icon: CreditCard },
    { id: 'privacy', name: 'Privacy & Security', icon: Shield },
  ];

  const faqs: FAQItem[] = [
    {
      category: 'getting-started',
      question: 'How do I create an account?',
      answer: 'Click the "Register" button in the top right corner, fill in your details, and verify your email address. You can then complete your profile and start exploring the community.'
    },
    {
      category: 'getting-started',
      question: 'What is Life CEO?',
      answer: 'Life CEO is your personal AI assistant that helps you manage all aspects of your life within the platform - from travel planning to event discovery and community engagement.'
    },
    {
      category: 'events',
      question: 'How do I RSVP to an event?',
      answer: 'Find an event you like and click the RSVP button. You can choose "Going", "Interested", or "Maybe". The event will then appear in your upcoming events list.'
    },
    {
      category: 'events',
      question: 'Can I create my own events?',
      answer: 'Yes! If you have an Organizer or Teacher role, you can create events from your dashboard. Navigate to the Events section and click "Create Event".'
    },
    {
      category: 'housing',
      question: 'How do I list my property?',
      answer: 'Go to the Host Dashboard and click "Add New Listing". Fill in your property details, add photos, set your pricing, and publish. Your listing will be visible to travelers immediately.'
    },
    {
      category: 'housing',
      question: 'How does booking work?',
      answer: 'Browse available properties, select your dates, and request to book. The host will review your request and either approve or decline. Once approved, you can complete payment.'
    },
    {
      category: 'community',
      question: 'How do I find friends in my city?',
      answer: 'Use the Community World Map to explore members in your area. You can also filter the Memories feed by your city to see local posts and connect with nearby dancers.'
    },
    {
      category: 'community',
      question: 'What are Groups?',
      answer: 'Groups are city-based communities where you can share posts, events, and recommendations specific to that location. Join groups for cities you visit or live in.'
    },
    {
      category: 'account',
      question: 'How do I change my password?',
      answer: 'Go to Settings > Security. Click "Change Password", enter your current password, then your new password twice to confirm.'
    },
    {
      category: 'account',
      question: 'Can I have multiple roles?',
      answer: 'Yes! You can be a Dancer, Host, Teacher, and Organizer all at once. Each role gives you access to different features and dashboards.'
    },
    {
      category: 'payments',
      question: 'What payment methods are accepted?',
      answer: 'We accept all major credit cards (Visa, Mastercard, American Express), debit cards, and various local payment methods through our secure Stripe integration.'
    },
    {
      category: 'payments',
      question: 'How do refunds work?',
      answer: 'Refunds depend on the host\'s cancellation policy. You can view the policy on each listing page. For event tickets, organizers set their own refund policies.'
    },
    {
      category: 'privacy',
      question: 'Who can see my profile?',
      answer: 'Your profile visibility is controlled in Settings > Privacy. You can choose to be visible to everyone, only friends, or just yourself. Posts respect individual privacy settings.'
    },
    {
      category: 'privacy',
      question: 'How is my data protected?',
      answer: 'We use industry-standard encryption, secure authentication, and comply with GDPR. Your payment information is handled by Stripe and never stored on our servers.'
    },
  ];

  const filteredFAQs = searchQuery 
    ? faqs.filter(faq => 
        faq.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
        faq.answer.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : faqs;

  return (
    <DashboardLayout>
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Header */}
          <div className="text-center mb-12">
            <div className="flex items-center justify-center mb-4">
              <HelpCircle className="h-12 w-12 text-primary" />
            </div>
            <h1 className="text-4xl font-bold mb-4 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Help & Support
            </h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Find answers to common questions or get in touch with our support team
            </p>
          </div>

          {/* Search */}
          <div className="mb-8 max-w-2xl mx-auto">
            <div className="relative">
              <Search className="absolute left-3 top-3 h-5 w-5 text-muted-foreground" />
              <Input
                type="text"
                placeholder="Search for help..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 h-12 text-lg"
                data-testid="input-help-search"
              />
            </div>
          </div>

          {/* Quick Actions */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
            <Card className="hover:shadow-lg transition-shadow cursor-pointer">
              <CardHeader>
                <MessageCircle className="h-8 w-8 text-blue-600 mb-2" />
                <CardTitle>Live Chat</CardTitle>
                <CardDescription>Chat with our support team</CardDescription>
              </CardHeader>
              <CardContent>
                <Button className="w-full" data-testid="button-live-chat">
                  Start Chat
                </Button>
              </CardContent>
            </Card>

            <Card className="hover:shadow-lg transition-shadow cursor-pointer">
              <CardHeader>
                <Mail className="h-8 w-8 text-purple-600 mb-2" />
                <CardTitle>Email Support</CardTitle>
                <CardDescription>Get help via email</CardDescription>
              </CardHeader>
              <CardContent>
                <Button variant="outline" className="w-full" data-testid="button-email-support">
                  support@lifeceo.com
                </Button>
              </CardContent>
            </Card>

            <Card className="hover:shadow-lg transition-shadow cursor-pointer">
              <CardHeader>
                <Book className="h-8 w-8 text-green-600 mb-2" />
                <CardTitle>Documentation</CardTitle>
                <CardDescription>Browse our guides</CardDescription>
              </CardHeader>
              <CardContent>
                <Button variant="outline" className="w-full" data-testid="button-docs">
                  View Docs
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* FAQ Categories */}
          <div className="mb-8">
            <h2 className="text-2xl font-bold mb-6">Browse by Category</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4">
              {faqCategories.map((category) => {
                const Icon = category.icon;
                return (
                  <button
                    key={category.id}
                    className="flex flex-col items-center gap-2 p-4 rounded-lg border bg-card hover:bg-accent hover:text-accent-foreground transition-colors"
                    data-testid={`button-category-${category.id}`}
                  >
                    <Icon className="h-6 w-6" />
                    <span className="text-sm text-center">{category.name}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* FAQ Accordion */}
          <div>
            <h2 className="text-2xl font-bold mb-6">
              {searchQuery ? 'Search Results' : 'Frequently Asked Questions'}
            </h2>
            
            {filteredFAQs.length === 0 ? (
              <Card>
                <CardContent className="py-12 text-center">
                  <p className="text-muted-foreground">
                    No results found for "{searchQuery}". Try a different search term.
                  </p>
                </CardContent>
              </Card>
            ) : (
              <Accordion type="single" collapsible className="space-y-4">
                {filteredFAQs.map((faq, index) => (
                  <AccordionItem
                    key={index}
                    value={`item-${index}`}
                    className="border rounded-lg px-6 bg-card"
                  >
                    <AccordionTrigger className="hover:no-underline">
                      <div className="flex items-start gap-3 text-left">
                        <HelpCircle className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                        <span className="font-medium">{faq.question}</span>
                      </div>
                    </AccordionTrigger>
                    <AccordionContent className="pl-8 pt-2 text-muted-foreground">
                      {faq.answer}
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            )}
          </div>

          {/* Contact Section */}
          <Card className="mt-12 bg-gradient-to-r from-blue-600 to-purple-600 text-white">
            <CardContent className="py-12 text-center">
              <h3 className="text-2xl font-bold mb-4">Still need help?</h3>
              <p className="text-lg mb-6 opacity-90">
                Our support team is here to help you 24/7
              </p>
              <div className="flex gap-4 justify-center flex-wrap">
                <Button variant="secondary" size="lg" data-testid="button-contact-support">
                  Contact Support
                </Button>
                <Button variant="outline" size="lg" className="bg-white/10 border-white/20 hover:bg-white/20 text-white" data-testid="button-community-forum">
                  Community Forum
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default HelpSupport;
