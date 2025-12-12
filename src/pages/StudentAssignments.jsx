import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { FileText, Filter, Calendar, CheckCircle } from 'lucide-react';
import { motion } from 'framer-motion';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import AssignmentCard from '../components/assignments/AssignmentCard';

export default function StudentAssignments() {
  const [studentProfile, setStudentProfile] = useState(null);
  const [filterSubject, setFilterSubject] = useState("all");
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadUserProfile();
  }, []);

  const loadUserProfile = async () => {
    try {
      const user = await base44.auth.me();
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

  const { data: assignments = [] } = useQuery({
    queryKey: ['assignments-student', studentProfile?.grade_level],
    queryFn: () => studentProfile 
      ? base44.entities.Assignment.filter({ 
          grade_level: studentProfile.grade_level,
          status: "Published"
        }, '-due_date')
      : [],
    enabled: !!studentProfile
  });

  const { data: submissions = [] } = useQuery({
    queryKey: ['submissions', studentProfile?.id],
    queryFn: () => studentProfile 
      ? base44.entities.AssignmentSubmission.filter({ student_id: studentProfile.id })
      : [],
    enabled: !!studentProfile
  });

  const getSubmission = (assignmentId) => {
    return submissions.find(s => s.assignment_id === assignmentId);
  };

  const filteredAssignments = assignments.filter(a => 
    filterSubject === "all" || a.subject === filterSubject
  );

  const upcomingAssignments = filteredAssignments.filter(a => {
    const sub = getSubmission(a.id);
    return !sub || sub.status === "Not Started" || sub.status === "In Progress";
  });

  const submittedAssignments = filteredAssignments.filter(a => {
    const sub = getSubmission(a.id);
    return sub?.status === "Submitted";
  });

  const gradedAssignments = filteredAssignments.filter(a => {
    const sub = getSubmission(a.id);
    return sub?.status === "Graded";
  });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-pink-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-purple-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <div className="text-gray-600">Loading assignments...</div>
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
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-purple-500 to-blue-600 flex items-center justify-center shadow-xl">
                <FileText className="w-9 h-9 text-white" />
              </div>
              <div>
                <h1 className="text-4xl font-bold text-gray-900">My Assignments</h1>
                <p className="text-gray-600 mt-1">Track and submit your work</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <Filter className="w-5 h-5 text-gray-600" />
              <Select value={filterSubject} onValueChange={setFilterSubject}>
                <SelectTrigger className="w-48 bg-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Subjects</SelectItem>
                  {Array.from(new Set(assignments.map(a => a.subject))).map(subject => (
                    <SelectItem key={subject} value={subject}>{subject}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </motion.div>

        <Tabs defaultValue="upcoming" className="space-y-6">
          <TabsList className="bg-white/80 backdrop-blur-sm shadow-lg">
            <TabsTrigger value="upcoming" className="gap-2">
              <Calendar className="w-4 h-4" />
              Upcoming ({upcomingAssignments.length})
            </TabsTrigger>
            <TabsTrigger value="submitted" className="gap-2">
              <FileText className="w-4 h-4" />
              Submitted ({submittedAssignments.length})
            </TabsTrigger>
            <TabsTrigger value="graded" className="gap-2">
              <CheckCircle className="w-4 h-4" />
              Graded ({gradedAssignments.length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="upcoming" className="space-y-4">
            {upcomingAssignments.length === 0 ? (
              <div className="text-center py-16 bg-white rounded-xl shadow-lg">
                <Calendar className="w-20 h-20 text-gray-300 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-900 mb-2">All caught up!</h3>
                <p className="text-gray-600">No upcoming assignments</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {upcomingAssignments.map(assignment => (
                  <AssignmentCard
                    key={assignment.id}
                    assignment={assignment}
                    submission={getSubmission(assignment.id)}
                    onClick={() => window.location.href = `/AssignmentSubmission?id=${assignment.id}`}
                  />
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="submitted" className="space-y-4">
            {submittedAssignments.length === 0 ? (
              <div className="text-center py-16 bg-white rounded-xl shadow-lg">
                <FileText className="w-20 h-20 text-gray-300 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-900 mb-2">No submissions yet</h3>
                <p className="text-gray-600">Submitted assignments will appear here</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {submittedAssignments.map(assignment => (
                  <AssignmentCard
                    key={assignment.id}
                    assignment={assignment}
                    submission={getSubmission(assignment.id)}
                    onClick={() => window.location.href = `/AssignmentSubmission?id=${assignment.id}`}
                  />
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="graded" className="space-y-4">
            {gradedAssignments.length === 0 ? (
              <div className="text-center py-16 bg-white rounded-xl shadow-lg">
                <CheckCircle className="w-20 h-20 text-gray-300 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-900 mb-2">No graded work yet</h3>
                <p className="text-gray-600">Completed assignments will appear here</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {gradedAssignments.map(assignment => (
                  <AssignmentCard
                    key={assignment.id}
                    assignment={assignment}
                    submission={getSubmission(assignment.id)}
                    onClick={() => window.location.href = `/AssignmentSubmission?id=${assignment.id}`}
                    showGrade
                  />
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}