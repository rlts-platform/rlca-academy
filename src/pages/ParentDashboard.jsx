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

  const calculateProgressForStudent = (student) => {
    return {
      completion: 65,
      status: "On Track",
      currentLesson: "Multiplication Mastery",
      lessonsCompleted: 12,
      weeklyHours: 8
    };
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
          <h2 className="text-2xl font-bold text-gray-900 mb-2">No Children Linked</h2>
          <p className="text-gray-600 mb-6">No students are linked to your parent account yet. Contact an administrator to link your children.</p>
          <Alert>
            <AlertCircle className="w-4 h-4" />
            <AlertDescription>
              You can manage up to 10 children from this parent account.
            </AlertDescription>
          </Alert>
        </div>
      </div>
    );
  }

  if (selectedStudent) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-pink-50 p-6">
        <div className="max-w-7xl mx-auto">
          <ChildDetailView student={selectedStudent} onBack={() => setSelectedStudent(null)} />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-pink-50 p-6">
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-4">
              <Users className="w-10 h-10 text-purple-600" />
              <div>
                <h1 className="text-4xl font-bold text-gray-900">Parent Dashboard</h1>
                <p className="text-gray-600 mt-1">
                  Managing {students.length} {students.length === 1 ? 'child' : 'children'} • {students.length < 10 ? `${10 - students.length} slots available` : 'Maximum reached'}
                </p>
              </div>
            </div>
            <Button variant="outline" className="gap-2">
              <Bell className="w-4 h-4" />
              Notifications
            </Button>
          </div>

          {students.length < 10 && (
            <Alert className="border-purple-200 bg-purple-50">
              <Plus className="w-4 h-4" />
              <AlertDescription>
                You can manage up to 10 children. Contact an administrator to link additional students.
              </AlertDescription>
            </Alert>
          )}
        </motion.div>

        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Your Children</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {students.map((student) => {
              const progress = calculateProgressForStudent(student);
              return (
                <ChildOverviewCard
                  key={student.id}
                  student={student}
                  progress={progress}
                  onSelect={setSelectedStudent}
                />
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}