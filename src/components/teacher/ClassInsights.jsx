import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Brain, Sparkles, Loader2, TrendingUp, AlertCircle, Users } from "lucide-react";
import { base44 } from '@/api/base44Client';
import { motion } from "framer-motion";

export default function ClassInsights({ students, grades, assignments }) {
  const [insights, setInsights] = useState(null);
  const [loading, setLoading] = useState(false);

  const generateInsights = async () => {
    setLoading(true);
    
    try {
      const activeStudents = students.filter(s => s.enrollment_status === 'Active');
      const avgGrade = grades.length > 0
        ? Math.round(grades.reduce((sum, g) => sum + ((g.score / (g.max_score || 100)) * 100), 0) / grades.length)
        : 0;

      const gradeDistribution = grades.reduce((acc, g) => {
        const percentage = (g.score / (g.max_score || 100)) * 100;
        const letter = percentage >= 90 ? 'A' : percentage >= 80 ? 'B' : percentage >= 70 ? 'C' : percentage >= 60 ? 'D' : 'F';
        acc[letter] = (acc[letter] || 0) + 1;
        return acc;
      }, {});

      const subjectPerformance = grades.reduce((acc, g) => {
        if (!acc[g.subject]) acc[g.subject] = [];
        acc[g.subject].push((g.score / (g.max_score || 100)) * 100);
        return acc;
      }, {});

      const subjectAvgs = Object.entries(subjectPerformance).map(([subject, scores]) => ({
        subject,
        average: Math.round(scores.reduce((a, b) => a + b, 0) / scores.length)
      }));

      const strugglingStudents = activeStudents.filter(student => {
        const studentGrades = grades.filter(g => g.student_id === student.id);
        if (studentGrades.length === 0) return false;
        const avg = studentGrades.reduce((sum, g) => sum + ((g.score / (g.max_score || 100)) * 100), 0) / studentGrades.length;
        return avg < 70;
      });

      const prompt = `You are an educational AI advisor analyzing class performance data.

CLASS OVERVIEW:
- Total Active Students: ${activeStudents.length}
- Total Grades Recorded: ${grades.length}
- Class Average: ${avgGrade}%
- Active Assignments: ${assignments.filter(a => a.status === 'Published').length}

GRADE DISTRIBUTION:
${Object.entries(gradeDistribution).map(([letter, count]) => `${letter}: ${count} grades`).join(', ')}

SUBJECT PERFORMANCE:
${subjectAvgs.map(s => `${s.subject}: ${s.average}%`).join(', ')}

STUDENTS NEEDING SUPPORT: ${strugglingStudents.length} students with average below 70%

TASK:
Provide comprehensive AI-driven insights for this teacher including:
1. Overall class performance analysis
2. Strengths and areas of excellence
3. Areas needing improvement or intervention
4. Specific recommendations for struggling students
5. Subject-specific insights
6. Actionable teaching strategies
7. Student engagement recommendations

Be specific, actionable, and supportive in your recommendations.`;

      const result = await base44.integrations.Core.InvokeLLM({
        prompt,
        response_json_schema: {
          type: "object",
          properties: {
            overall_analysis: { type: "string" },
            class_strengths: { type: "array", items: { type: "string" } },
            areas_for_improvement: { type: "array", items: { type: "string" } },
            intervention_strategies: { type: "array", items: { type: "string" } },
            subject_insights: { type: "array", items: {
              type: "object",
              properties: {
                subject: { type: "string" },
                insight: { type: "string" }
              }
            }},
            recommendations: { type: "array", items: { type: "string" } }
          }
        }
      });

      setInsights({
        ...result,
        classStats: {
          totalStudents: activeStudents.length,
          avgGrade,
          gradeDistribution,
          strugglingCount: strugglingStudents.length
        }
      });
    } catch (error) {
      console.error('Error generating insights:', error);
      alert('Failed to generate insights');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="shadow-lg">
      <CardHeader className="border-b bg-gradient-to-r from-indigo-50 to-purple-50">
        <CardTitle className="flex items-center gap-2">
          <Brain className="w-6 h-6 text-indigo-600" />
          AI-Generated Class Insights
        </CardTitle>
      </CardHeader>
      <CardContent className="p-6">
        {!insights && !loading && (
          <div className="text-center py-12">
            <Brain className="w-16 h-16 mx-auto mb-4 text-indigo-300" />
            <p className="text-gray-600 mb-4">
              Generate AI-powered insights on your class performance and individual student needs
            </p>
            <Button onClick={generateInsights} className="bg-gradient-to-r from-indigo-600 to-purple-600">
              <Sparkles className="w-4 h-4 mr-2" />
              Generate Insights
            </Button>
          </div>
        )}

        {loading && (
          <div className="text-center py-12">
            <Loader2 className="w-12 h-12 animate-spin mx-auto mb-4 text-indigo-600" />
            <p className="text-gray-600">Analyzing class data and generating insights...</p>
          </div>
        )}

        {insights && !loading && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="space-y-6"
          >
            <div className="flex justify-end">
              <Button onClick={generateInsights} variant="outline" size="sm">
                <Sparkles className="w-4 h-4 mr-2" />
                Regenerate
              </Button>
            </div>

            {/* Class Stats */}
            <div className="grid grid-cols-4 gap-4">
              <div className="p-4 bg-blue-50 rounded-lg text-center">
                <Users className="w-6 h-6 mx-auto mb-2 text-blue-600" />
                <p className="text-2xl font-bold text-blue-900">{insights.classStats.totalStudents}</p>
                <p className="text-xs text-blue-700">Students</p>
              </div>
              <div className="p-4 bg-green-50 rounded-lg text-center">
                <TrendingUp className="w-6 h-6 mx-auto mb-2 text-green-600" />
                <p className="text-2xl font-bold text-green-900">{insights.classStats.avgGrade}%</p>
                <p className="text-xs text-green-700">Class Average</p>
              </div>
              <div className="p-4 bg-purple-50 rounded-lg text-center">
                <Brain className="w-6 h-6 mx-auto mb-2 text-purple-600" />
                <p className="text-2xl font-bold text-purple-900">
                  {Object.values(insights.classStats.gradeDistribution).reduce((a, b) => a + b, 0)}
                </p>
                <p className="text-xs text-purple-700">Total Grades</p>
              </div>
              <div className="p-4 bg-amber-50 rounded-lg text-center">
                <AlertCircle className="w-6 h-6 mx-auto mb-2 text-amber-600" />
                <p className="text-2xl font-bold text-amber-900">{insights.classStats.strugglingCount}</p>
                <p className="text-xs text-amber-700">Need Support</p>
              </div>
            </div>

            {/* Overall Analysis */}
            <div className="p-4 bg-gradient-to-r from-indigo-50 to-purple-50 rounded-lg border border-indigo-200">
              <h4 className="font-semibold text-indigo-900 mb-2">📊 Overall Analysis</h4>
              <p className="text-gray-700">{insights.overall_analysis}</p>
            </div>

            {/* Strengths */}
            <div>
              <h4 className="font-semibold text-green-900 mb-3 flex items-center gap-2">
                ✨ Class Strengths
              </h4>
              <ul className="space-y-2">
                {insights.class_strengths.map((strength, i) => (
                  <li key={i} className="flex gap-2 text-gray-700">
                    <span className="text-green-600">•</span>
                    <span>{strength}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Areas for Improvement */}
            <div>
              <h4 className="font-semibold text-amber-900 mb-3 flex items-center gap-2">
                📈 Areas for Improvement
              </h4>
              <ul className="space-y-2">
                {insights.areas_for_improvement.map((area, i) => (
                  <li key={i} className="flex gap-2 text-gray-700">
                    <span className="text-amber-600">•</span>
                    <span>{area}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Intervention Strategies */}
            <div>
              <h4 className="font-semibold text-red-900 mb-3 flex items-center gap-2">
                🎯 Intervention Strategies
              </h4>
              <ul className="space-y-2">
                {insights.intervention_strategies.map((strategy, i) => (
                  <li key={i} className="flex gap-2 text-gray-700">
                    <span className="text-red-600">•</span>
                    <span>{strategy}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Subject Insights */}
            {insights.subject_insights && insights.subject_insights.length > 0 && (
              <div>
                <h4 className="font-semibold text-blue-900 mb-3">📚 Subject-Specific Insights</h4>
                <div className="space-y-3">
                  {insights.subject_insights.map((subj, i) => (
                    <div key={i} className="p-3 bg-blue-50 rounded-lg border border-blue-200">
                      <p className="font-semibold text-blue-900 mb-1">{subj.subject}</p>
                      <p className="text-sm text-gray-700">{subj.insight}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Recommendations */}
            <div>
              <h4 className="font-semibold text-purple-900 mb-3 flex items-center gap-2">
                💡 Action Recommendations
              </h4>
              <ul className="space-y-2">
                {insights.recommendations.map((rec, i) => (
                  <li key={i} className="flex gap-2 text-gray-700">
                    <span className="text-purple-600">•</span>
                    <span>{rec}</span>
                  </li>
                ))}
              </ul>
            </div>
          </motion.div>
        )}
      </CardContent>
    </Card>
  );
}