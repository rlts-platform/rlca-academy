import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { ArrowLeft, CheckCircle, BookOpen, Play } from "lucide-react";
import { motion } from "framer-motion";
import ReactMarkdown from 'react-markdown';
import MediaEmbed from '../components/lessons/MediaEmbed';
import InteractiveElement from '../components/lessons/InteractiveElement';
import PracticeActivity from '../components/lessons/PracticeActivity';

export default function LessonViewer() {
  const [studentProfile, setStudentProfile] = useState(null);
  const [lessonId, setLessonId] = useState(null);
  const [sessionStartTime, setSessionStartTime] = useState(Date.now());
  const queryClient = useQueryClient();

  useEffect(() => {
    loadUserProfile();
    const params = new URLSearchParams(window.location.search);
    setLessonId(params.get('id'));
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

  const { data: lesson, isLoading } = useQuery({
    queryKey: ['lesson', lessonId],
    queryFn: async () => {
      const lessons = await base44.entities.Lesson.filter({ id: lessonId });
      return lessons[0];
    },
    enabled: !!lessonId
  });

  const { data: progress } = useQuery({
    queryKey: ['lesson-progress', lessonId, studentProfile?.id],
    queryFn: async () => {
      const progs = await base44.entities.LessonProgress.filter({
        lesson_id: lessonId,
        student_id: studentProfile.id
      });
      return progs[0] || null;
    },
    enabled: !!lessonId && !!studentProfile
  });

  const updateProgressMutation = useMutation({
    mutationFn: async (updates) => {
      const timeSpent = Math.floor((Date.now() - sessionStartTime) / 60000);
      
      if (progress) {
        return await base44.entities.LessonProgress.update(progress.id, {
          ...updates,
          time_spent_minutes: (progress.time_spent_minutes || 0) + timeSpent
        });
      } else {
        return await base44.entities.LessonProgress.create({
          student_id: studentProfile.id,
          lesson_id: lessonId,
          unit_id: lesson.unit_id,
          status: "In Progress",
          started_date: new Date().toISOString().split('T')[0],
          time_spent_minutes: timeSpent,
          ...updates
        });
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['lesson-progress'] });
      setSessionStartTime(Date.now());
    }
  });

  const handleMediaComplete = (mediaId) => {
    const mediaWatched = [...(progress?.media_watched || [])];
    const existingIndex = mediaWatched.findIndex(m => m.media_id === mediaId);
    
    if (existingIndex >= 0) {
      mediaWatched[existingIndex].completed = true;
      mediaWatched[existingIndex].progress_percentage = 100;
    } else {
      mediaWatched.push({ media_id: mediaId, completed: true, progress_percentage: 100 });
    }
    
    updateProgressMutation.mutate({ media_watched: mediaWatched });
  };

  const handleInteractiveComplete = (elementId) => {
    const completed = [...(progress?.interactive_elements_completed || []), elementId];
    updateProgressMutation.mutate({ interactive_elements_completed: completed });
  };

  const handlePracticeComplete = (activityData) => {
    const activities = [...(progress?.practice_activities_completed || [])];
    const existingIndex = activities.findIndex(a => a.activity_id === activityData.activity_id);
    
    if (existingIndex >= 0) {
      activities[existingIndex] = activityData;
    } else {
      activities.push(activityData);
    }
    
    updateProgressMutation.mutate({ practice_activities_completed: activities });
  };

  const calculateCompletion = () => {
    if (!lesson || !progress) return 0;
    
    let total = 0;
    let completed = 0;

    // Count media
    if (lesson.embedded_media?.length > 0) {
      total += lesson.embedded_media.length;
      completed += (progress.media_watched?.filter(m => m.completed).length || 0);
    }

    // Count interactive elements
    if (lesson.interactive_elements?.length > 0) {
      total += lesson.interactive_elements.length;
      completed += (progress.interactive_elements_completed?.length || 0);
    }

    // Count practice activities
    if (lesson.practice_activities?.length > 0) {
      total += lesson.practice_activities.length;
      completed += (progress.practice_activities_completed?.filter(a => a.completed).length || 0);
    }

    return total > 0 ? Math.round((completed / total) * 100) : 0;
  };

  const handleMarkComplete = () => {
    updateProgressMutation.mutate({
      status: "Completed",
      completed_date: new Date().toISOString().split('T')[0],
      completion_percentage: 100
    });
  };

  if (isLoading || !lesson || !studentProfile) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-pink-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-purple-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <div className="text-gray-600">Loading lesson...</div>
        </div>
      </div>
    );
  }

  const completionPercentage = calculateCompletion();
  const isMediaComplete = (mediaId) => progress?.media_watched?.find(m => m.media_id === mediaId)?.completed || false;
  const isInteractiveComplete = (elementId) => progress?.interactive_elements_completed?.includes(elementId) || false;
  const getPracticeData = (activityId) => progress?.practice_activities_completed?.find(a => a.activity_id === activityId);

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-pink-50 p-6">
      <div className="max-w-5xl mx-auto">
        <div className="mb-6 flex items-center justify-between">
          <Button variant="outline" onClick={() => window.history.back()}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </Button>
          
          {progress?.status === "Completed" && (
            <Badge className="bg-green-600 text-white px-4 py-2">
              <CheckCircle className="w-4 h-4 mr-2" />
              Lesson Completed
            </Badge>
          )}
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          {/* Header */}
          <Card className="shadow-xl mb-6">
            <CardContent className="p-8">
              <div className="flex items-start gap-4 mb-6">
                <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-purple-500 to-blue-600 flex items-center justify-center shadow-lg">
                  <BookOpen className="w-7 h-7 text-white" />
                </div>
                <div className="flex-1">
                  <h1 className="text-3xl font-bold text-gray-900 mb-2">{lesson.title}</h1>
                  <p className="text-gray-600">{lesson.summary}</p>
                  <div className="flex gap-2 mt-3">
                    <Badge variant="outline">{lesson.subject_name}</Badge>
                    <Badge variant="outline">{lesson.grade_level}</Badge>
                    <Badge variant="outline">{lesson.estimated_duration_minutes} min</Badge>
                  </div>
                </div>
              </div>

              {/* Progress Bar */}
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">Lesson Progress</span>
                  <span className="font-semibold">{completionPercentage}%</span>
                </div>
                <Progress value={completionPercentage} className="h-3" />
              </div>
            </CardContent>
          </Card>

          {/* Main Content */}
          {lesson.content && (
            <Card className="shadow-lg mb-6">
              <CardContent className="p-8">
                <div className="prose max-w-none">
                  <ReactMarkdown>{lesson.content}</ReactMarkdown>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Vocabulary */}
          {lesson.vocabulary && lesson.vocabulary.length > 0 && (
            <Card className="shadow-lg mb-6">
              <CardContent className="p-6">
                <h2 className="text-xl font-bold text-gray-900 mb-4">Key Vocabulary</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {lesson.vocabulary.map((item, i) => (
                    <div key={i} className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                      <div className="font-semibold text-blue-900 mb-1">{item.term}</div>
                      <p className="text-sm text-blue-800">{item.definition}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Embedded Media */}
          {lesson.embedded_media && lesson.embedded_media.length > 0 && (
            <div className="space-y-6 mb-6">
              <h2 className="text-2xl font-bold text-gray-900">Learning Resources</h2>
              {lesson.embedded_media
                .sort((a, b) => (a.order || 0) - (b.order || 0))
                .map((media, i) => (
                  <MediaEmbed
                    key={i}
                    media={media}
                    onComplete={() => handleMediaComplete(`media-${i}`)}
                    isCompleted={isMediaComplete(`media-${i}`)}
                  />
                ))}
            </div>
          )}

          {/* Interactive Elements */}
          {lesson.interactive_elements && lesson.interactive_elements.length > 0 && (
            <div className="space-y-6 mb-6">
              <h2 className="text-2xl font-bold text-gray-900">Interactive Activities</h2>
              {lesson.interactive_elements
                .sort((a, b) => (a.order || 0) - (b.order || 0))
                .map((element, i) => (
                  <InteractiveElement
                    key={i}
                    element={element}
                    onComplete={() => handleInteractiveComplete(element.id || `interactive-${i}`)}
                    isCompleted={isInteractiveComplete(element.id || `interactive-${i}`)}
                  />
                ))}
            </div>
          )}

          {/* Practice Activities */}
          {lesson.practice_activities && lesson.practice_activities.length > 0 && (
            <div className="space-y-6 mb-6">
              <h2 className="text-2xl font-bold text-gray-900">Practice & Check Understanding</h2>
              {lesson.practice_activities
                .sort((a, b) => (a.order || 0) - (b.order || 0))
                .map((activity, i) => (
                  <PracticeActivity
                    key={i}
                    activity={activity}
                    onComplete={handlePracticeComplete}
                    completionData={getPracticeData(activity.id)}
                  />
                ))}
            </div>
          )}

          {/* Complete Lesson Button */}
          {progress?.status !== "Completed" && (
            <Card className="shadow-xl">
              <CardContent className="p-6 text-center">
                <p className="text-gray-600 mb-4">
                  Ready to mark this lesson as complete?
                </p>
                <Button
                  onClick={handleMarkComplete}
                  className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700"
                  size="lg"
                >
                  <CheckCircle className="w-5 h-5 mr-2" />
                  Mark Lesson Complete
                </Button>
              </CardContent>
            </Card>
          )}
        </motion.div>
      </div>
    </div>
  );
}