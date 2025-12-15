import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Search, Edit } from "lucide-react";
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

export default function GradeManager({ students, assignments, grades }) {
  const [showForm, setShowForm] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [formData, setFormData] = useState({
    assignment_id: '',
    score: '',
    max_score: 100,
    feedback: '',
    letter_grade: ''
  });
  const queryClient = useQueryClient();

  const addGradeMutation = useMutation({
    mutationFn: (gradeData) => base44.entities.Grade.create(gradeData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['all-grades'] });
      setShowForm(false);
      setSelectedStudent(null);
      setFormData({ assignment_id: '', score: '', max_score: 100, feedback: '', letter_grade: '' });
    }
  });

  const handleSubmit = () => {
    if (!selectedStudent || !formData.assignment_id || !formData.score) {
      alert('Please fill in all required fields');
      return;
    }

    const assignment = assignments.find(a => a.id === formData.assignment_id);
    const percentage = (parseFloat(formData.score) / parseFloat(formData.max_score)) * 100;
    let letterGrade = '';
    if (percentage >= 90) letterGrade = 'A';
    else if (percentage >= 80) letterGrade = 'B';
    else if (percentage >= 70) letterGrade = 'C';
    else if (percentage >= 60) letterGrade = 'D';
    else letterGrade = 'F';

    addGradeMutation.mutate({
      student_id: selectedStudent.id,
      student_name: selectedStudent.full_name,
      subject: assignment?.subject || 'General',
      assignment_name: assignment?.title || 'Assignment',
      assignment_id: formData.assignment_id,
      score: parseFloat(formData.score),
      max_score: parseFloat(formData.max_score),
      letter_grade: letterGrade,
      feedback: formData.feedback,
      graded_date: new Date().toISOString().split('T')[0]
    });
  };

  const filteredStudents = students.filter(s =>
    s.full_name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getStudentGrades = (studentId) => {
    return grades.filter(g => g.student_id === studentId);
  };

  return (
    <>
      <Card className="shadow-lg">
        <CardHeader className="border-b bg-gradient-to-r from-green-50 to-emerald-50">
          <div className="flex items-center justify-between">
            <CardTitle>Grade Book</CardTitle>
            <Button onClick={() => setShowForm(true)} className="bg-green-600">
              <Plus className="w-4 h-4 mr-2" />
              Add Grade
            </Button>
          </div>
        </CardHeader>
        <CardContent className="p-6">
          <div className="mb-6">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                placeholder="Search students..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

          <div className="space-y-3">
            {filteredStudents.map(student => {
              const studentGrades = getStudentGrades(student.id);
              const avg = studentGrades.length > 0
                ? Math.round(studentGrades.reduce((sum, g) => sum + ((g.score / (g.max_score || 100)) * 100), 0) / studentGrades.length)
                : 0;

              return (
                <Card key={student.id} className="hover:shadow-md transition-shadow">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <h4 className="font-semibold text-gray-900">{student.full_name}</h4>
                        <p className="text-sm text-gray-600">
                          {studentGrades.length} grades | Average: {avg}%
                        </p>
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setSelectedStudent(student);
                          setShowForm(true);
                        }}
                      >
                        <Plus className="w-4 h-4 mr-1" />
                        Add Grade
                      </Button>
                    </div>

                    {studentGrades.length > 0 && (
                      <div className="mt-3 pt-3 border-t">
                        <p className="text-xs text-gray-600 mb-2">Recent Grades:</p>
                        <div className="flex flex-wrap gap-2">
                          {studentGrades.slice(0, 5).map(grade => (
                            <div key={grade.id} className="text-xs bg-gray-100 px-2 py-1 rounded">
                              {grade.assignment_name}: {Math.round((grade.score / (grade.max_score || 100)) * 100)}%
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </CardContent>
      </Card>

      <Dialog open={showForm} onOpenChange={() => {
        setShowForm(false);
        setSelectedStudent(null);
      }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Grade {selectedStudent && `- ${selectedStudent.full_name}`}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            {!selectedStudent && (
              <div>
                <Label>Select Student</Label>
                <Select onValueChange={(id) => setSelectedStudent(students.find(s => s.id === id))}>
                  <SelectTrigger>
                    <SelectValue placeholder="Choose a student" />
                  </SelectTrigger>
                  <SelectContent>
                    {students.map(student => (
                      <SelectItem key={student.id} value={student.id}>
                        {student.full_name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            <div>
              <Label>Assignment</Label>
              <Select 
                value={formData.assignment_id} 
                onValueChange={(v) => setFormData({...formData, assignment_id: v})}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select assignment" />
                </SelectTrigger>
                <SelectContent>
                  {assignments.map(assignment => (
                    <SelectItem key={assignment.id} value={assignment.id}>
                      {assignment.title} ({assignment.subject})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Score</Label>
                <Input
                  type="number"
                  value={formData.score}
                  onChange={(e) => setFormData({...formData, score: e.target.value})}
                  placeholder="85"
                />
              </div>
              <div>
                <Label>Max Score</Label>
                <Input
                  type="number"
                  value={formData.max_score}
                  onChange={(e) => setFormData({...formData, max_score: e.target.value})}
                  placeholder="100"
                />
              </div>
            </div>

            <div>
              <Label>Feedback (Optional)</Label>
              <Textarea
                value={formData.feedback}
                onChange={(e) => setFormData({...formData, feedback: e.target.value})}
                placeholder="Great work on this assignment..."
                rows={3}
              />
            </div>

            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setShowForm(false)}>
                Cancel
              </Button>
              <Button onClick={handleSubmit} className="bg-green-600">
                Add Grade
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}