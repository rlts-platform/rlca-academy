import React, { useState, useEffect, useCallback } from 'react';
import { base44 } from '@/api/base44Client';
import { useMutation } from '@tanstack/react-query';
import { Progress } from "@/components/ui/progress";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { CheckCircle, AlertCircle, RotateCcw, BookOpen } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

import ProfileSwitcher from '@/components/ProfileSwitcher';
import FamilyAccountSetup from '@/components/onboarding/FamilyAccountSetup';
import StudentProfileForm from '@/components/onboarding/StudentProfileForm';
import ParentLearningProfile from '@/components/onboarding/ParentLearningProfile';
import PlacementTest from '@/components/onboarding/PlacementTest';
import PlacementResults from '@/components/onboarding/PlacementResults';

// ─── Step definitions (5 steps) ───────────────────────────────────────────────
const STEPS = [
  { num: 1, title: 'Family Setup',     short: 'Family'  },
  { num: 2, title: 'Student Profile',  short: 'Student' },
  { num: 3, title: 'Learning Profile', short: 'Learning'},
  { num: 4, title: 'Placement Test',   short: 'Test'    },
  { num: 5, title: 'Review & Submit',  short: 'Submit'  },
];

const TOTAL_STEPS = STEPS.length;
const LS_KEY = 'rlca_onboarding_v3';

function initialData(userEmail = '') {
  return {
    parent_email: userEmail,
    parent_full_name: '', parent_phone: '',
    parent2_full_name: '', parent2_email: '', parent2_phone: '',
    street_address: '', city: '', state: '', zip: '',
    homeschool_status: '', heard_about_rlca: '',
    faith_background: '', commitments: [],
    legal_first_name: '', legal_last_name: '', preferred_nickname: '',
    date_of_birth: '', gender: '', age: null, age_estimate_grade: '',
    learning_preferences: [], interests: [], special_needs: [], special_needs_details: '',
    extracurricular_interests: [], language_learning: [],
    learning_success_story: '', learning_struggle_story: '',
    academic_strengths: '', academic_challenges: '',
    struggle_areas: [], behavior_patterns: [], frustration_response: '',
    additional_notes: '', preferred_pace: 'Average', schedule_type: 'Full-Time',
    biblical_studies: true, character_focus: [],
    technology_access: { computer_tablet: true, internet_reliable: true },
    homeschooled_before: false,
    placement_scores: null, placement_answers: null,
    agreements: {}, digital_signature: '', submitted_at: '', status: 'In Progress',
  };
}

// ─── Progress bar ─────────────────────────────────────────────────────────────
function StepProgress({ currentStep }) {
  return (
    <div className="mb-8">
      <div className="flex items-center justify-between mb-3">
        {STEPS.map((s, i) => (
          <React.Fragment key={s.num}>
            <div className="flex flex-col items-center">
              <div className={`w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold transition-all
                ${currentStep > s.num ? 'bg-green-500 text-white' :
                  currentStep === s.num ? 'text-white shadow-lg' : 'bg-gray-200 text-gray-400'}`}
                style={currentStep === s.num ? { background: 'linear-gradient(135deg, #1B3A5C, #2a5485)' } : {}}>
                {currentStep > s.num ? <CheckCircle className="w-4 h-4" /> : s.num}
              </div>
              <span className={`text-xs mt-1.5 font-medium hidden sm:block
                ${currentStep === s.num ? 'text-[#1B3A5C]' : currentStep > s.num ? 'text-green-600' : 'text-gray-400'}`}>
                {s.short}
              </span>
            </div>
            {i < STEPS.length - 1 && (
              <div className={`flex-1 h-1 mx-1 rounded transition-all ${currentStep > s.num ? 'bg-green-400' : 'bg-gray-200'}`} />
            )}
          </React.Fragment>
        ))}
      </div>
      <Progress value={(currentStep / TOTAL_STEPS) * 100} className="h-1.5" />
      <div className="flex justify-between mt-1.5">
        <span className="text-xs text-gray-500">{STEPS[currentStep - 1]?.title}</span>
        <span className="text-xs text-gray-400">Step {currentStep} of {TOTAL_STEPS}</span>
      </div>
    </div>
  );
}

