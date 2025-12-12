import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { MessageSquare, Bell, Calendar, FileText, User } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import MessageThread from '../components/communication/MessageThread';
import NotificationList from '../components/communication/NotificationList';
import EventCalendar from '../components/communication/EventCalendar';
import { motion } from 'framer-motion';

export default function ParentCommunication() {
  const [currentUser, setCurrentUser] = useState(null);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [selectedThread, setSelectedThread] = useState(null);
  const queryClient = useQueryClient();

  useEffect(() => {
    loadUser();
  }, []);

  const loadUser = async () => {
    const user = await base44.auth.me();
    setCurrentUser(user);
  };

  const { data: students = [] } = useQuery({
    queryKey: ['parent-students', currentUser?.email],
    queryFn: () => currentUser ? base44.entities.Student.filter({ parent_email: currentUser.email }) : [],
    enabled: !!currentUser
  });

  useEffect(() => {
    if (students.length > 0 && !selectedStudent) {
      setSelectedStudent(students[0]);
    }
  }, [students]);

  const { data: messages = [] } = useQuery({
    queryKey: ['messages-parent', currentUser?.id],
    queryFn: () => base44.entities.Message.filter({ recipient_id: currentUser.id }, '-created_date'),
    enabled: !!currentUser
  });

  const { data: notifications = [] } = useQuery({
    queryKey: ['notifications-parent', currentUser?.id],
    queryFn: () => base44.entities.Notification.filter({ user_id: currentUser.id }, '-created_date', 20),
    enabled: !!currentUser
  });

  const { data: events = [] } = useQuery({
    queryKey: ['events-parent', selectedStudent?.id],
    queryFn: async () => {
      const allEvents = await base44.entities.Event.filter({ all_parents: true }, '-start_date');
      const studentEvents = selectedStudent 
        ? await base44.entities.Event.filter({ student_id: selectedStudent.id }, '-start_date')
        : [];
      return [...allEvents, ...studentEvents];
    },
    enabled: !!selectedStudent
  });

  const { data: announcements = [] } = useQuery({
    queryKey: ['announcements-parent', selectedStudent?.id],
    queryFn: async () => {
      const all = await base44.entities.Announcement.filter({ target_audience: 'all_parents' }, '-created_date');
      const cohort = selectedStudent?.cohort_id 
        ? await base44.entities.Announcement.filter({ cohort_id: selectedStudent.cohort_id }, '-created_date')
        : [];
      return [...all, ...cohort];
    },
    enabled: !!selectedStudent
  });

  const sendMessageMutation = useMutation({
    mutationFn: async ({ recipientId, recipientName, content, subject }) => {
      return await base44.entities.Message.create({
        sender_id: currentUser.id,
        sender_name: currentUser.full_name,
        sender_role: "Parent",
        recipient_id: recipientId,
        recipient_name: recipientName,
        recipient_role: "Teacher",
        subject: subject || "Message from parent",
        content,
        student_id: selectedStudent?.id,
        thread_id: selectedThread || `thread-${Date.now()}`
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['messages-parent'] });
    }
  });

  const markReadMutation = useMutation({
    mutationFn: (notifId) => base44.entities.Notification.update(notifId, { read: true }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications-parent'] });
    }
  });

  const unreadNotifications = notifications.filter(n => !n.read).length;

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-pink-50 p-6">
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-purple-500 to-blue-600 flex items-center justify-center shadow-xl">
                <MessageSquare className="w-9 h-9 text-white" />
              </div>
              <div>
                <h1 className="text-4xl font-bold text-gray-900">Communication Hub</h1>
                <p className="text-gray-600 mt-1">Stay connected with teachers and school</p>
              </div>
            </div>

            {students.length > 1 && (
              <Select value={selectedStudent?.id} onValueChange={(id) => setSelectedStudent(students.find(s => s.id === id))}>
                <SelectTrigger className="w-64 bg-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {students.map(student => (
                    <SelectItem key={student.id} value={student.id}>
                      <User className="w-4 h-4 mr-2 inline" />
                      {student.full_name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          </div>
        </motion.div>

        <Tabs defaultValue="messages" className="space-y-6">
          <TabsList className="bg-white/80 backdrop-blur-sm shadow-lg">
            <TabsTrigger value="messages" className="gap-2">
              <MessageSquare className="w-4 h-4" />
              Messages
            </TabsTrigger>
            <TabsTrigger value="notifications" className="gap-2">
              <Bell className="w-4 h-4" />
              Notifications
              {unreadNotifications > 0 && (
                <span className="ml-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                  {unreadNotifications}
                </span>
              )}
            </TabsTrigger>
            <TabsTrigger value="calendar" className="gap-2">
              <Calendar className="w-4 h-4" />
              Calendar
            </TabsTrigger>
            <TabsTrigger value="announcements" className="gap-2">
              <FileText className="w-4 h-4" />
              Announcements
            </TabsTrigger>
          </TabsList>

          <TabsContent value="messages">
            <MessageThread
              messages={messages}
              currentUserId={currentUser?.id}
              onSendMessage={(content) => {
                // For now, sending to a generic teacher - can enhance with teacher selection
                sendMessageMutation.mutate({
                  recipientId: "teacher-id",
                  recipientName: "Teacher",
                  content
                });
              }}
            />
          </TabsContent>

          <TabsContent value="notifications">
            <NotificationList
              notifications={notifications}
              onMarkRead={(id) => markReadMutation.mutate(id)}
              onNotificationClick={(notif) => {
                if (notif.link) window.location.href = notif.link;
                if (!notif.read) markReadMutation.mutate(notif.id);
              }}
            />
          </TabsContent>

          <TabsContent value="calendar">
            <EventCalendar
              events={events}
              onEventClick={(event) => console.log('Event clicked:', event)}
            />
          </TabsContent>

          <TabsContent value="announcements">
            <div className="space-y-4">
              {announcements.map(ann => (
                <Card key={ann.id} className={`shadow-lg ${ann.pinned ? 'border-2 border-purple-400' : ''}`}>
                  <CardHeader className="border-b">
                    <CardTitle className="flex items-center justify-between">
                      <span>{ann.title}</span>
                      {ann.pinned && (
                        <span className="text-sm text-purple-600">📌 Pinned</span>
                      )}
                    </CardTitle>
                    <p className="text-sm text-gray-600">By {ann.author_name}</p>
                  </CardHeader>
                  <CardContent className="p-6">
                    <p className="text-gray-800 whitespace-pre-wrap">{ann.content}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}