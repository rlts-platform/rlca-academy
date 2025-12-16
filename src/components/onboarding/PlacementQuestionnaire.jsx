import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";

export default function PlacementQuestionnaire({ age, data, onComplete, onBack }) {
  const [responses, setResponses] = useState(data.questionnaire_responses || {});

  const studentAge = age || data.age || 8;

  const getQuestions = () => {
    if (studentAge <= 7) {
      return [
        { id: 'letters', question: 'Can your child recognize most letters?', options: ['Yes', 'Some', 'No'] },
        { id: 'counting', question: 'Can your child count to 20?', options: ['Yes, and beyond', 'Yes', 'Not yet'] },
        { id: 'listening', question: 'Can your child sit and listen to a short story?', options: ['Yes, easily', 'Sometimes', 'Rarely'] },
        { id: 'writing', question: 'Can your child write their name?', options: ['Yes', 'With help', 'No'] }
      ];
    } else if (studentAge <= 11) {
      return [
        { id: 'reading', question: 'Can your child read a paragraph and explain it?', options: ['Yes, confidently', 'Yes, with some help', 'Still learning'] },
        { id: 'math', question: 'Can your child add and subtract comfortably?', options: ['Yes, easily', 'Yes, but needs practice', 'Not yet'] },
        { id: 'writing', question: 'Can your child write a few sentences independently?', options: ['Yes, well-structured', 'Yes, basic sentences', 'Needs help'] },
        { id: 'focus', question: 'How long can your child focus on schoolwork?', options: ['30+ minutes', '15-30 minutes', 'Less than 15 minutes'] }
      ];
    } else if (studentAge <= 14) {
      return [
        { id: 'paragraph', question: 'Can your child write a full paragraph with a main idea?', options: ['Yes, confidently', 'Yes, with guidance', 'Still developing'] },
        { id: 'math', question: 'Can your child solve multi-step math problems?', options: ['Yes, independently', 'Yes, with some help', 'Not yet'] },
        { id: 'independence', question: 'Can your child manage daily assignments independently?', options: ['Yes, fully', 'Mostly', 'Needs reminders'] },
        { id: 'critical', question: 'Can your child analyze and compare ideas?', options: ['Yes, naturally', 'Sometimes', 'Needs support'] }
      ];
    } else {
      return [
        { id: 'essay', question: 'Can your child write a multi-paragraph essay?', options: ['Yes, well-organized', 'Yes, basic structure', 'Needs development'] },
        { id: 'management', question: 'Can your child manage weekly assignments without reminders?', options: ['Yes, consistently', 'Usually', 'Needs support'] },
        { id: 'career', question: 'Is your child interested in business, trades, college, or leadership?', options: ['Yes, clear interest', 'Exploring options', 'Not yet'] },
        { id: 'analytical', question: 'Can your child think critically and solve complex problems?', options: ['Yes, advanced', 'Yes, developing', 'Needs practice'] }
      ];
    }
  };

  const questions = getQuestions();

  const handleSubmit = (e) => {
    e.preventDefault();
    if (Object.keys(responses).length < questions.length) {
      alert('Please answer all questions');
      return;
    }
    onComplete({ questionnaire_responses: responses });
  };

  return (
    <Card className="shadow-xl">
      <CardHeader className="border-b bg-gradient-to-r from-purple-50 to-blue-50">
        <CardTitle>Academic Readiness Assessment</CardTitle>
        <p className="text-sm text-gray-600 mt-2">
          Age {studentAge} • These questions help us recommend the right grade placement
        </p>
      </CardHeader>
      <CardContent className="p-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          {questions.map((q, i) => (
            <div key={q.id} className="p-4 bg-gray-50 rounded-lg">
              <Label className="text-base font-semibold mb-3 block">
                {i + 1}. {q.question}
              </Label>
              <RadioGroup
                value={responses[q.id]}
                onValueChange={(value) => setResponses({ ...responses, [q.id]: value })}
              >
                <div className="space-y-2">
                  {q.options.map(option => (
                    <div key={option} className="flex items-center space-x-3 p-3 border-2 rounded-lg hover:bg-white transition-all cursor-pointer" 
                         onClick={() => setResponses({ ...responses, [q.id]: option })}>
                      <RadioGroupItem value={option} id={`${q.id}-${option}`} />
                      <Label htmlFor={`${q.id}-${option}`} className="cursor-pointer flex-1 font-normal">{option}</Label>
                    </div>
                  ))}
                </div>
              </RadioGroup>
            </div>
          ))}

          <div className="flex justify-between pt-4">
            <Button type="button" variant="outline" onClick={onBack}>Back</Button>
            <Button type="submit" className="bg-gradient-to-r from-purple-600 to-blue-600">
              Continue
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}