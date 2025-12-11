import React from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Flame, TrendingUp } from "lucide-react";
import { motion } from "framer-motion";

export default function StreakTracker({ currentStreak, longestStreak }) {
  const streakDays = currentStreak || 0;
  const maxDays = 7; // Show last 7 days

  const getStreakColor = (days) => {
    if (days === 0) return "from-gray-300 to-gray-400";
    if (days < 3) return "from-orange-400 to-orange-600";
    if (days < 7) return "from-red-400 to-red-600";
    return "from-purple-500 to-pink-600";
  };

  return (
    <Card className="shadow-lg border-2 border-orange-200">
      <CardContent className="p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className={`w-14 h-14 rounded-full bg-gradient-to-br ${getStreakColor(streakDays)} flex items-center justify-center shadow-lg`}>
              <Flame className="w-8 h-8 text-white" />
            </div>
            <div>
              <div className="text-3xl font-bold text-gray-900">{streakDays}</div>
              <div className="text-sm text-gray-600">Day Streak 🔥</div>
            </div>
          </div>
          <div className="text-right">
            <div className="flex items-center gap-1 justify-end text-gray-600 mb-1">
              <TrendingUp className="w-4 h-4" />
              <span className="text-sm">Best</span>
            </div>
            <div className="text-2xl font-bold text-purple-600">
              {longestStreak || 0}
            </div>
          </div>
        </div>

        {/* Streak Calendar */}
        <div className="flex justify-center gap-2">
          {Array.from({ length: maxDays }).map((_, index) => {
            const dayNumber = maxDays - index;
            const isActive = dayNumber <= streakDays;
            return (
              <motion.div
                key={index}
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: index * 0.1 }}
                className={`w-10 h-10 rounded-lg flex items-center justify-center font-bold text-sm transition-all ${
                  isActive
                    ? 'bg-gradient-to-br from-orange-400 to-red-500 text-white shadow-lg'
                    : 'bg-gray-200 text-gray-400'
                }`}
              >
                {isActive ? '🔥' : dayNumber}
              </motion.div>
            );
          })}
        </div>

        <p className="text-center text-xs text-gray-600 mt-4">
          {streakDays > 0
            ? `Keep it up! Come back tomorrow to continue your streak! 💪`
            : `Start your learning streak today! Complete any activity to begin. 🚀`}
        </p>
      </CardContent>
    </Card>
  );
}