import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { FileQuestion, ArrowLeft } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { motion } from 'framer-motion';
import QuizTaker from '../components/curriculum/QuizTaker';
import { gradeQuiz } from '../components/curriculum/QuizGrader';
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export default function QuizView() {
  const [studentProfile, setStudentProfile] = useState(null);
  const [quizId, setQuizId] = useState(null);
  const [timeRemaining, setTimeRemaining] = useState(null);
  const [submitted, setSubmitted] = useState(false);
  const queryClient = useQueryClient();

  useEffect(() => {
    loadUserProfile();
    const params = new URLSearchParams(window.location.search);
    setQuizId(params.get('id'));
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

  const { data: quiz, isLoading } = useQuery({
    queryKey: ['quiz', quizId],
    queryFn: async () => {
      const quizzes = await base44.entities.Quiz.filter({ id: quizId });
      return quizzes[0];
    },
    enabled: !!quizId
  });

  const { data: previousSubmissions = [] } = useQuery({
    queryKey: ['quiz-submissions', quizId, studentProfile?.id],
    queryFn: () => base44.entities.QuizSubmission.filter({ 
      quiz_id: quizId, 
      student_id: studentProfile.id 
    }),
    enabled: !!quizId && !!studentProfile
  });

  useEffect(() => {
    if (quiz?.time_limit_minutes && quiz.time_limit_minutes > 0 && !submitted) {
      setTimeRemaining(quiz.time_limit_minutes * 60);
      
      const timer = setInterval(() => {
        setTimeRemaining(prev => {
          if (prev <= 1) {
            clearInterval(timer);
            handleAutoSubmit();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);

      return () => clearInterval(timer);
    }
  }, [quiz, submitted]);

  const submitQuizMutation = useMutation({
    mutationFn: async (answers) => {
      const gradedResult = gradeQuiz(quiz, { answers });
      
      return await base44.entities.QuizSubmission.create({
        quiz_id: quizId,
        student_id: studentProfile.id,
        student_name: studentProfile.full_name,
        answers: gradedResult.answers,
        score: gradedResult.score,
        total_points: gradedResult.total_points,
        percentage: gradedResult.percentage,
        attempt_number: previousSubmissions.length + 1,
        submitted_date: new Date().toISOString(),
        graded: gradedResult.graded
      });
    },
    onSuccess: () => {
      setSubmitted(true);
      queryClient.invalidateQueries({ queryKey: ['quiz-submissions'] });
    }
  });

  const handleAutoSubmit = () => {
    if (!submitted) {
      submitQuizMutation.mutate([]);
    }
  };

  const handleSubmit = (answers) => {
    submitQuizMutation.mutate(answers);
  };

  if (isLoading || !quiz || !studentProfile) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-pink-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-purple-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <div className="text-gray-600">Loading quiz...</div>
        </div>
      </div>
    );
  }

  const attemptsUsed = previousSubmissions.length;
  const canTakeQuiz = quiz.attempts_allowed === 0 || attemptsUsed < quiz.attempts_allowed;

  if (!canTakeQuiz) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-pink-50 p-6 flex items-center justify-center">
        <Card className="max-w-md shadow-xl">
          <CardContent className="p-8 text-center">
            <FileQuestion className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-900 mb-2">No Attempts Remaining</h2>
            <p className="text-gray-600 mb-4">
              You've used all {quiz.attempts_allowed} attempts for this quiz.
            </p>
            <Button onClick={() => window.history.back()}>
              <ArrowLeft className="w-4 h-4 mr-2" />
              Go Back
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (submitted) {
    const lastSubmission = previousSubmissions[previousSubmissions.length - 1];
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-pink-50 p-6 flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="max-w-md w-full"
        >
          <Card className="shadow-2xl">
            <CardContent className="p-8 text-center">
              <div className="w-20 h-20 rounded-full bg-gradient-to-br from-green-400 to-emerald-600 flex items-center justify-center mx-auto mb-6 shadow-lg">
                <FileQuestion className="w-10 h-10 text-white" />
              </div>
              <h2 className="text-3xl font-bold text-gray-900 mb-4">Quiz Submitted!</h2>
              
              {lastSubmission?.graded ? (
                <>
                  <div className="text-6xl font-bold text-purple-600 mb-4">
                    {lastSubmission.percentage}%
                  </div>
                  <p className="text-gray-600 mb-2">
                    Score: {lastSubmission.score} / {lastSubmission.total_points} points
                  </p>
                  {lastSubmission.percentage >= quiz.passing_score && (
                    <Badge className="bg-green-100 text-green-800 border-green-300 mb-4">
                      Passed ✓
                    </Badge>
                  )}
                </>
              ) : (
                <div className="mb-4">
                  <Badge className="bg-yellow-100 text-yellow-800 border-yellow-300">
                    Pending Manual Grading
                  </Badge>
                  <p className="text-sm text-gray-600 mt-2">
                    Your teacher will review and grade your essay responses.
                  </p>
                </div>
              )}
              
              <Button onClick={() => window.history.back()} className="mt-4">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Lesson
              </Button>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-pink-50 p-6">
      <div className="mb-6">
        <Button variant="outline" onClick={() => window.history.back()}>
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back
        </Button>
      </div>
      
      <QuizTaker
        quiz={quiz}
        onSubmit={handleSubmit}
        timeRemaining={timeRemaining}
      />
    </div>
  );
}