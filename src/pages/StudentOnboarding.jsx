import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { useMutation } from '@tanstack/react-query';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { CheckCircle, UserPlus } from "lucide-react";
import { motion } from "framer-motion";

import BasicInfoForm from '../components/onboarding/BasicInfoForm';
import PlacementQuestionnaire from '../components/onboarding/PlacementQuestionnaire';
import HomeschoolPreferences from '../components/onboarding/HomeschoolPreferences';
import ExtracurricularSelection from '../components/onboarding/ExtracurricularSelection';
import GradeRecommendation from '../components/onboarding/GradeRecommendation';

export default function StudentOnboarding() {
  const [currentUser, setCurrentUser] = useState(null);
  const [step, setStep] = useState(1);
  const [onboardingData, setOnboardingData] = useState({
    parent_email: '',
    learning_preferences: [],
    interests: [],
    biblical_studies: true,
    character_focus: [],
    extracurricular_interests: [],
    language_learning: []
  });

  useEffect(() => {
    loadUser();
  }, []);

  const loadUser = async () => {
    try {
      const user = await base44.auth.me();
      setCurrentUser(user);
      setOnboardingData(prev => ({ ...prev, parent_email: user.email }));
    } catch (error) {
      // User not logged in, redirect to get started page
      window.location.href = '/GetStarted';
    }
  };

  const calculateAge = (dob) => {
    const today = new Date();
    const birthDate = new Date(dob);
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    return age;
  };

  const getGradeByAge = (age) => {
    const ageGradeMap = {
      5: "Kindergarten", 6: "1st Grade", 7: "2nd Grade", 8: "3rd Grade",
      9: "4th Grade", 10: "5th Grade", 11: "6th Grade", 12: "7th Grade",
      13: "8th Grade", 14: "9th Grade", 15: "10th Grade", 16: "11th Grade",
      17: "12th Grade", 18: "12th Grade"
    };
    return ageGradeMap[age] || "To Be Determined";
  };

  const saveOnboardingMutation = useMutation({
    mutationFn: async (data) => {
      const onboardingRecord = await base44.entities.StudentOnboarding.create(data);
      
      // Also create the actual Student entity
      await base44.entities.Student.create({
        full_name: `${data.legal_first_name} ${data.legal_last_name}`,
        age: data.age,
        grade_level: data.recommended_grade || data.age_estimate_grade,
        parent_email: data.parent_email,
        student_email: '',
        enrollment_status: 'Active',
        date_of_birth: data.date_of_birth
      });
      
      return onboardingRecord;
    },
    onSuccess: (result) => {
      alert('Onboarding completed! Your student profile has been created. Welcome to Royal Legends Children Academy!');
      window.location.href = '/StudentDashboard';
    }
  });

  const handleStepComplete = (stepData) => {
    const updatedData = { ...onboardingData, ...stepData };
    
    if (step === 1 && stepData.date_of_birth) {
      const age = calculateAge(stepData.date_of_birth);
      const estimatedGrade = getGradeByAge(age);
      updatedData.age = age;
      updatedData.age_estimate_grade = estimatedGrade;
    }
    
    setOnboardingData(updatedData);
    
    if (step < 5) {
      setStep(step + 1);
    } else {
      finalizeOnboarding(updatedData);
    }
  };

  const finalizeOnboarding = async (data) => {
    const aiRecommendation = await generateGradeRecommendation(data);
    const finalData = { ...data, ...aiRecommendation, status: 'Completed' };
    saveOnboardingMutation.mutate(finalData);
  };

  const generateGradeRecommendation = async (data) => {
    const prompt = `You are an educational placement specialist at Royal Legends Children Academy, a faith-based homeschool.

STUDENT PROFILE:
- Age: ${data.age}
- Age-Based Estimate: ${data.age_estimate_grade}
- Previously Homeschooled: ${data.homeschooled_before ? 'Yes' : 'No'}
- Learning Pace Preference: ${data.preferred_pace || 'Average'}
- Learning Challenges: ${data.learning_challenges || 'None noted'}

QUESTIONNAIRE RESPONSES:
${JSON.stringify(data.questionnaire_responses, null, 2)}

PLACEMENT TASK:
Analyze the student's age, questionnaire responses, and background to recommend:
1. Primary grade placement
2. Alternative grade (if applicable)
3. Confidence level (High/Medium/Needs Review)
4. Brief explanation for parents

Consider:
- Academic readiness vs age
- Homeschool flexibility (not bound by traditional age-grade)
- Developmental readiness
- Parent preferences

Provide a thoughtful, encouraging recommendation that honors the child's unique development.`;

    try {
      const response = await base44.integrations.Core.InvokeLLM({
        prompt,
        response_json_schema: {
          type: "object",
          properties: {
            recommended_grade: { type: "string" },
            alternate_grade: { type: "string" },
            confidence_level: { type: "string", enum: ["High", "Medium", "Needs Review"] },
            explanation: { type: "string" },
            readiness_score: { type: "number", description: "1-100 score" }
          }
        }
      });
      return response;
    } catch (error) {
      console.error("AI recommendation error:", error);
      return {
        recommended_grade: data.age_estimate_grade,
        confidence_level: "Medium",
        explanation: "Based on age estimate. Schedule a call for personalized placement.",
        readiness_score: 75
      };
    }
  };

  const steps = [
    { num: 1, title: "Basic Information" },
    { num: 2, title: "Placement Assessment" },
    { num: 3, title: "Learning Preferences" },
    { num: 4, title: "Interests & Activities" },
    { num: 5, title: "Review & Recommendation" }
  ];

  if (!currentUser) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-pink-50 flex items-center justify-center">
        <div className="w-16 h-16 border-4 border-purple-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-pink-50 p-6">
      <div className="max-w-4xl mx-auto">
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
          <div className="flex items-center gap-4 mb-6">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-purple-500 to-blue-600 flex items-center justify-center shadow-xl">
              <UserPlus className="w-9 h-9 text-white" />
            </div>
            <div>
              <h1 className="text-4xl font-bold text-gray-900">Student Onboarding</h1>
              <p className="text-gray-600 mt-1">Let's find the perfect placement for your student</p>
            </div>
          </div>

          {/* Progress Bar */}
          <Card className="shadow-lg mb-6">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                {steps.map((s, i) => (
                  <div key={s.num} className="flex items-center">
                    <div className={`flex flex-col items-center ${i < steps.length - 1 ? 'flex-1' : ''}`}>
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold ${
                        step > s.num ? 'bg-green-500 text-white' :
                        step === s.num ? 'bg-purple-600 text-white' :
                        'bg-gray-200 text-gray-500'
                      }`}>
                        {step > s.num ? <CheckCircle className="w-5 h-5" /> : s.num}
                      </div>
                      <div className="text-xs mt-2 text-center font-semibold">{s.title}</div>
                    </div>
                    {i < steps.length - 1 && (
                      <div className={`h-1 flex-1 mx-2 ${step > s.num ? 'bg-green-500' : 'bg-gray-200'}`} />
                    )}
                  </div>
                ))}
              </div>
              <Progress value={(step / 5) * 100} className="h-2" />
            </CardContent>
          </Card>
        </motion.div>

        {/* Step Content */}
        <motion.div key={step} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}>
          {step === 1 && (
            <BasicInfoForm 
              data={onboardingData} 
              onComplete={handleStepComplete}
              onBack={() => window.history.back()}
            />
          )}
          {step === 2 && (
            <PlacementQuestionnaire 
              age={onboardingData.age}
              data={onboardingData}
              onComplete={handleStepComplete}
              onBack={() => setStep(step - 1)}
            />
          )}
          {step === 3 && (
            <HomeschoolPreferences 
              data={onboardingData}
              onComplete={handleStepComplete}
              onBack={() => setStep(step - 1)}
            />
          )}
          {step === 4 && (
            <ExtracurricularSelection 
              data={onboardingData}
              onComplete={handleStepComplete}
              onBack={() => setStep(step - 1)}
            />
          )}
          {step === 5 && (
            <GradeRecommendation 
              data={onboardingData}
              onGenerateRecommendation={generateGradeRecommendation}
              onFinalize={finalizeOnboarding}
              onBack={() => setStep(step - 1)}
            />
          )}
        </motion.div>
      </div>
    </div>
  );
}