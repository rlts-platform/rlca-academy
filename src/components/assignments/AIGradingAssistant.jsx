import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Sparkles, AlertTriangle, CheckCircle, Brain } from "lucide-react";
import { motion } from "framer-motion";
import { base44 } from '@/api/base44Client';

export default function AIGradingAssistant({ submission, assignment, onApplySuggestion }) {
  const [analyzing, setAnalyzing] = useState(false);
  const [aiSuggestion, setAiSuggestion] = useState(null);

  const analyzeSubmission = async () => {
    setAnalyzing(true);
    
    try {
      // Prepare the prompt for AI analysis
      const prompt = `You are an expert teacher at Royal Kids Academy, a Christian school focused on excellence, character development, critical thinking, creativity, and entrepreneurship.

ASSIGNMENT DETAILS:
Title: ${assignment.title}
Type: ${assignment.assignment_type}
Subject: ${assignment.subject}
Grade Level: ${assignment.grade_level}
Instructions: ${assignment.instructions}

${assignment.rubric && assignment.rubric.length > 0 ? `
GRADING RUBRIC:
${assignment.rubric.map(r => `- ${r.criteria} (${r.points} points): ${r.description}`).join('\n')}
` : ''}

STUDENT SUBMISSION:
${submission.text_response || '(No text response provided)'}

ROYAL KIDS ACADEMY VALUES TO ASSESS:
- Deep Understanding & Mastery (not just memorization)
- Critical Thinking & Problem-Solving
- Creativity & Original Thought
- Biblical/Ethical Reflection (where relevant)
- Real-World Application
- Entrepreneurial Mindset (where relevant)

YOUR TASK:
1. Analyze the student's submission against the rubric and instructions
2. Assess alignment with Royal Kids Academy values
3. Check for signs of potential plagiarism (generic responses, inconsistent writing style, too perfect)
4. Provide a suggested score and breakdown by rubric criteria
5. Write constructive, encouraging feedback that guides improvement
6. Highlight strengths and areas for growth

Respond with a structured analysis.`;

      const response = await base44.integrations.Core.InvokeLLM({
        prompt,
        response_json_schema: {
          type: "object",
          properties: {
            suggested_score: { type: "number", description: "Total points suggested" },
            percentage: { type: "number", description: "Percentage score" },
            rubric_breakdown: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  criteria: { type: "string" },
                  points_earned: { type: "number" },
                  points_possible: { type: "number" },
                  justification: { type: "string" }
                }
              }
            },
            strengths: {
              type: "array",
              items: { type: "string" },
              description: "Key strengths observed"
            },
            areas_for_improvement: {
              type: "array",
              items: { type: "string" },
              description: "Areas needing growth"
            },
            feedback: {
              type: "string",
              description: "Detailed constructive feedback"
            },
            values_assessment: {
              type: "object",
              properties: {
                critical_thinking: { type: "string", enum: ["Excellent", "Good", "Developing", "Needs Work"] },
                creativity: { type: "string", enum: ["Excellent", "Good", "Developing", "Needs Work"] },
                depth_of_understanding: { type: "string", enum: ["Excellent", "Good", "Developing", "Needs Work"] },
                biblical_reflection: { type: "string", enum: ["Excellent", "Good", "Developing", "Not Applicable"] }
              }
            },
            plagiarism_flags: {
              type: "array",
              items: { type: "string" },
              description: "Potential plagiarism concerns"
            },
            confidence_level: {
              type: "string",
              enum: ["High", "Medium", "Low"],
              description: "AI confidence in this assessment"
            }
          }
        }
      });

      setAiSuggestion(response);
    } catch (error) {
      console.error("AI analysis error:", error);
      alert("Failed to analyze submission. Please try again.");
    } finally {
      setAnalyzing(false);
    }
  };

  const getConfidenceColor = (level) => {
    switch (level) {
      case 'High': return 'bg-green-100 text-green-800 border-green-300';
      case 'Medium': return 'bg-yellow-100 text-yellow-800 border-yellow-300';
      case 'Low': return 'bg-orange-100 text-orange-800 border-orange-300';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getValueColor = (rating) => {
    switch (rating) {
      case 'Excellent': return 'text-green-600';
      case 'Good': return 'text-blue-600';
      case 'Developing': return 'text-yellow-600';
      case 'Needs Work': return 'text-orange-600';
      default: return 'text-gray-600';
    }
  };

  if (!aiSuggestion) {
    return (
      <Card className="shadow-lg border-2 border-purple-300">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-purple-600" />
            AI Grading Assistant
          </CardTitle>
        </CardHeader>
        <CardContent className="text-center py-8">
          <Brain className="w-16 h-16 text-purple-400 mx-auto mb-4" />
          <p className="text-gray-600 mb-4">
            Get AI-powered grading suggestions based on the assignment rubric and Royal Kids Academy values.
          </p>
          <Button
            onClick={analyzeSubmission}
            disabled={analyzing}
            className="bg-gradient-to-r from-purple-600 to-blue-600"
          >
            {analyzing ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                Analyzing Submission...
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4 mr-2" />
                Analyze with AI
              </>
            )}
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-4"
    >
      <Card className="shadow-lg border-2 border-purple-300">
        <CardHeader className="bg-gradient-to-r from-purple-50 to-blue-50">
          <CardTitle className="flex items-center justify-between">
            <span className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-purple-600" />
              AI Grading Suggestion
            </span>
            <Badge className={getConfidenceColor(aiSuggestion.confidence_level)}>
              {aiSuggestion.confidence_level} Confidence
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6 space-y-6">
          {/* Suggested Score */}
          <div className="text-center p-6 bg-gradient-to-br from-purple-100 to-blue-100 rounded-lg">
            <div className="text-5xl font-bold text-purple-900 mb-2">
              {aiSuggestion.suggested_score} / {assignment.points_possible}
            </div>
            <div className="text-2xl text-purple-700">
              {aiSuggestion.percentage}%
            </div>
          </div>

          {/* Plagiarism Flags */}
          {aiSuggestion.plagiarism_flags && aiSuggestion.plagiarism_flags.length > 0 && (
            <Card className="border-2 border-red-300 bg-red-50">
              <CardContent className="p-4">
                <div className="flex items-center gap-2 mb-3">
                  <AlertTriangle className="w-5 h-5 text-red-600" />
                  <h3 className="font-semibold text-red-900">Potential Issues Detected</h3>
                </div>
                <ul className="space-y-1 text-sm text-red-800">
                  {aiSuggestion.plagiarism_flags.map((flag, i) => (
                    <li key={i}>• {flag}</li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          )}

          {/* Rubric Breakdown */}
          {aiSuggestion.rubric_breakdown && (
            <div>
              <h3 className="font-semibold text-gray-900 mb-3">Rubric Breakdown</h3>
              <div className="space-y-3">
                {aiSuggestion.rubric_breakdown.map((item, i) => (
                  <Card key={i} className="bg-gray-50">
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-semibold text-gray-900">{item.criteria}</span>
                        <Badge variant="outline">
                          {item.points_earned} / {item.points_possible} pts
                        </Badge>
                      </div>
                      <p className="text-sm text-gray-700">{item.justification}</p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}

          {/* Royal Kids Values Assessment */}
          <div>
            <h3 className="font-semibold text-gray-900 mb-3">Royal Kids Academy Values</h3>
            <div className="grid grid-cols-2 gap-3">
              <div className="p-3 bg-white rounded-lg border">
                <div className="text-sm text-gray-600 mb-1">Critical Thinking</div>
                <div className={`font-semibold ${getValueColor(aiSuggestion.values_assessment.critical_thinking)}`}>
                  {aiSuggestion.values_assessment.critical_thinking}
                </div>
              </div>
              <div className="p-3 bg-white rounded-lg border">
                <div className="text-sm text-gray-600 mb-1">Creativity</div>
                <div className={`font-semibold ${getValueColor(aiSuggestion.values_assessment.creativity)}`}>
                  {aiSuggestion.values_assessment.creativity}
                </div>
              </div>
              <div className="p-3 bg-white rounded-lg border">
                <div className="text-sm text-gray-600 mb-1">Depth of Understanding</div>
                <div className={`font-semibold ${getValueColor(aiSuggestion.values_assessment.depth_of_understanding)}`}>
                  {aiSuggestion.values_assessment.depth_of_understanding}
                </div>
              </div>
              <div className="p-3 bg-white rounded-lg border">
                <div className="text-sm text-gray-600 mb-1">Biblical Reflection</div>
                <div className={`font-semibold ${getValueColor(aiSuggestion.values_assessment.biblical_reflection)}`}>
                  {aiSuggestion.values_assessment.biblical_reflection}
                </div>
              </div>
            </div>
          </div>

          {/* Strengths */}
          <div>
            <h3 className="font-semibold text-gray-900 mb-2 flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-green-600" />
              Strengths
            </h3>
            <ul className="space-y-1 text-sm text-gray-700">
              {aiSuggestion.strengths.map((strength, i) => (
                <li key={i} className="flex items-start gap-2">
                  <span className="text-green-600 mt-1">✓</span>
                  <span>{strength}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Areas for Improvement */}
          <div>
            <h3 className="font-semibold text-gray-900 mb-2">Areas for Growth</h3>
            <ul className="space-y-1 text-sm text-gray-700">
              {aiSuggestion.areas_for_improvement.map((area, i) => (
                <li key={i} className="flex items-start gap-2">
                  <span className="text-blue-600 mt-1">→</span>
                  <span>{area}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Feedback */}
          <div>
            <h3 className="font-semibold text-gray-900 mb-2">Suggested Feedback</h3>
            <Card className="bg-blue-50 border-blue-200">
              <CardContent className="p-4">
                <p className="text-sm text-gray-800 whitespace-pre-wrap">{aiSuggestion.feedback}</p>
              </CardContent>
            </Card>
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-4 border-t">
            <Button
              onClick={() => onApplySuggestion(aiSuggestion)}
              className="flex-1 bg-gradient-to-r from-green-600 to-emerald-600"
            >
              <CheckCircle className="w-4 h-4 mr-2" />
              Apply AI Suggestion
            </Button>
            <Button
              onClick={() => setAiSuggestion(null)}
              variant="outline"
            >
              Dismiss
            </Button>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}