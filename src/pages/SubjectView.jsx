import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { ArrowLeft, BookOpen, Target, Clock } from "lucide-react";
import { motion } from "framer-motion";

export default function SubjectView() {
  const [subjectId, setSubjectId] = useState(null);
  const [studentProfile, setStudentProfile] = useState(null);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    setSubjectId(params.get('id'));
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

  const { data: subject, isLoading } = useQuery({
    queryKey: ['subject', subjectId],
    queryFn: async () => {
      const subjects = await base44.entities.Subject.filter({ id: subjectId });
      return subjects[0];
    },
    enabled: !!subjectId
  });

  const { data: units = [] } = useQuery({
    queryKey: ['units', subjectId],
    queryFn: () => base44.entities.Unit.filter({ subject_id: subjectId }, 'order'),
    enabled: !!subjectId
  });

  const { data: unitProgress = [] } = useQuery({
    queryKey: ['unit-progress', studentProfile?.id],
    queryFn: () => studentProfile 
      ? base44.entities.UnitProgress.filter({ student_id: studentProfile.id })
      : [],
    enabled: !!studentProfile
  });

  const getUnitProgress = (unitId) => {
    return unitProgress.find(up => up.unit_id === unitId);
  };

  const calculateOverallProgress = () => {
    if (units.length === 0) return 0;
    const completedUnits = unitProgress.filter(up => 
      units.some(u => u.id === up.unit_id) && up.completion_percentage === 100
    ).length;
    return Math.round((completedUnits / units.length) * 100);
  };

  if (isLoading || !subject) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-pink-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-purple-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <div className="text-gray-600">Loading subject...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-pink-50 p-6">
      <div className="max-w-6xl mx-auto">
        <div className="mb-6">
          <Button variant="outline" onClick={() => window.history.back()}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </Button>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          {/* Subject Header */}
          <Card className="shadow-2xl mb-8">
            <CardHeader className="border-b bg-gradient-to-r from-blue-50 to-purple-50">
              <div className="flex items-start gap-4">
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center shadow-xl">
                  <BookOpen className="w-9 h-9 text-white" />
                </div>
                <div className="flex-1">
                  <CardTitle className="text-3xl mb-2">{subject.name}</CardTitle>
                  <p className="text-gray-600 mb-3">{subject.description}</p>
                  <div className="flex gap-2">
                    {subject.grade_levels?.map(grade => (
                      <Badge key={grade} variant="outline">{grade}</Badge>
                    ))}
                    <Badge className="bg-blue-100 text-blue-800">
                      {units.length} Units
                    </Badge>
                  </div>
                </div>
              </div>
            </CardHeader>
            
            {studentProfile && (
              <CardContent className="p-6">
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">Overall Progress</span>
                    <span className="font-semibold">{calculateOverallProgress()}%</span>
                  </div>
                  <Progress value={calculateOverallProgress()} className="h-3" />
                </div>
              </CardContent>
            )}
          </Card>

          {/* Units List */}
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-gray-900">Course Units</h2>
            
            {units.length === 0 ? (
              <Card className="shadow-lg">
                <CardContent className="p-12 text-center">
                  <BookOpen className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">No Units Yet</h3>
                  <p className="text-gray-600">Units will appear here once created</p>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-4">
                {units.map((unit, index) => {
                  const progress = getUnitProgress(unit.id);
                  const isLocked = unit.unlock_sequential && index > 0 && 
                    getUnitProgress(units[index - 1]?.id)?.completion_percentage !== 100;
                  
                  return (
                    <motion.div
                      key={unit.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.1 }}
                    >
                      <Card 
                        className={`shadow-lg hover:shadow-xl transition-all ${
                          isLocked ? 'opacity-60' : 'cursor-pointer'
                        }`}
                        onClick={() => !isLocked && (window.location.href = `/UnitView?id=${unit.id}`)}
                      >
                        <CardContent className="p-6">
                          <div className="flex items-start gap-6">
                            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center shadow-lg flex-shrink-0">
                              <span className="text-2xl font-bold text-white">{index + 1}</span>
                            </div>
                            
                            <div className="flex-1">
                              <div className="flex items-start justify-between mb-3">
                                <div className="flex-1">
                                  <h3 className="text-xl font-bold text-gray-900 mb-1">
                                    {unit.title}
                                  </h3>
                                  <p className="text-gray-600 mb-3">{unit.description}</p>
                                </div>
                                
                                {progress?.completion_percentage === 100 && (
                                  <Badge className="bg-green-600 text-white ml-4">
                                    Completed
                                  </Badge>
                                )}
                                {isLocked && (
                                  <Badge variant="outline" className="ml-4">
                                    Locked
                                  </Badge>
                                )}
                              </div>

                              {unit.learning_objectives && unit.learning_objectives.length > 0 && (
                                <div className="mb-4">
                                  <div className="text-sm font-semibold text-gray-900 mb-2 flex items-center gap-2">
                                    <Target className="w-4 h-4" />
                                    Learning Objectives
                                  </div>
                                  <ul className="list-disc list-inside space-y-1 text-sm text-gray-700">
                                    {unit.learning_objectives.slice(0, 3).map((obj, i) => (
                                      <li key={i}>{obj}</li>
                                    ))}
                                  </ul>
                                </div>
                              )}

                              <div className="flex items-center gap-6 text-sm text-gray-600">
                                <div className="flex items-center gap-1">
                                  <BookOpen className="w-4 h-4" />
                                  <span>{unit.total_lessons || 0} Lessons</span>
                                </div>
                                {unit.estimated_duration_weeks && (
                                  <div className="flex items-center gap-1">
                                    <Clock className="w-4 h-4" />
                                    <span>{unit.estimated_duration_weeks} weeks</span>
                                  </div>
                                )}
                              </div>

                              {progress && (
                                <div className="mt-4">
                                  <div className="flex items-center justify-between text-xs text-gray-600 mb-1">
                                    <span>Progress</span>
                                    <span>{progress.completion_percentage}%</span>
                                  </div>
                                  <Progress value={progress.completion_percentage} className="h-2" />
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