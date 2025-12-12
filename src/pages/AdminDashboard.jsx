import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Users, BookOpen, Calendar, GraduationCap, Plus, Edit, Trash2, CheckCircle } from 'lucide-react';
import { motion } from 'framer-motion';
import StatsCard from '../components/dashboard/StatsCard';
import { notifyNewGrade, notifyAttendanceUpdate } from '../components/notifications/NotificationHelpers';

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState("overview");
  const [showStudentForm, setShowStudentForm] = useState(false);
  const [showAttendanceForm, setShowAttendanceForm] = useState(false);
  const [showGradeForm, setShowGradeForm] = useState(false);
  const queryClient = useQueryClient();

  const { data: students = [] } = useQuery({
    queryKey: ['all-students'],
    queryFn: () => base44.entities.Student.list()
  });

  const { data: cohorts = [] } = useQuery({
    queryKey: ['all-cohorts'],
    queryFn: () => base44.entities.Cohort.list()
  });

  const { data: attendance = [] } = useQuery({
    queryKey: ['all-attendance'],
    queryFn: () => base44.entities.Attendance.list('-date', 50)
  });

  const { data: grades = [] } = useQuery({
    queryKey: ['all-grades'],
    queryFn: () => base44.entities.Grade.list('-created_date', 50)
  });

  const createStudentMutation = useMutation({
    mutationFn: (data) => base44.entities.Student.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['all-students'] });
      setShowStudentForm(false);
    }
  });

  const markAttendanceMutation = useMutation({
    mutationFn: (data) => base44.entities.Attendance.create(data),
    onSuccess: async (newAttendance) => {
      queryClient.invalidateQueries({ queryKey: ['all-attendance'] });
      setShowAttendanceForm(false);
      await notifyAttendanceUpdate(newAttendance);
    }
  });

  const addGradeMutation = useMutation({
    mutationFn: (data) => base44.entities.Grade.create(data),
    onSuccess: async (newGrade) => {
      queryClient.invalidateQueries({ queryKey: ['all-grades'] });
      setShowGradeForm(false);
      await notifyNewGrade(newGrade);
    }
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-purple-50 to-blue-50 p-6">
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Admin Dashboard</h1>
          <p className="text-gray-600">Manage students, attendance, grades, and cohorts</p>
        </motion.div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <StatsCard
            icon={Users}
            title="Total Students"
            value={students.length}
            color="purple"
          />
          <StatsCard
            icon={GraduationCap}
            title="Active Cohorts"
            value={cohorts.filter(c => c.status === "Active").length}
            color="blue"
          />
          <StatsCard
            icon={BookOpen}
            title="Grades Recorded"
            value={grades.length}
            color="green"
          />
          <StatsCard
            icon={Calendar}
            title="Attendance Today"
            value={attendance.filter(a => a.date === new Date().toISOString().split('T')[0]).length}
            color="gold"
          />
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="bg-white/50 backdrop-blur-sm">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="students">Students</TabsTrigger>
            <TabsTrigger value="attendance">Attendance</TabsTrigger>
            <TabsTrigger value="grades">Grades</TabsTrigger>
            <TabsTrigger value="cohorts">Cohorts</TabsTrigger>
          </TabsList>

          <TabsContent value="overview">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card className="shadow-lg">
                <CardHeader className="border-b bg-gradient-to-r from-purple-50 to-blue-50">
                  <CardTitle>Recent Students</CardTitle>
                </CardHeader>
                <CardContent className="p-6">
                  <div className="space-y-3">
                    {students.slice(0, 5).map(student => (
                      <div key={student.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div>
                          <div className="font-semibold">{student.full_name}</div>
                          <div className="text-sm text-gray-600">{student.grade_level}</div>
                        </div>
                        <Badge>{student.enrollment_status}</Badge>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card className="shadow-lg">
                <CardHeader className="border-b bg-gradient-to-r from-green-50 to-emerald-50">
                  <CardTitle>Active Cohorts</CardTitle>
                </CardHeader>
                <CardContent className="p-6">
                  <div className="space-y-3">
                    {cohorts.filter(c => c.status === "Active").map(cohort => (
                      <div key={cohort.id} className="p-3 bg-gray-50 rounded-lg">
                        <div className="font-semibold">{cohort.name}</div>
                        <div className="text-sm text-gray-600 mt-1">{cohort.teacher_name}</div>
                        <div className="text-xs text-gray-500 mt-1">
                          {cohort.current_enrollment}/{cohort.max_students} students
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="students">
            <Card className="shadow-lg">
              <CardHeader className="border-b bg-gradient-to-r from-purple-50 to-blue-50">
                <div className="flex items-center justify-between">
                  <CardTitle>Student Management</CardTitle>
                  <Button onClick={() => setShowStudentForm(!showStudentForm)} className="bg-purple-600 hover:bg-purple-700">
                    <Plus className="w-4 h-4 mr-2" />
                    Add Student
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="p-6">
                {showStudentForm && <StudentForm onSubmit={createStudentMutation.mutate} cohorts={cohorts} />}
                <div className="space-y-3 mt-6">
                  {students.map(student => (
                    <div key={student.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                      <div className="flex-1">
                        <div className="font-semibold text-lg">{student.full_name}</div>
                        <div className="text-sm text-gray-600">
                          {student.grade_level} • Age {student.age}
                        </div>
                        <div className="text-xs text-gray-500 mt-1">Parent: {student.parent_email}</div>
                      </div>
                      <Badge className={student.enrollment_status === "Active" ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-800"}>
                        {student.enrollment_status}
                      </Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="attendance">
            <Card className="shadow-lg">
              <CardHeader className="border-b bg-gradient-to-r from-blue-50 to-cyan-50">
                <div className="flex items-center justify-between">
                  <CardTitle>Attendance Management</CardTitle>
                  <Button onClick={() => setShowAttendanceForm(!showAttendanceForm)} className="bg-blue-600 hover:bg-blue-700">
                    <CheckCircle className="w-4 h-4 mr-2" />
                    Mark Attendance
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="p-6">
                {showAttendanceForm && <AttendanceForm onSubmit={markAttendanceMutation.mutate} students={students} />}
                <div className="space-y-2 mt-6">
                  {attendance.slice(0, 20).map(record => (
                    <div key={record.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div>
                        <div className="font-semibold">{record.student_name}</div>
                        <div className="text-sm text-gray-600">{record.date}</div>
                      </div>
                      <Badge className={
                        record.status === "Present" ? "bg-green-100 text-green-800" :
                        record.status === "Absent" ? "bg-red-100 text-red-800" :
                        record.status === "Late" ? "bg-yellow-100 text-yellow-800" :
                        "bg-blue-100 text-blue-800"
                      }>
                        {record.status}
                      </Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="grades">
            <Card className="shadow-lg">
              <CardHeader className="border-b bg-gradient-to-r from-green-50 to-emerald-50">
                <div className="flex items-center justify-between">
                  <CardTitle>Grade Management</CardTitle>
                  <Button onClick={() => setShowGradeForm(!showGradeForm)} className="bg-green-600 hover:bg-green-700">
                    <Plus className="w-4 h-4 mr-2" />
                    Add Grade
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="p-6">
                {showGradeForm && <GradeForm onSubmit={addGradeMutation.mutate} students={students} />}
                <div className="space-y-2 mt-6">
                  {grades.slice(0, 20).map(grade => (
                    <div key={grade.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div className="flex-1">
                        <div className="font-semibold">{grade.student_name}</div>
                        <div className="text-sm text-gray-600">{grade.assignment_name} - {grade.subject}</div>
                      </div>
                      <div className="text-right">
                        <div className="text-2xl font-bold text-purple-600">
                          {Math.round((grade.score / (grade.max_score || 100)) * 100)}%
                        </div>
                        <div className="text-xs text-gray-500">{grade.score}/{grade.max_score || 100}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="cohorts">
            <Card className="shadow-lg">
              <CardHeader className="border-b bg-gradient-to-r from-amber-50 to-orange-50">
                <CardTitle>Cohort Management</CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {cohorts.map(cohort => (
                    <div key={cohort.id} className="p-6 bg-gradient-to-br from-purple-500 to-blue-600 text-white rounded-xl shadow-lg">
                      <div className="flex items-start justify-between mb-4">
                        <div>
                          <h3 className="text-xl font-bold">{cohort.name}</h3>
                          <p className="text-sm opacity-90 mt-1">{cohort.grade_level}</p>
                        </div>
                        <Badge className="bg-white/20 text-white border-white/30">
                          {cohort.status}
                        </Badge>
                      </div>
                      <div className="space-y-2 text-sm">
                        <div>👨‍🏫 {cohort.teacher_name}</div>
                        <div>📅 {cohort.schedule}</div>
                        <div>👥 {cohort.current_enrollment}/{cohort.max_students} students</div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}

function StudentForm({ onSubmit, cohorts }) {
  const [formData, setFormData] = useState({
    full_name: "",
    age: "",
    grade_level: "",
    parent_email: "",
    student_email: "",
    cohort_id: "",
    enrollment_status: "Active"
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 p-6 bg-purple-50 rounded-lg border-2 border-purple-200">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label>Full Name</Label>
          <Input value={formData.full_name} onChange={e => setFormData({...formData, full_name: e.target.value})} required />
        </div>
        <div>
          <Label>Age</Label>
          <Input type="number" value={formData.age} onChange={e => setFormData({...formData, age: parseInt(e.target.value)})} required />
        </div>
        <div>
          <Label>Grade Level</Label>
          <Select value={formData.grade_level} onValueChange={v => setFormData({...formData, grade_level: v})}>
            <SelectTrigger>
              <SelectValue placeholder="Select grade" />
            </SelectTrigger>
            <SelectContent>
              {["Pre-K", "Kindergarten", "1st Grade", "2nd Grade", "3rd Grade", "4th Grade", "5th Grade", "6th Grade", "7th Grade", "8th Grade", "9th Grade", "10th Grade", "11th Grade", "12th Grade"].map(g => (
                <SelectItem key={g} value={g}>{g}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label>Parent Email</Label>
          <Input type="email" value={formData.parent_email} onChange={e => setFormData({...formData, parent_email: e.target.value})} required />
        </div>
        <div>
          <Label>Student Email (optional)</Label>
          <Input type="email" value={formData.student_email} onChange={e => setFormData({...formData, student_email: e.target.value})} />
        </div>
        <div>
          <Label>Cohort</Label>
          <Select value={formData.cohort_id} onValueChange={v => setFormData({...formData, cohort_id: v})}>
            <SelectTrigger>
              <SelectValue placeholder="Select cohort" />
            </SelectTrigger>
            <SelectContent>
              {cohorts.map(c => (
                <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>
      <Button type="submit" className="w-full bg-purple-600 hover:bg-purple-700">Create Student</Button>
    </form>
  );
}

function AttendanceForm({ onSubmit, students }) {
  const [formData, setFormData] = useState({
    student_id: "",
    date: new Date().toISOString().split('T')[0],
    status: "Present",
    notes: ""
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    const student = students.find(s => s.id === formData.student_id);
    onSubmit({
      ...formData,
      student_name: student?.full_name || ""
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 p-6 bg-blue-50 rounded-lg border-2 border-blue-200">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label>Student</Label>
          <Select value={formData.student_id} onValueChange={v => setFormData({...formData, student_id: v})}>
            <SelectTrigger>
              <SelectValue placeholder="Select student" />
            </SelectTrigger>
            <SelectContent>
              {students.map(s => (
                <SelectItem key={s.id} value={s.id}>{s.full_name} ({s.grade_level})</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label>Date</Label>
          <Input type="date" value={formData.date} onChange={e => setFormData({...formData, date: e.target.value})} required />
        </div>
        <div>
          <Label>Status</Label>
          <Select value={formData.status} onValueChange={v => setFormData({...formData, status: v})}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Present">Present</SelectItem>
              <SelectItem value="Absent">Absent</SelectItem>
              <SelectItem value="Late">Late</SelectItem>
              <SelectItem value="Excused">Excused</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label>Notes (optional)</Label>
          <Input value={formData.notes} onChange={e => setFormData({...formData, notes: e.target.value})} />
        </div>
      </div>
      <Button type="submit" className="w-full bg-blue-600 hover:bg-blue-700">Mark Attendance</Button>
    </form>
  );
}

function GradeForm({ onSubmit, students }) {
  const [formData, setFormData] = useState({
    student_id: "",
    subject: "",
    assignment_name: "",
    score: "",
    max_score: 100,
    feedback: ""
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    const student = students.find(s => s.id === formData.student_id);
    onSubmit({
      ...formData,
      student_name: student?.full_name || "",
      score: parseFloat(formData.score),
      submission_date: new Date().toISOString().split('T')[0],
      graded_date: new Date().toISOString().split('T')[0]
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 p-6 bg-green-50 rounded-lg border-2 border-green-200">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label>Student</Label>
          <Select value={formData.student_id} onValueChange={v => setFormData({...formData, student_id: v})}>
            <SelectTrigger>
              <SelectValue placeholder="Select student" />
            </SelectTrigger>
            <SelectContent>
              {students.map(s => (
                <SelectItem key={s.id} value={s.id}>{s.full_name} ({s.grade_level})</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label>Subject</Label>
          <Select value={formData.subject} onValueChange={v => setFormData({...formData, subject: v})}>
            <SelectTrigger>
              <SelectValue placeholder="Select subject" />
            </SelectTrigger>
            <SelectContent>
              {["Mathematics", "English/Language Arts", "Science", "History", "Geography", "Art", "Music", "Physical Education", "Foreign Language", "Computer Science", "Life Skills", "Other"].map(s => (
                <SelectItem key={s} value={s}>{s}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label>Assignment Name</Label>
          <Input value={formData.assignment_name} onChange={e => setFormData({...formData, assignment_name: e.target.value})} required />
        </div>
        <div>
          <Label>Score / Max Score</Label>
          <div className="flex gap-2">
            <Input type="number" value={formData.score} onChange={e => setFormData({...formData, score: e.target.value})} required className="flex-1" />
            <span className="flex items-center">/</span>
            <Input type="number" value={formData.max_score} onChange={e => setFormData({...formData, max_score: parseFloat(e.target.value)})} required className="flex-1" />
          </div>
        </div>
        <div className="md:col-span-2">
          <Label>Feedback (optional)</Label>
          <Input value={formData.feedback} onChange={e => setFormData({...formData, feedback: e.target.value})} />
        </div>
      </div>
      <Button type="submit" className="w-full bg-green-600 hover:bg-green-700">Add Grade</Button>
    </form>
  );
}