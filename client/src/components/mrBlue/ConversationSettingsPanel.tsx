/**
 * TRACK E: Conversation Settings Panel
 * MB.MD SIMULTANEOUS BUILD - Oct 23, 2025
 * Agent #126 (UI)
 * 
 * User preferences for conversations
 */

import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';
import {
  Settings,
  Bell,
  MessageSquare,
  Mic,
  Zap,
  Shield,
  Save,
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface ConversationSettings {
  // Notifications
  desktopNotifications: boolean;
  soundNotifications: boolean;
  emailDigest: 'never' | 'daily' | 'weekly';
  
  // Messages
  messageRetention: number; // days
  autoSaveMessages: boolean;
  showTimestamps: boolean;
  showModelBadges: boolean;
  
  // Voice
  autoSpeak: boolean;
  voiceSpeed: number;
  voiceVolume: number;
  muteOnStartup: boolean;
  
  // AI Behavior
  defaultModel: string;
  responseLength: 'concise' | 'balanced' | 'detailed';
  codeStyle: 'minimal' | 'documented' | 'verbose';
  
  // Privacy
  saveChatHistory: boolean;
  allowAnalytics: boolean;
  shareUsageData: boolean;
}

const DEFAULT_SETTINGS: ConversationSettings = {
  desktopNotifications: true,
  soundNotifications: false,
  emailDigest: 'never',
  messageRetention: 90,
  autoSaveMessages: true,
  showTimestamps: true,
  showModelBadges: true,
  autoSpeak: false,
  voiceSpeed: 1.0,
  voiceVolume: 80,
  muteOnStartup: false,
  defaultModel: 'gpt-4o',
  responseLength: 'balanced',
  codeStyle: 'documented',
  saveChatHistory: true,
  allowAnalytics: true,
  shareUsageData: false,
};

export function ConversationSettingsPanel() {
  const [settings, setSettings] = useState<ConversationSettings>(DEFAULT_SETTINGS);
  const [hasChanges, setHasChanges] = useState(false);
  const { toast } = useToast();

  const updateSetting = <K extends keyof ConversationSettings>(
    key: K,
    value: ConversationSettings[K]
  ) => {
    setSettings(prev => ({ ...prev, [key]: value }));
    setHasChanges(true);
  };

  const handleSave = async () => {
    try {
      // 🚀 STREAM E2: Save settings to backend
      await fetch('/api/user/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(settings)
      });
      
      toast({
        title: 'Settings saved',
        description: 'Your conversation preferences have been updated.',
      });
      
      setHasChanges(false);
    } catch (error) {
      toast({
        title: 'Failed to save settings',
        description: error instanceof Error ? error.message : 'Unknown error',
        variant: 'destructive'
      });
    }
  };

  const handleReset = () => {
    setSettings(DEFAULT_SETTINGS);
    setHasChanges(false);
    
    toast({
      title: 'Settings reset',
      description: 'All settings restored to defaults.',
    });
  };

  return (
    <div className="space-y-6 p-6 max-w-3xl">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2 mb-2">
          <Settings className="w-5 h-5" />
          <h2 className="text-xl font-semibold">Conversation Settings</h2>
        </div>
        <p className="text-sm text-gray-600 dark:text-gray-400">
          Customize how you interact with Mr Blue
        </p>
      </div>

      {/* Notifications */}
      <Card className="p-6">
        <div className="flex items-center gap-2 mb-4">
          <Bell className="w-4 h-4 text-purple-500" />
          <h3 className="font-semibold">Notifications</h3>
        </div>

        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <Label>Desktop Notifications</Label>
              <p className="text-xs text-gray-500">Get notified of new messages</p>
            </div>
            <Switch
              checked={settings.desktopNotifications}
              onCheckedChange={(v) => updateSetting('desktopNotifications', v)}
              data-testid="switch-desktop-notifications"
            />
          </div>

          <div className="flex items-center justify-between">
            <div>
              <Label>Sound Alerts</Label>
              <p className="text-xs text-gray-500">Play sound for notifications</p>
            </div>
            <Switch
              checked={settings.soundNotifications}
              onCheckedChange={(v) => updateSetting('soundNotifications', v)}
              data-testid="switch-sound-notifications"
            />
          </div>

          <div className="space-y-2">
            <Label>Email Digest</Label>
            <Select
              value={settings.emailDigest}
              onValueChange={(v) => updateSetting('emailDigest', v as any)}
            >
              <SelectTrigger data-testid="select-email-digest">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="never">Never</SelectItem>
                <SelectItem value="daily">Daily</SelectItem>
                <SelectItem value="weekly">Weekly</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </Card>

      {/* Messages */}
      <Card className="p-6">
        <div className="flex items-center gap-2 mb-4">
          <MessageSquare className="w-4 h-4 text-blue-500" />
          <h3 className="font-semibold">Messages</h3>
        </div>

        <div className="space-y-4">
          <div className="space-y-2">
            <Label>Message Retention (days)</Label>
            <Input
              type="number"
              value={settings.messageRetention}
              onChange={(e) => updateSetting('messageRetention', parseInt(e.target.value))}
              min={7}
              max={365}
              data-testid="input-message-retention"
            />
            <p className="text-xs text-gray-500">How long to keep messages (7-365 days)</p>
          </div>

          <div className="flex items-center justify-between">
            <div>
              <Label>Auto-save Messages</Label>
              <p className="text-xs text-gray-500">Automatically save conversations</p>
            </div>
            <Switch
              checked={settings.autoSaveMessages}
              onCheckedChange={(v) => updateSetting('autoSaveMessages', v)}
              data-testid="switch-auto-save"
            />
          </div>

          <div className="flex items-center justify-between">
            <div>
              <Label>Show Timestamps</Label>
              <p className="text-xs text-gray-500">Display message times</p>
            </div>
            <Switch
              checked={settings.showTimestamps}
              onCheckedChange={(v) => updateSetting('showTimestamps', v)}
              data-testid="switch-show-timestamps"
            />
          </div>

          <div className="flex items-center justify-between">
            <div>
              <Label>Show Model Badges</Label>
              <p className="text-xs text-gray-500">Display AI model used</p>
            </div>
            <Switch
              checked={settings.showModelBadges}
              onCheckedChange={(v) => updateSetting('showModelBadges', v)}
              data-testid="switch-show-model-badges"
            />
          </div>
        </div>
      </Card>

      {/* Voice */}
      <Card className="p-6">
        <div className="flex items-center gap-2 mb-4">
          <Mic className="w-4 h-4 text-purple-500" />
          <h3 className="font-semibold">Voice Settings</h3>
        </div>

        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <Label>Auto-speak Responses</Label>
              <p className="text-xs text-gray-500">Read AI responses aloud</p>
            </div>
            <Switch
              checked={settings.autoSpeak}
              onCheckedChange={(v) => updateSetting('autoSpeak', v)}
              data-testid="switch-auto-speak"
            />
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label>Voice Speed</Label>
              <span className="text-sm text-gray-500">{settings.voiceSpeed.toFixed(1)}x</span>
            </div>
            <Slider
              value={[settings.voiceSpeed]}
              onValueChange={(v) => updateSetting('voiceSpeed', v[0])}
              min={0.5}
              max={2.0}
              step={0.1}
              data-testid="slider-voice-speed"
            />
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label>Voice Volume</Label>
              <span className="text-sm text-gray-500">{settings.voiceVolume}%</span>
            </div>
            <Slider
              value={[settings.voiceVolume]}
              onValueChange={(v) => updateSetting('voiceVolume', v[0])}
              min={0}
              max={100}
              step={5}
              data-testid="slider-voice-volume"
            />
          </div>

          <div className="flex items-center justify-between">
            <div>
              <Label>Mute on Startup</Label>
              <p className="text-xs text-gray-500">Start voice sessions muted</p>
            </div>
            <Switch
              checked={settings.muteOnStartup}
              onCheckedChange={(v) => updateSetting('muteOnStartup', v)}
              data-testid="switch-mute-on-startup"
            />
          </div>
        </div>
      </Card>

      {/* AI Behavior */}
      <Card className="p-6">
        <div className="flex items-center gap-2 mb-4">
          <Zap className="w-4 h-4 text-yellow-500" />
          <h3 className="font-semibold">AI Behavior</h3>
        </div>

        <div className="space-y-4">
          <div className="space-y-2">
            <Label>Default Model</Label>
            <Select
              value={settings.defaultModel}
              onValueChange={(v) => updateSetting('defaultModel', v)}
            >
              <SelectTrigger data-testid="select-default-model">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="gpt-4o">GPT-4o (Fast, Smart)</SelectItem>
                <SelectItem value="claude-3-5-sonnet">Claude 3.5 Sonnet (Best)</SelectItem>
                <SelectItem value="gemini-pro">Gemini Pro (Multimodal)</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Response Length</Label>
            <Select
              value={settings.responseLength}
              onValueChange={(v) => updateSetting('responseLength', v as any)}
            >
              <SelectTrigger data-testid="select-response-length">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="concise">Concise</SelectItem>
                <SelectItem value="balanced">Balanced</SelectItem>
                <SelectItem value="detailed">Detailed</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Code Style</Label>
            <Select
              value={settings.codeStyle}
              onValueChange={(v) => updateSetting('codeStyle', v as any)}
            >
              <SelectTrigger data-testid="select-code-style">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="minimal">Minimal</SelectItem>
                <SelectItem value="documented">Documented</SelectItem>
                <SelectItem value="verbose">Verbose</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </Card>

      {/* Privacy */}
      <Card className="p-6">
        <div className="flex items-center gap-2 mb-4">
          <Shield className="w-4 h-4 text-green-500" />
          <h3 className="font-semibold">Privacy & Data</h3>
        </div>

        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <Label>Save Chat History</Label>
              <p className="text-xs text-gray-500">Store conversations on server</p>
            </div>
            <Switch
              checked={settings.saveChatHistory}
              onCheckedChange={(v) => updateSetting('saveChatHistory', v)}
              data-testid="switch-save-history"
            />
          </div>

          <div className="flex items-center justify-between">
            <div>
              <Label>Allow Analytics</Label>
              <p className="text-xs text-gray-500">Help improve features</p>
            </div>
            <Switch
              checked={settings.allowAnalytics}
              onCheckedChange={(v) => updateSetting('allowAnalytics', v)}
              data-testid="switch-allow-analytics"
            />
          </div>

          <div className="flex items-center justify-between">
            <div>
              <Label>Share Usage Data</Label>
              <p className="text-xs text-gray-500">Contribute to AI research</p>
            </div>
            <Switch
              checked={settings.shareUsageData}
              onCheckedChange={(v) => updateSetting('shareUsageData', v)}
              data-testid="switch-share-data"
            />
          </div>
        </div>
      </Card>

      {/* Actions */}
      <div className="flex items-center gap-3 pt-4">
        <Button
          onClick={handleSave}
          disabled={!hasChanges}
          className="flex-1"
          data-testid="button-save-settings"
        >
          <Save className="w-4 h-4 mr-2" />
          Save Changes
        </Button>
        <Button
          onClick={handleReset}
          variant="outline"
          data-testid="button-reset-settings"
        >
          Reset to Defaults
        </Button>
      </div>
    </div>
  );
}
