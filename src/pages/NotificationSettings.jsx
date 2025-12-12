import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Bell, Save } from 'lucide-react';
import { motion } from 'framer-motion';

export default function NotificationSettings() {
  const [user, setUser] = useState(null);
  const queryClient = useQueryClient();

  useEffect(() => {
    loadUser();
  }, []);

  const loadUser = async () => {
    try {
      const currentUser = await base44.auth.me();
      setUser(currentUser);
    } catch (error) {
      console.error('Error loading user:', error);
    }
  };

  const { data: preferences } = useQuery({
    queryKey: ['notification-preferences', user?.email],
    queryFn: async () => {
      const prefs = await base44.entities.NotificationPreference.filter({ user_email: user.email });
      if (prefs && prefs.length > 0) {
        return prefs[0];
      }
      return null;
    },
    enabled: !!user
  });

  const [settings, setSettings] = useState({
    enrollment_notifications: true,
    enrollment_status_changes: true,
    grade_updates: true,
    attendance_updates: true,
    event_reminders: true,
    announcements: true,
    assignment_reminders: true
  });

  useEffect(() => {
    if (preferences) {
      setSettings({
        enrollment_notifications: preferences.enrollment_notifications ?? true,
        enrollment_status_changes: preferences.enrollment_status_changes ?? true,
        grade_updates: preferences.grade_updates ?? true,
        attendance_updates: preferences.attendance_updates ?? true,
        event_reminders: preferences.event_reminders ?? true,
        announcements: preferences.announcements ?? true,
        assignment_reminders: preferences.assignment_reminders ?? true
      });
    }
  }, [preferences]);

  const saveMutation = useMutation({
    mutationFn: async (data) => {
      if (preferences) {
        return base44.entities.NotificationPreference.update(preferences.id, data);
      } else {
        return base44.entities.NotificationPreference.create({ ...data, user_email: user.email });
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notification-preferences'] });
      alert('Notification preferences saved successfully!');
    }
  });

  const handleSave = () => {
    saveMutation.mutate(settings);
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-pink-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-purple-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <div className="text-gray-600">Loading...</div>
        </div>
      </div>
    );
  }

  const notificationOptions = [
    {
      key: 'enrollment_notifications',
      title: 'New Enrollments',
      description: 'Get notified when students enroll in courses',
      adminOnly: true
    },
    {
      key: 'enrollment_status_changes',
      title: 'Enrollment Status Changes',
      description: 'Get notified when enrollment status changes',
      adminOnly: false
    },
    {
      key: 'grade_updates',
      title: 'Grade Updates',
      description: 'Get notified when new grades are posted',
      adminOnly: false
    },
    {
      key: 'attendance_updates',
      title: 'Attendance Updates',
      description: 'Get notified about attendance changes',
      adminOnly: false
    },
    {
      key: 'event_reminders',
      title: 'Event Reminders',
      description: 'Get notified about upcoming events',
      adminOnly: false
    },
    {
      key: 'announcements',
      title: 'Announcements',
      description: 'Get notified about important announcements',
      adminOnly: false
    },
    {
      key: 'assignment_reminders',
      title: 'Assignment Reminders',
      description: 'Get notified about assignment deadlines',
      adminOnly: false
    }
  ];

  const filteredOptions = notificationOptions.filter(option => 
    !option.adminOnly || user.role === 'admin'
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-pink-50 p-6">
      <div className="max-w-4xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex items-center gap-4 mb-2">
            <Bell className="w-10 h-10 text-purple-600" />
            <div>
              <h1 className="text-4xl font-bold text-gray-900">Notification Settings</h1>
              <p className="text-gray-600 mt-1">Manage your notification preferences</p>
            </div>
          </div>
        </motion.div>

        <Card className="shadow-xl">
          <CardHeader className="border-b bg-gradient-to-r from-purple-50 to-blue-50">
            <CardTitle>Configure Notifications</CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <div className="space-y-6">
              {filteredOptions.map((option) => (
                <div key={option.key} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div className="flex-1">
                    <Label htmlFor={option.key} className="text-base font-semibold text-gray-900 cursor-pointer">
                      {option.title}
                    </Label>
                    <p className="text-sm text-gray-600 mt-1">{option.description}</p>
                  </div>
                  <Switch
                    id={option.key}
                    checked={settings[option.key]}
                    onCheckedChange={(checked) => setSettings({ ...settings, [option.key]: checked })}
                  />
                </div>
              ))}
            </div>

            <div className="flex justify-end mt-8">
              <Button
                onClick={handleSave}
                disabled={saveMutation.isPending}
                className="bg-gradient-to-r from-purple-600 to-blue-600"
              >
                <Save className="w-4 h-4 mr-2" />
                {saveMutation.isPending ? 'Saving...' : 'Save Preferences'}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}