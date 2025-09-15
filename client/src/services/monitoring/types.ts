/**
 * ESA Life CEO 61x21 - Monitoring Types
 */

export interface PrivacyConfig {
  maskTextContent?: boolean;
  maskInputContent?: boolean;
  maskEmails?: boolean;
  maskPhoneNumbers?: boolean;
  blockClass?: string;
  ignoreClass?: string;
  maskTextClass?: string;
  maskTextSelector?: string;
  blockSelector?: string;
  ignoreSelector?: string;
  captureNetwork?: boolean;
  captureConsole?: boolean;
}

export interface MonitoringConfig {
  projectKey?: string;
  apiKey?: string;
  ingestPoint?: string;
  apiHost?: string;
  privacy?: PrivacyConfig;
}

export interface UserTraits {
  id?: string;
  email?: string;
  name?: string;
  role?: string;
  plan?: string;
  createdAt?: Date;
  customTraits?: Record<string, any>;
}

export interface EventProperties {
  category?: string;
  label?: string;
  value?: number;
  revenue?: number;
  currency?: string;
  [key: string]: any;
}

export interface SessionData {
  sessionId: string;
  userId?: string;
  startTime: Date;
  duration?: number;
  pageViews?: number;
  events?: number;
}

export interface RageClickEvent {
  selector: string;
  count: number;
  timestamp: Date;
  position: { x: number; y: number };
}

export interface FeatureFlag {
  name: string;
  variant: boolean | string;
  payload?: any;
}

export interface ConsentState {
  analytics: boolean;
  sessionRecording: boolean;
  errorTracking: boolean;
  timestamp: Date;
}

export interface FunnelStep {
  name: string;
  url?: string;
  selector?: string;
  properties?: Record<string, any>;
}

export interface AgentInteraction {
  agentName: string;
  action: string;
  timestamp: Date;
  duration?: number;
  success?: boolean;
  metadata?: Record<string, any>;
}