import React from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { FileText, Edit, Trash2, Clock, Lock, CheckCircle } from "lucide-react";
import { motion } from "framer-motion";

export default function LessonCard({ lesson, isLocked, isCompleted, onEdit, onDelete, onClick }) {
  const statusColors = {
    Draft: "bg-gray-100 text-gray-800",
    Published: "bg-green-100 text-green-800",
    Archived: "bg-red-100 text-red-800"
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      whileHover={{ x: 5 }}
      className={`cursor-pointer ${isLocked ? 'opacity-60' : ''}`}
      onClick={!isLocked ? onClick : undefined}
    >
      <Card className={`shadow-sm hover:shadow-lg transition-all border-l-4 ${
        isCompleted ? 'border-green-500 bg-green-50' : 
        isLocked ? 'border-gray-300' : 
        'border-purple-500'
      }`}>
        <CardContent className="p-4">
          <div className="flex items-start justify-between mb-2">
            <div className="flex items-center gap-3 flex-1">
              <div className={`w-8 h-8 rounded-lg flex items-center justify-center shadow-sm ${
                isCompleted ? 'bg-green-500' : 
                isLocked ? 'bg-gray-400' : 
                'bg-purple-500'
              }`}>
                {isLocked ? (
                  <Lock className="w-4 h-4 text-white" />
                ) : isCompleted ? (
                  <CheckCircle className="w-4 h-4 text-white" />
                ) : (
                  <FileText className="w-4 h-4 text-white" />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <h4 className="font-semibold text-gray-900 line-clamp-1">
                  {lesson.title}
                </h4>
                <div className="flex items-center gap-2 text-xs text-gray-600 mt-1">
                  <Clock className="w-3 h-3" />
                  <span>{lesson.estimated_duration_minutes || 45} min</span>
                </div>
              </div>
            </div>
            <Badge className={`${statusColors[lesson.status]} text-xs`}>
              {lesson.status}
            </Badge>
          </div>

          {lesson.summary && (
            <p className="text-xs text-gray-700 mb-2 line-clamp-2">
              {lesson.summary}
            </p>
          )}

          <div className="flex gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={(e) => {
                e.stopPropagation();
                onEdit && onEdit(lesson);
              }}
              className="flex-1 text-xs h-7"
            >
              <Edit className="w-3 h-3 mr-1" />
              Edit
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={(e) => {
                e.stopPropagation();
                onDelete && onDelete(lesson.id);
              }}
              className="text-red-600 hover:text-red-700 text-xs h-7"
            >
              <Trash2 className="w-3 h-3" />
            </Button>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}