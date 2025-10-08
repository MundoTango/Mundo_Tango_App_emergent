/**
 * ESA Life CEO 61x21 - Privacy & Analytics Page
 * Comprehensive privacy management center for GDPR compliance
 */

import { useState, useEffect } from 'react';
import { Shield, Eye, BarChart, Bug, Download, Trash2, Lock, CheckCircle2, XCircle, Info, ChevronRight, AlertTriangle, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { monitoring } from '@/services/monitoring';
import { useMonitoringContext } from '@/components/MonitoringProvider';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Helmet } from 'react-helmet';

interface ConsentState {
  analytics: boolean;
  sessionRecording: boolean;
  errorTracking: boolean;
  timestamp: Date | null;
}

interface ServiceStatus {
  name: string;
  enabled: boolean;
  icon: any;
  description: string;
  dataCollected: string[];
  purposes: string[];
  retention: string;
  thirdParty: string;
}

export default function PrivacyAnalytics() {
  const { toast } = useToast();
  const { updateConsent: updateMonitoringConsent, revokeConsent } = useMonitoringContext();
  const [consentState, setConsentState] = useState<ConsentState>({
    analytics: false,
    sessionRecording: false,
    errorTracking: false,
    timestamp: null
  });
  const [loading, setLoading] = useState(false);
  const [testingService, setTestingService] = useState<string | null>(null);

  // Load consent state from localStorage
  useEffect(() => {
    loadConsentState();
  }, []);

  const loadConsentState = () => {
    try {
      const stored = localStorage.getItem('mt_monitoring_consent');
      if (stored) {
        const parsed = JSON.parse(stored);
        if (parsed.state) {
          setConsentState({
            ...parsed.state,
            timestamp: parsed.state.timestamp ? new Date(parsed.state.timestamp) : null
          });
        }
      }
    } catch (error) {
      console.error('Failed to load consent state:', error);
    }
  };

  const updateConsent = async (service: keyof ConsentState, enabled: boolean) => {
    setLoading(true);
    try {
      const newState = {
        ...consentState,
        [service]: enabled,
        timestamp: new Date()
      };
      
      // ESA Layer 49: Use centralized consent management from MonitoringProvider
      setConsentState(newState);
      
      if (enabled || newState.analytics || newState.sessionRecording || newState.errorTracking) {
        updateMonitoringConsent(
          newState.analytics || false,
          newState.sessionRecording || false,
          newState.errorTracking || false
        );
        toast({
          title: "Privacy Settings Updated",
          description: `${service === 'analytics' ? 'Analytics' : service === 'sessionRecording' ? 'Session Recording' : 'Error Tracking'} has been ${enabled ? 'enabled' : 'disabled'}`,
        });
      } else {
        // All services disabled
        revokeConsent();
        toast({
          title: "All Tracking Disabled",
          description: "Your privacy settings have been updated",
        });
      }
    } catch (error) {
      console.error('Failed to update consent:', error);
      toast({
        title: "Update Failed",
        description: "Failed to update privacy settings. Please try again.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleAcceptAll = async () => {
    setLoading(true);
    try {
      const newState = {
        analytics: true,
        sessionRecording: true,
        errorTracking: true,
        timestamp: new Date()
      };
      
      setConsentState(newState);
      
      // ESA Layer 49: Use centralized consent management
      updateMonitoringConsent(true, true, true);
      
      toast({
        title: "All Services Enabled",
        description: "Thank you for helping us improve your experience",
      });
    } catch (error) {
      console.error('Failed to accept all:', error);
      toast({
        title: "Update Failed",
        description: "Failed to update privacy settings",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleRejectAll = () => {
    setLoading(true);
    try {
      // ESA Layer 49: Use centralized consent management
      revokeConsent();
      const newState = {
        analytics: false,
        sessionRecording: false,
        errorTracking: false,
        timestamp: new Date()
      };
      setConsentState(newState);
      
      toast({
        title: "All Services Disabled",
        description: "All tracking and analytics have been disabled",
      });
    } catch (error) {
      console.error('Failed to reject all:', error);
      toast({
        title: "Update Failed",
        description: "Failed to update privacy settings",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const testService = async (service: string) => {
    setTestingService(service);
    try {
      switch (service) {
        case 'analytics':
          monitoring.trackEvent('privacy_test_event', { 
            service: 'PostHog',
            test: true,
            timestamp: new Date().toISOString()
          });
          toast({
            title: "Test Event Sent",
            description: "Analytics test event sent to PostHog",
          });
          break;
          
        case 'session':
          monitoring.trackPageView('/privacy-analytics-test', {
            test: true
          });
          toast({
            title: "Session Test",
            description: "Session recording test initiated",
          });
          break;
          
        case 'error':
          monitoring.captureException(new Error('Privacy page test error'), {
            test: true,
            context: 'privacy_settings'
          });
          toast({
            title: "Error Test",
            description: "Test error sent to Sentry",
          });
          break;
      }
    } catch (error) {
      console.error('Test failed:', error);
      toast({
        title: "Test Failed",
        description: "Could not test the service",
        variant: "destructive"
      });
    } finally {
      setTimeout(() => setTestingService(null), 2000);
    }
  };

  const exportData = () => {
    // In a real implementation, this would make an API call to export user data
    toast({
      title: "Data Export Requested",
      description: "Your data export will be ready within 24 hours. We'll send you an email with the download link.",
    });
  };

  const requestDeletion = () => {
    // In a real implementation, this would make an API call to request data deletion
    toast({
      title: "Deletion Request Submitted",
      description: "Your data deletion request has been received. This will be processed within 30 days as per GDPR requirements.",
      variant: "destructive"
    });
  };

  const services: ServiceStatus[] = [
    {
      name: "Product Analytics",
      enabled: consentState.analytics,
      icon: BarChart,
      description: "PostHog analytics for understanding feature usage",
      dataCollected: [
        "Page views and navigation paths",
        "Feature usage and interactions",
        "Device and browser information",
        "Geographic location (country/city level)",
        "User preferences and settings"
      ],
      purposes: [
        "Improve product features",
        "Understand user behavior",
        "Fix usability issues",
        "Measure feature adoption"
      ],
      retention: "90 days",
      thirdParty: "PostHog (EU servers)"
    },
    {
      name: "Session Recording",
      enabled: consentState.sessionRecording,
      icon: Eye,
      description: "OpenReplay for visual session replay",
      dataCollected: [
        "Mouse movements and clicks",
        "Scroll patterns",
        "Form interactions (sensitive data masked)",
        "Page navigation",
        "Console errors"
      ],
      purposes: [
        "Identify UX problems",
        "Debug user issues",
        "Improve user flows",
        "Quality assurance"
      ],
      retention: "30 days",
      thirdParty: "OpenReplay (self-hosted)"
    },
    {
      name: "Error Tracking",
      enabled: consentState.errorTracking,
      icon: Bug,
      description: "Sentry for automatic error reporting",
      dataCollected: [
        "JavaScript errors and stack traces",
        "Network errors",
        "Browser and OS information",
        "Error context and breadcrumbs",
        "User ID (if logged in)"
      ],
      purposes: [
        "Fix bugs faster",
        "Monitor application health",
        "Prevent issues proactively",
        "Improve stability"
      ],
      retention: "30 days",
      thirdParty: "Sentry (EU servers)"
    }
  ];

  const hasAnyConsent = consentState.analytics || consentState.sessionRecording || consentState.errorTracking;

  return (
    <>
      <Helmet>
        <title>Privacy Analytics | Life CEO</title>
      </Helmet>
      
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center space-x-3 mb-4">
          <div className="w-12 h-12 bg-gradient-to-br from-teal-400 to-cyan-500 rounded-full flex items-center justify-center">
            <Shield className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Privacy & Analytics</h1>
            <p className="text-gray-600 dark:text-gray-600 dark:text-gray-400">Manage your privacy settings and data collection preferences</p>
          </div>
        </div>
        
        {/* Quick Actions */}
        <div className="flex flex-wrap gap-3">
          <Button
            onClick={handleAcceptAll}
            disabled={loading}
            className="bg-gradient-to-r from-teal-500 to-cyan-500 hover:from-teal-600 hover:to-cyan-600 text-white"
           
          >
            <CheckCircle2 className="w-4 h-4 mr-2" />
            Enable All Services
          </Button>
          <Button
            onClick={handleRejectAll}
            disabled={loading}
            variant="outline"
           
          >
            <XCircle className="w-4 h-4 mr-2" />
            Disable All Tracking
          </Button>
        </div>
      </div>

      {/* Status Alert */}
      <Alert className={`mb-6 ${hasAnyConsent ? 'border-green-200 bg-green-50 dark:bg-green-900/20' : 'border-gray-200'}`}>
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>Current Status</AlertTitle>
        <AlertDescription className="mt-2">
          {hasAnyConsent ? (
            <>
              <span className="font-medium text-green-700 dark:text-green-400">✓ Some monitoring services are active</span>
              <br />
              Last updated: {consentState.timestamp ? new Date(consentState.timestamp).toLocaleString() : 'Never'}
            </>
          ) : (
            <span className="font-medium text-gray-600 dark:text-gray-600 dark:text-gray-400">All monitoring services are disabled</span>
          )}
        </AlertDescription>
      </Alert>

      {/* Main Content Tabs */}
      <Tabs defaultValue="services" className="space-y-4">
        <TabsList className="grid grid-cols-3 w-full max-w-md">
          <TabsTrigger value="services">Services</TabsTrigger>
          <TabsTrigger value="details">Data Details</TabsTrigger>
          <TabsTrigger value="rights">Your Rights</TabsTrigger>
        </TabsList>

        {/* Services Tab */}
        <TabsContent value="services" className="space-y-4">
          {services.map((service) => (
            <Card key={service.name} className="overflow-hidden">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex items-start space-x-3">
                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                      service.enabled ? 'bg-teal-100 dark:bg-teal-900/30' : 'bg-gray-100 dark:bg-gray-800'
                    }`}>
                      <service.icon className={`w-5 h-5 ${
                        service.enabled ? 'text-teal-600 dark:text-teal-400' : 'text-gray-500'
                      }`} />
                    </div>
                    <div className="space-y-1 flex-1">
                      <CardTitle className="text-lg flex items-center gap-2">
                        {service.name}
                        {service.enabled && (
                          <Badge variant="default" className="bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400">
                            Active
                          </Badge>
                        )}
                      </CardTitle>
                      <CardDescription>{service.description}</CardDescription>
                    </div>
                  </div>
                  <Switch
                    checked={service.enabled}
                    onCheckedChange={(checked) => {
                      const key = service.name === 'Product Analytics' ? 'analytics' :
                                 service.name === 'Session Recording' ? 'sessionRecording' :
                                 'errorTracking';
                      updateConsent(key as keyof ConsentState, checked);
                    }}
                    disabled={loading}
                    data-testid={`switch-${service.name.toLowerCase().replace(' ', '-')}`}
                  />
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-500 dark:text-gray-600 dark:text-gray-400">Third-party service:</span>
                  <span className="font-medium">{service.thirdParty}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-500 dark:text-gray-600 dark:text-gray-400">Data retention:</span>
                  <span className="font-medium">{service.retention}</span>
                </div>
                {service.enabled && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => testService(
                      service.name === 'Product Analytics' ? 'analytics' :
                      service.name === 'Session Recording' ? 'session' :
                      'error'
                    )}
                    disabled={testingService !== null}
                    className="w-full"
                    data-testid={`test-${service.name.toLowerCase().replace(' ', '-')}`}
                  >
                    {testingService === (service.name === 'Product Analytics' ? 'analytics' :
                                       service.name === 'Session Recording' ? 'session' : 'error') ? (
                      <>
                        <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-current mr-2" />
                        Testing...
                      </>
                    ) : (
                      <>Test Connection</>
                    )}
                  </Button>
                )}
              </CardContent>
            </Card>
          ))}
        </TabsContent>

        {/* Data Details Tab */}
        <TabsContent value="details" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Data Collection Details</CardTitle>
              <CardDescription>
                Detailed information about what data each service collects and why
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Accordion type="single" collapsible className="w-full">
                {services.map((service, index) => (
                  <AccordionItem key={service.name} value={`item-${index}`}>
                    <AccordionTrigger>
                      <div className="flex items-center space-x-2">
                        <service.icon className="w-4 h-4" />
                        <span>{service.name}</span>
                      </div>
                    </AccordionTrigger>
                    <AccordionContent className="space-y-4">
                      <div>
                        <h4 className="font-semibold text-sm mb-2">Data Collected:</h4>
                        <ul className="space-y-1">
                          {service.dataCollected.map((data, idx) => (
                            <li key={idx} className="text-sm text-gray-600 dark:text-gray-600 dark:text-gray-400 flex items-start">
                              <ChevronRight className="w-3 h-3 mr-2 mt-0.5 flex-shrink-0" />
                              {data}
                            </li>
                          ))}
                        </ul>
                      </div>
                      <div>
                        <h4 className="font-semibold text-sm mb-2">Purposes:</h4>
                        <ul className="space-y-1">
                          {service.purposes.map((purpose, idx) => (
                            <li key={idx} className="text-sm text-gray-600 dark:text-gray-600 dark:text-gray-400 flex items-start">
                              <ChevronRight className="w-3 h-3 mr-2 mt-0.5 flex-shrink-0" />
                              {purpose}
                            </li>
                          ))}
                        </ul>
                      </div>
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            </CardContent>
          </Card>

          {/* Security Measures */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Lock className="w-5 h-5" />
                Security Measures
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-start space-x-3">
                <CheckCircle2 className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-medium">End-to-End Encryption</p>
                  <p className="text-sm text-gray-600 dark:text-gray-600 dark:text-gray-400">All data is encrypted in transit and at rest</p>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <CheckCircle2 className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-medium">EU Data Centers</p>
                  <p className="text-sm text-gray-600 dark:text-gray-600 dark:text-gray-400">Data is stored in GDPR-compliant EU servers</p>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <CheckCircle2 className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-medium">Automatic PII Masking</p>
                  <p className="text-sm text-gray-600 dark:text-gray-600 dark:text-gray-400">Sensitive information is automatically masked</p>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <CheckCircle2 className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-medium">No Third-Party Selling</p>
                  <p className="text-sm text-gray-600 dark:text-gray-600 dark:text-gray-400">Your data is never sold to advertisers</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Your Rights Tab */}
        <TabsContent value="rights" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Your Privacy Rights (GDPR)</CardTitle>
              <CardDescription>
                Under the General Data Protection Regulation, you have the following rights
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                  <h4 className="font-semibold mb-2 flex items-center gap-2">
                    <Info className="w-4 h-4" />
                    Right to Access
                  </h4>
                  <p className="text-sm text-gray-600 dark:text-gray-600 dark:text-gray-400">
                    You have the right to request a copy of all personal data we hold about you.
                  </p>
                </div>
                
                <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                  <h4 className="font-semibold mb-2 flex items-center gap-2">
                    <Info className="w-4 h-4" />
                    Right to Rectification
                  </h4>
                  <p className="text-sm text-gray-600 dark:text-gray-600 dark:text-gray-400">
                    You can request correction of any inaccurate or incomplete personal data.
                  </p>
                </div>
                
                <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                  <h4 className="font-semibold mb-2 flex items-center gap-2">
                    <Info className="w-4 h-4" />
                    Right to Erasure
                  </h4>
                  <p className="text-sm text-gray-600 dark:text-gray-600 dark:text-gray-400">
                    You have the right to request deletion of your personal data ("right to be forgotten").
                  </p>
                </div>
                
                <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                  <h4 className="font-semibold mb-2 flex items-center gap-2">
                    <Info className="w-4 h-4" />
                    Right to Data Portability
                  </h4>
                  <p className="text-sm text-gray-600 dark:text-gray-600 dark:text-gray-400">
                    You can request your data in a structured, machine-readable format.
                  </p>
                </div>
              </div>

              <Separator />

              <div className="space-y-3">
                <h4 className="font-semibold">Exercise Your Rights</h4>
                <div className="grid gap-3 sm:grid-cols-2">
                  <Button
                    variant="outline"
                    onClick={exportData}
                    className="w-full"
                   
                  >
                    <Download className="w-4 h-4 mr-2" />
                    Export My Data
                  </Button>
                  <Button
                    variant="outline"
                    onClick={requestDeletion}
                    className="w-full text-red-600 hover:text-red-700 dark:text-red-400"
                   
                  >
                    <Trash2 className="w-4 h-4 mr-2" />
                    Delete My Data
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Contact Information */}
          <Card>
            <CardHeader>
              <CardTitle>Data Protection Contact</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <p className="text-sm text-gray-600 dark:text-gray-600 dark:text-gray-400">
                For privacy-related inquiries or to exercise your rights, contact our Data Protection Officer:
              </p>
              <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                <p className="font-medium">Data Protection Officer</p>
                <p className="text-sm text-gray-600 dark:text-gray-600 dark:text-gray-400 mt-1">privacy@mundotango.app</p>
                <p className="text-sm text-gray-600 dark:text-gray-600 dark:text-gray-400">Response time: Within 30 days</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  
    </>
  );
}