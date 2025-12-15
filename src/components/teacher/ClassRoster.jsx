import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Search, TrendingUp, Calendar, Eye } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { motion } from "framer-motion";

export default function ClassRoster({ students, grades }) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStudent, setSelectedStudent] = useState(null);

  const filteredStudents = students.filter(s => 
    s.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    s.grade_level?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getStudentGrades = (studentId) => {
    return grades.filter(g => g.student_id === studentId);
  };

  const calculateAverage = (studentId) => {
    const studentGrades = getStudentGrades(studentId);
    if (studentGrades.length === 0) return 0;
    const avg = studentGrades.reduce((sum, g) => sum + ((g.score / (g.max_score || 100)) * 100), 0) / studentGrades.length;
    return Math.round(avg);
  };

  return (
    <Card className="shadow-lg">
      <CardHeader className="border-b bg-gradient-to-r from-purple-50 to-blue-50">
        <CardTitle className="flex items-center justify-between">
          <span>Class Roster</span>
          <Badge variant="outline">{filteredStudents.length} Students</Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="p-6">
        <div className="mb-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <Input
              placeholder="Search by name or grade level..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        <div className="space-y-3">
          {filteredStudents.map((student, index) => (
            <motion.div
              key={student.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
            >
              <Card className="hover:shadow-md transition-shadow">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <h4 className="font-semibold text-gray-900">{student.full_name}</h4>
                      <div className="flex items-center gap-4 mt-1 text-sm text-gray-600">
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          {student.grade_level}
                        </span>
                        <span className="flex items-center gap-1">
                          <TrendingUp className="w-3 h-3" />
                          Avg: {calculateAverage(student.id)}%
                        </span>
                        <Badge variant={student.enrollment_status === 'Active' ? 'default' : 'secondary'}>
                          {student.enrollment_status}
                        </Badge>
                      </div>
                    </div>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => setSelectedStudent(student)}
                    >
                      <Eye className="w-4 h-4 mr-1" />
                      View Details
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        {filteredStudents.length === 0 && (
          <div className="text-center py-12 text-gray-500">
            <p>No students found</p>
          </div>
        )}

        {/* Student Details Modal */}
        <Dialog open={!!selectedStudent} onOpenChange={() => setSelectedStudent(null)}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>{selectedStudent?.full_name} - Progress Report</DialogTitle>
            </DialogHeader>
            {selectedStudent && (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-600">Grade Level</p>
                    <p className="font-semibold">{selectedStudent.grade_level}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Age</p>
                    <p className="font-semibold">{selectedStudent.age} years</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Parent Email</p>
                    <p className="font-semibold text-sm">{selectedStudent.parent_email}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Status</p>
                    <Badge>{selectedStudent.enrollment_status}</Badge>
                  </div>
                </div>

                <div>
                  <h4 className="font-semibold mb-2">Recent Grades</h4>
                  <div className="space-y-2 max-h-64 overflow-y-auto">
                    {getStudentGrades(selectedStudent.id).slice(0, 10).map(grade => (
                      <div key={grade.id} className="flex justify-between p-2 bg-gray-50 rounded">
                        <span className="text-sm">{grade.assignment_name}</span>
                        <span className="font-semibold">
                          {Math.round((grade.score / (grade.max_score || 100)) * 100)}%
                        </span>
                      </div>
                    ))}
                    {getStudentGrades(selectedStudent.id).length === 0 && (
                      <p className="text-sm text-gray-500 text-center py-4">No grades recorded yet</p>
                    )}
                  </div>
                </div>

                <div className="p-4 bg-blue-50 rounded-lg">
                  <p className="text-sm font-semibold text-blue-900">Overall Average</p>
                  <p className="text-3xl font-bold text-blue-600">{calculateAverage(selectedStudent.id)}%</p>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </CardContent>
    </Card>
  );
}