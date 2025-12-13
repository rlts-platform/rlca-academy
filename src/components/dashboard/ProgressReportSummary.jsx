import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { TrendingUp, TrendingDown, BookOpen, Calendar, Users, Target } from "lucide-react";
import { motion } from "framer-motion";

export default function ProgressReportSummary({ student, grades, attendance, enrollments }) {
  const calculateAverageGrade = () => {
    if (!grades || grades.length === 0) return 0;
    const total = grades.reduce((sum, g) => {
      const percentage = (g.score / (g.max_score || 100)) * 100;
      return sum + percentage;
    }, 0);
    return Math.round(total / grades.length);
  };

  const calculateAttendanceRate = () => {
    if (!attendance || attendance.length === 0) return 0;
    const present = attendance.filter(a => a.status === "Present").length;
    return Math.round((present / attendance.length) * 100);
  };

  const getGradesBySubject = () => {
    if (!grades || grades.length === 0) return [];
    const subjects = {};
    grades.forEach(grade => {
      if (!subjects[grade.subject]) {
        subjects[grade.subject] = { total: 0, count: 0 };
      }
      const percentage = (grade.score / (grade.max_score || 100)) * 100;
      subjects[grade.subject].total += percentage;
      subjects[grade.subject].count += 1;
    });
    return Object.entries(subjects).map(([subject, data]) => ({
      subject,
      average: Math.round(data.total / data.count)
    })).sort((a, b) => b.average - a.average);
  };

  const getRecentTrend = () => {
    if (!grades || grades.length < 2) return 'stable';
    const recent = grades.slice(0, 3);
    const older = grades.slice(3, 6);
    
    if (older.length === 0) return 'stable';
    
    const recentAvg = recent.reduce((sum, g) => sum + ((g.score / (g.max_score || 100)) * 100), 0) / recent.length;
    const olderAvg = older.reduce((sum, g) => sum + ((g.score / (g.max_score || 100)) * 100), 0) / older.length;
    
    if (recentAvg > olderAvg + 5) return 'improving';
    if (recentAvg < olderAvg - 5) return 'declining';
    return 'stable';
  };

  const getActiveEnrollments = () => {
    if (!enrollments) return 0;
    return enrollments.filter(e => e.status === 'Active').length;
  };

  const avgGrade = calculateAverageGrade();
  const attendanceRate = calculateAttendanceRate();
  const subjectBreakdown = getGradesBySubject();
  const trend = getRecentTrend();
  const activeEnrollments = getActiveEnrollments();

  const getGradeColor = (grade) => {
    if (grade >= 90) return "text-green-600 bg-green-50";
    if (grade >= 80) return "text-blue-600 bg-blue-50";
    if (grade >= 70) return "text-yellow-600 bg-yellow-50";
    return "text-red-600 bg-red-50";
  };

  const getTrendIcon = () => {
    if (trend === 'improving') return <TrendingUp className="w-5 h-5 text-green-600" />;
    if (trend === 'declining') return <TrendingDown className="w-5 h-5 text-red-600" />;
    return <Target className="w-5 h-5 text-gray-600" />;
  };

  const getTrendText = () => {
    if (trend === 'improving') return 'Performance is improving! 📈';
    if (trend === 'declining') return 'Needs attention 📉';
    return 'Maintaining steady progress';
  };

  return (
    <Card className="shadow-lg">
      <CardHeader className="border-b bg-gradient-to-r from-indigo-50 to-purple-50">
        <CardTitle className="flex items-center gap-2 text-indigo-900">
          <BookOpen className="w-5 h-5" />
          Progress Report Summary
        </CardTitle>
      </CardHeader>
      <CardContent className="p-6">
        {/* Overall Performance */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className={`p-4 rounded-lg border-2 ${getGradeColor(avgGrade)}`}
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium">Average Grade</span>
              {getTrendIcon()}
            </div>
            <div className="text-3xl font-bold">{avgGrade}%</div>
            <div className="text-xs mt-1">{getTrendText()}</div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.1 }}
            className="p-4 rounded-lg border-2 bg-blue-50 text-blue-600"
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium">Attendance</span>
              <Calendar className="w-5 h-5" />
            </div>
            <div className="text-3xl font-bold">{attendanceRate}%</div>
            <div className="text-xs mt-1">{attendance?.length || 0} days tracked</div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2 }}
            className="p-4 rounded-lg border-2 bg-purple-50 text-purple-600"
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium">Active Courses</span>
              <Users className="w-5 h-5" />
            </div>
            <div className="text-3xl font-bold">{activeEnrollments}</div>
            <div className="text-xs mt-1">Enrolled courses</div>
          </motion.div>
        </div>

        {/* Subject Breakdown */}
        {subjectBreakdown.length > 0 && (
          <div>
            <h4 className="font-semibold text-gray-900 mb-3">Performance by Subject</h4>
            <div className="space-y-3">
              {subjectBreakdown.map((item, index) => (
                <motion.div
                  key={item.subject}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="flex items-center gap-3"
                >
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm font-medium text-gray-700">{item.subject}</span>
                      <span className={`text-sm font-bold ${
                        item.average >= 90 ? 'text-green-600' :
                        item.average >= 80 ? 'text-blue-600' :
                        item.average >= 70 ? 'text-yellow-600' :
                        'text-red-600'
                      }`}>
                        {item.average}%
                      </span>
                    </div>
                    <Progress value={item.average} className="h-2" />
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        )}

        {/* No Data State */}
        {subjectBreakdown.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            <BookOpen className="w-12 h-12 mx-auto mb-2 text-gray-300" />
            <p>No performance data yet</p>
            <p className="text-sm mt-1">Grades will appear here once recorded</p>
          </div>
        )}

        {/* Insights */}
        {grades && grades.length > 0 && (
          <div className="mt-6 pt-6 border-t">
            <h4 className="font-semibold text-gray-900 mb-3">Quick Insights</h4>
            <div className="space-y-2">
              {avgGrade >= 90 && (
                <div className="p-3 bg-green-50 rounded-lg border border-green-200 text-sm text-green-800">
                  🌟 Excellent work! Maintaining outstanding grades
                </div>
              )}
              {attendanceRate >= 95 && (
                <div className="p-3 bg-blue-50 rounded-lg border border-blue-200 text-sm text-blue-800">
                  ⭐ Perfect attendance! Great dedication
                </div>
              )}
              {trend === 'improving' && (
                <div className="p-3 bg-purple-50 rounded-lg border border-purple-200 text-sm text-purple-800">
                  📈 Grades are trending upward - keep up the momentum!
                </div>
              )}
              {subjectBreakdown.length > 0 && subjectBreakdown[0].average >= 95 && (
                <div className="p-3 bg-indigo-50 rounded-lg border border-indigo-200 text-sm text-indigo-800">
                  🏆 Top performer in {subjectBreakdown[0].subject}!
                </div>
              )}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}