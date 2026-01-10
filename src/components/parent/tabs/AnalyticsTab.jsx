import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TrendingUp, Clock, Target, Award, BookOpen } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, LineChart, Line } from 'recharts';

export default function AnalyticsTab({ student }) {
  const { data: grades = [] } = useQuery({
    queryKey: ['student-grades', student.id],
    queryFn: () => base44.entities.Grade.filter({ student_id: student.id }, '-created_date')
  });

  const { data: lessonProgress = [] } = useQuery({
    queryKey: ['lesson-progress', student.id],
    queryFn: () => base44.entities.LessonProgress.filter({ student_id: student.id })
  });

  const calculateAverageBySubject = () => {
    const subjectGrades = {};
    grades.forEach(grade => {
      if (!subjectGrades[grade.subject]) {
        subjectGrades[grade.subject] = [];
      }
      const percentage = (grade.score / (grade.max_score || 100)) * 100;
      subjectGrades[grade.subject].push(percentage);
    });

    return Object.entries(subjectGrades).map(([subject, scores]) => ({
      subject: subject.replace(/Grade \d+ /, ''),
      average: Math.round(scores.reduce((a, b) => a + b, 0) / scores.length)
    }));
  };

  const calculateWeeklyTime = () => {
    const totalMinutes = lessonProgress.reduce((sum, lp) => sum + (lp.time_spent_minutes || 0), 0);
    return Math.round(totalMinutes / 60);
  };

  const calculateStrengthsGaps = () => {
    const subjectAverages = calculateAverageBySubject();
    const strengths = subjectAverages.filter(s => s.average >= 85).map(s => s.subject);
    const gaps = subjectAverages.filter(s => s.average < 75).map(s => s.subject);
    return { strengths, gaps };
  };

  const subjectData = calculateAverageBySubject();
  const weeklyHours = calculateWeeklyTime();
  const { strengths, gaps } = calculateStrengthsGaps();

  const completedLessons = lessonProgress.filter(lp => lp.status === "Completed").length;
  const inProgressLessons = lessonProgress.filter(lp => lp.status === "In Progress").length;

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-purple-100 flex items-center justify-center">
                <Clock className="w-6 h-6 text-purple-600" />
              </div>
              <div>
                <div className="text-2xl font-bold text-gray-900">{weeklyHours}h</div>
                <div className="text-xs text-gray-600">Total Study Time</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center">
                <BookOpen className="w-6 h-6 text-green-600" />
              </div>
              <div>
                <div className="text-2xl font-bold text-gray-900">{completedLessons}</div>
                <div className="text-xs text-gray-600">Lessons Completed</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center">
                <Target className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <div className="text-2xl font-bold text-gray-900">{inProgressLessons}</div>
                <div className="text-xs text-gray-600">In Progress</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-yellow-100 flex items-center justify-center">
                <Award className="w-6 h-6 text-yellow-600" />
              </div>
              <div>
                <div className="text-2xl font-bold text-gray-900">{grades.length}</div>
                <div className="text-xs text-gray-600">Total Grades</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-purple-600" />
            Performance by Subject
          </CardTitle>
        </CardHeader>
        <CardContent>
          {subjectData.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={subjectData}>
                <XAxis dataKey="subject" />
                <YAxis domain={[0, 100]} />
                <Tooltip />
                <Bar dataKey="average" fill="#8b5cf6" />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="text-center py-8 text-gray-500">No grade data available yet</div>
          )}
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="border-2 border-green-200 bg-green-50">
          <CardHeader>
            <CardTitle className="text-green-800">Strengths</CardTitle>
          </CardHeader>
          <CardContent>
            {strengths.length > 0 ? (
              <ul className="space-y-2">
                {strengths.map((subject, idx) => (
                  <li key={idx} className="flex items-center gap-2 text-green-700">
                    <Award className="w-4 h-4" />
                    {subject}
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-green-600">Keep building strengths!</p>
            )}
          </CardContent>
        </Card>

        <Card className="border-2 border-yellow-200 bg-yellow-50">
          <CardHeader>
            <CardTitle className="text-yellow-800">Areas for Growth</CardTitle>
          </CardHeader>
          <CardContent>
            {gaps.length > 0 ? (
              <ul className="space-y-2">
                {gaps.map((subject, idx) => (
                  <li key={idx} className="flex items-center gap-2 text-yellow-700">
                    <Target className="w-4 h-4" />
                    {subject}
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-yellow-600">All subjects are on track!</p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}