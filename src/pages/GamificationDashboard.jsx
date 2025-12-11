import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Gamepad2, Zap, Trophy, Target } from 'lucide-react';
import { motion } from 'framer-motion';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

import PointsDisplay from '../components/gamification/PointsDisplay';
import BadgeCollection from '../components/gamification/BadgeCollection';
import QuestBoard from '../components/gamification/QuestBoard';
import Leaderboard from '../components/gamification/Leaderboard';
import StreakTracker from '../components/gamification/StreakTracker';

export default function GamificationDashboard() {
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

  const { data: progress } = useQuery({
    queryKey: ['student-progress', studentProfile?.id],
    queryFn: async () => {
      if (!studentProfile) return null;
      const progressRecords = await base44.entities.StudentProgress.filter({ student_id: studentProfile.id });
      if (progressRecords.length > 0) {
        return progressRecords[0];
      }
      // Create initial progress if doesn't exist
      return await base44.entities.StudentProgress.create({
        student_id: studentProfile.id,
        student_name: studentProfile.full_name,
        total_points: 0,
        level: 1,
        experience_to_next_level: 100,
        current_level_progress: 0,
        earned_badges: [],
        current_streak: 0,
        longest_streak: 0,
        last_activity_date: new Date().toISOString().split('T')[0]
      });
    },
    enabled: !!studentProfile
  });

  const { data: allBadges = [] } = useQuery({
    queryKey: ['all-badges'],
    queryFn: () => base44.entities.Badge.list()
  });

  const { data: quests = [] } = useQuery({
    queryKey: ['quests', studentProfile?.grade_level],
    queryFn: () => studentProfile ? base44.entities.Quest.filter({ 
      target_grade_level: studentProfile.grade_level,
      status: "Active"
    }) : [],
    enabled: !!studentProfile
  });

  const { data: questProgress = [] } = useQuery({
    queryKey: ['quest-progress', studentProfile?.id],
    queryFn: () => studentProfile ? base44.entities.QuestProgress.filter({ student_id: studentProfile.id }) : [],
    enabled: !!studentProfile
  });

  const { data: leaderboard = [] } = useQuery({
    queryKey: ['leaderboard'],
    queryFn: async () => {
      const allProgress = await base44.entities.StudentProgress.filter({ leaderboard_opt_in: true }, '-total_points', 20);
      return allProgress;
    }
  });

  const toggleOptInMutation = useMutation({
    mutationFn: async (optIn) => {
      if (!progress) return;
      return await base44.entities.StudentProgress.update(progress.id, {
        leaderboard_opt_in: optIn
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['student-progress'] });
      queryClient.invalidateQueries({ queryKey: ['leaderboard'] });
    }
  });

  const claimRewardMutation = useMutation({
    mutationFn: async (questId) => {
      const quest = quests.find(q => q.id === questId);
      const qProgress = questProgress.find(qp => qp.quest_id === questId);
      
      if (!quest || !progress || !qProgress) return;

      // Award points
      const newPoints = progress.total_points + quest.points_reward;
      const newLevelProgress = progress.current_level_progress + quest.points_reward;
      
      // Check for level up
      let newLevel = progress.level;
      let remainingProgress = newLevelProgress;
      let nextLevelXP = progress.experience_to_next_level;
      
      while (remainingProgress >= nextLevelXP) {
        newLevel++;
        remainingProgress -= nextLevelXP;
        nextLevelXP = Math.floor(nextLevelXP * 1.2); // Increase XP needed by 20% each level
      }

      // Add badge if quest awards one
      const newBadges = [...(progress.earned_badges || [])];
      if (quest.badge_reward) {
        newBadges.push({
          badge_id: `quest-${questId}`,
          badge_name: quest.badge_reward.badge_name,
          earned_date: new Date().toISOString().split('T')[0],
          icon: quest.badge_reward.icon,
          color: quest.badge_reward.color
        });
      }

      // Update progress
      await base44.entities.StudentProgress.update(progress.id, {
        total_points: newPoints,
        level: newLevel,
        current_level_progress: remainingProgress,
        experience_to_next_level: nextLevelXP,
        earned_badges: newBadges,
        quests_completed: (progress.quests_completed || 0) + 1
      });

      // Mark quest as claimed
      await base44.entities.QuestProgress.update(qProgress.id, {
        status: "Claimed",
        reward_claimed: true
      });

      return { newLevel, leveledUp: newLevel > progress.level };
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['student-progress'] });
      queryClient.invalidateQueries({ queryKey: ['quest-progress'] });
      
      if (data?.leveledUp) {
        // Show level up notification (could add toast here)
        console.log('Level Up!', data.newLevel);
      }
    }
  });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-pink-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-purple-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <div className="text-gray-600">Loading gamification...</div>
        </div>
      </div>
    );
  }

  if (!studentProfile) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-pink-50 flex items-center justify-center p-6">
        <div className="text-center bg-white p-8 rounded-2xl shadow-xl max-w-md">
          <Gamepad2 className="w-16 h-16 text-purple-600 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Profile Not Found</h2>
          <p className="text-gray-600">Please set up your student profile first.</p>
        </div>
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
          <div className="flex items-center gap-4 mb-6">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-purple-500 to-pink-600 flex items-center justify-center shadow-xl">
              <Gamepad2 className="w-9 h-9 text-white" />
            </div>
            <div>
              <h1 className="text-4xl font-bold text-gray-900">Gamification Hub</h1>
              <p className="text-gray-600 mt-1">Level up your learning journey!</p>
            </div>
          </div>
        </motion.div>

        {/* Points & Streak Cards */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          <div className="lg:col-span-2">
            <PointsDisplay progress={progress} />
          </div>
          <div>
            <StreakTracker 
              currentStreak={progress?.current_streak} 
              longestStreak={progress?.longest_streak}
            />
          </div>
        </div>

        {/* Tabs for different sections */}
        <Tabs defaultValue="quests" className="space-y-6">
          <TabsList className="bg-white/80 backdrop-blur-sm shadow-lg">
            <TabsTrigger value="quests" className="gap-2">
              <Target className="w-4 h-4" />
              Quests
            </TabsTrigger>
            <TabsTrigger value="badges" className="gap-2">
              <Trophy className="w-4 h-4" />
              Badges
            </TabsTrigger>
            <TabsTrigger value="leaderboard" className="gap-2">
              <Zap className="w-4 h-4" />
              Leaderboard
            </TabsTrigger>
          </TabsList>

          <TabsContent value="quests" className="space-y-6">
            <QuestBoard 
              quests={quests} 
              questProgress={questProgress}
              onClaimReward={(questId) => claimRewardMutation.mutate(questId)}
            />
          </TabsContent>

          <TabsContent value="badges" className="space-y-6">
            <BadgeCollection 
              earnedBadges={progress?.earned_badges || []}
              allBadges={allBadges}
            />
          </TabsContent>

          <TabsContent value="leaderboard" className="space-y-6">
            <Leaderboard
              leaderboardData={leaderboard}
              currentStudentId={studentProfile.id}
              isOptedIn={progress?.leaderboard_opt_in || false}
              onToggleOptIn={(value) => toggleOptInMutation.mutate(value)}
            />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}