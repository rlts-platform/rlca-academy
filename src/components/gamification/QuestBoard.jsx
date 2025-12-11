import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Scroll, Zap, Clock, Target, CheckCircle, Gift } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { format, parseISO, differenceInDays } from "date-fns";

export default function QuestBoard({ quests, questProgress, onClaimReward }) {
  if (!quests || quests.length === 0) return null;

  const difficultyColors = {
    Easy: "bg-green-100 text-green-800 border-green-300",
    Medium: "bg-yellow-100 text-yellow-800 border-yellow-300",
    Hard: "bg-orange-100 text-orange-800 border-orange-300",
    Expert: "bg-red-100 text-red-800 border-red-300"
  };

  const questTypeIcons = {
    daily: Clock,
    weekly: Target,
    milestone: CheckCircle,
    learning_plan: Scroll,
    special: Gift
  };

  const getQuestProgress = (questId) => {
    return questProgress?.find(qp => qp.quest_id === questId);
  };

  return (
    <Card className="shadow-lg">
      <CardHeader className="border-b bg-gradient-to-r from-indigo-50 to-purple-50">
        <CardTitle className="flex items-center gap-2 text-indigo-900">
          <Scroll className="w-6 h-6" />
          Active Quests
        </CardTitle>
      </CardHeader>
      <CardContent className="p-6">
        <div className="space-y-4">
          <AnimatePresence>
            {quests.filter(q => q.status === "Active").map((quest, index) => {
              const progress = getQuestProgress(quest.id);
              const Icon = questTypeIcons[quest.quest_type] || Scroll;
              const isCompleted = progress?.status === "Completed";
              const isClaimed = progress?.reward_claimed;
              const daysLeft = quest.end_date ? differenceInDays(parseISO(quest.end_date), new Date()) : null;

              return (
                <motion.div
                  key={quest.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  transition={{ delay: index * 0.1 }}
                  className={`p-5 rounded-xl border-2 transition-all ${
                    isCompleted
                      ? 'bg-gradient-to-br from-green-50 to-emerald-50 border-green-300'
                      : 'bg-white border-gray-200 hover:border-purple-300 hover:shadow-lg'
                  }`}
                >
                  <div className="flex items-start gap-4">
                    <div className={`flex-shrink-0 w-14 h-14 rounded-xl flex items-center justify-center ${
                      isCompleted ? 'bg-green-500' : 'bg-gradient-to-br from-purple-500 to-indigo-600'
                    } shadow-lg`}>
                      {isCompleted ? (
                        <CheckCircle className="w-7 h-7 text-white" />
                      ) : (
                        <Icon className="w-7 h-7 text-white" />
                      )}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2 mb-2">
                        <div className="flex-1">
                          <h3 className="font-bold text-gray-900 mb-1">{quest.title}</h3>
                          <p className="text-sm text-gray-600 mb-2">{quest.description}</p>
                        </div>
                        <div className="flex flex-col gap-2 items-end">
                          <Badge className={`${difficultyColors[quest.difficulty]} border`}>
                            {quest.difficulty}
                          </Badge>
                          {daysLeft !== null && daysLeft >= 0 && (
                            <Badge variant="outline" className="text-xs">
                              <Clock className="w-3 h-3 mr-1" />
                              {daysLeft}d left
                            </Badge>
                          )}
                        </div>
                      </div>

                      {/* Requirements Progress */}
                      {progress?.requirements_progress && (
                        <div className="space-y-2 mb-3">
                          {progress.requirements_progress.map((req, i) => (
                            <div key={i} className="space-y-1">
                              <div className="flex items-center justify-between text-xs">
                                <span className="text-gray-600">{req.description}</span>
                                <span className={`font-semibold ${req.completed ? 'text-green-600' : 'text-gray-700'}`}>
                                  {req.current} / {req.target}
                                </span>
                              </div>
                              <div className="w-full bg-gray-200 rounded-full h-2">
                                <div
                                  className={`h-full rounded-full transition-all ${
                                    req.completed ? 'bg-green-500' : 'bg-purple-500'
                                  }`}
                                  style={{ width: `${Math.min((req.current / req.target) * 100, 100)}%` }}
                                />
                              </div>
                            </div>
                          ))}
                        </div>
                      )}

                      {/* Rewards and Actions */}
                      <div className="flex items-center justify-between mt-3 pt-3 border-t border-gray-200">
                        <div className="flex items-center gap-4">
                          <div className="flex items-center gap-2 text-sm">
                            <Zap className="w-4 h-4 text-amber-600" />
                            <span className="font-semibold text-gray-900">
                              {quest.points_reward} XP
                            </span>
                          </div>
                          {quest.badge_reward && (
                            <Badge className="bg-purple-100 text-purple-800 border-purple-200 text-xs">
                              + Badge
                            </Badge>
                          )}
                        </div>
                        
                        {isCompleted && !isClaimed && (
                          <Button
                            onClick={() => onClaimReward && onClaimReward(quest.id)}
                            className="bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white shadow-lg"
                            size="sm"
                          >
                            <Gift className="w-4 h-4 mr-2" />
                            Claim Reward
                          </Button>
                        )}
                        
                        {isClaimed && (
                          <Badge className="bg-green-100 text-green-800 border-green-200">
                            ✓ Claimed
                          </Badge>
                        )}
                      </div>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>

          {quests.filter(q => q.status === "Active").length === 0 && (
            <div className="text-center py-8 text-gray-500">
              <Scroll className="w-16 h-16 mx-auto mb-3 text-gray-300" />
              <p>No active quests available. Check back soon!</p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}