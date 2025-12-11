import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { BookOpen, TrendingUp } from "lucide-react";
import { motion } from "framer-motion";

export default function GradesList({ grades, title = "Recent Grades" }) {
  const getGradeColor = (percentage) => {
    if (percentage >= 90) return "bg-green-100 text-green-800 border-green-200";
    if (percentage >= 80) return "bg-blue-100 text-blue-800 border-blue-200";
    if (percentage >= 70) return "bg-yellow-100 text-yellow-800 border-yellow-200";
    return "bg-red-100 text-red-800 border-red-200";
  };

  const calculatePercentage = (score, maxScore) => {
    return Math.round((score / maxScore) * 100);
  };

  return (
    <Card className="shadow-lg">
      <CardHeader className="border-b bg-gradient-to-r from-purple-50 to-blue-50">
        <CardTitle className="flex items-center gap-2 text-purple-900">
          <BookOpen className="w-5 h-5" />
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent className="p-6">
        {!grades || grades.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            No grades recorded yet
          </div>
        ) : (
          <div className="space-y-3">
            {grades.map((grade, index) => {
              const percentage = calculatePercentage(grade.score, grade.max_score || 100);
              return (
                <motion.div
                  key={grade.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="flex items-center justify-between p-4 bg-white rounded-lg border hover:border-purple-300 transition-all"
                >
                  <div className="flex-1">
                    <div className="font-semibold text-gray-900">{grade.assignment_name}</div>
                    <div className="text-sm text-gray-600 mt-1">{grade.subject}</div>
                    {grade.feedback && (
                      <div className="text-xs text-gray-500 mt-2 italic">"{grade.feedback}"</div>
                    )}
                  </div>
                  <div className="flex items-center gap-3">
                    <Badge className={`${getGradeColor(percentage)} border font-semibold`}>
                      {grade.score}/{grade.max_score || 100}
                    </Badge>
                    <div className="text-2xl font-bold text-purple-600">{percentage}%</div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}