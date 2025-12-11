import React from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { UserCircle, GraduationCap, Calendar } from "lucide-react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";

export default function StudentCard({ student, onSelect }) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      whileHover={{ scale: 1.02 }}
      transition={{ duration: 0.3 }}
    >
      <Card className="overflow-hidden hover:shadow-xl transition-shadow duration-300 cursor-pointer border-2 border-transparent hover:border-purple-300"
        onClick={() => onSelect && onSelect(student)}
      >
        <CardContent className="p-0">
          <div className="bg-gradient-to-br from-purple-500 to-blue-600 p-6 text-white">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-3">
                {student.profile_image ? (
                  <img src={student.profile_image} alt={student.full_name} className="w-16 h-16 rounded-full border-4 border-white/30" />
                ) : (
                  <div className="w-16 h-16 rounded-full bg-white/20 flex items-center justify-center border-4 border-white/30">
                    <UserCircle className="w-10 h-10" />
                  </div>
                )}
                <div>
                  <h3 className="text-xl font-bold">{student.full_name}</h3>
                  <div className="text-sm opacity-90">Age {student.age}</div>
                </div>
              </div>
              <Badge className="bg-white/20 text-white border-white/30">
                {student.enrollment_status}
              </Badge>
            </div>
            
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm">
                <GraduationCap className="w-4 h-4" />
                <span>{student.grade_level}</span>
              </div>
            </div>
          </div>
          
          <div className="p-4 bg-gray-50">
            <Button className="w-full bg-purple-600 hover:bg-purple-700 text-white" size="sm">
              View Dashboard
            </Button>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}