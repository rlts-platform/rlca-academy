import React from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Zap, TrendingUp, Award } from "lucide-react";
import { motion } from "framer-motion";

export default function PointsDisplay({ progress }) {
  if (!progress) return null;

  const levelProgress = (progress.current_level_progress / progress.experience_to_next_level) * 100;

  const getLevelTitle = (level) => {
    if (level < 5) return "Novice Scholar";
    if (level < 10) return "Apprentice Learner";
    if (level < 15) return "Skilled Student";
    if (level < 20) return "Expert Scholar";
    if (level < 30) return "Master Mind";
    return "Legendary Genius";
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      whileHover={{ scale: 1.02 }}
      transition={{ duration: 0.3 }}
    >
      <Card className="shadow-xl border-2 border-amber-300 bg-gradient-to-br from-amber-50 via-yellow-50 to-orange-50 overflow-hidden">
        <CardContent className="p-0">
          <div className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-14 h-14 rounded-full bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center shadow-lg">
                  <span className="text-2xl font-bold text-white">
                    {progress.level}
                  </span>
                </div>
                <div>
                  <div className="text-sm text-gray-600">Level {progress.level}</div>
                  <div className="font-bold text-gray-900">{getLevelTitle(progress.level)}</div>
                </div>
              </div>
              <div className="text-right">
                <div className="flex items-center gap-2 justify-end mb-1">
                  <Zap className="w-5 h-5 text-amber-600" />
                  <span className="text-3xl font-bold text-amber-600">
                    {progress.total_points}
                  </span>
                </div>
                <div className="text-xs text-gray-600">Total Points</div>
              </div>
            </div>

            {/* Progress Bar */}
            <div className="mb-3">
              <div className="flex items-center justify-between text-xs text-gray-600 mb-1">
                <span>Progress to Level {progress.level + 1}</span>
                <span>{progress.current_level_progress} / {progress.experience_to_next_level} XP</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden shadow-inner">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${levelProgress}%` }}
                  transition={{ duration: 1, ease: "easeOut" }}
                  className="h-full bg-gradient-to-r from-amber-400 via-yellow-400 to-orange-500 rounded-full relative"
                >
                  <div className="absolute inset-0 bg-white/30 animate-pulse"></div>
                </motion.div>
              </div>
            </div>

            {/* Stats Row */}
            <div className="grid grid-cols-3 gap-3 mt-4">
              <div className="text-center p-2 bg-white/60 rounded-lg">
                <Award className="w-5 h-5 text-purple-600 mx-auto mb-1" />
                <div className="text-lg font-bold text-gray-900">{progress.earned_badges?.length || 0}</div>
                <div className="text-xs text-gray-600">Badges</div>
              </div>
              <div className="text-center p-2 bg-white/60 rounded-lg">
                <TrendingUp className="w-5 h-5 text-green-600 mx-auto mb-1" />
                <div className="text-lg font-bold text-gray-900">{progress.quests_completed || 0}</div>
                <div className="text-xs text-gray-600">Quests</div>
              </div>
              <div className="text-center p-2 bg-white/60 rounded-lg">
                <Zap className="w-5 h-5 text-orange-600 mx-auto mb-1" />
                <div className="text-lg font-bold text-gray-900">{progress.current_streak || 0}</div>
                <div className="text-xs text-gray-600">Day Streak</div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}