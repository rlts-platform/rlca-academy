import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { GraduationCap, FileText, Clock, CheckCircle, Eye } from "lucide-react";
import { motion } from "framer-motion";
import AIGradingAssistant from '../components/assignments/AIGradingAssistant';

export default function TeacherGrading() {
  const [currentUser, setCurrentUser] = useState(null);
  const [selectedAssignment, setSelectedAssignment] = useState(null);
  const [selectedSubmission, setSelectedSubmission] = useState(null);
  const [gradeData, setGradeData] = useState({ score: '', feedback: '', rubric_scores: [] });
  const queryClient = useQueryClient();

  useEffect(() => {
    loadUser();
  }, []);

  const loadUser = async () => {
    const user = await base44.auth.me();
    setCurrentUser(user);
  };

  const { data: assignments = [] } = useQuery({
    queryKey: ['teacher-assignments'],
    queryFn: () => base44.entities.Assignment.filter({ status: 'Published' }, '-created_date'),
    enabled: !!currentUser
  });

  const { data: submissions = [] } = useQuery({
    queryKey: ['assignment-submissions', selectedAssignment?.id],
    queryFn: () => base44.entities.AssignmentSubmission.filter({ 
      assignment_id: selectedAssignment.id,
      status: 'Submitted'
    }),
    enabled: !!selectedAssignment
  });

  const gradeSubmissionMutation = useMutation({
    mutationFn: async ({ submissionId, gradeData }) => {
      await base44.entities.AssignmentSubmission.update(submissionId, {
        status: 'Graded',
        graded_score: parseFloat(gradeData.score),
        percentage: Math.round((parseFloat(gradeData.score) / selectedAssignment.points_possible) * 100),
        teacher_feedback: gradeData.feedback,
        rubric_scores: gradeData.rubric_scores,
        graded_by: currentUser.email,
        graded_date: new Date().toISOString()
      });

      // Create grade record
      const submission = submissions.find(s => s.id === submissionId);
      await base44.entities.Grade.create({
        student_id: submission.student_id,
        student_name: submission.student_name,
        subject: selectedAssignment.subject,
        assignment_name: selectedAssignment.title,
        assignment_id: selectedAssignment.id,
        score: parseFloat(gradeData.score),
        max_score: selectedAssignment.points_possible,
        feedback: gradeData.feedback,
        submission_date: submission.submitted_date,
        graded_date: new Date().toISOString().split('T')[0],
        graded_by: currentUser.email
      });

      // Create notification for student
      await base44.entities.Notification.create({
        user_id: submission.student_id,
        type: 'graded_work',
        title: 'Assignment Graded',
        message: `Your assignment "${selectedAssignment.title}" has been graded. Score: ${gradeData.score}/${selectedAssignment.points_possible}`,
        priority: 'medium',
        student_id: submission.student_id
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['assignment-submissions'] });
      setSelectedSubmission(null);
      setGradeData({ score: '', feedback: '', rubric_scores: [] });
    }
  });

  const handleApplyAISuggestion = (aiSuggestion) => {
    setGradeData({
      score: aiSuggestion.suggested_score,
      feedback: aiSuggestion.feedback,
      rubric_scores: aiSuggestion.rubric_breakdown || []
    });
  };

  const handleGradeSubmit = () => {
    if (!gradeData.score || !gradeData.feedback) {
      alert('Please provide both a score and feedback');
      return;
    }
    gradeSubmissionMutation.mutate({
      submissionId: selectedSubmission.id,
      gradeData
    });
  };

  const pendingCount = submissions.filter(s => s.status === 'Submitted').length;

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-pink-50 p-6">
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex items-center gap-4 mb-6">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-purple-500 to-blue-600 flex items-center justify-center shadow-xl">
              <GraduationCap className="w-9 h-9 text-white" />
            </div>
            <div>
              <h1 className="text-4xl font-bold text-gray-900">Grading Dashboard</h1>
              <p className="text-gray-600 mt-1">Review submissions with AI-powered assistance</p>
            </div>
          </div>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Assignment Selection */}
          <div className="lg:col-span-1">
            <Card className="shadow-lg sticky top-6">
              <CardHeader className="border-b">
                <CardTitle>Assignments</CardTitle>
              </CardHeader>
              <CardContent className="p-4">
                <div className="space-y-2 max-h-[600px] overflow-y-auto">
                  {assignments.map(assignment => {
                    const submissionCount = assignment.id === selectedAssignment?.id ? submissions.length : 0;
                    return (
                      <div
                        key={assignment.id}
                        onClick={() => setSelectedAssignment(assignment)}
                        className={`p-4 rounded-lg cursor-pointer transition-all ${
                          selectedAssignment?.id === assignment.id
                            ? 'bg-purple-100 border-2 border-purple-500'
                            : 'bg-gray-50 hover:bg-gray-100'
                        }`}
                      >
                        <div className="font-semibold text-gray-900 mb-1">{assignment.title}</div>
                        <div className="text-sm text-gray-600">{assignment.subject}</div>
                        <div className="flex items-center gap-2 mt-2">
                          <Badge variant="outline" className="text-xs">
                            {assignment.assignment_type}
                          </Badge>
                          {selectedAssignment?.id === assignment.id && submissionCount > 0 && (
                            <Badge className="bg-orange-100 text-orange-800 text-xs">
                              {submissionCount} submissions
                            </Badge>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Submissions & Grading */}
          <div className="lg:col-span-2">
            {!selectedAssignment ? (
              <Card className="shadow-lg h-96 flex items-center justify-center">
                <CardContent className="text-center">
                  <FileText className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-600">Select an assignment to view submissions</p>
                </CardContent>
              </Card>
            ) : !selectedSubmission ? (
              <Card className="shadow-lg">
                <CardHeader className="border-b bg-gradient-to-r from-purple-50 to-blue-50">
                  <CardTitle className="flex items-center justify-between">
                    <span>{selectedAssignment.title}</span>
                    {pendingCount > 0 && (
                      <Badge className="bg-orange-500 text-white">
                        {pendingCount} pending
                      </Badge>
                    )}
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-6">
                  <div className="space-y-3">
                    {submissions.length === 0 ? (
                      <div className="text-center py-12">
                        <Clock className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                        <p className="text-gray-600">No submissions yet</p>
                      </div>
                    ) : (
                      submissions.map(submission => (
                        <div
                          key={submission.id}
                          className="p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer"
                          onClick={() => setSelectedSubmission(submission)}
                        >
                          <div className="flex items-center justify-between">
                            <div>
                              <div className="font-semibold text-gray-900">{submission.student_name}</div>
                              <div className="text-sm text-gray-600">
                                Submitted {new Date(submission.submitted_date).toLocaleDateString()}
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              <Badge className={
                                submission.late_submission
                                  ? 'bg-red-100 text-red-800'
                                  : 'bg-blue-100 text-blue-800'
                              }>
                                {submission.late_submission ? 'Late' : 'On Time'}
                              </Badge>
                              <Button size="sm" variant="outline">
                                <Eye className="w-4 h-4 mr-1" />
                                Review
                              </Button>
                            </div>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-6">
                {/* Submission Header */}
                <Card className="shadow-lg">
                  <CardHeader className="border-b">
                    <div className="flex items-center justify-between">
                      <div>
                        <CardTitle>{selectedSubmission.student_name}</CardTitle>
                        <p className="text-sm text-gray-600 mt-1">
                          Submitted {new Date(selectedSubmission.submitted_date).toLocaleDateString()}
                        </p>
                      </div>
                      <Button variant="outline" onClick={() => setSelectedSubmission(null)}>
                        Back to List
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent className="p-6">
                    <div className="prose max-w-none">
                      <h3 className="text-lg font-semibold mb-3">Student Response:</h3>
                      <div className="p-4 bg-gray-50 rounded-lg whitespace-pre-wrap">
                        {selectedSubmission.text_response || '(No text response)'}
                      </div>
                      {selectedSubmission.file_links && selectedSubmission.file_links.length > 0 && (
                        <div className="mt-4">
                          <h4 className="font-semibold mb-2">Attached Files:</h4>
                          <ul className="space-y-1">
                            {selectedSubmission.file_links.map((link, i) => (
                              <li key={i}>
                                <a href={link} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                                  File {i + 1}
                                </a>
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>

                {/* AI Grading Assistant */}
                <AIGradingAssistant
                  submission={selectedSubmission}
                  assignment={selectedAssignment}
                  onApplySuggestion={handleApplyAISuggestion}
                />

                {/* Manual Grading Form */}
                <Card className="shadow-lg">
                  <CardHeader className="border-b">
                    <CardTitle>Finalize Grade</CardTitle>
                  </CardHeader>
                  <CardContent className="p-6 space-y-4">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Score (out of {selectedAssignment.points_possible})
                      </label>
                      <Input
                        type="number"
                        value={gradeData.score}
                        onChange={(e) => setGradeData({ ...gradeData, score: e.target.value })}
                        max={selectedAssignment.points_possible}
                        min={0}
                        placeholder="Enter score"
                      />
                    </div>

                    {selectedAssignment.rubric && selectedAssignment.rubric.length > 0 && (
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                          Rubric Scores
                        </label>
                        <div className="space-y-2">
                          {selectedAssignment.rubric.map((criteria, i) => {
                            const rubricScore = gradeData.rubric_scores[i] || {};
                            return (
                              <div key={i} className="p-3 bg-gray-50 rounded-lg">
                                <div className="flex items-center justify-between mb-1">
                                  <span className="font-medium text-sm">{criteria.criteria}</span>
                                  <Input
                                    type="number"
                                    value={rubricScore.points_earned || ''}
                                    onChange={(e) => {
                                      const newScores = [...gradeData.rubric_scores];
                                      newScores[i] = {
                                        criteria: criteria.criteria,
                                        points_earned: parseFloat(e.target.value),
                                        points_possible: criteria.points
                                      };
                                      setGradeData({ ...gradeData, rubric_scores: newScores });
                                    }}
                                    max={criteria.points}
                                    min={0}
                                    className="w-20"
                                    placeholder={`/${criteria.points}`}
                                  />
                                </div>
                                <p className="text-xs text-gray-600">{criteria.description}</p>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    )}

                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Feedback for Student
                      </label>
                      <Textarea
                        value={gradeData.feedback}
                        onChange={(e) => setGradeData({ ...gradeData, feedback: e.target.value })}
                        rows={6}
                        placeholder="Provide constructive feedback..."
                      />
                    </div>

                    <Button
                      onClick={handleGradeSubmit}
                      disabled={!gradeData.score || !gradeData.feedback}
                      className="w-full bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700"
                      size="lg"
                    >
                      <CheckCircle className="w-5 h-5 mr-2" />
                      Submit Grade
                    </Button>
                  </CardContent>
                </Card>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}