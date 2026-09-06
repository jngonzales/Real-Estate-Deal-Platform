'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import {
  Bell,
  Mail,
  Smartphone,
  MessageSquare,
  TrendingUp,
  AlertCircle,
  CheckCircle,
  Save,
  Loader2,
} from '@/components/ui/icons';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

interface NotificationSettings {
  // Email notifications
  emailEnabled: boolean;
  emailDigestFrequency: 'realtime' | 'daily' | 'weekly' | 'never';
  emailNewDeals: boolean;
  emailDealUpdates: boolean;
  emailDealClosed: boolean;
  emailDealLost: boolean;
  emailComments: boolean;
  emailAssignments: boolean;
  
  // Push notifications
  pushEnabled: boolean;
  pushNewDeals: boolean;
  pushDealUpdates: boolean;
  pushComments: boolean;
  pushAlerts: boolean;
  
  // In-app notifications
  inAppEnabled: boolean;
  inAppNewDeals: boolean;
  inAppDealUpdates: boolean;
  inAppComments: boolean;
  inAppAlerts: boolean;
  
  // Alert thresholds
  alertHighScoreThreshold: number;
  alertLowScoreThreshold: number;
  alertPriceDropEnabled: boolean;
  alertPriceDropPercent: number;
}

interface NotificationPreferencesProps {
  settings: NotificationSettings;
  onSave?: (settings: NotificationSettings) => Promise<void>;
  className?: string;
}

const DEFAULT_SETTINGS: NotificationSettings = {
  emailEnabled: true,
  emailDigestFrequency: 'daily',
  emailNewDeals: true,
  emailDealUpdates: true,
  emailDealClosed: true,
  emailDealLost: false,
  emailComments: true,
  emailAssignments: true,
  
  pushEnabled: true,
  pushNewDeals: true,
  pushDealUpdates: false,
  pushComments: true,
  pushAlerts: true,
  
  inAppEnabled: true,
  inAppNewDeals: true,
  inAppDealUpdates: true,
  inAppComments: true,
  inAppAlerts: true,
  
  alertHighScoreThreshold: 80,
  alertLowScoreThreshold: 30,
  alertPriceDropEnabled: true,
  alertPriceDropPercent: 10,
};

