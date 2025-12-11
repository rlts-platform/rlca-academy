import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { CheckCircle, Circle, Flag, Calendar } from "lucide-react";
import { motion } from "framer-motion";
import { format, parseISO } from "date-fns";

export default function MilestonesTracker({ milestones, onToggleComplete }) {
  if (!milestones || milestones.length === 0) return null;

  const completedCount = milestones.filter(m => m.completed).length;
  const progressPercentage = Math.round((completedCount / milestones.length) * 100);

  return (
    <Card className="shadow-lg">
      <CardHeader className="border-b bg-gradient-to-r from-cyan-50 to-blue-50">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-cyan-900">
            <Flag className="w-6 h-6" />
            Learning Milestones
          </CardTitle>
          <Badge className="bg-cyan-100 text-cyan-800 border-cyan-200">
            {completedCount} / {milestones.length} Complete
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="p-6">
        {/* Progress Bar */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-700">Overall Progress</span>
            <span className="text-sm font-bold text-cyan-600">{progressPercentage}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${progressPercentage}%` }}
              transition={{ duration: 1, ease: "easeOut" }}
              className="h-full bg-gradient-to-r from-cyan-500 to-blue-600 rounded-full"
            />
          </div>
        </div>

        {/* Milestones List */}
        <div className="space-y-3">
          {milestones.map((milestone, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
              className={`p-4 rounded-lg border-2 transition-all ${
                milestone.completed
                  ? 'bg-green-50 border-green-300'
                  : 'bg-white border-gray-200 hover:border-cyan-300'
              }`}
            >
              <div className="flex items-start gap-3">
                <button
                  onClick={() => onToggleComplete && onToggleComplete(index)}
                  className="flex-shrink-0 mt-1 transition-transform hover:scale-110"
                >
                  {milestone.completed ? (
                    <CheckCircle className="w-6 h-6 text-green-600" />
                  ) : (
                    <Circle className="w-6 h-6 text-gray-400" />
                  )}
                </button>
                
                <div className="flex-1">
                  <h3 className={`font-bold mb-1 ${
                    milestone.completed ? 'text-green-700 line-through' : 'text-gray-900'
                  }`}>
                    {milestone.title}
                  </h3>
                  
                  {milestone.description && (
                    <p className="text-sm text-gray-600 mb-2">
                      {milestone.description}
                    </p>
                  )}

                  {milestone.target_date && (
                    <div className="flex items-center gap-2 text-xs text-gray-500">
                      <Calendar className="w-3 h-3" />
                      <span>Target: {format(parseISO(milestone.target_date), 'MMM d, yyyy')}</span>
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}