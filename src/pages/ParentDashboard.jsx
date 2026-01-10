import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { Users, Bell, AlertCircle, Plus } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import ChildOverviewCard from '../components/parent/ChildOverviewCard';
import ChildDetailView from '../components/parent/ChildDetailView';
import { motion, AnimatePresence } from 'framer-motion';

export default function ParentDashboard() {
  const [currentUser, setCurrentUser] = useState(null);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadUser();
  }, []);

  const loadUser = async () => {
    try {
      const user = await base44.auth.me();
      setCurrentUser(user);
      setIsLoading(false);
    } catch (error) {
      console.error("Error loading user:", error);
      setIsLoading(false);
    }
  };

  const { data: childLinks = [] } = useQuery({
    queryKey: ['parent-child-links', currentUser?.email],
    queryFn: () => currentUser ? base44.entities.ParentChildLink.filter({ parent_email: currentUser.email, status: 'Active' }) : [],
    enabled: !!currentUser
  });

  const { data: students = [] } = useQuery({
    queryKey: ['linked-students', childLinks],
    queryFn: async () => {
      if (childLinks.length === 0) return [];
      const studentIds = childLinks.map(link => link.student_id);
      const allStudents = await base44.entities.Student.list();
      return allStudents.filter(s => studentIds.includes(s.id));
    },
    enabled: childLinks.length > 0
  });

  const { data: selectedGrades = [] } = useQuery({
    queryKey: ['student-grades', selectedStudent?.id],
    queryFn: () => selectedStudent ? base44.entities.Grade.filter({ student_id: selectedStudent.id }, '-created_date', 10) : [],
    enabled: !!selectedStudent
  });

  const { data: selectedAttendance = [] } = useQuery({
    queryKey: ['student-attendance', selectedStudent?.id],
    queryFn: () => selectedStudent ? base44.entities.Attendance.filter({ student_id: selectedStudent.id }, '-date', 30) : [],
    enabled: !!selectedStudent
  });

  const { data: selectedEnrollments = [] } = useQuery({
    queryKey: ['student-enrollments', selectedStudent?.id],
    queryFn: () => selectedStudent ? base44.entities.Enrollment.filter({ student_id: selectedStudent.id }, '-enrollment_date', 50) : [],
    enabled: !!selectedStudent
  });

  const getWeekStartDate = () => {
    const now = new Date();
    const day = now.getDay();
    const diff = now.getDate() - day + (day === 0 ? -6 : 1);
    const monday = new Date(now.setDate(diff));
    return monday.toISOString().split('T')[0];
  };

  const { data: weeklyGoals = [] } = useQuery({
    queryKey: ['weekly-goals', selectedStudent?.id, getWeekStartDate()],
    queryFn: () => selectedStudent ? base44.entities.WeeklyGoal.filter({ 
      student_id: selectedStudent.id,
      week_start_date: getWeekStartDate()
    }) : [],
    enabled: !!selectedStudent
  });

  useEffect(() => {
    if (students && students.length > 0 && !selectedStudent) {
      setSelectedStudent(students[0]);
    }
  }, [students, selectedStudent]);

  const calculateAverageGrade = (studentId) => {
    const studentGrades = selectedStudent?.id === studentId ? selectedGrades : [];
    if (!studentGrades || studentGrades.length === 0) return 0;
    const total = studentGrades.reduce((sum, g) => {
      const percentage = (g.score / (g.max_score || 100)) * 100;
      return sum + percentage;
    }, 0);
    return Math.round(total / studentGrades.length);
  };

  const calculateAttendanceRate = (studentId) => {
    const studentAttendance = selectedStudent?.id === studentId ? selectedAttendance : [];
    if (!studentAttendance || studentAttendance.length === 0) return 0;
    const present = studentAttendance.filter(a => a.status === "Present").length;
    return Math.round((present / studentAttendance.length) * 100);
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

  if (!students || students.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-pink-50 flex items-center justify-center p-6">
        <div className="text-center bg-white p-8 rounded-2xl shadow-xl max-w-md">
          <Users className="w-16 h-16 text-purple-600 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">No Students Found</h2>
          <p className="text-gray-600">No students are linked to your parent account yet. Please contact your administrator.</p>
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
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-4">
              <Users className="w-10 h-10 text-purple-600" />
              <div>
                <h1 className="text-4xl font-bold text-gray-900">
                  Parent Dashboard
                </h1>
                <p className="text-gray-600 mt-1">
                  Managing {students.length} {students.length === 1 ? 'student' : 'students'}
                </p>
              </div>
            </div>
            <Button variant="outline" className="gap-2">
              <Bell className="w-4 h-4" />
              Notifications
            </Button>
          </div>
        </motion.div>

        {/* Student Selector */}
        <div className="mb-8">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Your Children</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {students.map((student) => (
              <StudentCard
                key={student.id}
                student={student}
                onSelect={setSelectedStudent}
              />
            ))}
          </div>
        </div>

        {/* Selected Student Details */}
        {selectedStudent && (
          <AnimatePresence mode="wait">
            <motion.div
              key={selectedStudent.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
            >
              {/* Stats Cards */}
              <div className="mb-6">
                <div className="flex items-center gap-3 mb-4">
                  <ChevronRight className="w-6 h-6 text-purple-600" />
                  <h2 className="text-2xl font-bold text-gray-900">
                    {selectedStudent.full_name}'s Progress
                  </h2>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <StatsCard
                    icon={TrendingUp}
                    title="Average Grade"
                    value={`${calculateAverageGrade(selectedStudent.id)}%`}
                    subtitle={`${selectedGrades.length} grades recorded`}
                    color="purple"
                  />
                  <StatsCard
                    icon={Calendar}
                    title="Attendance Rate"
                    value={`${calculateAttendanceRate(selectedStudent.id)}%`}
                    subtitle={`${selectedAttendance.filter(a => a.status === "Present").length} days present`}
                    color="blue"
                  />
                  <StatsCard
                    icon={BookOpen}
                    title="Grade Level"
                    value={selectedStudent.grade_level}
                    subtitle={selectedStudent.enrollment_status}
                    color="gold"
                  />
                </div>
              </div>

              {/* Grades and Attendance */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
                <GradesList grades={selectedGrades} title={`${selectedStudent.full_name}'s Recent Grades`} />
                <AttendanceCalendar attendance={selectedAttendance} title={`${selectedStudent.full_name}'s Attendance`} />
              </div>

              {/* AI Communication Module */}
              <div className="space-y-6 mb-8">
                <h2 className="text-2xl font-bold text-gray-900">AI Communication Center</h2>
                
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <WeeklyProgressReportGenerator 
                    student={selectedStudent}
                    grades={selectedGrades}
                    attendance={selectedAttendance}
                    weeklyGoals={weeklyGoals}
                    enrollments={selectedEnrollments}
                  />
                  
                  <AIMessageComposer student={selectedStudent} />
                </div>

                <AnnouncementSummarizer studentGradeLevel={selectedStudent.grade_level} />
              </div>

              {/* Enrolled Courses */}
              <div>
                <div className="flex items-center gap-2 mb-6">
                  <BookOpen className="w-6 h-6 text-purple-600" />
                  <h2 className="text-2xl font-bold text-gray-900">Enrolled Courses</h2>
                </div>
                {selectedEnrollments.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {selectedEnrollments.map((enrollment) => (
                      <CourseEnrollmentCard key={enrollment.id} enrollment={enrollment} />
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12 bg-white rounded-xl shadow-sm">
                    <BookOpen className="w-16 h-16 mx-auto text-gray-300 mb-4" />
                    <p className="text-gray-500">No course enrollments found</p>
                  </div>
                )}
              </div>
            </motion.div>
          </AnimatePresence>
        )}
      </div>
    </div>
  );
}