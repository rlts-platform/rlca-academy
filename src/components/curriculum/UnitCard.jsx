import React from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { FolderOpen, Edit, Trash2, Clock, Target } from "lucide-react";
import { motion } from "framer-motion";

export default function UnitCard({ unit, onEdit, onDelete, onClick }) {
  const statusColors = {
    Draft: "bg-gray-100 text-gray-800",
    Published: "bg-green-100 text-green-800",
    Archived: "bg-red-100 text-red-800"
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -5 }}
      className="cursor-pointer"
      onClick={onClick}
    >
      <Card className="shadow-md hover:shadow-xl transition-all border-2 border-gray-200 hover:border-blue-300">
        <CardContent className="p-5">
          <div className="flex items-start justify-between mb-3">
            <div className="flex items-center gap-3 flex-1">
              <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center shadow-md">
                <FolderOpen className="w-5 h-5 text-white" />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-bold text-gray-900 line-clamp-1">{unit.title}</h3>
                <p className="text-xs text-gray-600">{unit.grade_level}</p>
              </div>
            </div>
            <Badge className={`${statusColors[unit.status]} text-xs ml-2`}>
              {unit.status}
            </Badge>
          </div>

          {unit.description && (
            <p className="text-sm text-gray-700 mb-3 line-clamp-2">
              {unit.description}
            </p>
          )}

          <div className="flex items-center gap-4 mb-3 text-xs text-gray-600">
            <div className="flex items-center gap-1">
              <Target className="w-3 h-3" />
              <span>{unit.total_lessons || 0} lessons</span>
            </div>
            <div className="flex items-center gap-1">
              <Clock className="w-3 h-3" />
              <span>{unit.estimated_duration_weeks || 0}w</span>
            </div>
          </div>

          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={(e) => {
                e.stopPropagation();
                onEdit && onEdit(unit);
              }}
              className="flex-1 text-xs"
            >
              <Edit className="w-3 h-3 mr-1" />
              Edit
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={(e) => {
                e.stopPropagation();
                onDelete && onDelete(unit.id);
              }}
              className="text-red-600 hover:text-red-700 text-xs"
            >
              <Trash2 className="w-3 h-3" />
            </Button>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}