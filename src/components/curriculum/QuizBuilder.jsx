import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Trash2, Sparkles } from "lucide-react";
import { Badge } from "@/components/ui/badge";

export default function QuizBuilder({ quiz, onChange, onAIGenerate }) {
  const [currentQuestion, setCurrentQuestion] = useState({
    question_type: "multiple_choice",
    question_text: "",
    points: 10,
    options: ["", "", "", ""],
    correct_answer: "",
    keywords: [],
    matching_pairs: {
      left_items: ["", ""],
      right_items: ["", ""],
      correct_matches: []
    },
    explanation: ""
  });

  const addQuestion = () => {
    const questions = [...(quiz.questions || []), currentQuestion];
    onChange({ ...quiz, questions });
    setCurrentQuestion({
      question_type: "multiple_choice",
      question_text: "",
      points: 10,
      options: ["", "", "", ""],
      correct_answer: "",
      keywords: [],
      matching_pairs: { left_items: ["", ""], right_items: ["", ""], correct_matches: [] },
      explanation: ""
    });
  };

  const removeQuestion = (index) => {
    const questions = quiz.questions.filter((_, i) => i !== index);
    onChange({ ...quiz, questions });
  };

  const renderQuestionTypeFields = () => {
    switch (currentQuestion.question_type) {
      case "multiple_choice":
      case "true_false":
        return (
          <div className="space-y-3">
            <Label>Options</Label>
            {currentQuestion.options.map((opt, i) => (
              <Input
                key={i}
                value={opt}
                onChange={(e) => {
                  const newOpts = [...currentQuestion.options];
                  newOpts[i] = e.target.value;
                  setCurrentQuestion({ ...currentQuestion, options: newOpts });
                }}
                placeholder={`Option ${i + 1}`}
              />
            ))}
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentQuestion({
                ...currentQuestion,
                options: [...currentQuestion.options, ""]
              })}
            >
              <Plus className="w-3 h-3 mr-1" /> Add Option
            </Button>
            <div>
              <Label>Correct Answer</Label>
              <Select
                value={currentQuestion.correct_answer}
                onValueChange={(value) => setCurrentQuestion({ ...currentQuestion, correct_answer: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select correct answer" />
                </SelectTrigger>
                <SelectContent>
                  {currentQuestion.options.filter(o => o).map((opt, i) => (
                    <SelectItem key={i} value={opt}>{opt}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        );

      case "short_answer":
        return (
          <div className="space-y-3">
            <div>
              <Label>Keywords for Auto-Grading (comma-separated)</Label>
              <Input
                value={currentQuestion.keywords?.join(", ") || ""}
                onChange={(e) => setCurrentQuestion({
                  ...currentQuestion,
                  keywords: e.target.value.split(",").map(k => k.trim()).filter(k => k)
                })}
                placeholder="e.g. photosynthesis, chlorophyll, sunlight"
              />
              <p className="text-xs text-gray-600 mt-1">Student answer must contain at least 50% of keywords to pass</p>
            </div>
            <div>
              <Label>Model Answer (optional)</Label>
              <Textarea
                value={currentQuestion.correct_answer}
                onChange={(e) => setCurrentQuestion({ ...currentQuestion, correct_answer: e.target.value })}
                placeholder="Example of a good answer..."
                rows={3}
              />
            </div>
          </div>
        );

      case "matching":
        return (
          <div className="space-y-4">
            <div>
              <Label>Left Column Items</Label>
              {currentQuestion.matching_pairs.left_items.map((item, i) => (
                <div key={i} className="flex gap-2 mb-2">
                  <Input
                    value={item}
                    onChange={(e) => {
                      const newLeft = [...currentQuestion.matching_pairs.left_items];
                      newLeft[i] = e.target.value;
                      setCurrentQuestion({
                        ...currentQuestion,
                        matching_pairs: { ...currentQuestion.matching_pairs, left_items: newLeft }
                      });
                    }}
                    placeholder={`Item ${i + 1}`}
                  />
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => {
                      const newLeft = currentQuestion.matching_pairs.left_items.filter((_, idx) => idx !== i);
                      setCurrentQuestion({
                        ...currentQuestion,
                        matching_pairs: { ...currentQuestion.matching_pairs, left_items: newLeft }
                      });
                    }}
                  >
                    <Trash2 className="w-4 h-4 text-red-600" />
                  </Button>
                </div>
              ))}
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentQuestion({
                  ...currentQuestion,
                  matching_pairs: {
                    ...currentQuestion.matching_pairs,
                    left_items: [...currentQuestion.matching_pairs.left_items, ""]
                  }
                })}
              >
                <Plus className="w-3 h-3 mr-1" /> Add Left Item
              </Button>
            </div>

            <div>
              <Label>Right Column Items</Label>
              {currentQuestion.matching_pairs.right_items.map((item, i) => (
                <div key={i} className="flex gap-2 mb-2">
                  <Input
                    value={item}
                    onChange={(e) => {
                      const newRight = [...currentQuestion.matching_pairs.right_items];
                      newRight[i] = e.target.value;
                      setCurrentQuestion({
                        ...currentQuestion,
                        matching_pairs: { ...currentQuestion.matching_pairs, right_items: newRight }
                      });
                    }}
                    placeholder={`Match ${i + 1}`}
                  />
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => {
                      const newRight = currentQuestion.matching_pairs.right_items.filter((_, idx) => idx !== i);
                      setCurrentQuestion({
                        ...currentQuestion,
                        matching_pairs: { ...currentQuestion.matching_pairs, right_items: newRight }
                      });
                    }}
                  >
                    <Trash2 className="w-4 h-4 text-red-600" />
                  </Button>
                </div>
              ))}
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentQuestion({
                  ...currentQuestion,
                  matching_pairs: {
                    ...currentQuestion.matching_pairs,
                    right_items: [...currentQuestion.matching_pairs.right_items, ""]
                  }
                })}
              >
                <Plus className="w-3 h-3 mr-1" /> Add Right Item
              </Button>
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
              <p className="text-sm text-blue-900 font-semibold mb-2">Define Correct Matches:</p>
              <p className="text-xs text-blue-800 mb-2">Set which left items match which right items</p>
              {currentQuestion.matching_pairs.left_items.filter(l => l).map((leftItem, i) => (
                <div key={i} className="flex items-center gap-2 mb-2">
                  <span className="text-sm flex-1">{leftItem}</span>
                  <span>→</span>
                  <Select
                    value={currentQuestion.matching_pairs.correct_matches?.find(m => m.left === leftItem)?.right || ""}
                    onValueChange={(value) => {
                      const newMatches = [...(currentQuestion.matching_pairs.correct_matches || [])].filter(m => m.left !== leftItem);
                      newMatches.push({ left: leftItem, right: value });
                      setCurrentQuestion({
                        ...currentQuestion,
                        matching_pairs: { ...currentQuestion.matching_pairs, correct_matches: newMatches }
                      });
                    }}
                  >
                    <SelectTrigger className="flex-1">
                      <SelectValue placeholder="Select match" />
                    </SelectTrigger>
                    <SelectContent>
                      {currentQuestion.matching_pairs.right_items.filter(r => r).map((rightItem, j) => (
                        <SelectItem key={j} value={rightItem}>{rightItem}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              ))}
            </div>
          </div>
        );

      case "essay":
        return (
          <div className="space-y-3">
            <div>
              <Label>Rubric / Grading Criteria</Label>
              <Textarea
                value={currentQuestion.explanation}
                onChange={(e) => setCurrentQuestion({ ...currentQuestion, explanation: e.target.value })}
                placeholder="What should be included in a good answer? Grading criteria..."
                rows={4}
              />
            </div>
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
              <p className="text-sm text-yellow-900">
                <strong>Note:</strong> Essay questions require manual grading by a teacher.
              </p>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="border-b">
          <div className="flex items-center justify-between">
            <CardTitle>Quiz Questions</CardTitle>
            <Button
              variant="outline"
              size="sm"
              onClick={onAIGenerate}
              className="gap-2"
            >
              <Sparkles className="w-4 h-4" />
              Generate with AI
            </Button>
          </div>
        </CardHeader>
        <CardContent className="p-6">
          {/* Existing Questions */}
          <div className="space-y-4 mb-6">
            {quiz.questions?.map((q, index) => (
              <Card key={index} className="border-2 border-gray-200">
                <CardContent className="p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <Badge variant="outline">Q{index + 1}</Badge>
                        <Badge className="bg-purple-100 text-purple-800">{q.question_type.replace("_", " ")}</Badge>
                        <Badge variant="outline">{q.points} pts</Badge>
                      </div>
                      <p className="font-semibold text-gray-900 mb-2">{q.question_text}</p>
                      {q.question_type === "multiple_choice" && (
                        <ul className="text-sm text-gray-600 list-disc list-inside">
                          {q.options?.map((opt, i) => (
                            <li key={i} className={opt === q.correct_answer ? 'text-green-600 font-semibold' : ''}>
                              {opt}
                            </li>
                          ))}
                        </ul>
                      )}
                      {q.question_type === "short_answer" && q.keywords && (
                        <p className="text-sm text-gray-600">Keywords: {q.keywords.join(", ")}</p>
                      )}
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => removeQuestion(index)}
                    >
                      <Trash2 className="w-4 h-4 text-red-600" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Add New Question */}
          <Card className="border-2 border-dashed border-purple-300 bg-purple-50">
            <CardContent className="p-6 space-y-4">
              <h3 className="font-semibold text-lg">Add New Question</h3>
              
              <div>
                <Label>Question Type</Label>
                <Select
                  value={currentQuestion.question_type}
                  onValueChange={(value) => setCurrentQuestion({ ...currentQuestion, question_type: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="multiple_choice">Multiple Choice</SelectItem>
                    <SelectItem value="true_false">True/False</SelectItem>
                    <SelectItem value="short_answer">Short Answer</SelectItem>
                    <SelectItem value="essay">Essay</SelectItem>
                    <SelectItem value="matching">Matching</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label>Question Text</Label>
                <Textarea
                  value={currentQuestion.question_text}
                  onChange={(e) => setCurrentQuestion({ ...currentQuestion, question_text: e.target.value })}
                  placeholder="Enter your question..."
                  rows={3}
                />
              </div>

              <div>
                <Label>Points</Label>
                <Input
                  type="number"
                  value={currentQuestion.points}
                  onChange={(e) => setCurrentQuestion({ ...currentQuestion, points: parseInt(e.target.value) })}
                  min="1"
                />
              </div>

              {renderQuestionTypeFields()}

              <Button
                onClick={addQuestion}
                disabled={!currentQuestion.question_text}
                className="w-full"
              >
                <Plus className="w-4 h-4 mr-2" />
                Add Question
              </Button>
            </CardContent>
          </Card>
        </CardContent>
      </Card>
    </div>
  );
}