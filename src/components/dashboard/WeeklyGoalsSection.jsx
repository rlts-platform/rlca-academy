import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Target, Plus, CheckCircle, Sparkles, TrendingUp } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { base44 } from '@/api/base44Client';
import { useMutation, useQueryClient } from '@tanstack/react-query';

export default function WeeklyGoalsSection({ student, goals, grades, attendance }) {
  const [showForm, setShowForm] = useState(false);
  const [showAISuggestions, setShowAISuggestions] = useState(false);
  const [aiSuggestions, setAiSuggestions] = useState(null);
  const [loadingAI, setLoadingAI] = useState(false);
  const queryClient = useQueryClient();

  const [formData, setFormData] = useState({
    goal_title: '',
    goal_description: '',
    goal_type: 'Academic',
    target_value: 0
  });

  const createGoalMutation = useMutation({
    mutationFn: (goalData) => base44.entities.WeeklyGoal.create(goalData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['weekly-goals'] });
      setShowForm(false);
      setFormData({ goal_title: '', goal_description: '', goal_type: 'Academic', target_value: 0 });
    }
  });

  const updateGoalMutation = useMutation({
    mutationFn: ({ id, data }) => base44.entities.WeeklyGoal.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['weekly-goals'] });
    }
  });

  const getWeekStartDate = () => {
    const now = new Date();
    const day = now.getDay();
    const diff = now.getDate() - day + (day === 0 ? -6 : 1);
    const monday = new Date(now.setDate(diff));
    return monday.toISOString().split('T')[0];
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    createGoalMutation.mutate({
      ...formData,
      student_id: student.id,
      student_name: student.full_name,
      week_start_date: getWeekStartDate(),
      current_progress: 0,
      progress_percentage: 0,
      status: 'Active'
    });
  };

  const handleCompleteGoal = (goal) => {
    updateGoalMutation.mutate({
      id: goal.id,
      data: {
        status: 'Completed',
        progress_percentage: 100,
        current_progress: goal.target_value,
        completed_date: new Date().toISOString().split('T')[0]
      }
    });
  };

  const generateAISuggestions = async () => {
    setLoadingAI(true);
    setShowAISuggestions(true);

    const avgGrade = grades && grades.length > 0 
      ? Math.round(grades.reduce((sum, g) => sum + ((g.score / (g.max_score || 100)) * 100), 0) / grades.length)
      : 0;

    const attendanceRate = attendance && attendance.length > 0
      ? Math.round((attendance.filter(a => a.status === 'Present').length / attendance.length) * 100)
      : 0;

    const prompt = `You are an educational advisor for Royal Legends Children Academy.

STUDENT PROFILE:
- Name: ${student.full_name}
- Grade: ${student.grade_level}
- Age: ${student.age}
- Current Average Grade: ${avgGrade}%
- Attendance Rate: ${attendanceRate}%
- Recent Performance: ${grades && grades.length > 0 ? 'Has grades recorded' : 'Just started'}

TASK:
Suggest 3 achievable weekly goals for this student. Goals should be:
- Specific and measurable
- Encouraging and positive
- Age-appropriate
- Aligned with their current performance level

Include a mix of academic, character, and personal development goals.`;

    try {
      const response = await base44.integrations.Core.InvokeLLM({
        prompt,
        response_json_schema: {
          type: "object",
          properties: {
            goals: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  title: { type: "string" },
                  description: { type: "string" },
                  type: { type: "string" },
                  target: { type: "number" }
                }
              }
            }
          }
        }
      });
      setAiSuggestions(response.goals);
    } catch (error) {
      console.error('Error generating AI suggestions:', error);
    } finally {
      setLoadingAI(false);
    }
  };

  const handleAcceptSuggestion = (suggestion) => {
    createGoalMutation.mutate({
      goal_title: suggestion.title,
      goal_description: suggestion.description,
      goal_type: suggestion.type,
      target_value: suggestion.target,
      student_id: student.id,
      student_name: student.full_name,
      week_start_date: getWeekStartDate(),
      current_progress: 0,
      progress_percentage: 0,
      status: 'Active',
      ai_suggested: true
    });
  };

  const activeGoals = goals.filter(g => g.status === 'Active' || g.status === 'In Progress');
  const completedThisWeek = goals.filter(g => g.status === 'Completed');

  return (
    <Card className="shadow-lg">
      <CardHeader className="border-b bg-gradient-to-r from-green-50 to-emerald-50">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-green-900">
            <Target className="w-5 h-5" />
            Weekly Goals
          </CardTitle>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={generateAISuggestions}
              disabled={loadingAI}
              className="gap-1"
            >
              <Sparkles className="w-4 h-4" />
              AI Suggestions
            </Button>
            <Button
              size="sm"
              onClick={() => setShowForm(!showForm)}
              className="bg-green-600 hover:bg-green-700 gap-1"
            >
              <Plus className="w-4 h-4" />
              Add Goal
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-6">
        {/* Stats */}
        <div className="grid grid-cols-2 gap-3 mb-6">
          <div className="p-3 bg-blue-50 rounded-lg border border-blue-200 text-center">
            <div className="text-2xl font-bold text-blue-700">{activeGoals.length}</div>
            <div className="text-xs text-blue-600">Active Goals</div>
          </div>
          <div className="p-3 bg-green-50 rounded-lg border border-green-200 text-center">
            <div className="text-2xl font-bold text-green-700">{completedThisWeek.length}</div>
            <div className="text-xs text-green-600">Completed</div>
          </div>
        </div>

        {/* AI Suggestions */}
        <AnimatePresence>
          {showAISuggestions && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="mb-6"
            >
              <div className="p-4 bg-purple-50 rounded-lg border border-purple-200">
                <h4 className="font-semibold text-purple-900 mb-3 flex items-center gap-2">
                  <Sparkles className="w-4 h-4" />
                  AI-Suggested Goals
                </h4>
                {loadingAI ? (
                  <div className="text-center py-4">
                    <div className="w-8 h-8 border-4 border-purple-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
                  </div>
                ) : aiSuggestions ? (
                  <div className="space-y-2">
                    {aiSuggestions.map((suggestion, i) => (
                      <div key={i} className="p-3 bg-white rounded-lg flex items-start justify-between">
                        <div className="flex-1">
                          <div className="font-semibold text-sm">{suggestion.title}</div>
                          <div className="text-xs text-gray-600 mt-1">{suggestion.description}</div>
                        </div>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleAcceptSuggestion(suggestion)}
                          className="ml-2"
                        >
                          Add
                        </Button>
                      </div>
                    ))}
                  </div>
                ) : null}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Add Goal Form */}
        <AnimatePresence>
          {showForm && (
            <motion.form
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              onSubmit={handleSubmit}
              className="mb-6 p-4 bg-green-50 rounded-lg border border-green-200 space-y-3"
            >
              <div>
                <Label className="text-sm">Goal Title</Label>
                <Input
                  value={formData.goal_title}
                  onChange={(e) => setFormData({ ...formData, goal_title: e.target.value })}
                  placeholder="e.g., Complete all math homework"
                  required
                />
              </div>
              <div>
                <Label className="text-sm">Description</Label>
                <Input
                  value={formData.goal_description}
                  onChange={(e) => setFormData({ ...formData, goal_description: e.target.value })}
                  placeholder="Details about this goal"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label className="text-sm">Type</Label>
                  <Select value={formData.goal_type} onValueChange={(v) => setFormData({ ...formData, goal_type: v })}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Academic">Academic</SelectItem>
                      <SelectItem value="Personal">Personal</SelectItem>
                      <SelectItem value="Character">Character</SelectItem>
                      <SelectItem value="Extracurricular">Extracurricular</SelectItem>
                      <SelectItem value="Attendance">Attendance</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label className="text-sm">Target</Label>
                  <Input
                    type="number"
                    value={formData.target_value}
                    onChange={(e) => setFormData({ ...formData, target_value: parseFloat(e.target.value) })}
                    placeholder="Number"
                    required
                  />
                </div>
              </div>
              <div className="flex gap-2">
                <Button type="submit" size="sm" className="bg-green-600 hover:bg-green-700">Create Goal</Button>
                <Button type="button" size="sm" variant="outline" onClick={() => setShowForm(false)}>Cancel</Button>
              </div>
            </motion.form>
          )}
        </AnimatePresence>

        {/* Goals List */}
        <div className="space-y-3">
          {activeGoals.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <Target className="w-12 h-12 mx-auto mb-2 text-gray-300" />
              <p>No active goals for this week</p>
              <p className="text-sm mt-1">Click "Add Goal" or try "AI Suggestions"</p>
            </div>
          ) : (
            activeGoals.map((goal) => (
              <motion.div
                key={goal.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-4 bg-white rounded-lg border hover:border-green-300 transition-all"
              >
                <div className="flex items-start justify-between mb-2">
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <h4 className="font-semibold text-gray-900">{goal.goal_title}</h4>
                      {goal.ai_suggested && (
                        <Badge variant="outline" className="text-xs bg-purple-50 text-purple-700 border-purple-200">
                          <Sparkles className="w-3 h-3 mr-1" />
                          AI
                        </Badge>
                      )}
                    </div>
                    {goal.goal_description && (
                      <p className="text-sm text-gray-600 mt-1">{goal.goal_description}</p>
                    )}
                    <div className="flex items-center gap-2 mt-2">
                      <Badge variant="outline" className="text-xs">{goal.goal_type}</Badge>
                      <span className="text-xs text-gray-500">
                        Target: {goal.target_value}
                      </span>
                    </div>
                  </div>
                  <Button
                    size="sm"
                    onClick={() => handleCompleteGoal(goal)}
                    className="bg-green-600 hover:bg-green-700"
                  >
                    <CheckCircle className="w-4 h-4" />
                  </Button>
                </div>
                <div className="mt-3">
                  <Progress value={goal.progress_percentage || 0} className="h-2" />
                  <div className="text-xs text-gray-500 mt-1">
                    {goal.progress_percentage || 0}% complete
                  </div>
                </div>
              </motion.div>
            ))
          )}
        </div>

        {/* Completed Goals */}
        {completedThisWeek.length > 0 && (
          <div className="mt-6 pt-6 border-t">
            <h4 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-green-600" />
              Completed This Week ({completedThisWeek.length})
            </h4>
            <div className="space-y-2">
              {completedThisWeek.map((goal) => (
                <div key={goal.id} className="p-3 bg-green-50 rounded-lg border border-green-200">
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-600" />
                    <span className="text-sm font-semibold text-gray-900">{goal.goal_title}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}