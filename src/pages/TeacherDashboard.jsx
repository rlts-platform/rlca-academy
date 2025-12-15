import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { GraduationCap, Users, ClipboardList, MessageSquare, Brain, BookOpen } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";
import { motion } from 'framer-motion';

import ClassRoster from '../components/teacher/ClassRoster';
import AssignmentManager from '../components/teacher/AssignmentManager';
import GradeManager from '../components/teacher/GradeManager';
import ParentMessaging from '../components/teacher/ParentMessaging';
import ClassInsights from '../components/teacher/ClassInsights';
import StatsCard from '../components/dashboard/StatsCard';

export default function TeacherDashboard() {
  const [currentUser, setCurrentUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadUser();
  }, []);

  const loadUser = async () => {
    try {
      const user = await base44.auth.me();
      if (user.role !== 'admin') {
        alert('Access denied. Teacher portal is for administrators only.');
        window.location.href = '/';
        return;
      }
      setCurrentUser(user);
      setIsLoading(false);
    } catch (error) {
      console.error("Error loading user:", error);
      setIsLoading(false);
    }
  };

  const { data: students = [] } = useQuery({
    queryKey: ['all-students'],
    queryFn: () => base44.entities.Student.list('-created_date', 100),
    enabled: !!currentUser
  });

  const { data: assignments = [] } = useQuery({
    queryKey: ['all-assignments'],
    queryFn: () => base44.entities.Assignment.list('-created_date', 50),
    enabled: !!currentUser
  });

  const { data: grades = [] } = useQuery({
    queryKey: ['all-grades'],
    queryFn: () => base44.entities.Grade.list('-created_date', 100),
    enabled: !!currentUser
  });

  const { data: messages = [] } = useQuery({
    queryKey: ['teacher-messages'],
    queryFn: () => base44.entities.Message.list('-created_date', 50),
    enabled: !!currentUser
  });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-pink-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-purple-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <div className="text-gray-600">Loading teacher portal...</div>
        </div>
      </div>
    );
  }

  const activeStudents = students.filter(s => s.enrollment_status === 'Active').length;
  const pendingAssignments = assignments.filter(a => a.status === 'Published').length;
  const unreadMessages = messages.filter(m => !m.read && m.recipient_role === 'Teacher').length;

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-pink-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex items-center gap-4 mb-6">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-purple-500 to-blue-600 flex items-center justify-center shadow-xl">
              <GraduationCap className="w-9 h-9 text-white" />
            </div>
            <div>
              <h1 className="text-4xl font-bold text-gray-900">Teacher Portal</h1>
              <p className="text-gray-600 mt-1">Manage your classes, assignments, and connect with parents</p>
            </div>
          </div>
        </motion.div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <StatsCard
            icon={Users}
            title="Active Students"
            value={activeStudents}
            subtitle={`${students.length} total enrolled`}
            color="purple"
          />
          <StatsCard
            icon={ClipboardList}
            title="Active Assignments"
            value={pendingAssignments}
            subtitle={`${assignments.length} total created`}
            color="blue"
          />
          <StatsCard
            icon={BookOpen}
            title="Grades Recorded"
            value={grades.length}
            subtitle="This semester"
            color="green"
          />
          <StatsCard
            icon={MessageSquare}
            title="Messages"
            value={unreadMessages}
            subtitle="Unread messages"
            color="amber"
          />
        </div>

        {/* Main Content Tabs */}
        <Tabs defaultValue="roster" className="space-y-6">
          <TabsList className="bg-white/80 backdrop-blur-sm shadow-lg">
            <TabsTrigger value="roster" className="gap-2">
              <Users className="w-4 h-4" />
              Class Roster
            </TabsTrigger>
            <TabsTrigger value="assignments" className="gap-2">
              <ClipboardList className="w-4 h-4" />
              Assignments
            </TabsTrigger>
            <TabsTrigger value="grades" className="gap-2">
              <BookOpen className="w-4 h-4" />
              Grade Book
            </TabsTrigger>
            <TabsTrigger value="messaging" className="gap-2">
              <MessageSquare className="w-4 h-4" />
              Parent Communication
              {unreadMessages > 0 && (
                <span className="ml-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                  {unreadMessages}
                </span>
              )}
            </TabsTrigger>
            <TabsTrigger value="insights" className="gap-2">
              <Brain className="w-4 h-4" />
              AI Insights
            </TabsTrigger>
          </TabsList>

          <TabsContent value="roster">
            <ClassRoster students={students} grades={grades} />
          </TabsContent>

          <TabsContent value="assignments">
            <AssignmentManager assignments={assignments} students={students} />
          </TabsContent>

          <TabsContent value="grades">
            <GradeManager students={students} assignments={assignments} grades={grades} />
          </TabsContent>

          <TabsContent value="messaging">
            <ParentMessaging messages={messages} students={students} currentUser={currentUser} />
          </TabsContent>

          <TabsContent value="insights">
            <ClassInsights students={students} grades={grades} assignments={assignments} />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}