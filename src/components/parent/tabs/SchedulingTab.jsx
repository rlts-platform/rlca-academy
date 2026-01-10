import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Calendar, Clock, AlertCircle } from 'lucide-react';
import { format, parseISO, isBefore } from 'date-fns';

export default function SchedulingTab({ student }) {
  const { data: assignments = [] } = useQuery({
    queryKey: ['student-assignments-schedule', student.cohort_id],
    queryFn: async () => {
      if (!student.cohort_id) return [];
      return base44.entities.Assignment.filter({ cohort_id: student.cohort_id, status: 'Published' }, 'due_date');
    }
  });

  const upcomingAssignments = assignments.filter(a => !isBefore(parseISO(a.due_date), new Date()));
  const pastAssignments = assignments.filter(a => isBefore(parseISO(a.due_date), new Date()));

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="w-5 h-5 text-purple-600" />
            Upcoming Assignments & Deadlines
          </CardTitle>
        </CardHeader>
        <CardContent>
          {upcomingAssignments.length > 0 ? (
            <div className="space-y-3">
              {upcomingAssignments.map((assignment) => {
                const daysUntilDue = Math.ceil((parseISO(assignment.due_date) - new Date()) / (1000 * 60 * 60 * 24));
                const isUrgent = daysUntilDue <= 3;
                
                return (
                  <Card key={assignment.id} className={`border-2 ${isUrgent ? 'border-red-300 bg-red-50' : ''}`}>
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h4 className="font-semibold text-gray-900">{assignment.title}</h4>
                          <p className="text-sm text-gray-600">{assignment.subject}</p>
                          <div className="flex items-center gap-3 mt-2 text-xs text-gray-500">
                            <span className="flex items-center gap-1">
                              <Clock className="w-3 h-3" />
                              {assignment.estimated_time_minutes} min
                            </span>
                            <Badge variant="outline">{assignment.assignment_type}</Badge>
                          </div>
                        </div>
                        <div className="text-right">
                          {isUrgent && <AlertCircle className="w-5 h-5 text-red-600 mb-1 ml-auto" />}
                          <div className="text-sm font-semibold text-gray-900">
                            Due: {format(parseISO(assignment.due_date), 'MMM d')}
                          </div>
                          <div className="text-xs text-gray-600">
                            {daysUntilDue} day{daysUntilDue !== 1 ? 's' : ''} left
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              No upcoming assignments
            </div>
          )}
        </CardContent>
      </Card>

      {pastAssignments.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-gray-600">Past Assignments</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {pastAssignments.slice(0, 5).map((assignment) => (
                <div key={assignment.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div>
                    <h4 className="text-sm font-medium text-gray-700">{assignment.title}</h4>
                    <p className="text-xs text-gray-500">{assignment.subject}</p>
                  </div>
                  <div className="text-xs text-gray-500">
                    {format(parseISO(assignment.due_date), 'MMM d, yyyy')}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}