export function NotificationPreferences({
  settings: initialSettings,
  onSave,
  className,
}: NotificationPreferencesProps) {
  const [settings, setSettings] = useState<NotificationSettings>({
    ...DEFAULT_SETTINGS,
    ...initialSettings,
  });
  const [isSaving, setIsSaving] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);

  const updateSetting = <K extends keyof NotificationSettings>(
    key: K,
    value: NotificationSettings[K]
  ) => {
    setSettings(prev => ({ ...prev, [key]: value }));
    setHasChanges(true);
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await onSave?.(settings);
      toast.success('Notification preferences saved');
      setHasChanges(false);
    } catch {
      toast.error('Failed to save preferences');
    } finally {
      setIsSaving(false);
    }
  };

  const handleReset = () => {
    setSettings(DEFAULT_SETTINGS);
    setHasChanges(true);
  };

  return (
    <Card className={cn('min-w-0 rounded-lg shadow-none', className)}>
      <CardHeader>
        <div className="flex min-w-0 flex-wrap items-center justify-between gap-2">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Bell className="h-5 w-5" />
              Notification Preferences
            </CardTitle>
            <CardDescription>
              Manage how and when you receive notifications
            </CardDescription>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button variant="outline" size="sm" className="min-h-11" onClick={handleReset}>
              Reset
            </Button>
            <Button
              size="sm"
              className="min-h-11"
              onClick={handleSave}
              disabled={!hasChanges || isSaving}
            >
              {isSaving ? (
                <Loader2 className="h-4 w-4 motion-safe:animate-spin me-2" />
              ) : (
                <Save className="h-4 w-4 mr-2" />
              )}
              Save Changes
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Email Notifications */}
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <Mail className="h-5 w-5 text-muted-foreground" />
            <h3 className="font-medium">Email Notifications</h3>
          </div>
          
          <div className="flex min-w-0 flex-wrap items-center justify-between gap-2">
            <div>
              <Label htmlFor="emailEnabled">Enable email notifications</Label>
              <p className="text-xs text-muted-foreground">
                Receive notifications via email
              </p>
            </div>
            <Switch
              id="emailEnabled"
              checked={settings.emailEnabled}
              onCheckedChange={value => updateSetting('emailEnabled', value)}
            />
          </div>

          {settings.emailEnabled && (
            <div className="sm:ms-4 space-y-3">
              <div className="flex min-w-0 flex-wrap items-center justify-between gap-2">
                <Label htmlFor="emailDigest">Digest frequency</Label>
                <Select
                  value={settings.emailDigestFrequency}
                  onValueChange={value => updateSetting('emailDigestFrequency', value as NotificationSettings['emailDigestFrequency'])}
                >
                  <SelectTrigger id="emailDigest" className="min-h-11 w-full min-[380px]:w-32">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="realtime">Real-time</SelectItem>
                    <SelectItem value="daily">Daily</SelectItem>
                    <SelectItem value="weekly">Weekly</SelectItem>
                    <SelectItem value="never">Never</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="grid gap-3 sm:grid-cols-2">
                <SettingToggle
                  label="New deals"
                  checked={settings.emailNewDeals}
                  onChange={value => updateSetting('emailNewDeals', value)}
                />
                <SettingToggle
                  label="Deal updates"
                  checked={settings.emailDealUpdates}
                  onChange={value => updateSetting('emailDealUpdates', value)}
                />
                <SettingToggle
                  label="Deal closed"
                  checked={settings.emailDealClosed}
                  onChange={value => updateSetting('emailDealClosed', value)}
                />
                <SettingToggle
                  label="Deal lost"
                  checked={settings.emailDealLost}
                  onChange={value => updateSetting('emailDealLost', value)}
                />
                <SettingToggle
                  label="Comments"
                  checked={settings.emailComments}
                  onChange={value => updateSetting('emailComments', value)}
                />
                <SettingToggle
                  label="Assignments"
                  checked={settings.emailAssignments}
                  onChange={value => updateSetting('emailAssignments', value)}
                />
              </div>
            </div>
          )}
        </div>

        <Separator />

        {/* Push Notifications */}
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <Smartphone className="h-5 w-5 text-muted-foreground" />
            <h3 className="font-medium">Push Notifications</h3>
          </div>
          
          <div className="flex min-w-0 flex-wrap items-center justify-between gap-2">
            <div>
              <Label htmlFor="pushEnabled">Enable push notifications</Label>
              <p className="text-xs text-muted-foreground">
                Receive browser/mobile push notifications
              </p>
            </div>
            <Switch
              id="pushEnabled"
              checked={settings.pushEnabled}
              onCheckedChange={value => updateSetting('pushEnabled', value)}
            />
          </div>

          {settings.pushEnabled && (
            <div className="sm:ms-4 grid gap-3 sm:grid-cols-2">
              <SettingToggle
                label="New deals"
                checked={settings.pushNewDeals}
                onChange={value => updateSetting('pushNewDeals', value)}
              />
              <SettingToggle
                label="Deal updates"
                checked={settings.pushDealUpdates}
                onChange={value => updateSetting('pushDealUpdates', value)}
              />
              <SettingToggle
                label="Comments"
                checked={settings.pushComments}
                onChange={value => updateSetting('pushComments', value)}
              />
              <SettingToggle
                label="Important alerts"
                checked={settings.pushAlerts}
                onChange={value => updateSetting('pushAlerts', value)}
              />
            </div>
          )}
        </div>

        <Separator />

        {/* In-App Notifications */}
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <MessageSquare className="h-5 w-5 text-muted-foreground" />
            <h3 className="font-medium">In-App Notifications</h3>
          </div>
          
          <div className="flex min-w-0 flex-wrap items-center justify-between gap-2">
            <div>
              <Label htmlFor="inAppEnabled">Enable in-app notifications</Label>
              <p className="text-xs text-muted-foreground">
                Show notifications within the application
              </p>
            </div>
            <Switch
              id="inAppEnabled"
              checked={settings.inAppEnabled}
              onCheckedChange={value => updateSetting('inAppEnabled', value)}
            />
          </div>

          {settings.inAppEnabled && (
            <div className="sm:ms-4 grid gap-3 sm:grid-cols-2">
              <SettingToggle
                label="New deals"
                checked={settings.inAppNewDeals}
                onChange={value => updateSetting('inAppNewDeals', value)}
              />
              <SettingToggle
                label="Deal updates"
                checked={settings.inAppDealUpdates}
                onChange={value => updateSetting('inAppDealUpdates', value)}
              />
              <SettingToggle
                label="Comments"
                checked={settings.inAppComments}
                onChange={value => updateSetting('inAppComments', value)}
              />
              <SettingToggle
                label="System alerts"
                checked={settings.inAppAlerts}
                onChange={value => updateSetting('inAppAlerts', value)}
              />
            </div>
          )}
        </div>

        <Separator />

        {/* Smart Alerts */}
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-muted-foreground" />
            <h3 className="font-medium">Smart Alerts</h3>
          </div>
          
          <div className="space-y-4">
            <div className="flex min-w-0 flex-wrap items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-green-500" />
                <div>
                  <Label htmlFor="high-score-alert">High score alert</Label>
                  <p className="text-xs text-muted-foreground">
                    Notify when a deal scores above this threshold
                  </p>
                </div>
              </div>
              <Select
                value={settings.alertHighScoreThreshold.toString()}
                onValueChange={value => updateSetting('alertHighScoreThreshold', parseInt(value))}
              >
                <SelectTrigger id="high-score-alert" className="min-h-11 w-24">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {[70, 75, 80, 85, 90, 95].map(value => (
                    <SelectItem key={value} value={value.toString()}>
                      {value}+
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex min-w-0 flex-wrap items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <AlertCircle className="h-4 w-4 text-red-500" />
                <div>
                  <Label htmlFor="low-score-warning">Low score warning</Label>
                  <p className="text-xs text-muted-foreground">
                    Warn when a deal scores below this threshold
                  </p>
                </div>
              </div>
              <Select
                value={settings.alertLowScoreThreshold.toString()}
                onValueChange={value => updateSetting('alertLowScoreThreshold', parseInt(value))}
              >
                <SelectTrigger id="low-score-warning" className="min-h-11 w-24">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {[20, 25, 30, 35, 40, 50].map(value => (
                    <SelectItem key={value} value={value.toString()}>
                      &lt;{value}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex min-w-0 flex-wrap items-center justify-between gap-2">
              <div>
                <Label htmlFor="priceDropEnabled">Price drop alerts</Label>
                <p className="text-xs text-muted-foreground">
                  Notify when asking price drops significantly
                </p>
              </div>
              <div className="flex items-center gap-2">
                <Select
                  value={settings.alertPriceDropPercent.toString()}
                  onValueChange={value => updateSetting('alertPriceDropPercent', parseInt(value))}
                  disabled={!settings.alertPriceDropEnabled}
                >
                  <SelectTrigger aria-label="Price drop threshold" className="min-h-11 w-20">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {[5, 10, 15, 20, 25].map(value => (
                      <SelectItem key={value} value={value.toString()}>
                        {value}%
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Switch
                  id="priceDropEnabled"
                  checked={settings.alertPriceDropEnabled}
                  onCheckedChange={value => updateSetting('alertPriceDropEnabled', value)}
                />
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

// Helper component for toggle settings
function SettingToggle({
  label,
  checked,
  onChange,
  className,
}: {
  label: string;
  checked: boolean;
  onChange: (value: boolean) => void;
  className?: string;
}) {
  return (
    <div className={cn('flex min-h-11 items-center justify-between gap-2', className)}>
      <span className="text-sm">{label}</span>
      <Switch aria-label={label} checked={checked} onCheckedChange={onChange} />
    </div>
  );
}

// Export default settings for initialization
export { DEFAULT_SETTINGS as defaultNotificationSettings };
