import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Target, AlertTriangle, Clock } from "lucide-react";
import { motion } from "framer-motion";

export default function FocusAreasGrid({ focusAreas }) {
  if (!focusAreas || focusAreas.length === 0) return null;

  const priorityColors = {
    "High": "bg-red-100 text-red-800 border-red-300",
    "Medium": "bg-yellow-100 text-yellow-800 border-yellow-300",
    "Low": "bg-green-100 text-green-800 border-green-300"
  };

  const priorityIcons = {
    "High": <AlertTriangle className="w-4 h-4" />,
    "Medium": <Target className="w-4 h-4" />,
    "Low": <Target className="w-4 h-4" />
  };

  return (
    <Card className="shadow-lg">
      <CardHeader className="border-b bg-gradient-to-r from-amber-50 to-orange-50">
        <CardTitle className="flex items-center gap-2 text-amber-900">
          <Target className="w-6 h-6" />
          Recommended Focus Areas
        </CardTitle>
      </CardHeader>
      <CardContent className="p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {focusAreas.map((area, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: index * 0.1 }}
              className="p-5 bg-gradient-to-br from-white to-gray-50 rounded-xl border-2 border-gray-200 hover:border-amber-300 hover:shadow-lg transition-all"
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-2">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center text-white font-bold">
                    {index + 1}
                  </div>
                </div>
                <Badge className={`${priorityColors[area.priority]} border flex items-center gap-1`}>
                  {priorityIcons[area.priority]}
                  {area.priority}
                </Badge>
              </div>
              
              <h3 className="font-bold text-gray-900 mb-1">{area.subject}</h3>
              <p className="text-sm font-medium text-gray-700 mb-3">{area.topic}</p>
              
              {area.reason && (
                <p className="text-xs text-gray-600 mb-3 italic">
                  "{area.reason}"
                </p>
              )}

              {area.estimated_weeks && (
                <div className="flex items-center gap-2 text-xs text-gray-500">
                  <Clock className="w-3 h-3" />
                  <span>{area.estimated_weeks} {area.estimated_weeks === 1 ? 'week' : 'weeks'} estimated</span>
                </div>
              )}
            </motion.div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}