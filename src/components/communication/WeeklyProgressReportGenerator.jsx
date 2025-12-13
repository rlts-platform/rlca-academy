import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FileText, Download, Sparkles, Loader2, Mail } from "lucide-react";
import { base44 } from '@/api/base44Client';
import { motion } from "framer-motion";

export default function WeeklyProgressReportGenerator({ student, grades, attendance, weeklyGoals, enrollments }) {
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(false);

  const generateReport = async () => {
    setLoading(true);
    
    try {
      const recentGrades = grades.slice(0, 10);
      const avgGrade = grades.length > 0 
        ? Math.round(grades.reduce((sum, g) => sum + ((g.score / (g.max_score || 100)) * 100), 0) / grades.length)
        : 0;
      
      const recentAttendance = attendance.slice(0, 7);
      const attendanceRate = attendance.length > 0
        ? Math.round((attendance.filter(a => a.status === 'Present').length / attendance.length) * 100)
        : 0;

      const completedGoals = weeklyGoals.filter(g => g.status === 'Completed').length;
      const activeGoals = weeklyGoals.filter(g => g.status === 'Active').length;

      const prompt = `You are an educational advisor writing a personalized weekly progress report for a parent.

STUDENT INFORMATION:
- Name: ${student.full_name}
- Grade Level: ${student.grade_level}
- Age: ${student.age}

THIS WEEK'S PERFORMANCE:
- Average Grade: ${avgGrade}%
- Recent Grades: ${recentGrades.map(g => `${g.subject}: ${Math.round((g.score / (g.max_score || 100)) * 100)}% on ${g.assignment_name}`).join(', ')}
- Attendance Rate: ${attendanceRate}% (${recentAttendance.filter(a => a.status === 'Present').length} of ${recentAttendance.length} days present)
- Weekly Goals Completed: ${completedGoals} of ${activeGoals + completedGoals}
- Active Enrollments: ${enrollments.filter(e => e.status === 'Active').length} courses

TASK:
Write a warm, encouraging, and informative weekly progress report for the parent. Include:
1. A welcoming opening
2. Academic achievements and highlights
3. Areas showing improvement
4. Any areas needing attention (presented positively)
5. Attendance and engagement summary
6. Weekly goals progress
7. Recommendations for the upcoming week
8. An encouraging closing

Keep tone professional yet warm, focus on strengths while being honest about challenges, and provide specific actionable insights.`;

      const result = await base44.integrations.Core.InvokeLLM({
        prompt,
        response_json_schema: {
          type: "object",
          properties: {
            title: { type: "string" },
            opening: { type: "string" },
            academic_highlights: { type: "array", items: { type: "string" } },
            areas_for_growth: { type: "array", items: { type: "string" } },
            attendance_summary: { type: "string" },
            goals_summary: { type: "string" },
            recommendations: { type: "array", items: { type: "string" } },
            closing: { type: "string" }
          }
        }
      });

      setReport(result);
    } catch (error) {
      console.error('Error generating report:', error);
    } finally {
      setLoading(false);
    }
  };

  const downloadReport = () => {
    if (!report) return;
    
    const reportText = `
${report.title}
Generated: ${new Date().toLocaleDateString()}

${report.opening}

ACADEMIC HIGHLIGHTS:
${report.academic_highlights.map((h, i) => `${i + 1}. ${h}`).join('\n')}

AREAS FOR GROWTH:
${report.areas_for_growth.map((a, i) => `${i + 1}. ${a}`).join('\n')}

ATTENDANCE & ENGAGEMENT:
${report.attendance_summary}

WEEKLY GOALS:
${report.goals_summary}

RECOMMENDATIONS FOR NEXT WEEK:
${report.recommendations.map((r, i) => `${i + 1}. ${r}`).join('\n')}

${report.closing}
    `;

    const blob = new Blob([reportText], { type: 'text/plain' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${student.full_name}_Weekly_Report_${new Date().toLocaleDateString()}.txt`;
    a.click();
  };

  const emailReport = async () => {
    if (!report || !student.parent_email) return;
    
    const reportHTML = `
      <h2>${report.title}</h2>
      <p><em>Generated: ${new Date().toLocaleDateString()}</em></p>
      <p>${report.opening}</p>
      <h3>Academic Highlights</h3>
      <ul>${report.academic_highlights.map(h => `<li>${h}</li>`).join('')}</ul>
      <h3>Areas for Growth</h3>
      <ul>${report.areas_for_growth.map(a => `<li>${a}</li>`).join('')}</ul>
      <h3>Attendance & Engagement</h3>
      <p>${report.attendance_summary}</p>
      <h3>Weekly Goals</h3>
      <p>${report.goals_summary}</p>
      <h3>Recommendations</h3>
      <ul>${report.recommendations.map(r => `<li>${r}</li>`).join('')}</ul>
      <p>${report.closing}</p>
    `;

    try {
      await base44.integrations.Core.SendEmail({
        to: student.parent_email,
        subject: `Weekly Progress Report - ${student.full_name}`,
        body: reportHTML
      });
      alert('Report sent to parent email!');
    } catch (error) {
      console.error('Error sending email:', error);
      alert('Failed to send email');
    }
  };

  return (
    <Card className="shadow-lg">
      <CardHeader className="border-b bg-gradient-to-r from-blue-50 to-cyan-50">
        <CardTitle className="flex items-center gap-2 text-blue-900">
          <FileText className="w-6 h-6" />
          Weekly Progress Report
        </CardTitle>
      </CardHeader>
      <CardContent className="p-6">
        {!report && !loading && (
          <div className="text-center py-12">
            <FileText className="w-16 h-16 mx-auto mb-4 text-blue-300" />
            <p className="text-gray-600 mb-4">
              Generate an AI-powered weekly progress report summarizing your child's performance
            </p>
            <Button onClick={generateReport} className="bg-gradient-to-r from-blue-600 to-cyan-600">
              <Sparkles className="w-4 h-4 mr-2" />
              Generate Report
            </Button>
          </div>
        )}

        {loading && (
          <div className="text-center py-12">
            <Loader2 className="w-12 h-12 animate-spin mx-auto mb-4 text-blue-600" />
            <p className="text-gray-600">Analyzing performance and generating report...</p>
          </div>
        )}

        {report && !loading && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="space-y-6"
          >
            <div className="flex justify-end gap-2">
              <Button onClick={downloadReport} variant="outline" size="sm">
                <Download className="w-4 h-4 mr-2" />
                Download
              </Button>
              <Button onClick={emailReport} variant="outline" size="sm">
                <Mail className="w-4 h-4 mr-2" />
                Email to Parent
              </Button>
              <Button onClick={generateReport} variant="outline" size="sm">
                <Sparkles className="w-4 h-4 mr-2" />
                Regenerate
              </Button>
            </div>

            <div className="bg-white rounded-lg border p-6 space-y-4">
              <h3 className="text-2xl font-bold text-gray-900">{report.title}</h3>
              <p className="text-sm text-gray-500">Generated: {new Date().toLocaleDateString()}</p>
              
              <p className="text-gray-700">{report.opening}</p>

              <div>
                <h4 className="font-semibold text-green-900 mb-2">✨ Academic Highlights</h4>
                <ul className="space-y-1">
                  {report.academic_highlights.map((h, i) => (
                    <li key={i} className="text-gray-700 flex gap-2">
                      <span className="text-green-600">•</span>
                      <span>{h}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div>
                <h4 className="font-semibold text-amber-900 mb-2">📈 Areas for Growth</h4>
                <ul className="space-y-1">
                  {report.areas_for_growth.map((a, i) => (
                    <li key={i} className="text-gray-700 flex gap-2">
                      <span className="text-amber-600">•</span>
                      <span>{a}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div>
                <h4 className="font-semibold text-blue-900 mb-2">📅 Attendance & Engagement</h4>
                <p className="text-gray-700">{report.attendance_summary}</p>
              </div>

              <div>
                <h4 className="font-semibold text-purple-900 mb-2">🎯 Weekly Goals</h4>
                <p className="text-gray-700">{report.goals_summary}</p>
              </div>

              <div>
                <h4 className="font-semibold text-indigo-900 mb-2">💡 Recommendations for Next Week</h4>
                <ul className="space-y-1">
                  {report.recommendations.map((r, i) => (
                    <li key={i} className="text-gray-700 flex gap-2">
                      <span className="text-indigo-600">•</span>
                      <span>{r}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <p className="text-gray-700 italic border-t pt-4">{report.closing}</p>
            </div>
          </motion.div>
        )}
      </CardContent>
    </Card>
  );
}