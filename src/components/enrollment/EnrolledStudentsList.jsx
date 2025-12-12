import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Users, Calendar } from 'lucide-react';

export default function EnrolledStudentsList({ courseType, courseName, enrollments, onUpdateStatus }) {
  const statusColors = {
    Active: 'bg-green-100 text-green-800',
    Completed: 'bg-blue-100 text-blue-800',
    Dropped: 'bg-red-100 text-red-800',
    Pending: 'bg-yellow-100 text-yellow-800',
    Waitlisted: 'bg-gray-100 text-gray-800'
  };

  return (
    <Card>
      <CardHeader className="bg-gradient-to-r from-purple-50 to-blue-50 border-b">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Users className="w-5 h-5 text-purple-600" />
              {courseName}
            </CardTitle>
            <p className="text-sm text-gray-600 mt-1">{courseType}</p>
          </div>
          <Badge variant="outline" className="text-lg">
            {enrollments.length} Enrolled
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="p-6">
        {enrollments.length > 0 ? (
          <div className="space-y-3">
            {enrollments.map((enrollment) => (
              <div
                key={enrollment.id}
                className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <div className="flex-1">
                  <h4 className="font-semibold text-gray-900">{enrollment.student_name}</h4>
                  <div className="flex items-center gap-4 mt-1">
                    <span className="text-xs text-gray-500 flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      Enrolled: {new Date(enrollment.enrollment_date).toLocaleDateString()}
                    </span>
                    <span className="text-xs text-gray-500">
                      Progress: {enrollment.progress_percentage}%
                    </span>
                    {enrollment.grade_level && (
                      <span className="text-xs text-gray-500">
                        Grade: {enrollment.grade_level}
                      </span>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Badge className={statusColors[enrollment.status]}>
                    {enrollment.status}
                  </Badge>
                  <select
                    value={enrollment.status}
                    onChange={(e) => onUpdateStatus({ id: enrollment.id, status: e.target.value })}
                    className="px-3 py-1 border border-gray-300 rounded-md text-sm bg-white"
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
          </div>
        ) : (
          <div className="text-center py-8 text-gray-500">
            <Users className="w-12 h-12 mx-auto mb-3 text-gray-300" />
            <p>No students enrolled in this {courseType.toLowerCase()}</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}