import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Brain, Sparkles, Loader2, CheckCircle } from "lucide-react";
import { motion } from "framer-motion";
import { useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/utils';

export default function GenerateLearningPlan() {
  const [studentProfile, setStudentProfile] = useState(null);
  const [parentGoals, setParentGoals] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [currentStep, setCurrentStep] = useState("");
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  useEffect(() => {
    loadUserProfile();
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

  const { data: grades = [] } = useQuery({
    queryKey: ['student-grades-all', studentProfile?.id],
    queryFn: () => studentProfile ? base44.entities.Grade.filter({ student_id: studentProfile.id }) : [],
    enabled: !!studentProfile
  });

  const { data: attendance = [] } = useQuery({
    queryKey: ['student-attendance-all', studentProfile?.id],
    queryFn: () => studentProfile ? base44.entities.Attendance.filter({ student_id: studentProfile.id }) : [],
    enabled: !!studentProfile
  });

  const generatePlanMutation = useMutation({
    mutationFn: async ({ studentData, goalsInput }) => {
      setCurrentStep("Analyzing student performance data...");
      
      // Prepare comprehensive data for AI analysis
      const performanceData = {
        student: {
          name: studentData.full_name,
          age: studentData.age,
          grade_level: studentData.grade_level
        },
        grades: grades.map(g => ({
          subject: g.subject,
          assignment: g.assignment_name,
          score: g.score,
          max_score: g.max_score || 100,
          percentage: Math.round((g.score / (g.max_score || 100)) * 100),
          feedback: g.feedback
        })),
        attendance: {
          total_days: attendance.length,
          present: attendance.filter(a => a.status === "Present").length,
          absent: attendance.filter(a => a.status === "Absent").length,
          rate: attendance.length > 0 ? Math.round((attendance.filter(a => a.status === "Present").length / attendance.length) * 100) : 0
        },
        parent_goals: goalsInput
      };

      // Calculate subject averages
      const subjectAverages = {};
      grades.forEach(g => {
        if (!subjectAverages[g.subject]) {
          subjectAverages[g.subject] = [];
        }
        subjectAverages[g.subject].push((g.score / (g.max_score || 100)) * 100);
      });

      const subjectPerformance = Object.entries(subjectAverages).map(([subject, scores]) => ({
        subject,
        average: Math.round(scores.reduce((a, b) => a + b, 0) / scores.length),
        count: scores.length
      }));

      setCurrentStep("Generating personalized learning analysis...");

      // AI Analysis
      const analysisPrompt = `You are an expert educational consultant. Analyze this student's academic performance and generate a comprehensive assessment.

Student Information:
- Name: ${performanceData.student.name}
- Age: ${performanceData.student.age}
- Grade Level: ${performanceData.student.grade_level}

Academic Performance:
${subjectPerformance.map(sp => `- ${sp.subject}: ${sp.average}% average (${sp.count} grades)`).join('\n')}

Attendance:
- Attendance Rate: ${performanceData.attendance.rate}%
- Present: ${performanceData.attendance.present} days
- Absent: ${performanceData.attendance.absent} days

Parent Goals and Priorities:
${goalsInput || "No specific goals provided"}

Please provide a detailed analysis with:
1. Overall academic summary
2. 3-5 key strengths
3. 3-5 areas needing improvement or focus
4. Identified learning style based on performance patterns
`;

      const analysisResult = await base44.integrations.Core.InvokeLLM({
        prompt: analysisPrompt,
        response_json_schema: {
          type: "object",
          properties: {
            overall_summary: { type: "string" },
            strengths: { type: "array", items: { type: "string" } },
            areas_for_improvement: { type: "array", items: { type: "string" } },
            learning_style: { type: "string" }
          }
        }
      });

      setCurrentStep("Creating personalized curriculum path...");

      // Generate Focus Areas and Lesson Path
      const curriculumPrompt = `As an expert curriculum designer, create a personalized 12-week learning plan for this ${performanceData.student.grade_level} student.

Student Profile:
- Grade: ${performanceData.student.grade_level}
- Strengths: ${analysisResult.strengths.join(', ')}
- Areas to Improve: ${analysisResult.areas_for_improvement.join(', ')}
- Learning Style: ${analysisResult.learning_style}
- Parent Goals: ${goalsInput || "General academic improvement"}

Subject Performance:
${subjectPerformance.map(sp => `- ${sp.subject}: ${sp.average}%`).join('\n')}

Generate:
1. Top 5 focus areas (with priority High/Medium/Low, estimated weeks)
2. A detailed 12-week lesson plan covering all core subjects appropriate for ${performanceData.student.grade_level}
3. Each week should include: subject, specific topics, learning objectives (3-5), activities (3-5), and resources (3-5)

Make it age-appropriate, engaging, and aligned with ${performanceData.student.grade_level} standards.
`;

      const curriculumResult = await base44.integrations.Core.InvokeLLM({
        prompt: curriculumPrompt,
        response_json_schema: {
          type: "object",
          properties: {
            focus_areas: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  subject: { type: "string" },
                  topic: { type: "string" },
                  priority: { type: "string" },
                  reason: { type: "string" },
                  estimated_weeks: { type: "number" }
                }
              }
            },
            lesson_path: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  week: { type: "number" },
                  subject: { type: "string" },
                  topics: { type: "array", items: { type: "string" } },
                  learning_objectives: { type: "array", items: { type: "string" } },
                  activities: { type: "array", items: { type: "string" } },
                  resources: { type: "array", items: { type: "string" } }
                }
              }
            }
          }
        }
      });

      setCurrentStep("Compiling recommended resources...");

      // Generate Resources
      const resourcesPrompt = `Create a curated list of 15-20 learning resources for a ${performanceData.student.grade_level} student focusing on: ${curriculumResult.focus_areas.map(fa => fa.topic).join(', ')}.

Include a mix of:
- Educational videos
- Interactive learning games
- Worksheets and printables
- Books and reading materials
- Online tools and platforms

For each resource provide: title, type (Video/Article/Interactive/Book/Worksheet/Game), subject, description, and a realistic URL or platform name.`;

      const resourcesResult = await base44.integrations.Core.InvokeLLM({
        prompt: resourcesPrompt,
        response_json_schema: {
          type: "object",
          properties: {
            resources: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  title: { type: "string" },
                  type: { type: "string" },
                  subject: { type: "string" },
                  description: { type: "string" },
                  url: { type: "string" }
                }
              }
            }
          }
        }
      });

      setCurrentStep("Setting learning milestones...");

      // Generate Milestones
      const milestonesPrompt = `Create 8-10 achievable learning milestones for a ${performanceData.student.grade_level} student over the next 12 weeks, based on these focus areas: ${curriculumResult.focus_areas.map(fa => fa.topic).join(', ')}.

Each milestone should be specific, measurable, and have a target date spread across the 12 weeks.`;

      const milestonesResult = await base44.integrations.Core.InvokeLLM({
        prompt: milestonesPrompt,
        response_json_schema: {
          type: "object",
          properties: {
            milestones: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  title: { type: "string" },
                  description: { type: "string" },
                  target_date: { type: "string" },
                  completed: { type: "boolean" }
                }
              }
            }
          }
        }
      });

      setCurrentStep("Finalizing your personalized learning plan...");

      // Create Learning Plan
      const learningPlan = {
        student_id: studentData.id,
        student_name: studentData.full_name,
        grade_level: studentData.grade_level,
        status: "Active",
        generated_date: new Date().toISOString().split('T')[0],
        parent_goals: goalsInput,
        ai_analysis: analysisResult,
        recommended_focus_areas: curriculumResult.focus_areas,
        lesson_path: curriculumResult.lesson_path,
        resources: resourcesResult.resources,
        milestones: milestonesResult.milestones,
        next_review_date: new Date(Date.now() + 84 * 24 * 60 * 60 * 1000).toISOString().split('T')[0] // 12 weeks from now
      };

      return base44.entities.LearningPlan.create(learningPlan);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['learning-plans'] });
      setTimeout(() => {
        navigate(createPageUrl('LearningPlanView'));
      }, 1500);
    },
    onError: (error) => {
      console.error("Error generating plan:", error);
      setIsGenerating(false);
      setCurrentStep("");
    }
  });

  const handleGenerate = () => {
    if (!studentProfile) return;
    setIsGenerating(true);
    generatePlanMutation.mutate({
      studentData: studentProfile,
      goalsInput: parentGoals
    });
  };

  if (!studentProfile) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-pink-50 flex items-center justify-center p-6">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-purple-600 animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Loading your profile...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-pink-50 p-6">
      <div className="max-w-4xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex items-center gap-4 mb-4">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-purple-500 to-blue-600 flex items-center justify-center shadow-xl">
              <Brain className="w-9 h-9 text-white" />
            </div>
            <div>
              <h1 className="text-4xl font-bold text-gray-900">AI Learning Plan Generator</h1>
              <p className="text-gray-600 mt-1">Personalized curriculum powered by artificial intelligence</p>
            </div>
          </div>
        </motion.div>

        {isGenerating ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
          >
            <Card className="shadow-2xl border-2 border-purple-200">
              <CardContent className="p-12">
                <div className="text-center">
                  <div className="relative w-24 h-24 mx-auto mb-6">
                    <div className="absolute inset-0 bg-gradient-to-r from-purple-500 to-blue-600 rounded-full animate-pulse"></div>
                    <div className="absolute inset-2 bg-white rounded-full flex items-center justify-center">
                      <Sparkles className="w-12 h-12 text-purple-600 animate-bounce" />
                    </div>
                  </div>
                  <h2 className="text-2xl font-bold text-gray-900 mb-3">
                    Generating Your Personalized Learning Plan
                  </h2>
                  <p className="text-lg text-purple-600 font-medium mb-8">
                    {currentStep || "Processing..."}
                  </p>
                  <div className="w-full bg-gray-200 rounded-full h-3">
                    <div className="h-full bg-gradient-to-r from-purple-500 to-blue-600 rounded-full animate-pulse" style={{ width: '100%' }}></div>
                  </div>
                  <p className="text-sm text-gray-500 mt-4">This may take 20-30 seconds...</p>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ) : generatePlanMutation.isSuccess ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
          >
            <Card className="shadow-2xl border-2 border-green-200 bg-gradient-to-br from-green-50 to-emerald-50">
              <CardContent className="p-12 text-center">
                <CheckCircle className="w-24 h-24 text-green-600 mx-auto mb-6" />
                <h2 className="text-3xl font-bold text-gray-900 mb-3">
                  Learning Plan Created Successfully! 🎉
                </h2>
                <p className="text-gray-600 mb-6">
                  Redirecting you to your personalized learning plan...
                </p>
              </CardContent>
            </Card>
          </motion.div>
        ) : (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <Card className="shadow-xl">
              <CardHeader className="border-b bg-gradient-to-r from-purple-50 to-blue-50">
                <CardTitle>Student Information</CardTitle>
              </CardHeader>
              <CardContent className="p-6 space-y-6">
                <div className="grid grid-cols-2 gap-6 p-6 bg-gray-50 rounded-lg">
                  <div>
                    <div className="text-sm text-gray-600">Student Name</div>
                    <div className="font-semibold text-gray-900">{studentProfile.full_name}</div>
                  </div>
                  <div>
                    <div className="text-sm text-gray-600">Grade Level</div>
                    <div className="font-semibold text-gray-900">{studentProfile.grade_level}</div>
                  </div>
                  <div>
                    <div className="text-sm text-gray-600">Age</div>
                    <div className="font-semibold text-gray-900">{studentProfile.age} years old</div>
                  </div>
                  <div>
                    <div className="text-sm text-gray-600">Total Grades</div>
                    <div className="font-semibold text-gray-900">{grades.length} recorded</div>
                  </div>
                </div>

                <div>
                  <Label htmlFor="goals" className="text-base font-semibold mb-2 block">
                    Learning Goals & Priorities (Optional)
                  </Label>
                  <Textarea
                    id="goals"
                    placeholder="Share your goals for this student... Examples:&#10;• Focus on improving math skills&#10;• Develop better reading comprehension&#10;• Prepare for standardized tests&#10;• Build confidence in science&#10;• Strengthen writing abilities"
                    value={parentGoals}
                    onChange={(e) => setParentGoals(e.target.value)}
                    rows={6}
                    className="resize-none"
                  />
                  <p className="text-sm text-gray-500 mt-2">
                    The AI will use this information along with grades and attendance to create a tailored learning plan.
                  </p>
                </div>

                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <h3 className="font-semibold text-blue-900 mb-2">What You'll Get:</h3>
                  <ul className="space-y-1 text-sm text-blue-800">
                    <li>✨ AI-powered analysis of strengths and areas for improvement</li>
                    <li>📚 12-week personalized lesson path with weekly topics and activities</li>
                    <li>🎯 Prioritized focus areas with recommended study duration</li>
                    <li>📖 Curated learning resources (videos, games, books, worksheets)</li>
                    <li>🏆 Achievement milestones to track progress</li>
                  </ul>
                </div>

                <Button
                  onClick={handleGenerate}
                  disabled={isGenerating}
                  className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white py-6 text-lg font-semibold shadow-lg"
                >
                  <Brain className="w-6 h-6 mr-3" />
                  Generate AI Learning Plan
                </Button>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </div>
    </div>
  );
}