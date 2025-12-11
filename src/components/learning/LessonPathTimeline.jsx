import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Calendar, BookOpen, Target, ChevronDown, ChevronUp, ExternalLink } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function LessonPathTimeline({ lessonPath }) {
  const [expandedWeek, setExpandedWeek] = useState(null);

  if (!lessonPath || lessonPath.length === 0) return null;

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
      <CardHeader className="border-b bg-gradient-to-r from-indigo-50 to-purple-50">
        <CardTitle className="flex items-center gap-2 text-indigo-900">
          <Calendar className="w-6 h-6" />
          Personalized Learning Path
        </CardTitle>
      </CardHeader>
      <CardContent className="p-6">
        <div className="space-y-4">
          {lessonPath.map((week, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              className="relative"
            >
              {/* Timeline connector */}
              {index < lessonPath.length - 1 && (
                <div className="absolute left-6 top-20 w-0.5 h-full bg-gradient-to-b from-purple-300 to-blue-300 -z-10"></div>
              )}

              <div className="flex gap-4">
                {/* Week Number Badge */}
                <div className="flex-shrink-0">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-purple-500 to-blue-600 flex items-center justify-center text-white font-bold shadow-lg">
                    {week.week}
                  </div>
                </div>

                {/* Week Content */}
                <div className="flex-1">
                  <div 
                    className={`p-4 rounded-lg border-2 cursor-pointer transition-all ${
                      expandedWeek === index 
                        ? 'bg-white border-purple-300 shadow-lg' 
                        : 'bg-gray-50 border-gray-200 hover:border-purple-200 hover:shadow-md'
                    }`}
                    onClick={() => setExpandedWeek(expandedWeek === index ? null : index)}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <div className={`w-3 h-3 rounded-full ${subjectColors[week.subject] || subjectColors["Other"]}`}></div>
                          <h3 className="font-bold text-gray-900">Week {week.week}: {week.subject}</h3>
                        </div>
                        <div className="flex flex-wrap gap-2 mb-2">
                          {week.topics && week.topics.slice(0, 3).map((topic, i) => (
                            <Badge key={i} variant="secondary" className="text-xs">
                              {topic}
                            </Badge>
                          ))}
                          {week.topics && week.topics.length > 3 && (
                            <Badge variant="secondary" className="text-xs">
                              +{week.topics.length - 3} more
                            </Badge>
                          )}
                        </div>
                      </div>
                      <Button variant="ghost" size="sm">
                        {expandedWeek === index ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                      </Button>
                    </div>

                    <AnimatePresence>
                      {expandedWeek === index && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: "auto" }}
                          exit={{ opacity: 0, height: 0 }}
                          transition={{ duration: 0.3 }}
                          className="mt-4 pt-4 border-t border-gray-200 space-y-4"
                        >
                          {/* Learning Objectives */}
                          {week.learning_objectives && week.learning_objectives.length > 0 && (
                            <div>
                              <div className="flex items-center gap-2 mb-2">
                                <Target className="w-4 h-4 text-purple-600" />
                                <h4 className="font-semibold text-sm text-gray-900">Learning Objectives</h4>
                              </div>
                              <ul className="space-y-1 ml-6">
                                {week.learning_objectives.map((obj, i) => (
                                  <li key={i} className="text-sm text-gray-700 list-disc">{obj}</li>
                                ))}
                              </ul>
                            </div>
                          )}

                          {/* Activities */}
                          {week.activities && week.activities.length > 0 && (
                            <div>
                              <div className="flex items-center gap-2 mb-2">
                                <BookOpen className="w-4 h-4 text-blue-600" />
                                <h4 className="font-semibold text-sm text-gray-900">Activities</h4>
                              </div>
                              <ul className="space-y-1 ml-6">
                                {week.activities.map((activity, i) => (
                                  <li key={i} className="text-sm text-gray-700 list-disc">{activity}</li>
                                ))}
                              </ul>
                            </div>
                          )}

                          {/* Resources */}
                          {week.resources && week.resources.length > 0 && (
                            <div>
                              <div className="flex items-center gap-2 mb-2">
                                <ExternalLink className="w-4 h-4 text-green-600" />
                                <h4 className="font-semibold text-sm text-gray-900">Resources</h4>
                              </div>
                              <div className="space-y-2 ml-6">
                                {week.resources.map((resource, i) => (
                                  <div key={i} className="text-sm text-blue-600 hover:text-blue-800 cursor-pointer flex items-center gap-1">
                                    <span>→ {resource}</span>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}