export default function StudentOnboarding() {
  const [currentUser, setCurrentUser] = useState(null);
  const [appState, setAppState] = useState('loading');
  const [activeChild, setActiveChild] = useState(null);
  const [step, setStep] = useState(1);
  const [data, setData] = useState(() => initialData());
  const [error, setError] = useState(null);
  const [hasSavedProgress, setHasSavedProgress] = useState(false);

  useEffect(() => { bootstrap(); }, []);

  const bootstrap = async () => {
    if (appState !== "loading") return; // prevent re-run
    try {
      const user = await base44.auth.me().catch(() => null);
      if (!user) { window.location.href = '/GetStarted'; return; }
      setCurrentUser(user);
      setData(initialData(user.email));
      const saved = loadProgress();
      if (saved) setHasSavedProgress(true);
      setAppState('switcher');
    } catch (err) {
      console.error('[Onboarding bootstrap]', err);
      setError('Failed to load. Please refresh.');
      setAppState('switcher');
    }
  };

  const saveProgress = useCallback((stepNum, formData) => {
    try {
      localStorage.setItem(LS_KEY, JSON.stringify({ step: stepNum, data: formData, ts: Date.now() }));
    } catch (e) {}
  }, []);

  const loadProgress = () => {
    try {
      const raw = localStorage.getItem(LS_KEY);
      if (!raw) return null;
      const parsed = JSON.parse(raw);
      if (Date.now() - parsed.ts > 7 * 24 * 3600 * 1000) { localStorage.removeItem(LS_KEY); return null; }
      return parsed;
    } catch { return null; }
  };

  const clearProgress = () => {
    localStorage.removeItem(LS_KEY);
    // Also clear old key from previous version
    localStorage.removeItem('rlca_onboarding_v2');
    localStorage.removeItem('onboarding_progress');
  };

  const handleSelectChild = (child) => {
    sessionStorage.setItem('rlca_active_child', JSON.stringify(child));
    window.location.href = '/StudentDashboard';
  };

  const handleAddChild = () => {
    const saved = loadProgress();
    if (saved) {
      setData(saved.data);
      setStep(saved.step);
    } else {
      setData(initialData(currentUser?.email || ''));
      setStep(1);
    }
    setActiveChild(null);
    setAppState('onboarding');
  };

  const handleEditChild = (child) => {
    setActiveChild(child);
    setData({ ...initialData(currentUser?.email || ''), ...child });
    setStep(2); // Skip family setup, go to student profile
    setAppState('onboarding');
  };

  const handleStepComplete = (stepData) => {
    const updated = { ...data, ...stepData };
    setData(updated);
    if (step < TOTAL_STEPS) {
      const next = step + 1;
      setStep(next);
      saveProgress(next, updated);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleBack = () => {
    if (step === 1) {
      setAppState('switcher');
    } else {
      const prev = step - 1;
      setStep(prev);
      saveProgress(prev, data);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const restartOnboarding = () => {
    if (!confirm('Reset this onboarding? All progress will be cleared.')) return;
    clearProgress();
    setData(initialData(currentUser?.email || ''));
    setStep(1);
    setError(null);
  };

  const submitMutation = useMutation({
    mutationFn: async (finalData) => {
      const onboardingRecord = await base44.entities.StudentOnboarding.create({
        ...finalData,
        parent_email: finalData.parent_email,
        status: 'Submitted',
      });

      const existingParents = await base44.entities.Parent.filter({ email: finalData.parent_email }).catch(() => []);
      if (existingParents.length === 0) {
        await base44.entities.Parent.create({
          full_name: finalData.parent_full_name,
          email: finalData.parent_email,
          phone: finalData.parent_phone || '',
          address: `${finalData.street_address}, ${finalData.city}, ${finalData.state} ${finalData.zip}`,
        });
      }

      await base44.entities.Student.create({
        full_name: `${finalData.legal_first_name} ${finalData.legal_last_name}`,
        age: finalData.age,
        grade_level: finalData.age_estimate_grade,
        parent_email: finalData.parent_email,
        enrollment_status: 'Pending Review',
        placement_level: finalData.placement_scores
          ? Object.values(finalData.placement_scores)
              .filter(s => s && s.level && s.level !== 'To be reviewed')
              .map(s => s.level)[0] || 'Developing'
          : 'Developing',
      });

      return onboardingRecord;
    },
    onSuccess: () => {
      clearProgress();
      setAppState('success');
    },
    onError: (err) => {
      console.error('[Onboarding submit error]', err);
      setError('Submission failed. Please try again or contact RLCA directly.');
    },
  });

  const handleFinalSubmit = (submissionData) => {
    const finalData = { ...data, ...submissionData };
    setData(finalData);
    submitMutation.mutate(finalData);
  };

  // ── Loading ────────────────────────────────────────────────────────────────
  if (appState === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center"
           style={{ background: 'linear-gradient(135deg, #0f1923 0%, #1B3A5C 50%, #0f1923 100%)' }}>
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-[#C5972B] border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-400">Loading...</p>
        </div>
      </div>
    );
  }

  // ── Profile switcher ───────────────────────────────────────────────────────
  if (appState === 'switcher') {
    return (
      <ProfileSwitcher
        currentUser={currentUser}
        onSelectChild={handleSelectChild}
        onAddChild={handleAddChild}
        onEditChild={handleEditChild}
      />
    );
  }

  // ── Success ────────────────────────────────────────────────────────────────
  if (appState === 'success') {
    return (
      <div className="min-h-screen flex items-center justify-center px-6"
           style={{ background: 'linear-gradient(135deg, #0f1923 0%, #1B3A5C 50%, #0f1923 100%)' }}>
        <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}
          className="text-center max-w-md">
          <div className="w-20 h-20 rounded-full bg-green-500 flex items-center justify-center mx-auto mb-6 shadow-2xl">
            <CheckCircle className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-white mb-3">Application Submitted!</h1>
          <p className="text-gray-300 mb-2">Welcome to Royal Legends Children Academy, {data.legal_first_name}!</p>
          <p className="text-gray-400 text-sm mb-8">
            RLCA will review and respond within 5 business days at{' '}
            <strong className="text-white">{data.parent_email}</strong>.
          </p>
          <Button onClick={() => setAppState('switcher')} className="text-white px-8"
            style={{ background: 'linear-gradient(135deg, #C5972B, #a07820)' }}>
            Return to Profiles
          </Button>
        </motion.div>
      </div>
    );
  }

  // ── Onboarding flow ────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen py-8 px-4" style={{ backgroundColor: '#f8fafc' }}>
      <div className="max-w-3xl mx-auto">

        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ backgroundColor: '#1B3A5C' }}>
              <BookOpen className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">RLCA Academy</h1>
              <p className="text-gray-500 text-sm">Student Enrollment — {activeChild ? 'Edit Profile' : 'New Child'}</p>
            </div>
          </div>
          <Button variant="ghost" size="sm" onClick={restartOnboarding}
            className="text-gray-400 hover:text-gray-600 gap-1.5 text-xs">
            <RotateCcw className="w-3.5 h-3.5" /> Restart
          </Button>
        </div>

        {error && (
          <Alert className="mb-4 border-red-200 bg-red-50">
            <AlertCircle className="w-4 h-4 text-red-500" />
            <AlertDescription className="text-red-700">{error}</AlertDescription>
          </Alert>
        )}

        {hasSavedProgress && step > 1 && (
          <Alert className="mb-4 border-blue-200 bg-blue-50">
            <CheckCircle className="w-4 h-4 text-blue-500" />
            <AlertDescription className="text-blue-700">Progress restored — continuing where you left off.</AlertDescription>
          </Alert>
        )}

        <StepProgress currentStep={step} />

        <AnimatePresence mode="wait">
          <motion.div key={step}
            initial={{ opacity: 0, x: 24 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -24 }}
            transition={{ duration: 0.2 }}>
            {step === 1 && <FamilyAccountSetup data={data} onComplete={handleStepComplete} onBack={handleBack} />}
            {step === 2 && <StudentProfileForm data={data} onComplete={handleStepComplete} onBack={handleBack} />}
            {step === 3 && <ParentLearningProfile data={data} onComplete={handleStepComplete} onBack={handleBack} />}
            {step === 4 && <PlacementTest data={data} onComplete={handleStepComplete} onBack={handleBack} />}
            {step === 5 && (
              <PlacementResults
                data={data}
                onComplete={handleFinalSubmit}
                onBack={handleBack}
                isSubmitting={submitMutation.isPending}
              />
            )}
          </motion.div>
        </AnimatePresence>

      </div>
    </div>
  );
}
