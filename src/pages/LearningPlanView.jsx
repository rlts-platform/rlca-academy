import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Brain, Calendar, RefreshCw, Sparkles, AlertCircle } from "lucide-react";
import { motion } from "framer-motion";
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { format, parseISO } from "date-fns";

import AIAnalysisCard from '../components/learning/AIAnalysisCard';
import FocusAreasGrid from '../components/learning/FocusAreasGrid';
import LessonPathTimeline from '../components/learning/LessonPathTimeline';
import ResourcesLibrary from '../components/learning/ResourcesLibrary';
import MilestonesTracker from '../components/learning/MilestonesTracker';
import SkillTreeVisualization from '../components/learning/SkillTreeVisualization';
import DynamicResourceSuggester from '../components/learning/DynamicResourceSuggester';
import PlanEditor from '../components/learning/PlanEditor';

export default function LearningPlanView() {
  const [studentProfile, setStudentProfile] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const queryClient = useQueryClient();

  useEffect(() => {
    loadUserProfile();
  }, []);

  const loadUserProfile = async () => {
    try {
      const user = await base44.auth.me();
      const students = await base44.entities.Student.filter({ student_email: user.email });
      if (students && students.length > 0) {
        setStudentProfile(students[0]);
      }
      setIsLoading(false);
    } catch (error) {
      console.error("Error loading profile:", error);
      setIsLoading(false);
    }
  };

  const { data: learningPlans = [] } = useQuery({
    queryKey: ['learning-plans', studentProfile?.id],
    queryFn: () => studentProfile ? base44.entities.LearningPlan.filter({ student_id: studentProfile.id }, '-created_date') : [],
    enabled: !!studentProfile
  });

  const activePlan = learningPlans.find(plan => plan.status === "Active") || learningPlans[0];

  const updateMilestoneMutation = useMutation({
    mutationFn: async ({ planId, milestones }) => {
      return base44.entities.LearningPlan.update(planId, { milestones });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['learning-plans'] });
    }
  });

  const updatePlanMutation = useMutation({
    mutationFn: ({ planId, updates }) => base44.entities.LearningPlan.update(planId, updates),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['learning-plans'] });
    }
  });

  const { data: grades = [] } = useQuery({
    queryKey: ['student-grades-all', studentProfile?.id],
    queryFn: () => studentProfile ? base44.entities.Grade.filter({ student_id: studentProfile.id }) : [],
    enabled: !!studentProfile
  });

  const handleToggleMilestone = (index) => {
    if (!activePlan) return;
    const updatedMilestones = [...activePlan.milestones];
    updatedMilestones[index].completed = !updatedMilestones[index].completed;
    updateMilestoneMutation.mutate({
      planId: activePlan.id,
      milestones: updatedMilestones
    });
  };

  const handleSavePlan = (updatedPlan) => {
    updatePlanMutation.mutate({
      planId: activePlan.id,
      updates: {
        parent_goals: updatedPlan.parent_goals,
        recommended_focus_areas: updatedPlan.recommended_focus_areas,
        lesson_path: updatedPlan.lesson_path
      }
    });
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-pink-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-purple-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <div className="text-gray-600">Loading learning plan...</div>
        </div>
      </div>
    );
  }

  if (!activePlan) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-pink-50 flex items-center justify-center p-6">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center bg-white p-12 rounded-2xl shadow-2xl max-w-2xl"
        >
          <div className="w-24 h-24 rounded-full bg-gradient-to-br from-purple-500 to-blue-600 flex items-center justify-center mx-auto mb-6 shadow-xl">
            <Brain className="w-12 h-12 text-white" />
          </div>
          <h2 className="text-3xl font-bold text-gray-900 mb-4">No Learning Plan Yet</h2>
          <p className="text-gray-600 mb-8 text-lg">
            Generate your first AI-powered personalized learning plan to get started with a customized curriculum path!
          </p>
          <Link to={createPageUrl('GenerateLearningPlan')}>
            <Button className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white px-8 py-6 text-lg shadow-lg">
              <Sparkles className="w-6 h-6 mr-3" />
              Generate Learning Plan
            </Button>
          </Link>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-pink-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-purple-500 to-blue-600 flex items-center justify-center shadow-xl">
                <Brain className="w-9 h-9 text-white" />
              </div>
              <div>
                <h1 className="text-4xl font-bold text-gray-900">My Learning Plan</h1>
                <p className="text-gray-600 mt-1">AI-powered personalized curriculum</p>
              </div>
            </div>
            <div className="flex flex-wrap gap-3">
              <Badge className="bg-green-100 text-green-800 border-green-200 px-4 py-2 text-sm">
                {activePlan.status}
              </Badge>
              <Link to={createPageUrl('GenerateLearningPlan')}>
                <Button variant="outline" className="gap-2">
                  <RefreshCw className="w-4 h-4" />
                  Generate New Plan
                </Button>
              </Link>
            </div>
          </div>

          {/* Plan Info */}
          <div className="flex flex-wrap gap-4 text-sm text-gray-600">
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4" />
              <span>Generated: {format(parseISO(activePlan.generated_date), 'MMM d, yyyy')}</span>
            </div>
            <div className="flex items-center gap-2">
              <AlertCircle className="w-4 h-4" />
              <span>Next Review: {format(parseISO(activePlan.next_review_date), 'MMM d, yyyy')}</span>
            </div>
          </div>
        </motion.div>

        {/* Parent Goals */}
        {activePlan.parent_goals && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="mb-8 p-6 bg-white rounded-xl shadow-lg border-l-4 border-purple-500"
          >
            <h3 className="font-semibold text-gray-900 mb-2">Learning Goals & Priorities</h3>
            <p className="text-gray-700 whitespace-pre-wrap">{activePlan.parent_goals}</p>
          </motion.div>
        )}

        {/* Plan Editor */}
        <div className="mb-8">
          <PlanEditor learningPlan={activePlan} onSave={handleSavePlan} />
        </div>

        {/* AI Analysis */}
        <div className="mb-8">
          <AIAnalysisCard analysis={activePlan.ai_analysis} />
        </div>

        {/* Skill Tree Visualization */}
        <div className="mb-8">
          <SkillTreeVisualization grades={grades} student={studentProfile} />
        </div>

        {/* Dynamic AI Resource Suggestions */}
        <div className="mb-8">
          <DynamicResourceSuggester 
            learningPlan={activePlan} 
            grades={grades}
            milestones={activePlan.milestones}
          />
        </div>

        {/* Focus Areas */}
        <div className="mb-8">
          <FocusAreasGrid focusAreas={activePlan.recommended_focus_areas} />
        </div>

        {/* Milestones */}
        <div className="mb-8">
          <MilestonesTracker 
            milestones={activePlan.milestones} 
            onToggleComplete={handleToggleMilestone}
          />
        </div>

        {/* Lesson Path Timeline */}
        <div className="mb-8">
          <LessonPathTimeline lessonPath={activePlan.lesson_path} />
        </div>

        {/* Resources Library */}
        <div className="mb-8">
          <ResourcesLibrary resources={activePlan.resources} />
        </div>
      </div>
    </div>
  );
}