import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Users, BookOpen, Search, Filter, UserPlus } from 'lucide-react';
import EnrollmentForm from '../components/enrollment/EnrollmentForm';
import EnrolledStudentsList from '../components/enrollment/EnrolledStudentsList';
import StatsCard from '../components/dashboard/StatsCard';
import { notifyNewEnrollment, notifyEnrollmentStatusChange } from '../utils/notificationHelpers';

export default function EnrollmentManagement() {
  const [user, setUser] = useState(null);
  const [showEnrollForm, setShowEnrollForm] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCourse, setSelectedCourse] = useState(null);
  const queryClient = useQueryClient();

  useEffect(() => {
    loadUser();
  }, []);

  const loadUser = async () => {
    try {
      const currentUser = await base44.auth.me();
      if (currentUser.role !== 'admin') {
        window.location.href = '/';
        return;
      }
      setUser(currentUser);
    } catch (error) {
      console.error('Error loading user:', error);
      window.location.href = '/';
    }
  };

  const { data: enrollments = [] } = useQuery({
    queryKey: ['enrollments'],
    queryFn: () => base44.entities.Enrollment.list('-enrollment_date', 100),
    enabled: !!user
  });

  const { data: students = [] } = useQuery({
    queryKey: ['students'],
    queryFn: () => base44.entities.Student.list('full_name', 100),
    enabled: !!user
  });

  const { data: subjects = [] } = useQuery({
    queryKey: ['subjects'],
    queryFn: () => base44.entities.Subject.list('name', 50),
    enabled: !!user
  });

  const { data: units = [] } = useQuery({
    queryKey: ['units'],
    queryFn: () => base44.entities.Unit.list('title', 100),
    enabled: !!user
  });

  const { data: clubs = [] } = useQuery({
    queryKey: ['clubs'],
    queryFn: () => base44.entities.Club.list('name', 50),
    enabled: !!user
  });

  const enrollMutation = useMutation({
    mutationFn: (enrollmentData) => base44.entities.Enrollment.create(enrollmentData),
    onSuccess: async (newEnrollment) => {
      queryClient.invalidateQueries({ queryKey: ['enrollments'] });
      setShowEnrollForm(false);
      
      // Notify all admins about new enrollment
      const allUsers = await base44.entities.User.list();
      const adminEmails = allUsers.filter(u => u.role === 'admin').map(u => u.email);
      await notifyNewEnrollment(newEnrollment, adminEmails);
    }
  });

  const updateStatusMutation = useMutation({
    mutationFn: async ({ id, status }) => {
      const enrollment = enrollments.find(e => e.id === id);
      const oldStatus = enrollment?.status;
      const updated = await base44.entities.Enrollment.update(id, { status });
      return { updated, enrollment, oldStatus };
    },
    onSuccess: async ({ updated, enrollment, oldStatus }) => {
      queryClient.invalidateQueries({ queryKey: ['enrollments'] });
      if (enrollment && oldStatus !== updated.status) {
        await notifyEnrollmentStatusChange({ ...enrollment, ...updated }, oldStatus);
      }
    }
  });

  const activeEnrollments = enrollments.filter(e => e.status === 'Active');
  const completedEnrollments = enrollments.filter(e => e.status === 'Completed');

  const filteredEnrollments = enrollments.filter(e =>
    e.student_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    e.course_name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getEnrollmentsByCourse = (courseId) => {
    return enrollments.filter(e => e.course_id === courseId && e.status === 'Active');
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-pink-50 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-4xl font-bold text-gray-900">Enrollment Management</h1>
            <p className="text-gray-600 mt-2">Manage student course enrollments</p>
          </div>
          <Button
            onClick={() => setShowEnrollForm(true)}
            className="bg-gradient-to-r from-purple-600 to-blue-600"
          >
            <UserPlus className="w-4 h-4 mr-2" />
            Enroll Student
          </Button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <StatsCard
            icon={Users}
            title="Total Enrollments"
            value={enrollments.length}
            subtitle="All time"
            color="purple"
          />
          <StatsCard
            icon={BookOpen}
            title="Active Enrollments"
            value={activeEnrollments.length}
            subtitle="Currently enrolled"
            color="blue"
          />
          <StatsCard
            icon={Users}
            title="Completed"
            value={completedEnrollments.length}
            subtitle="Finished courses"
            color="green"
          />
          <StatsCard
            icon={BookOpen}
            title="Total Students"
            value={students.length}
            subtitle="In system"
            color="gold"
          />
        </div>

        {/* Enrollment Form Modal */}
        {showEnrollForm && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-6">
            <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <EnrollmentForm
                students={students}
                subjects={subjects}
                units={units}
                clubs={clubs}
                onSubmit={(data) => enrollMutation.mutate(data)}
                onCancel={() => setShowEnrollForm(false)}
                currentUser={user}
              />
            </div>
          </div>
        )}

        <Tabs defaultValue="all" className="space-y-6">
          <TabsList className="bg-white border border-gray-200">
            <TabsTrigger value="all">All Enrollments</TabsTrigger>
            <TabsTrigger value="subjects">By Subject</TabsTrigger>
            <TabsTrigger value="units">By Unit</TabsTrigger>
            <TabsTrigger value="clubs">By Club</TabsTrigger>
          </TabsList>

          <TabsContent value="all" className="space-y-6">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>All Enrollments</CardTitle>
                  <div className="flex items-center gap-2">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                      <Input
                        placeholder="Search students or courses..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-10 w-64"
                      />
                    </div>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {filteredEnrollments.map((enrollment) => (
                    <div
                      key={enrollment.id}
                      className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                    >
                      <div className="flex-1">
                        <h4 className="font-semibold text-gray-900">{enrollment.student_name}</h4>
                        <p className="text-sm text-gray-600">
                          {enrollment.course_name} ({enrollment.course_type})
                        </p>
                        <div className="flex items-center gap-4 mt-1">
                          <span className="text-xs text-gray-500">
                            Enrolled: {new Date(enrollment.enrollment_date).toLocaleDateString()}
                          </span>
                          <span className="text-xs text-gray-500">
                            Progress: {enrollment.progress_percentage}%
                          </span>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <select
                          value={enrollment.status}
                          onChange={(e) => updateStatusMutation.mutate({ id: enrollment.id, status: e.target.value })}
                          className="px-3 py-1 border border-gray-300 rounded-md text-sm"
                        >
                          <option value="Active">Active</option>
                          <option value="Completed">Completed</option>
                          <option value="Dropped">Dropped</option>
                          <option value="Pending">Pending</option>
                          <option value="Waitlisted">Waitlisted</option>
                        </select>
                      </div>
                    </div>
                  ))}
                  {filteredEnrollments.length === 0 && (
                    <div className="text-center py-12 text-gray-500">
                      No enrollments found
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="subjects" className="space-y-6">
            <div className="grid grid-cols-1 gap-6">
              {subjects.map((subject) => {
                const enrolledStudents = getEnrollmentsByCourse(subject.id);
                return (
                  <EnrolledStudentsList
                    key={subject.id}
                    courseType="Subject"
                    courseName={subject.name}
                    enrollments={enrolledStudents}
                    onUpdateStatus={updateStatusMutation.mutate}
                  />
                );
              })}
            </div>
          </TabsContent>

          <TabsContent value="units" className="space-y-6">
            <div className="grid grid-cols-1 gap-6">
              {units.map((unit) => {
                const enrolledStudents = getEnrollmentsByCourse(unit.id);
                return (
                  <EnrolledStudentsList
                    key={unit.id}
                    courseType="Unit"
                    courseName={unit.title}
                    enrollments={enrolledStudents}
                    onUpdateStatus={updateStatusMutation.mutate}
                  />
                );
              })}
            </div>
          </TabsContent>

          <TabsContent value="clubs" className="space-y-6">
            <div className="grid grid-cols-1 gap-6">
              {clubs.map((club) => {
                const enrolledStudents = getEnrollmentsByCourse(club.id);
                return (
                  <EnrolledStudentsList
                    key={club.id}
                    courseType="Club"
                    courseName={club.name}
                    enrollments={enrolledStudents}
                    onUpdateStatus={updateStatusMutation.mutate}
                  />
                );
              })}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}