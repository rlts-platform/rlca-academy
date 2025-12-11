import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ClipboardList, Clock } from "lucide-react";
import { format, parseISO, differenceInDays } from "date-fns";
import { motion } from "framer-motion";

export default function UpcomingAssignments({ assignments, title = "Upcoming Assignments" }) {
  const getDaysUntilDue = (dueDate) => {
    return differenceInDays(parseISO(dueDate), new Date());
  };

  const getUrgencyColor = (daysUntil) => {
    if (daysUntil < 0) return "bg-red-100 text-red-800 border-red-200";
    if (daysUntil <= 2) return "bg-orange-100 text-orange-800 border-orange-200";
    if (daysUntil <= 5) return "bg-yellow-100 text-yellow-800 border-yellow-200";
    return "bg-green-100 text-green-800 border-green-200";
  };

  const getUrgencyText = (daysUntil) => {
    if (daysUntil < 0) return "Overdue";
    if (daysUntil === 0) return "Due Today";
    if (daysUntil === 1) return "Due Tomorrow";
    return `${daysUntil} days left`;
  };

  const subjectColors = {
    "Mathematics": "bg-blue-500",
    "English/Language Arts": "bg-green-500",
    "Science": "bg-purple-500",
    "History": "bg-amber-500",
    "Geography": "bg-teal-500",
    "Art": "bg-pink-500",
    "Music": "bg-indigo-500",
    "Physical Education": "bg-orange-500",
    "Foreign Language": "bg-cyan-500",
    "Computer Science": "bg-slate-500",
    "Life Skills": "bg-emerald-500",
    "Other": "bg-gray-500"
  };

  return (
    <Card className="shadow-lg">
      <CardHeader className="border-b bg-gradient-to-r from-amber-50 to-orange-50">
        <CardTitle className="flex items-center gap-2 text-amber-900">
          <ClipboardList className="w-5 h-5" />
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent className="p-6">
        {!assignments || assignments.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            No upcoming assignments
          </div>
        ) : (
          <div className="space-y-3">
            {assignments.map((assignment, index) => {
              const daysUntil = getDaysUntilDue(assignment.due_date);
              return (
                <motion.div
                  key={assignment.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="p-4 bg-white rounded-lg border hover:border-amber-300 transition-all"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <div className={`w-3 h-3 rounded-full ${subjectColors[assignment.subject] || subjectColors["Other"]}`}></div>
                        <span className="text-xs font-medium text-gray-600">{assignment.subject}</span>
                      </div>
                      <div className="font-semibold text-gray-900">{assignment.title}</div>
                      {assignment.description && (
                        <div className="text-sm text-gray-600 mt-1 line-clamp-2">{assignment.description}</div>
                      )}
                      <div className="flex items-center gap-2 mt-3 text-xs text-gray-500">
                        <Clock className="w-3 h-3" />
                        Due {format(parseISO(assignment.due_date), 'MMM d, yyyy')}
                      </div>
                    </div>
                    <Badge className={`${getUrgencyColor(daysUntil)} border font-semibold ml-4`}>
                      {getUrgencyText(daysUntil)}
                    </Badge>
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