import React from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { FileText, Clock, Calendar, Award, Heart } from "lucide-react";
import { motion } from "framer-motion";
import { format, parseISO, differenceInDays } from "date-fns";

export default function AssignmentCard({ assignment, submission, onClick, showGrade = false }) {
  const daysUntilDue = differenceInDays(parseISO(assignment.due_date), new Date());
  
  const getUrgencyColor = () => {
    if (submission?.status === "Graded") return "text-gray-500";
    if (daysUntilDue < 0) return "text-red-600";
    if (daysUntilDue <= 2) return "text-orange-600";
    if (daysUntilDue <= 7) return "text-yellow-600";
    return "text-gray-600";
  };

  const statusColors = {
    "Not Started": "bg-gray-100 text-gray-800",
    "In Progress": "bg-blue-100 text-blue-800",
    "Submitted": "bg-green-100 text-green-800",
    "Graded": "bg-purple-100 text-purple-800",
    "Returned": "bg-indigo-100 text-indigo-800"
  };

  const typeIcons = {
    "Written Assignment": "📝",
    "Problem Set": "🔢",
    "Project": "🎯",
    "Reading Response": "📖",
    "Entrepreneurship Challenge": "💡",
    "Creative Work": "🎨",
    "Group Assignment": "👥",
    "Reflection": "💭",
    "Presentation": "🎤"
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -5 }}
      onClick={onClick}
      className="cursor-pointer"
    >
      <Card className="shadow-md hover:shadow-xl transition-all border-l-4 border-purple-500">
        <CardContent className="p-5">
          <div className="flex items-start justify-between mb-3">
            <div className="flex items-center gap-2 flex-1">
              <span className="text-2xl">{typeIcons[assignment.assignment_type] || "📄"}</span>
              <div className="flex-1 min-w-0">
                <h3 className="font-bold text-gray-900 line-clamp-1">{assignment.title}</h3>
                <p className="text-sm text-gray-600">{assignment.subject}</p>
              </div>
            </div>
            {submission && (
              <Badge className={statusColors[submission.status]}>
                {submission.status}
              </Badge>
            )}
          </div>

          {assignment.description && (
            <p className="text-sm text-gray-700 mb-3 line-clamp-2">
              {assignment.description}
            </p>
          )}

          <div className="flex flex-wrap items-center gap-3 text-xs text-gray-600 mb-3">
            <div className="flex items-center gap-1">
              <Calendar className="w-3 h-3" />
              <span className={getUrgencyColor()}>
                Due {format(parseISO(assignment.due_date), 'MMM d')}
                {daysUntilDue >= 0 && ` (${daysUntilDue}d)`}
              </span>
            </div>
            <div className="flex items-center gap-1">
              <Clock className="w-3 h-3" />
              <span>{assignment.estimated_time_minutes || 60} min</span>
            </div>
            <div className="flex items-center gap-1">
              <Award className="w-3 h-3" />
              <span>{assignment.points_possible} pts</span>
            </div>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex flex-wrap gap-2">
              <Badge variant="outline" className="text-xs">
                {assignment.assignment_type}
              </Badge>
              {assignment.faith_character_tag && (
                <Badge className="bg-blue-100 text-blue-800 border-blue-200 text-xs">
                  <Heart className="w-3 h-3 mr-1" />
                  {assignment.faith_character_tag}
                </Badge>
              )}
              {assignment.difficulty_level && (
                <Badge variant="outline" className="text-xs">
                  Level {assignment.difficulty_level}
                </Badge>
              )}
            </div>
            
            {showGrade && submission?.status === "Graded" && (
              <Badge className="bg-purple-600 text-white font-bold">
                {submission.percentage}%
              </Badge>
            )}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}