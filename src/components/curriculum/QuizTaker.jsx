import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Clock, CheckCircle, AlertCircle } from "lucide-react";
import { motion } from "framer-motion";

export default function QuizTaker({ quiz, onSubmit, timeRemaining }) {
  const [answers, setAnswers] = useState({});
  const [currentQuestion, setCurrentQuestion] = useState(0);

  const handleAnswer = (questionIndex, answer) => {
    setAnswers({ ...answers, [questionIndex]: answer });
  };

  const handleMatchingPair = (questionIndex, leftItem, rightItem) => {
    const currentMatches = answers[questionIndex] || [];
    const existingIndex = currentMatches.findIndex(m => m.left === leftItem);
    
    let newMatches;
    if (existingIndex >= 0) {
      newMatches = [...currentMatches];
      newMatches[existingIndex] = { left: leftItem, right: rightItem };
    } else {
      newMatches = [...currentMatches, { left: leftItem, right: rightItem }];
    }
    
    handleAnswer(questionIndex, newMatches);
  };

  const handleSubmit = () => {
    const formattedAnswers = quiz.questions.map((q, index) => {
      const answer = answers[index];
      return {
        question_index: index,
        answer: typeof answer === 'string' ? answer : undefined,
        matched_pairs: Array.isArray(answer) ? answer : undefined
      };
    });
    
    onSubmit(formattedAnswers);
  };

  const question = quiz.questions[currentQuestion];
  const progress = ((currentQuestion + 1) / quiz.questions.length) * 100;

  const renderQuestion = () => {
    const answer = answers[currentQuestion];

    switch (question.question_type) {
      case "multiple_choice":
      case "true_false":
        return (
          <RadioGroup value={answer} onValueChange={(value) => handleAnswer(currentQuestion, value)}>
            {question.options?.map((option, i) => (
              <div key={i} className="flex items-center space-x-3 p-3 rounded-lg border hover:bg-gray-50 transition-colors">
                <RadioGroupItem value={option} id={`option-${i}`} />
                <Label htmlFor={`option-${i}`} className="flex-1 cursor-pointer">
                  {option}
                </Label>
              </div>
            ))}
          </RadioGroup>
        );

      case "short_answer":
        return (
          <div>
            <Textarea
              value={answer || ""}
              onChange={(e) => handleAnswer(currentQuestion, e.target.value)}
              placeholder="Type your answer here..."
              rows={5}
              className="resize-none"
            />
            <p className="text-sm text-gray-600 mt-2">
              Write a clear and complete answer.
            </p>
          </div>
        );

      case "essay":
        return (
          <div>
            <Textarea
              value={answer || ""}
              onChange={(e) => handleAnswer(currentQuestion, e.target.value)}
              placeholder="Write your essay here..."
              rows={12}
              className="resize-none"
            />
            {question.explanation && (
              <div className="mt-3 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                <p className="text-sm font-semibold text-blue-900 mb-1">Grading Criteria:</p>
                <p className="text-sm text-blue-800">{question.explanation}</p>
              </div>
            )}
          </div>
        );

      case "matching":
        const currentMatches = answer || [];
        return (
          <div className="space-y-4">
            <p className="text-sm text-gray-600 mb-4">
              Match each item on the left with the correct item on the right.
            </p>
            
            {question.matching_pairs?.left_items?.map((leftItem, i) => (
              <Card key={i} className="p-4 border-2 border-gray-200">
                <div className="flex flex-col md:flex-row items-start md:items-center gap-4">
                  <div className="flex-1">
                    <div className="font-semibold text-gray-900">{leftItem}</div>
                  </div>
                  <div className="text-gray-400">→</div>
                  <div className="flex-1">
                    <RadioGroup
                      value={currentMatches.find(m => m.left === leftItem)?.right || ""}
                      onValueChange={(value) => handleMatchingPair(currentQuestion, leftItem, value)}
                    >
                      {question.matching_pairs.right_items?.map((rightItem, j) => (
                        <div key={j} className="flex items-center space-x-2 mb-2">
                          <RadioGroupItem value={rightItem} id={`match-${i}-${j}`} />
                          <Label htmlFor={`match-${i}-${j}`} className="cursor-pointer">
                            {rightItem}
                          </Label>
                        </div>
                      ))}
                    </RadioGroup>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        );

      default:
        return <p>Unsupported question type</p>;
    }
  };

  const isAnswered = (index) => {
    const answer = answers[index];
    if (!answer) return false;
    if (Array.isArray(answer)) return answer.length > 0;
    return answer.toString().trim().length > 0;
  };

  const answeredCount = quiz.questions.filter((_, i) => isAnswered(i)).length;

  return (
    <div className="max-w-4xl mx-auto">
      {/* Header */}
      <Card className="mb-6 shadow-lg">
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">{quiz.title}</h2>
              <p className="text-gray-600">{quiz.description}</p>
            </div>
            {timeRemaining !== undefined && timeRemaining > 0 && (
              <Badge className="bg-orange-100 text-orange-800 border-orange-200 flex items-center gap-2 px-4 py-2">
                <Clock className="w-4 h-4" />
                {Math.floor(timeRemaining / 60)}:{(timeRemaining % 60).toString().padStart(2, '0')}
              </Badge>
            )}
          </div>
          
          {/* Progress Bar */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-600">Progress</span>
              <span className="font-semibold">{answeredCount} / {quiz.questions.length} answered</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${progress}%` }}
                className="h-full bg-gradient-to-r from-purple-500 to-blue-600 rounded-full"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Question Card */}
      <motion.div
        key={currentQuestion}
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: -20 }}
      >
        <Card className="shadow-lg">
          <CardHeader className="border-b bg-gradient-to-r from-purple-50 to-blue-50">
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-3">
                <Badge variant="outline">Question {currentQuestion + 1} of {quiz.questions.length}</Badge>
                <Badge className="bg-purple-100 text-purple-800">
                  {question.question_type.replace("_", " ")}
                </Badge>
                <Badge variant="outline">{question.points} points</Badge>
              </CardTitle>
              {isAnswered(currentQuestion) && (
                <CheckCircle className="w-5 h-5 text-green-600" />
              )}
            </div>
          </CardHeader>
          <CardContent className="p-6">
            <div className="mb-6">
              <h3 className="text-xl font-semibold text-gray-900 mb-4">
                {question.question_text}
              </h3>
            </div>

            {renderQuestion()}
          </CardContent>
        </Card>
      </motion.div>

      {/* Navigation */}
      <div className="flex items-center justify-between mt-6">
        <Button
          variant="outline"
          onClick={() => setCurrentQuestion(Math.max(0, currentQuestion - 1))}
          disabled={currentQuestion === 0}
        >
          Previous
        </Button>

        <div className="flex gap-2">
          {quiz.questions.map((_, i) => (
            <button
              key={i}
              onClick={() => setCurrentQuestion(i)}
              className={`w-10 h-10 rounded-lg font-semibold transition-all ${
                i === currentQuestion
                  ? 'bg-purple-600 text-white'
                  : isAnswered(i)
                  ? 'bg-green-100 text-green-800 border border-green-300'
                  : 'bg-gray-200 text-gray-600 hover:bg-gray-300'
              }`}
            >
              {i + 1}
            </button>
          ))}
        </div>

        {currentQuestion < quiz.questions.length - 1 ? (
          <Button
            onClick={() => setCurrentQuestion(currentQuestion + 1)}
          >
            Next
          </Button>
        ) : (
          <Button
            onClick={handleSubmit}
            className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700"
            disabled={answeredCount < quiz.questions.length}
          >
            {answeredCount < quiz.questions.length ? (
              <>
                <AlertCircle className="w-4 h-4 mr-2" />
                Answer All Questions
              </>
            ) : (
              <>
                <CheckCircle className="w-4 h-4 mr-2" />
                Submit Quiz
              </>
            )}
          </Button>
        )}
      </div>
    </div>
  );
}