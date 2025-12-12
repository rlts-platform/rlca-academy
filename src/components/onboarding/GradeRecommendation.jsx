import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, AlertCircle, Sparkles } from "lucide-react";

export default function GradeRecommendation({ data, onGenerateRecommendation, onFinalize, onBack }) {
  const [recommendation, setRecommendation] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    generateRecommendation();
  }, []);

  const generateRecommendation = async () => {
    setLoading(true);
    const result = await onGenerateRecommendation(data);
    setRecommendation(result);
    setLoading(false);
  };

  const handleFinalize = () => {
    onFinalize({ ...data, ...recommendation });
  };

  const scheduleExamples = {
    'Full-Time': {
      days: 'Monday - Friday',
      hours: '9:00 AM - 2:30 PM',
      weeks: '36 weeks/year',
      description: 'Complete curriculum coverage with all core subjects daily'
    },
    'Part-Time': {
      days: 'Monday - Thursday',
      hours: '9:00 AM - 11:45 AM',
      weeks: '36 weeks/year',
      description: 'Core subjects 4 days/week with flexible enrichment'
    },
    'Flexible': {
      days: 'Self-paced',
      hours: 'Variable',
      weeks: 'Year-round access',
      description: 'Complete at your own pace with parent guidance'
    }
  };

  const schedule = scheduleExamples[data.schedule_type] || scheduleExamples['Full-Time'];

  if (loading) {
    return (
      <Card className="shadow-xl">
        <CardContent className="p-12 text-center">
          <div className="w-16 h-16 border-4 border-purple-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Analyzing placement and generating recommendation...</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Card className="shadow-xl border-2 border-purple-300">
        <CardHeader className="bg-gradient-to-r from-purple-600 to-blue-600 text-white">
          <CardTitle className="flex items-center gap-2">
            <Sparkles className="w-6 h-6" />
            Placement Recommendation
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6 space-y-6">
          {/* Grade Recommendation */}
          <div className="text-center p-6 bg-gradient-to-br from-purple-50 to-blue-50 rounded-lg">
            <div className="text-sm text-gray-600 mb-2">Recommended Grade</div>
            <div className="text-5xl font-bold text-purple-900 mb-2">
              {recommendation?.recommended_grade || data.age_estimate_grade}
            </div>
            <Badge className={`${
              recommendation?.confidence_level === 'High' ? 'bg-green-100 text-green-800' :
              recommendation?.confidence_level === 'Medium' ? 'bg-yellow-100 text-yellow-800' :
              'bg-orange-100 text-orange-800'
            }`}>
              {recommendation?.confidence_level || 'Medium'} Confidence
            </Badge>
          </div>

          {recommendation?.alternate_grade && (
            <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
              <div className="flex items-center gap-2 mb-2">
                <AlertCircle className="w-5 h-5 text-blue-600" />
                <span className="font-semibold text-blue-900">Alternative Option</span>
              </div>
              <p className="text-sm text-blue-800">
                {recommendation.alternate_grade} may also be suitable depending on specific subject strengths
              </p>
            </div>
          )}

          <div className="p-4 bg-gray-50 rounded-lg">
            <h3 className="font-semibold text-gray-900 mb-2">Placement Explanation</h3>
            <p className="text-sm text-gray-700">
              {recommendation?.explanation || 'Based on age and readiness assessment'}
            </p>
          </div>

          {/* Student Summary */}
          <div>
            <h3 className="font-semibold text-gray-900 mb-3">Student Profile Summary</h3>
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div className="p-3 bg-white rounded border">
                <div className="text-gray-600">Name</div>
                <div className="font-semibold">{data.legal_first_name} {data.legal_last_name}</div>
              </div>
              <div className="p-3 bg-white rounded border">
                <div className="text-gray-600">Age</div>
                <div className="font-semibold">{data.age} years old</div>
              </div>
              <div className="p-3 bg-white rounded border">
                <div className="text-gray-600">Learning Pace</div>
                <div className="font-semibold">{data.preferred_pace}</div>
              </div>
              <div className="p-3 bg-white rounded border">
                <div className="text-gray-600">Schedule</div>
                <div className="font-semibold">{data.schedule_type}</div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Schedule Preview */}
      <Card className="shadow-lg">
        <CardHeader className="border-b">
          <CardTitle>Your {data.schedule_type} Schedule</CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
            <div className="text-center p-4 bg-purple-50 rounded-lg">
              <div className="text-sm text-gray-600">Days</div>
              <div className="font-bold text-purple-900">{schedule.days}</div>
            </div>
            <div className="text-center p-4 bg-blue-50 rounded-lg">
              <div className="text-sm text-gray-600">Hours</div>
              <div className="font-bold text-blue-900">{schedule.hours}</div>
            </div>
            <div className="text-center p-4 bg-green-50 rounded-lg">
              <div className="text-sm text-gray-600">Duration</div>
              <div className="font-bold text-green-900">{schedule.weeks}</div>
            </div>
          </div>
          <p className="text-sm text-gray-700 text-center">{schedule.description}</p>
        </CardContent>
      </Card>

      {/* Curriculum Preview */}
      <Card className="shadow-lg">
        <CardHeader className="border-b">
          <CardTitle>Core Subjects</CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {['Mathematics', 'English/Language Arts', 'Science', 'History', 
              data.biblical_studies && 'Biblical Studies', 'Character & Leadership'].filter(Boolean).map(subject => (
              <div key={subject} className="p-3 bg-gray-50 rounded-lg border flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-green-600" />
                <span className="text-sm font-semibold">{subject}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-between">
        <Button variant="outline" onClick={onBack}>Back</Button>
        <Button
          onClick={handleFinalize}
          className="bg-gradient-to-r from-green-600 to-emerald-600"
          size="lg"
        >
          <CheckCircle className="w-5 h-5 mr-2" />
          Complete Onboarding
        </Button>
      </div>
    </div>
  );
}