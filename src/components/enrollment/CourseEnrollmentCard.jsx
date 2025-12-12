import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { BookOpen, Calendar, TrendingUp } from 'lucide-react';

export default function CourseEnrollmentCard({ enrollment }) {
  const statusColors = {
    Active: 'bg-green-100 text-green-800',
    Completed: 'bg-blue-100 text-blue-800',
    Dropped: 'bg-red-100 text-red-800',
    Pending: 'bg-yellow-100 text-yellow-800',
    Waitlisted: 'bg-gray-100 text-gray-800'
  };

  const typeIcons = {
    Subject: BookOpen,
    Unit: BookOpen,
    Club: Users,
    Extracurricular: TrendingUp
  };

  const Icon = typeIcons[enrollment.course_type] || BookOpen;

  return (
    <Card className="hover:shadow-lg transition-shadow">
      <CardHeader className="bg-gradient-to-r from-purple-50 to-blue-50 border-b">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Icon className="w-5 h-5 text-purple-600" />
            <CardTitle className="text-lg">{enrollment.course_name}</CardTitle>
          </div>
          <Badge className={statusColors[enrollment.status]}>
            {enrollment.status}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="p-6 space-y-4">
        <div className="flex items-center justify-between text-sm">
          <span className="text-gray-600">Course Type:</span>
          <span className="font-semibold text-gray-900">{enrollment.course_type}</span>
        </div>

        <div className="flex items-center justify-between text-sm">
          <span className="text-gray-600 flex items-center gap-1">
            <Calendar className="w-4 h-4" />
            Enrolled:
          </span>
          <span className="font-semibold text-gray-900">
            {new Date(enrollment.enrollment_date).toLocaleDateString()}
          </span>
        </div>

        {enrollment.academic_year && (
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-600">Academic Year:</span>
            <span className="font-semibold text-gray-900">{enrollment.academic_year}</span>
          </div>
        )}

        {enrollment.semester && (
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-600">Semester:</span>
            <span className="font-semibold text-gray-900">{enrollment.semester}</span>
          </div>
        )}

        {enrollment.status === 'Active' && (
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-600">Progress:</span>
              <span className="font-semibold text-gray-900">{enrollment.progress_percentage}%</span>
            </div>
            <Progress value={enrollment.progress_percentage} className="h-2" />
          </div>
        )}

        {enrollment.completion_date && (
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-600">Completed:</span>
            <span className="font-semibold text-green-600">
              {new Date(enrollment.completion_date).toLocaleDateString()}
            </span>
          </div>
        )}

        {enrollment.notes && (
          <div className="pt-2 border-t">
            <p className="text-xs text-gray-600">{enrollment.notes}</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}