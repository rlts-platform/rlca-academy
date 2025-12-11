import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { GraduationCap, BookOpen, Calendar, TrendingUp, Award, Clock, Brain, Sparkles } from 'lucide-react';
import StatsCard from '../components/dashboard/StatsCard';
import GradesList from '../components/dashboard/GradesList';
import AttendanceCalendar from '../components/dashboard/AttendanceCalendar';
import UpcomingAssignments from '../components/dashboard/UpcomingAssignments';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

export default function StudentDashboard() {
  const [currentUser, setCurrentUser] = useState(null);
  const [studentProfile, setStudentProfile] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadUserAndProfile();
  }, []);

  const loadUserAndProfile = async () => {
    try {
      const user = await base44.auth.me();
      setCurrentUser(user);
      
      const students = await base44.entities.Student.filter({ student_email: user.email });
      if (students && students.length > 0) {
        setStudentProfile(students[0]);
      }
      setIsLoading(false);
    } catch (error) {
      console.error("Error loading profile:", error);
      setIsLoading(false);
    }
  };

  const { data: grades = [] } = useQuery({
    queryKey: ['student-grades', studentProfile?.id],
    queryFn: () => studentProfile ? base44.entities.Grade.filter({ student_id: studentProfile.id }, '-created_date', 10) : [],
    enabled: !!studentProfile
  });

  const { data: attendance = [] } = useQuery({
    queryKey: ['student-attendance', studentProfile?.id],
    queryFn: () => studentProfile ? base44.entities.Attendance.filter({ student_id: studentProfile.id }, '-date', 30) : [],
    enabled: !!studentProfile
  });

  const { data: assignments = [] } = useQuery({
    queryKey: ['student-assignments', studentProfile?.cohort_id],
    queryFn: async () => {
      if (!studentProfile?.cohort_id) return [];
      return base44.entities.Assignment.filter({ cohort_id: studentProfile.cohort_id, status: 'Published' }, 'due_date', 20);
    },
    enabled: !!studentProfile?.cohort_id
  });

  const { data: cohort } = useQuery({
    queryKey: ['student-cohort', studentProfile?.cohort_id],
    queryFn: async () => {
      if (!studentProfile?.cohort_id) return null;
      const cohorts = await base44.entities.Cohort.filter({ id: studentProfile.cohort_id });
      return cohorts[0] || null;
    },
    enabled: !!studentProfile?.cohort_id
  });

  const { data: learningPlans = [] } = useQuery({
    queryKey: ['learning-plans', studentProfile?.id],
    queryFn: () => studentProfile ? base44.entities.LearningPlan.filter({ student_id: studentProfile.id }, '-created_date', 1) : [],
    enabled: !!studentProfile
  });

  const hasActivePlan = learningPlans.length > 0 && learningPlans.some(plan => plan.status === "Active");

  const calculateAverageGrade = () => {
    if (!grades || grades.length === 0) return 0;
    const total = grades.reduce((sum, g) => {
      const percentage = (g.score / (g.max_score || 100)) * 100;
      return sum + percentage;
    }, 0);
    return Math.round(total / grades.length);
  };

  const calculateAttendanceRate = () => {
    if (!attendance || attendance.length === 0) return 0;
    const present = attendance.filter(a => a.status === "Present").length;
    return Math.round((present / attendance.length) * 100);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-pink-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-purple-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <div className="text-gray-600">Loading your dashboard...</div>
        </div>
      </div>
    );
  }

  if (!studentProfile) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-pink-50 flex items-center justify-center p-6">
        <div className="text-center bg-white p-8 rounded-2xl shadow-xl max-w-md">
          <GraduationCap className="w-16 h-16 text-purple-600 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Student Profile Not Found</h2>
          <p className="text-gray-600">Please contact your administrator to set up your student profile.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-pink-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex items-center gap-4 mb-2">
            <GraduationCap className="w-10 h-10 text-purple-600" />
            <div>
              <h1 className="text-4xl font-bold text-gray-900">
                Welcome back, {studentProfile.full_name}! 👋
              </h1>
              <p className="text-gray-600 mt-1">
                {studentProfile.grade_level} {cohort && `• ${cohort.name}`}
              </p>
            </div>
          </div>
        </motion.div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <StatsCard
            icon={Award}
            title="Average Grade"
            value={`${calculateAverageGrade()}%`}
            subtitle={`Based on ${grades.length} grades`}
            color="purple"
          />
          <StatsCard
            icon={Calendar}
            title="Attendance Rate"
            value={`${calculateAttendanceRate()}%`}
            subtitle={`${attendance.filter(a => a.status === "Present").length} days present`}
            color="blue"
          />
          <StatsCard
            icon={ClipboardList}
            title="Assignments"
            value={assignments.length}
            subtitle="Due soon"
            color="gold"
          />
          <StatsCard
            icon={BookOpen}
            title="Total Grades"
            value={grades.length}
            subtitle="This semester"
            color="green"
          />
        </div>

        {/* AI Learning Plan CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="mb-8"
        >
          <Card className="shadow-xl border-2 border-purple-300 bg-gradient-to-br from-purple-50 via-blue-50 to-pink-50 overflow-hidden">
            <CardContent className="p-0">
              <div className="flex flex-col md:flex-row items-center gap-6 p-8">
                <div className="flex-shrink-0">
                  <div className="w-24 h-24 rounded-2xl bg-gradient-to-br from-purple-500 to-blue-600 flex items-center justify-center shadow-xl">
                    <Brain className="w-12 h-12 text-white" />
                  </div>
                </div>
                <div className="flex-1 text-center md:text-left">
                  <h2 className="text-2xl font-bold text-gray-900 mb-2 flex items-center gap-2 justify-center md:justify-start">
                    {hasActivePlan ? 'Your AI Learning Plan' : 'Unlock AI-Powered Learning'}
                    <Sparkles className="w-6 h-6 text-purple-600" />
                  </h2>
                  <p className="text-gray-700 mb-4">
                    {hasActivePlan 
                      ? 'View your personalized curriculum path, milestones, and resources tailored just for you!'
                      : 'Get a personalized 12-week curriculum designed by AI based on your performance, goals, and learning style!'}
                  </p>
                  <div className="flex flex-wrap gap-3 justify-center md:justify-start">
                    {hasActivePlan ? (
                      <>
                        <Link to={createPageUrl('LearningPlanView')}>
                          <Button className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white shadow-lg">
                            <Brain className="w-4 h-4 mr-2" />
                            View My Learning Plan
                          </Button>
                        </Link>
                        <Link to={createPageUrl('GenerateLearningPlan')}>
                          <Button variant="outline">
                            Generate New Plan
                          </Button>
                        </Link>
                      </>
                    ) : (
                      <Link to={createPageUrl('GenerateLearningPlan')}>
                        <Button className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white shadow-lg">
                          <Sparkles className="w-4 h-4 mr-2" />
                          Generate My Learning Plan
                        </Button>
                      </Link>
                    )}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <UpcomingAssignments assignments={assignments} />
          <GradesList grades={grades.slice(0, 5)} />
        </div>

        {/* Attendance */}
        <div className="mb-8">
          <AttendanceCalendar attendance={attendance} />
        </div>
      </div>
    </div>
  );
}