import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Trophy, Crown, Medal, Eye, EyeOff, Zap } from "lucide-react";
import { motion } from "framer-motion";

export default function Leaderboard({ leaderboardData, currentStudentId, isOptedIn, onToggleOptIn }) {
  const [showLeaderboard, setShowLeaderboard] = useState(false);

  if (!leaderboardData) return null;

  const topThree = leaderboardData.slice(0, 3);
  const currentStudentRank = leaderboardData.findIndex(s => s.student_id === currentStudentId) + 1;
  const currentStudent = leaderboardData.find(s => s.student_id === currentStudentId);

  const getRankIcon = (rank) => {
    if (rank === 1) return <Crown className="w-6 h-6 text-amber-500" />;
    if (rank === 2) return <Medal className="w-6 h-6 text-gray-400" />;
    if (rank === 3) return <Medal className="w-6 h-6 text-amber-700" />;
    return null;
  };

  const getRankColor = (rank) => {
    if (rank === 1) return "from-amber-400 to-yellow-600";
    if (rank === 2) return "from-gray-300 to-gray-500";
    if (rank === 3) return "from-amber-600 to-orange-800";
    return "from-purple-400 to-purple-600";
  };

  return (
    <Card className="shadow-lg">
      <CardHeader className="border-b bg-gradient-to-r from-amber-50 to-orange-50">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-amber-900">
            <Trophy className="w-6 h-6" />
            Leaderboard
          </CardTitle>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowLeaderboard(!showLeaderboard)}
          >
            {showLeaderboard ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
          </Button>
        </div>
      </CardHeader>
      <CardContent className="p-6">
        {/* Privacy Toggle */}
        <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <Label htmlFor="leaderboard-opt-in" className="font-semibold text-gray-900">
                Show me on the leaderboard
              </Label>
              <p className="text-xs text-gray-600 mt-1">
                Let others see your progress and compete with friends
              </p>
            </div>
            <Switch
              id="leaderboard-opt-in"
              checked={isOptedIn}
              onCheckedChange={onToggleOptIn}
            />
          </div>
        </div>

        {/* Your Rank */}
        {isOptedIn && currentStudent && (
          <div className="mb-6 p-4 bg-gradient-to-r from-purple-100 to-blue-100 rounded-lg border-2 border-purple-300">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className={`w-12 h-12 rounded-full bg-gradient-to-br ${getRankColor(currentStudentRank)} flex items-center justify-center text-white font-bold shadow-lg`}>
                  {currentStudentRank}
                </div>
                <div>
                  <div className="font-bold text-gray-900">Your Rank</div>
                  <div className="text-sm text-gray-600">Keep going! 🚀</div>
                </div>
              </div>
              <div className="text-right">
                <div className="flex items-center gap-1">
                  <Zap className="w-5 h-5 text-amber-600" />
                  <span className="text-2xl font-bold text-gray-900">
                    {currentStudent.total_points}
                  </span>
                </div>
                <div className="text-xs text-gray-600">Level {currentStudent.level}</div>
              </div>
            </div>
          </div>
        )}

        {/* Leaderboard */}
        {showLeaderboard && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="space-y-3"
          >
            {/* Top 3 Podium */}
            <div className="grid grid-cols-3 gap-3 mb-6">
              {/* 2nd Place */}
              {topThree[1] && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 }}
                  className="text-center"
                >
                  <div className="relative">
                    <div className="w-16 h-16 mx-auto rounded-full bg-gradient-to-br from-gray-300 to-gray-500 flex items-center justify-center shadow-lg mb-2">
                      <Medal className="w-8 h-8 text-white" />
                    </div>
                    <div className="absolute -top-1 -right-1 w-6 h-6 bg-white rounded-full flex items-center justify-center text-xs font-bold text-gray-600 shadow border-2 border-gray-300">
                      2
                    </div>
                  </div>
                  <div className="font-semibold text-sm text-gray-900 truncate">
                    {topThree[1].display_name || topThree[1].student_name}
                  </div>
                  <div className="text-xs text-amber-600 font-bold">
                    {topThree[1].total_points} XP
                  </div>
                </motion.div>
              )}

              {/* 1st Place */}
              {topThree[0] && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0 }}
                  className="text-center"
                >
                  <div className="relative">
                    <div className="w-20 h-20 mx-auto rounded-full bg-gradient-to-br from-amber-400 to-yellow-600 flex items-center justify-center shadow-xl mb-2">
                      <Crown className="w-10 h-10 text-white" />
                    </div>
                    <div className="absolute -top-2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
                      <div className="text-2xl animate-bounce">👑</div>
                    </div>
                  </div>
                  <div className="font-bold text-gray-900 truncate">
                    {topThree[0].display_name || topThree[0].student_name}
                  </div>
                  <div className="text-sm text-amber-600 font-bold">
                    {topThree[0].total_points} XP
                  </div>
                </motion.div>
              )}

              {/* 3rd Place */}
              {topThree[2] && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                  className="text-center"
                >
                  <div className="relative">
                    <div className="w-16 h-16 mx-auto rounded-full bg-gradient-to-br from-amber-600 to-orange-800 flex items-center justify-center shadow-lg mb-2">
                      <Medal className="w-8 h-8 text-white" />
                    </div>
                    <div className="absolute -top-1 -right-1 w-6 h-6 bg-white rounded-full flex items-center justify-center text-xs font-bold text-gray-600 shadow border-2 border-amber-300">
                      3
                    </div>
                  </div>
                  <div className="font-semibold text-sm text-gray-900 truncate">
                    {topThree[2].display_name || topThree[2].student_name}
                  </div>
                  <div className="text-xs text-amber-600 font-bold">
                    {topThree[2].total_points} XP
                  </div>
                </motion.div>
              )}
            </div>

            {/* Rest of leaderboard */}
            {leaderboardData.slice(3, 10).map((student, index) => (
              <motion.div
                key={student.student_id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: (index + 3) * 0.05 }}
                className={`flex items-center justify-between p-3 rounded-lg ${
                  student.student_id === currentStudentId
                    ? 'bg-purple-100 border-2 border-purple-300'
                    : 'bg-gray-50 hover:bg-gray-100'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center text-sm font-bold text-gray-600">
                    {index + 4}
                  </div>
                  <div>
                    <div className="font-semibold text-gray-900">
                      {student.display_name || student.student_name}
                    </div>
                    <div className="text-xs text-gray-600">Level {student.level}</div>
                  </div>
                </div>
                <div className="flex items-center gap-1">
                  <Zap className="w-4 h-4 text-amber-600" />
                  <span className="font-bold text-gray-900">{student.total_points}</span>
                </div>
              </motion.div>
            ))}
          </motion.div>
        )}

        {!showLeaderboard && (
          <div className="text-center py-8 text-gray-500">
            <Trophy className="w-16 h-16 mx-auto mb-3 text-gray-300" />
            <p className="mb-2">Click the eye icon to view the leaderboard</p>
            <p className="text-sm">Compete with your classmates and climb the ranks!</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}