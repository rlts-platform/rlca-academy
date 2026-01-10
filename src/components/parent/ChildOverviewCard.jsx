import React from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { BookOpen, TrendingUp, AlertCircle, CheckCircle, Clock } from 'lucide-react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';

export default function ChildOverviewCard({ student, progress, onSelect }) {
  const getStatusColor = (status) => {
    if (status === "Excelling") return "bg-green-100 text-green-800";
    if (status === "On Track") return "bg-blue-100 text-blue-800";
    if (status === "Needs Attention") return "bg-yellow-100 text-yellow-800";
    return "bg-red-100 text-red-800";
  };

  const getStatusIcon = (status) => {
    if (status === "Excelling" || status === "On Track") return CheckCircle;
    if (status === "Needs Attention") return AlertCircle;
    return AlertCircle;
  };

  const StatusIcon = getStatusIcon(progress?.status || "On Track");

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      whileHover={{ scale: 1.02 }}
      transition={{ duration: 0.2 }}
    >
      <Card className="hover:shadow-xl transition-all cursor-pointer border-2 hover:border-purple-300">
        <CardContent className="p-6">
          <div className="flex items-start justify-between mb-4">
            <div>
              <h3 className="text-xl font-bold text-gray-900">{student.full_name}</h3>
              <p className="text-sm text-gray-600 mt-1">{student.grade_level}</p>
            </div>
            <Badge className={getStatusColor(progress?.status || "On Track")}>
              <StatusIcon className="w-3 h-3 mr-1" />
              {progress?.status || "On Track"}
            </Badge>
          </div>

          {progress && (
            <div className="space-y-3 mb-4">
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600 flex items-center gap-2">
                  <BookOpen className="w-4 h-4" />
                  Current Progress
                </span>
                <span className="font-semibold text-purple-700">{progress.completion}%</span>
              </div>
              
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-gradient-to-r from-purple-500 to-blue-500 h-2 rounded-full transition-all"
                  style={{ width: `${progress.completion}%` }}
                />
              </div>

              {progress.currentLesson && (
                <div className="text-xs text-gray-600 mt-2">
                  <span className="font-medium">Currently studying:</span> {progress.currentLesson}
                </div>
              )}

              <div className="grid grid-cols-2 gap-2 mt-3 pt-3 border-t">
                <div className="text-center">
                  <div className="text-lg font-bold text-purple-600">{progress.lessonsCompleted || 0}</div>
                  <div className="text-xs text-gray-500">Lessons Done</div>
                </div>
                <div className="text-center">
                  <div className="text-lg font-bold text-blue-600">{progress.weeklyHours || 0}h</div>
                  <div className="text-xs text-gray-500">This Week</div>
                </div>
              </div>
            </div>
          )}

          <Button 
            onClick={() => onSelect(student)}
            className="w-full bg-gradient-to-r from-purple-600 to-blue-600"
          >
            View Details
          </Button>
        </CardContent>
      </Card>
    </motion.div>
  );
}