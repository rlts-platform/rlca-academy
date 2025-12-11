import React from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { motion } from "framer-motion";

export default function StatsCard({ icon: Icon, title, value, subtitle, color = "purple" }) {
  const colorClasses = {
    purple: "from-purple-500 to-purple-700",
    blue: "from-blue-500 to-blue-700",
    gold: "from-amber-500 to-amber-700",
    green: "from-green-500 to-green-700",
    red: "from-red-500 to-red-700"
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
    >
      <Card className="overflow-hidden hover:shadow-xl transition-shadow duration-300">
        <CardContent className="p-0">
          <div className={`bg-gradient-to-br ${colorClasses[color]} p-6 text-white`}>
            <div className="flex items-center justify-between mb-3">
              <Icon className="w-8 h-8 opacity-90" />
              <div className="text-right">
                <div className="text-3xl font-bold">{value}</div>
              </div>
            </div>
            <div className="text-sm font-medium opacity-90">{title}</div>
            {subtitle && (
              <div className="text-xs opacity-75 mt-1">{subtitle}</div>
            )}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}