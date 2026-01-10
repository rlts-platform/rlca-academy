import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { ArrowLeft, BookOpen, CheckCircle, Clock, Lock, Play } from "lucide-react";
import { motion } from "framer-motion";

export default function UnitView() {
  const [unitId, setUnitId] = useState(null);
  const [studentProfile, setStudentProfile] = useState(null);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    setUnitId(params.get('id'));
    loadUserProfile();
  }, []);

  const loadUserProfile = async () => {
    try {
      const user = await base44.auth.me();
      const students = await base44.entities.Student.filter({ student_email: user.email });
      if (students && students.length > 0) {
        setStudentProfile(students[0]);
      }
    } catch (error) {
      console.error("Error loading profile:", error);
    }
  };

  const { data: unit, isLoading } = useQuery({
    queryKey: ['unit', unitId],
    queryFn: async () => {
      const units = await base44.entities.Unit.filter({ id: unitId });
      return units[0];
    },
    enabled: !!unitId
  });

  const { data: lessons = [] } = useQuery({
    queryKey: ['lessons', unitId],
    queryFn: () => base44.entities.Lesson.filter({ unit_id: unitId }, 'order'),
    enabled: !!unitId
  });

  const { data: lessonProgress = [] } = useQuery({
    queryKey: ['lesson-progress-unit', unitId, studentProfile?.id],
    queryFn: () => studentProfile 
      ? base44.entities.LessonProgress.filter({ 
          unit_id: unitId,
          student_id: studentProfile.id 
        })
      : [],
    enabled: !!unitId && !!studentProfile
  });

  const getLessonProgress = (lessonId) => {
    return lessonProgress.find(lp => lp.lesson_id === lessonId);
  };

  const calculateUnitProgress = () => {
    if (lessons.length === 0) return 0;
    const completedLessons = lessonProgress.filter(lp => 
      lp.status === "Completed" && lessons.some(l => l.id === lp.lesson_id)
    ).length;
    return Math.round((completedLessons / lessons.length) * 100);
  };

  const getNextLesson = () => {
    for (let lesson of lessons) {
      const progress = getLessonProgress(lesson.id);
      if (!progress || progress.status !== "Completed") {
        return lesson;
      }
    }
    return null;
  };

  if (isLoading || !unit) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-pink-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-purple-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <div className="text-gray-600">Loading unit...</div>
        </div>
      </div>
    );
  }

  const nextLesson = getNextLesson();
  const unitProgress = calculateUnitProgress();

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-pink-50 p-6">
      <div className="max-w-6xl mx-auto">
        <div className="mb-6">
          <Button variant="outline" onClick={() => window.location.href = `/SubjectView?id=${unit.subject_id}`}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to {unit.subject_name}
          </Button>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          {/* Unit Header */}
          <Card className="shadow-2xl mb-8">
            <CardHeader className="border-b bg-gradient-to-r from-purple-50 to-blue-50">
              <div className="flex items-start gap-4">
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-purple-500 to-blue-600 flex items-center justify-center shadow-xl">
                  <BookOpen className="w-9 h-9 text-white" />
                </div>
                <div className="flex-1">
                  <CardTitle className="text-3xl mb-2">{unit.title}</CardTitle>
                  <p className="text-gray-600 mb-3">{unit.description}</p>
                  <div className="flex gap-2">
                    <Badge variant="outline">{unit.subject_name}</Badge>
                    <Badge variant="outline">{unit.grade_level}</Badge>
                    <Badge className="bg-purple-100 text-purple-800">
                      {lessons.length} Lessons
                    </Badge>
                  </div>
                </div>
              </div>
            </CardHeader>
            
            <CardContent className="p-6">
              {unit.learning_objectives && unit.learning_objectives.length > 0 && (
                <div className="mb-6">
                  <h3 className="font-semibold text-gray-900 mb-3">Learning Objectives</h3>
                  <ul className="space-y-2">
                    {unit.learning_objectives.map((obj, i) => (
                      <li key={i} className="flex items-start gap-2">
                        <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                        <span className="text-gray-700">{obj}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {studentProfile && (
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-gray-600">Unit Progress</span>
                    <span className="text-sm font-semibold">{unitProgress}%</span>
                  </div>
                  <Progress value={unitProgress} className="h-3 mb-4" />
                  
                  {nextLesson && (
                    <Button 
                      onClick={() => window.location.href = `/LessonViewer?id=${nextLesson.id}`}
                      className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 w-full"
                      size="lg"
                    >
                      <Play className="w-5 h-5 mr-2" />
                      Continue Learning: {nextLesson.title}
                    </Button>
                  )}
                  
                  {unitProgress === 100 && (
                    <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-lg text-center">
                      <CheckCircle className="w-12 h-12 text-green-600 mx-auto mb-2" />
                      <p className="font-semibold text-green-900">Unit Complete!</p>
                      <p className="text-sm text-green-700">Great work on finishing this unit</p>
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Lessons List */}
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-gray-900">Lessons</h2>
            
            {lessons.length === 0 ? (
              <Card className="shadow-lg">
                <CardContent className="p-12 text-center">
                  <BookOpen className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">No Lessons Yet</h3>
                  <p className="text-gray-600">Lessons will appear here once created</p>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-4">
                {lessons.map((lesson, index) => {
                  const progress = getLessonProgress(lesson.id);
                  const isLocked = unit.unlock_sequential && index > 0 && 
                    getLessonProgress(lessons[index - 1]?.id)?.status !== "Completed";
                  const isCompleted = progress?.status === "Completed";
                  
                  return (
                    <motion.div
                      key={lesson.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.05 }}
                    >
                      <Card 
                        className={`shadow-lg hover:shadow-xl transition-all ${
                          isLocked ? 'opacity-60' : 'cursor-pointer'
                        } ${isCompleted ? 'border-l-4 border-green-500' : ''}`}
                        onClick={() => !isLocked && (window.location.href = `/LessonViewer?id=${lesson.id}`)}
                      >
                        <CardContent className="p-6">
                          <div className="flex items-start gap-4">
                            <div className={`w-12 h-12 rounded-xl flex items-center justify-center shadow-lg flex-shrink-0 ${
                              isCompleted ? 'bg-gradient-to-br from-green-500 to-emerald-600' :
                              progress ? 'bg-gradient-to-br from-blue-400 to-purple-500' :
                              'bg-gradient-to-br from-gray-300 to-gray-400'
                            }`}>
                              {isCompleted ? (
                                <CheckCircle className="w-6 h-6 text-white" />
                              ) : isLocked ? (
                                <Lock className="w-6 h-6 text-white" />
                              ) : (
                                <span className="text-xl font-bold text-white">{index + 1}</span>
                              )}
                            </div>
                            
                            <div className="flex-1">
                              <div className="flex items-start justify-between mb-2">
                                <div>
                                  <h3 className="text-lg font-bold text-gray-900 mb-1">
                                    {lesson.title}
                                  </h3>
                                  {lesson.summary && (
                                    <p className="text-sm text-gray-600">{lesson.summary}</p>
                                  )}
                                </div>
                                
                                {isCompleted && (
                                  <Badge className="bg-green-600 text-white ml-4">
                                    Completed
                                  </Badge>
                                )}
                                {progress?.status === "In Progress" && (
                                  <Badge className="bg-blue-600 text-white ml-4">
                                    In Progress
                                  </Badge>
                                )}
                                {isLocked && (
                                  <Badge variant="outline" className="ml-4">
                                    Locked
                                  </Badge>
                                )}
                              </div>

                              <div className="flex items-center gap-4 text-sm text-gray-600">
                                {lesson.estimated_duration_minutes && (
                                  <div className="flex items-center gap-1">
                                    <Clock className="w-4 h-4" />
                                    <span>{lesson.estimated_duration_minutes} min</span>
                                  </div>
                                )}
                                {progress?.time_spent_minutes > 0 && (
                                  <span className="text-purple-600">
                                    {progress.time_spent_minutes} min spent
                                  </span>
                                )}
                              </div>

                              {progress && progress.status !== "Completed" && (
                                <div className="mt-3">
                                  <Progress value={progress.completion_percentage || 0} className="h-2" />
                                </div>
                              )}
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </motion.div>
                  );
                })}
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </div>
  );
}