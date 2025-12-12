import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Upload, Send, Heart, Clock, Award, FileText } from "lucide-react";
import { motion } from "framer-motion";
import ReactMarkdown from 'react-markdown';
import { format, parseISO } from "date-fns";

export default function AssignmentSubmission() {
  const [studentProfile, setStudentProfile] = useState(null);
  const [assignmentId, setAssignmentId] = useState(null);
  const [textResponse, setTextResponse] = useState("");
  const [fileLinks, setFileLinks] = useState([]);
  const queryClient = useQueryClient();

  useEffect(() => {
    loadUserProfile();
    const params = new URLSearchParams(window.location.search);
    setAssignmentId(params.get('id'));
  }, []);

  const loadUserProfile = async () => {
    try {
      const user = await base44.auth.me();
      const students = await base44.entities.Student.filter({ student_email: user.email });
      if (students && students.length > 0) {
        setStudentProfile(students[0]);
      }
    } catch (error) {
      console.error("Error loading profile:", error);
    }
  };

  const { data: assignment, isLoading } = useQuery({
    queryKey: ['assignment', assignmentId],
    queryFn: async () => {
      const assignments = await base44.entities.Assignment.filter({ id: assignmentId });
      return assignments[0];
    },
    enabled: !!assignmentId
  });

  const { data: submission } = useQuery({
    queryKey: ['submission', assignmentId, studentProfile?.id],
    queryFn: async () => {
      const subs = await base44.entities.AssignmentSubmission.filter({
        assignment_id: assignmentId,
        student_id: studentProfile.id
      });
      if (subs.length > 0) {
        setTextResponse(subs[0].text_response || "");
        setFileLinks(subs[0].file_links || []);
        return subs[0];
      }
      return null;
    },
    enabled: !!assignmentId && !!studentProfile
  });

  const saveProgressMutation = useMutation({
    mutationFn: async () => {
      if (submission) {
        return await base44.entities.AssignmentSubmission.update(submission.id, {
          text_response: textResponse,
          file_links: fileLinks,
          status: "In Progress"
        });
      } else {
        return await base44.entities.AssignmentSubmission.create({
          assignment_id: assignmentId,
          assignment_title: assignment.title,
          student_id: studentProfile.id,
          student_name: studentProfile.full_name,
          text_response: textResponse,
          file_links: fileLinks,
          status: "In Progress",
          started_date: new Date().toISOString()
        });
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['submission'] });
    }
  });

  const submitMutation = useMutation({
    mutationFn: async () => {
      const isLate = new Date() > new Date(assignment.due_date);
      
      if (submission) {
        return await base44.entities.AssignmentSubmission.update(submission.id, {
          text_response: textResponse,
          file_links: fileLinks,
          status: "Submitted",
          submitted_date: new Date().toISOString(),
          late_submission: isLate
        });
      } else {
        return await base44.entities.AssignmentSubmission.create({
          assignment_id: assignmentId,
          assignment_title: assignment.title,
          student_id: studentProfile.id,
          student_name: studentProfile.full_name,
          text_response: textResponse,
          file_links: fileLinks,
          status: "Submitted",
          started_date: new Date().toISOString(),
          submitted_date: new Date().toISOString(),
          late_submission: isLate
        });
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['submission'] });
    }
  });

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    try {
      const result = await base44.integrations.Core.UploadFile({ file });
      setFileLinks([...fileLinks, result.file_url]);
    } catch (error) {
      console.error("File upload error:", error);
    }
  };

  if (isLoading || !assignment || !studentProfile) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-pink-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-purple-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <div className="text-gray-600">Loading assignment...</div>
        </div>
      </div>
    );
  }

  const isSubmitted = submission?.status === "Submitted" || submission?.status === "Graded";

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-pink-50 p-6">
      <div className="max-w-5xl mx-auto">
        <div className="mb-6">
          <Button variant="outline" onClick={() => window.history.back()}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Assignments
          </Button>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <Card className="shadow-2xl mb-6">
            <CardHeader className="border-b bg-gradient-to-r from-purple-50 to-blue-50">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <CardTitle className="text-2xl mb-2">{assignment.title}</CardTitle>
                  <p className="text-gray-600">{assignment.description}</p>
                  
                  <div className="flex flex-wrap gap-2 mt-4">
                    <Badge variant="outline">{assignment.assignment_type}</Badge>
                    <Badge variant="outline">{assignment.subject}</Badge>
                    {assignment.faith_character_tag && (
                      <Badge className="bg-blue-100 text-blue-800">
                        <Heart className="w-3 h-3 mr-1" />
                        {assignment.faith_character_tag}
                      </Badge>
                    )}
                  </div>
                </div>
                
                {submission?.status && (
                  <Badge className={
                    submission.status === "Graded" ? "bg-purple-600 text-white" :
                    submission.status === "Submitted" ? "bg-green-600 text-white" :
                    "bg-blue-600 text-white"
                  }>
                    {submission.status}
                  </Badge>
                )}
              </div>
            </CardHeader>
            
            <CardContent className="p-6">
              <div className="grid grid-cols-3 gap-4 mb-6">
                <div className="flex items-center gap-2 text-gray-700">
                  <Clock className="w-5 h-5" />
                  <div>
                    <div className="text-xs text-gray-600">Due Date</div>
                    <div className="font-semibold">{format(parseISO(assignment.due_date), 'MMM d, yyyy')}</div>
                  </div>
                </div>
                <div className="flex items-center gap-2 text-gray-700">
                  <Award className="w-5 h-5" />
                  <div>
                    <div className="text-xs text-gray-600">Points</div>
                    <div className="font-semibold">{assignment.points_possible}</div>
                  </div>
                </div>
                <div className="flex items-center gap-2 text-gray-700">
                  <Clock className="w-5 h-5" />
                  <div>
                    <div className="text-xs text-gray-600">Est. Time</div>
                    <div className="font-semibold">{assignment.estimated_time_minutes} min</div>
                  </div>
                </div>
              </div>

              <div className="prose max-w-none mb-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-3">Instructions</h3>
                <ReactMarkdown>{assignment.instructions || ""}</ReactMarkdown>
              </div>

              {assignment.show_rubric_to_students && assignment.rubric && assignment.rubric.length > 0 && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
                  <h3 className="font-semibold text-blue-900 mb-3 flex items-center gap-2">
                    <FileText className="w-5 h-5" />
                    Grading Rubric
                  </h3>
                  <div className="space-y-2">
                    {assignment.rubric.map((item, i) => (
                      <div key={i} className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="font-semibold text-blue-900">{item.criteria}</div>
                          <p className="text-sm text-blue-800">{item.description}</p>
                        </div>
                        <Badge className="bg-blue-200 text-blue-900">{item.points} pts</Badge>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {submission?.status === "Graded" && (
            <Card className="shadow-xl mb-6 border-2 border-purple-300">
              <CardHeader className="bg-gradient-to-r from-purple-100 to-blue-100 border-b">
                <CardTitle className="flex items-center justify-between">
                  <span>Your Grade</span>
                  <Badge className="bg-purple-600 text-white text-2xl px-6 py-2">
                    {submission.percentage}%
                  </Badge>
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <div className="mb-4">
                  <div className="text-sm text-gray-600 mb-1">Score</div>
                  <div className="text-2xl font-bold text-gray-900">
                    {submission.graded_score} / {assignment.points_possible}
                  </div>
                </div>
                
                {submission.teacher_feedback && (
                  <div className="mt-4">
                    <div className="text-sm font-semibold text-gray-900 mb-2">Teacher Feedback</div>
                    <div className="bg-gray-50 p-4 rounded-lg text-gray-800">
                      {submission.teacher_feedback}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          <Card className="shadow-xl">
            <CardHeader className="border-b">
              <CardTitle>
                {isSubmitted ? "Your Submission" : "Submit Your Work"}
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-2">
                  Written Response
                </label>
                <Textarea
                  value={textResponse}
                  onChange={(e) => setTextResponse(e.target.value)}
                  placeholder="Type your response here..."
                  rows={12}
                  disabled={isSubmitted}
                  className="resize-none"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-2">
                  File Attachments
                </label>
                {!isSubmitted && (
                  <div className="mb-3">
                    <input
                      type="file"
                      onChange={handleFileUpload}
                      className="hidden"
                      id="file-upload"
                    />
                    <label htmlFor="file-upload">
                      <Button type="button" variant="outline" className="cursor-pointer" asChild>
                        <span>
                          <Upload className="w-4 h-4 mr-2" />
                          Upload File
                        </span>
                      </Button>
                    </label>
                  </div>
                )}
                
                {fileLinks.length > 0 && (
                  <div className="space-y-2">
                    {fileLinks.map((link, i) => (
                      <div key={i} className="flex items-center gap-2 p-2 bg-gray-50 rounded">
                        <FileText className="w-4 h-4" />
                        <a href={link} target="_blank" rel="noopener noreferrer" className="text-sm text-blue-600 hover:underline flex-1">
                          Attachment {i + 1}
                        </a>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {!isSubmitted && (
                <div className="flex gap-3 pt-4">
                  <Button
                    variant="outline"
                    onClick={() => saveProgressMutation.mutate()}
                    disabled={saveProgressMutation.isLoading}
                  >
                    Save Progress
                  </Button>
                  <Button
                    onClick={() => submitMutation.mutate()}
                    disabled={submitMutation.isLoading || (!textResponse && fileLinks.length === 0)}
                    className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700"
                  >
                    <Send className="w-4 h-4 mr-2" />
                    Submit Assignment
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}