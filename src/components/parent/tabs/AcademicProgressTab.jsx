import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { BookOpen, CheckCircle, Clock, Award } from 'lucide-react';
import { Progress } from "@/components/ui/progress";

export default function AcademicProgressTab({ student }) {
  const { data: enrollments = [] } = useQuery({
    queryKey: ['student-enrollments', student.id],
    queryFn: () => base44.entities.Enrollment.filter({ student_id: student.id })
  });

  const { data: grades = [] } = useQuery({
    queryKey: ['student-grades', student.id],
    queryFn: () => base44.entities.Grade.filter({ student_id: student.id }, '-created_date', 20)
  });

  const { data: lessonProgress = [] } = useQuery({
    queryKey: ['lesson-progress', student.id],
    queryFn: () => base44.entities.LessonProgress.filter({ student_id: student.id })
  });

  const calculateSubjectProgress = (subjectName) => {
    const subjectLessons = lessonProgress.filter(lp => lp.unit_id?.includes(subjectName));
    if (subjectLessons.length === 0) return 0;
    const completed = subjectLessons.filter(lp => lp.status === "Completed").length;
    return Math.round((completed / subjectLessons.length) * 100);
  };

  const getStatusColor = (status) => {
    if (status === "Completed") return "bg-green-100 text-green-800";
    if (status === "In Progress") return "bg-blue-100 text-blue-800";
    return "bg-gray-100 text-gray-800";
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-purple-600" />
            Course Enrollments
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {enrollments.map((enrollment) => {
              const progress = calculateSubjectProgress(enrollment.course_name);
              return (
                <Card key={enrollment.id} className="border-2">
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <h4 className="font-semibold text-gray-900">{enrollment.course_name}</h4>
                        <p className="text-sm text-gray-600">{enrollment.course_type}</p>
                      </div>
                      <Badge className={getStatusColor(enrollment.status)}>
                        {enrollment.status}
                      </Badge>
                    </div>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-600">Progress</span>
                        <span className="font-semibold text-purple-700">{progress}%</span>
                      </div>
                      <Progress value={progress} className="h-2" />
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Award className="w-5 h-5 text-purple-600" />
            Recent Grades & Assessments
          </CardTitle>
        </CardHeader>
        <CardContent>
          {grades.length > 0 ? (
            <div className="space-y-3">
              {grades.slice(0, 10).map((grade) => {
                const percentage = Math.round((grade.score / (grade.max_score || 100)) * 100);
                const gradeColor = percentage >= 90 ? "text-green-600" : percentage >= 80 ? "text-blue-600" : percentage >= 70 ? "text-yellow-600" : "text-red-600";
                
                return (
                  <div key={grade.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div className="flex-1">
                      <h4 className="font-semibold text-gray-900">{grade.assignment_name}</h4>
                      <p className="text-sm text-gray-600">{grade.subject}</p>
                      {grade.feedback && (
                        <p className="text-xs text-gray-500 mt-1 italic">"{grade.feedback}"</p>
                      )}
                    </div>
                    <div className="text-right">
                      <div className={`text-2xl font-bold ${gradeColor}`}>{percentage}%</div>
                      <div className="text-sm text-gray-500">{grade.score}/{grade.max_score}</div>
                      {grade.letter_grade && (
                        <Badge variant="outline" className="mt-1">{grade.letter_grade}</Badge>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              No grades recorded yet
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CheckCircle className="w-5 h-5 text-purple-600" />
            Lesson Progress
          </CardTitle>
        </CardHeader>
        <CardContent>
          {lessonProgress.length > 0 ? (
            <div className="space-y-2">
              {lessonProgress.slice(0, 10).map((progress) => (
                <div key={progress.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-900">Lesson in {progress.unit_id}</p>
                    <p className="text-xs text-gray-600">
                      {progress.time_spent_minutes || 0} minutes • {progress.completion_percentage || 0}% complete
                    </p>
                  </div>
                  <Badge className={getStatusColor(progress.status)}>
                    {progress.status}
                  </Badge>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              No lesson progress recorded yet
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}