import React from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { BookOpen, Edit, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";

export default function SubjectCard({ subject, onEdit, onDelete, onClick }) {
  const statusColors = {
    Draft: "bg-gray-100 text-gray-800",
    Published: "bg-green-100 text-green-800",
    Archived: "bg-red-100 text-red-800"
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      whileHover={{ scale: 1.02 }}
      className="cursor-pointer"
      onClick={onClick}
    >
      <Card className="shadow-lg hover:shadow-xl transition-all border-2 border-gray-200 hover:border-purple-300">
        <CardContent className="p-6">
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className={`w-12 h-12 rounded-lg ${subject.color || 'bg-purple-500'} flex items-center justify-center shadow-lg`}>
                <BookOpen className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="font-bold text-lg text-gray-900">{subject.name}</h3>
                <p className="text-sm text-gray-600">{subject.total_units || 0} units</p>
              </div>
            </div>
            <Badge className={statusColors[subject.status]}>
              {subject.status}
            </Badge>
          </div>

          {subject.description && (
            <p className="text-sm text-gray-700 mb-4 line-clamp-2">
              {subject.description}
            </p>
          )}

          <div className="flex flex-wrap gap-2 mb-4">
            {subject.grade_levels?.slice(0, 5).map((grade, i) => (
              <Badge key={i} variant="outline" className="text-xs">
                {grade}
              </Badge>
            ))}
            {subject.grade_levels?.length > 5 && (
              <Badge variant="outline" className="text-xs">
                +{subject.grade_levels.length - 5} more
              </Badge>
            )}
          </div>

          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={(e) => {
                e.stopPropagation();
                onEdit && onEdit(subject);
              }}
              className="flex-1"
            >
              <Edit className="w-4 h-4 mr-2" />
              Edit
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={(e) => {
                e.stopPropagation();
                onDelete && onDelete(subject.id);
              }}
              className="text-red-600 hover:text-red-700"
            >
              <Trash2 className="w-4 h-4" />
            </Button>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}