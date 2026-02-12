import { useState } from 'react';
import { useGetAutoReset, useSetAutoReset, useGetNotificationsEnabled, useSetNotificationsEnabled } from '../hooks/useQueries';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Bell, RotateCcw, Info, BellOff } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { toast } from 'sonner';

export default function SettingsView() {
  const { data: autoReset = false, isLoading: autoResetLoading } = useGetAutoReset();
  const { data: notificationsEnabled = false, isLoading: notificationsLoading } = useGetNotificationsEnabled();
  const { mutate: setAutoReset } = useSetAutoReset();
  const { mutate: setNotificationsEnabled } = useSetNotificationsEnabled();
  const [browserPermission, setBrowserPermission] = useState<NotificationPermission>(
    typeof Notification !== 'undefined' ? Notification.permission : 'default'
  );

  const handleAutoResetChange = (checked: boolean) => {
    setAutoReset(checked);
  };

  const handleNotificationsChange = (checked: boolean) => {
    if (checked && browserPermission !== 'granted') {
      toast.error('Please enable browser notifications first');
      return;
    }
    setNotificationsEnabled(checked);
  };

  const requestNotificationPermission = async () => {
    if (!('Notification' in window)) {
      toast.error('Notifications are not supported in this browser');
      return;
    }

    try {
      const permission = await Notification.requestPermission();
      setBrowserPermission(permission);
      
      if (permission === 'granted') {
        toast.success('Notification permissions granted!');
        // Automatically enable notifications in settings
        setNotificationsEnabled(true);
      } else if (permission === 'denied') {
        toast.error('Notification permissions denied. Please enable them in your browser settings.');
      }
    } catch (error) {
      toast.error('Failed to request notification permissions');
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold mb-2">Settings</h2>
        <p className="text-muted-foreground">Customize your daily routine experience</p>
      </div>

      {/* Notifications */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Bell className="h-5 w-5" />
            <CardTitle>Notifications & Reminders</CardTitle>
          </div>
          <CardDescription>Manage your task reminders and browser notifications</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Browser Permission Status */}
          <Alert>
            <Info className="h-4 w-4" />
            <AlertDescription>
              Browser notifications are currently{' '}
              <strong>
                {browserPermission === 'granted' ? 'enabled' : browserPermission === 'denied' ? 'blocked' : 'not enabled'}
              </strong>
              .
              {browserPermission === 'denied' && ' Please enable them in your browser settings to receive reminders.'}
              {browserPermission === 'default' && ' Click the button below to enable notifications.'}
            </AlertDescription>
          </Alert>

          {/* Request Permission Button */}
          {browserPermission !== 'granted' && (
            <div className="flex items-center justify-between p-4 border rounded-lg">
              <div className="space-y-0.5">
                <Label className="text-base">Browser Notification Permission</Label>
                <p className="text-sm text-muted-foreground">
                  Allow this app to send you browser notifications
                </p>
              </div>
              <Button onClick={requestNotificationPermission} variant="outline">
                <Bell className="h-4 w-4 mr-2" />
                Enable
              </Button>
            </div>
          )}

          {/* Enable/Disable Reminders */}
          <div className="flex items-center justify-between p-4 border rounded-lg">
            <div className="space-y-0.5">
              <Label htmlFor="notifications-enabled" className="text-base">
                Task Reminders
              </Label>
              <p className="text-sm text-muted-foreground">
                Receive notifications for tasks with reminder times
              </p>
            </div>
            <Switch
              id="notifications-enabled"
              checked={notificationsEnabled}
              onCheckedChange={handleNotificationsChange}
              disabled={notificationsLoading || browserPermission !== 'granted'}
            />
          </div>

          {notificationsEnabled && browserPermission === 'granted' && (
            <Alert className="bg-chart-1/10 border-chart-1/20">
              <Bell className="h-4 w-4 text-chart-1" />
              <AlertDescription className="text-chart-1">
                Reminders are active! You'll receive notifications for tasks with scheduled reminder times.
              </AlertDescription>
            </Alert>
          )}

          {!notificationsEnabled && (
            <Alert>
              <BellOff className="h-4 w-4" />
              <AlertDescription>
                Reminders are currently disabled. Enable them to receive notifications for your tasks.
              </AlertDescription>
            </Alert>
          )}

          <div className="pt-2 space-y-2">
            <p className="text-sm text-muted-foreground">
              Set reminder times for individual tasks to receive browser notifications. 
              Notifications will appear when it's time to complete your tasks.
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Auto Reset */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <RotateCcw className="h-5 w-5" />
            <CardTitle>Daily Reset</CardTitle>
          </div>
          <CardDescription>Automatically reset tasks at midnight</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="auto-reset" className="text-base">
                Auto-reset tasks
              </Label>
              <p className="text-sm text-muted-foreground">
                Uncheck all completed tasks at midnight each day
              </p>
            </div>
            <Switch
              id="auto-reset"
              checked={autoReset}
              onCheckedChange={handleAutoResetChange}
              disabled={autoResetLoading}
            />
          </div>

          <Alert>
            <Info className="h-4 w-4" />
            <AlertDescription>
              When enabled, all task completion statuses will be reset automatically at midnight, 
              giving you a fresh start each day. Your tasks and streaks will be preserved.
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>

      {/* About */}
      <Card>
        <CardHeader>
          <CardTitle>About</CardTitle>
          <CardDescription>Daily Routine Task App</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-start gap-3">
            <img src="/assets/generated/checkmark-success.dim_64x64.png" alt="Icon" className="h-10 w-10" />
            <div className="space-y-1">
              <p className="text-sm font-medium">Version 1.0.0</p>
              <p className="text-sm text-muted-foreground">
                Build better habits and track your daily progress with ease.
              </p>
            </div>
          </div>
          
          <div className="pt-4 border-t">
            <p className="text-xs text-muted-foreground">
              Your data is securely stored on the Internet Computer blockchain, 
              ensuring privacy and decentralization.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
