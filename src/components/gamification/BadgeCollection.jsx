import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Award, Trophy, Star, Medal, Crown, Rocket, Flame, Book, Target, Zap, Heart, Diamond, Shield, Flag } from "lucide-react";
import { motion } from "framer-motion";
import { format, parseISO } from "date-fns";

const iconMap = {
  trophy: Trophy,
  star: Star,
  medal: Medal,
  crown: Crown,
  rocket: Rocket,
  fire: Flame,
  book: Book,
  target: Target,
  lightning: Zap,
  heart: Heart,
  diamond: Diamond,
  shield: Shield,
  flag: Flag,
  award: Award
};

const colorClasses = {
  gold: "from-amber-400 to-yellow-600",
  silver: "from-gray-300 to-gray-500",
  bronze: "from-amber-700 to-orange-900",
  purple: "from-purple-400 to-purple-600",
  blue: "from-blue-400 to-blue-600",
  green: "from-green-400 to-green-600",
  red: "from-red-400 to-red-600",
  pink: "from-pink-400 to-pink-600",
  orange: "from-orange-400 to-orange-600",
  cyan: "from-cyan-400 to-cyan-600"
};

const rarityColors = {
  Common: "bg-gray-100 text-gray-800 border-gray-300",
  Rare: "bg-blue-100 text-blue-800 border-blue-300",
  Epic: "bg-purple-100 text-purple-800 border-purple-300",
  Legendary: "bg-amber-100 text-amber-800 border-amber-300"
};

export default function BadgeCollection({ earnedBadges, allBadges }) {
  if (!earnedBadges) earnedBadges = [];

  const earnedIds = earnedBadges.map(b => b.badge_id);
  const lockedBadges = allBadges?.filter(b => !earnedIds.includes(b.id)) || [];

  return (
    <Card className="shadow-lg">
      <CardHeader className="border-b bg-gradient-to-r from-purple-50 to-pink-50">
        <CardTitle className="flex items-center gap-2 text-purple-900">
          <Award className="w-6 h-6" />
          Badge Collection ({earnedBadges.length})
        </CardTitle>
      </CardHeader>
      <CardContent className="p-6">
        {earnedBadges.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <Award className="w-16 h-16 mx-auto mb-3 text-gray-300" />
            <p>Complete quests and achieve milestones to earn badges!</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {earnedBadges.map((badge, index) => {
              const Icon = iconMap[badge.icon] || Award;
              return (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, scale: 0.8, rotateY: 180 }}
                  animate={{ opacity: 1, scale: 1, rotateY: 0 }}
                  transition={{ delay: index * 0.1, duration: 0.5 }}
                  whileHover={{ scale: 1.1, rotateY: 360 }}
                  className="relative group"
                >
                  <div className="text-center">
                    <div className={`w-20 h-20 mx-auto rounded-full bg-gradient-to-br ${colorClasses[badge.color] || colorClasses.gold} flex items-center justify-center shadow-xl mb-2 relative overflow-hidden`}>
                      <div className="absolute inset-0 bg-white/20 animate-pulse"></div>
                      <Icon className="w-10 h-10 text-white relative z-10" />
                    </div>
                    <div className="font-semibold text-sm text-gray-900 mb-1 line-clamp-2">
                      {badge.badge_name}
                    </div>
                    {badge.earned_date && (
                      <div className="text-xs text-gray-500">
                        {format(parseISO(badge.earned_date), 'MMM d')}
                      </div>
                    )}
                  </div>

                  {/* Hover tooltip */}
                  <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-2 bg-gray-900 text-white text-xs rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none z-20">
                    {badge.badge_name}
                    <div className="text-gray-300 text-xs">
                      Earned {format(parseISO(badge.earned_date), 'MMM d, yyyy')}
                    </div>
                  </div>
                </motion.div>
              );
            })}

            {/* Show locked badges */}
            {lockedBadges.slice(0, 5).map((badge, index) => {
              const Icon = iconMap[badge.icon] || Award;
              return (
                <motion.div
                  key={`locked-${index}`}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: (earnedBadges.length + index) * 0.1 }}
                  className="relative group"
                >
                  <div className="text-center opacity-40">
                    <div className="w-20 h-20 mx-auto rounded-full bg-gradient-to-br from-gray-300 to-gray-400 flex items-center justify-center shadow-lg mb-2">
                      <Icon className="w-10 h-10 text-gray-500" />
                    </div>
                    <div className="font-semibold text-sm text-gray-500 mb-1 line-clamp-2">
                      ???
                    </div>
                    <div className="text-xs text-gray-400">Locked</div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}