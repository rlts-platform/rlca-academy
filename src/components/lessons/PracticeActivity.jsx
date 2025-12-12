import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, XCircle, Target, RefreshCw } from "lucide-react";
import { motion } from "framer-motion";

export default function PracticeActivity({ activity, onComplete, completionData }) {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState({});
  const [showResults, setShowResults] = useState(false);
  const [score, setScore] = useState(0);

  const question = activity.questions[currentQuestion];

  const handleSubmit = () => {
    let correct = 0;
    activity.questions.forEach((q, i) => {
      if (q.correct_answer === answers[i]) {
        correct++;
      }
    });
    
    const finalScore = Math.round((correct / activity.questions.length) * 100);
    setScore(finalScore);
    setShowResults(true);
    
    onComplete && onComplete({
      activity_id: activity.id,
      completed: true,
      score: finalScore,
      attempts: (completionData?.attempts || 0) + 1
    });
  };

  const handleRetry = () => {
    setAnswers({});
    setCurrentQuestion(0);
    setShowResults(false);
    setScore(0);
  };

  if (showResults) {
    return (
      <Card className="shadow-lg border-2 border-purple-300">
        <CardContent className="p-8 text-center">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className={`w-24 h-24 rounded-full mx-auto mb-4 flex items-center justify-center ${
              score >= 70 ? 'bg-green-100' : 'bg-orange-100'
            }`}
          >
            {score >= 70 ? (
              <CheckCircle className="w-12 h-12 text-green-600" />
            ) : (
              <Target className="w-12 h-12 text-orange-600" />
            )}
          </motion.div>
          
          <h3 className="text-3xl font-bold text-gray-900 mb-2">{score}%</h3>
          <p className="text-gray-600 mb-4">
            You got {Math.round((score / 100) * activity.questions.length)} out of {activity.questions.length} correct
          </p>
          
          {score >= 70 ? (
            <Badge className="bg-green-100 text-green-800 border-green-300 mb-4">
              Great Job! ✓
            </Badge>
          ) : (
            <Badge className="bg-orange-100 text-orange-800 border-orange-300 mb-4">
              Keep Practicing
            </Badge>
          )}
          
          <Button onClick={handleRetry} variant="outline" className="mt-4">
            <RefreshCw className="w-4 h-4 mr-2" />
            Try Again
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="shadow-lg">
      <CardHeader className="border-b bg-gradient-to-r from-purple-50 to-blue-50">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Target className="w-5 h-5 text-purple-600" />
            {activity.title}
          </CardTitle>
          <Badge variant="outline">
            Question {currentQuestion + 1} / {activity.questions.length}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="p-6">
        <div className="mb-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            {question.question}
          </h3>
          
          {question.type === 'multiple_choice' && (
            <RadioGroup
              value={answers[currentQuestion]}
              onValueChange={(value) => setAnswers({ ...answers, [currentQuestion]: value })}
            >
              {question.options?.map((option, i) => (
                <div key={i} className="flex items-center space-x-3 p-3 rounded-lg border hover:bg-gray-50 transition-colors mb-2">
                  <RadioGroupItem value={option} id={`q${currentQuestion}-opt${i}`} />
                  <Label htmlFor={`q${currentQuestion}-opt${i}`} className="flex-1 cursor-pointer">
                    {option}
                  </Label>
                </div>
              ))}
            </RadioGroup>
          )}
          
          {question.type === 'short_answer' && (
            <Textarea
              value={answers[currentQuestion] || ""}
              onChange={(e) => setAnswers({ ...answers, [currentQuestion]: e.target.value })}
              placeholder="Type your answer..."
              rows={4}
            />
          )}
        </div>

        <div className="flex items-center justify-between">
          <Button
            variant="outline"
            onClick={() => setCurrentQuestion(Math.max(0, currentQuestion - 1))}
            disabled={currentQuestion === 0}
          >
            Previous
          </Button>
          
          {currentQuestion < activity.questions.length - 1 ? (
            <Button
              onClick={() => setCurrentQuestion(currentQuestion + 1)}
              disabled={!answers[currentQuestion]}
            >
              Next
            </Button>
          ) : (
            <Button
              onClick={handleSubmit}
              disabled={Object.keys(answers).length < activity.questions.length}
              className="bg-gradient-to-r from-green-600 to-emerald-600"
            >
              Submit
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}