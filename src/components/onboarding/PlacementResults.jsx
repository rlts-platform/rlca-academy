import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, BookOpen, Calculator, PenLine, Star } from 'lucide-react';

const LEVEL_CONFIG = {
  'Advanced':       { color: '#2D6A4F', bg: '#d1fae5', desc: 'Above grade level — ready for enrichment or accelerated track.' },
  'Proficient':     { color: '#1B3A5C', bg: '#dbeafe', desc: 'Strong command of grade-level skills — standard RLCA curriculum track.' },
  'Developing':     { color: '#C5972B', bg: '#fef3c7', desc: 'Foundational skills in place with some gaps — on-level with scaffolded support.' },
  'Beginning':      { color: '#991b1b', bg: '#fee2e2', desc: 'Significant gaps — targeted remediation plan and modified pacing.' },
  'To be reviewed': { color: '#6B3FA0', bg: '#ede9fe', desc: 'Writing sample will be reviewed by RLCA staff before final placement.' },
};

const SUBJECT_ICONS = { reading: BookOpen, math: Calculator, writing: PenLine, biblical: Star };
const SUBJECT_LABELS = { reading: 'Reading / Language Arts', math: 'Mathematics', writing: 'Writing', biblical: 'Biblical Knowledge' };

const AGREEMENTS = [
  { id: 'accurate', label: 'All information provided in this application is accurate and complete.' },
  { id: 'not_guaranteed', label: 'I understand that submission does not guarantee enrollment — RLCA will follow up within 5 business days.' },
  { id: 'homeschool_resp', label: 'I understand that maintaining legal homeschool status is my family\'s responsibility.' },
  { id: 'placement_use', label: 'I consent to placement test results being used for instructional planning.' },
  { id: 'handbook', label: 'I agree to review and follow the RLCA Parent Handbook and Code of Conduct upon enrollment.' },
  { id: 'contact', label: 'I agree to be contacted by RLCA regarding this application.' },
  { id: 'photo_release', label: 'I consent to RLCA using photos/video of my child for internal and promotional purposes. (Optional — uncheck to decline.)', optional: true },
];

function SubjectCard({ subjectKey, scores }) {
  const score = scores[subjectKey];
  if (!score) return null;
  const Icon = SUBJECT_ICONS[subjectKey];
  const levelCfg = LEVEL_CONFIG[score.level] || LEVEL_CONFIG['Developing'];

  return (
    <div className="p-4 rounded-xl border-2 transition-all" style={{ borderColor: levelCfg.color, backgroundColor: levelCfg.bg }}>
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <Icon className="w-4 h-4" style={{ color: levelCfg.color }} />
          <span className="text-sm font-bold text-gray-800">{SUBJECT_LABELS[subjectKey]}</span>
        </div>
        <Badge style={{ backgroundColor: levelCfg.color, color: '#fff' }}>{score.level}</Badge>
      </div>
      {score.correct !== undefined && (
        <p className="text-xs text-gray-600 mb-1">{score.correct} / {score.total} correct ({Math.round((score.correct / score.total) * 100)}%)</p>
      )}
      <p className="text-xs text-gray-700 leading-snug">{levelCfg.desc}</p>
    </div>
  );
}

export default function PlacementResults({ data, onComplete, onBack, isSubmitting }) {
  const scores = data.placement_scores || {};
  const [agreements, setAgreements] = useState(
    AGREEMENTS.reduce((acc, a) => ({ ...acc, [a.id]: a.optional ? true : false }), {})
  );
  const [signature, setSignature] = useState('');
  const [errors, setErrors] = useState({});

  const toggleAgreement = (id) => {
    setAgreements(prev => ({ ...prev, [id]: !prev[id] }));
    setErrors(prev => ({ ...prev, agreements: '' }));
  };

  const validate = () => {
    const e = {};
    const required = AGREEMENTS.filter(a => !a.optional);
    const allChecked = required.every(a => agreements[a.id]);
    if (!allChecked) e.agreements = 'Please confirm all required agreements.';
    if (!signature.trim()) e.signature = 'Please enter your full legal name as your digital signature.';
    else if (signature.trim().split(' ').length < 2) e.signature = 'Please enter your full legal name (first and last).';
    return e;
  };

  const handleSubmit = () => {
    const errs = validate();
    if (Object.keys(errs).length > 0) { setErrors(errs); return; }
    onComplete({
      agreements,
      digital_signature: signature.trim(),
      submitted_at: new Date().toISOString(),
      status: 'Submitted',
    });
  };

  // Determine overall placement from non-writing subjects
  const subjectLevels = ['reading', 'math', 'biblical'].map(k => scores[k]?.level).filter(Boolean);
  const levelOrder = ['Beginning', 'Developing', 'Proficient', 'Advanced'];
  const overallLevel = subjectLevels.length > 0
    ? levelOrder[Math.round(subjectLevels.reduce((sum, l) => sum + levelOrder.indexOf(l), 0) / subjectLevels.length)]
    : 'Developing';
  const overallCfg = LEVEL_CONFIG[overallLevel] || LEVEL_CONFIG['Developing'];

  return (
    <div className="space-y-6">
      {/* Results header */}
      <Card className="shadow-xl border-0">
        <CardHeader className="rounded-t-xl pb-4" style={{ background: 'linear-gradient(135deg, #1B3A5C, #2a5485)' }}>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ backgroundColor: '#C5972B' }}>
              <CheckCircle className="w-5 h-5 text-white" />
            </div>
            <div>
              <CardTitle className="text-white text-xl">Placement Results & Application Review</CardTitle>
              <p className="text-blue-200 text-sm mt-0.5">Step 8 of 8 — Review, agree, and submit</p>
            </div>
          </div>
        </CardHeader>

        <CardContent className="p-6">
          {/* Overall placement */}
          <div className="text-center p-6 rounded-2xl mb-6" style={{ backgroundColor: overallCfg.bg, border: `2px solid ${overallCfg.color}` }}>
            <p className="text-sm text-gray-600 mb-1">Overall Placement Level</p>
            <p className="text-4xl font-bold mb-2" style={{ color: overallCfg.color }}>{overallLevel}</p>
            <p className="text-sm text-gray-600">Grade Band: {scores.grade_band || 'TBD'} · Age: {data.age}</p>
            <p className="text-xs text-gray-500 mt-2">
              This is an initial estimate. RLCA staff will review and confirm your child's placement within 5 business days.
            </p>
          </div>

          {/* Per-subject breakdown */}
          <h3 className="text-base font-bold text-[#1B3A5C] mb-3">Subject-by-Subject Breakdown</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-6">
            {['reading', 'math', 'writing', 'biblical'].map(k => (
              <SubjectCard key={k} subjectKey={k} scores={scores} />
            ))}
          </div>

          {/* Student summary */}
          <h3 className="text-base font-bold text-[#1B3A5C] mb-3">Student Profile Summary</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm mb-6">
            {[
              ['Name', `${data.legal_first_name || ''} ${data.legal_last_name || ''}`],
              ['Age', `${data.age} years old`],
              ['Grade Estimate', data.age_estimate_grade || 'TBD'],
              ['Schedule', data.schedule_type || 'Full-Time'],
              ['Learning Pace', data.preferred_pace || 'Average'],
              ['Homeschooled Before', data.homeschooled_before ? 'Yes' : 'No'],
              ['Biblical Studies', data.biblical_studies ? 'Included' : 'Not included'],
              ['Faith Status', data.homeschool_status || '—'],
            ].map(([label, value]) => (
              <div key={label} className="p-3 bg-gray-50 rounded-lg border border-gray-200">
                <p className="text-xs text-gray-500">{label}</p>
                <p className="font-semibold text-gray-900 text-sm truncate">{value}</p>
              </div>
            ))}
          </div>

          {/* What happens next */}
          <div className="p-4 rounded-xl bg-blue-50 border border-blue-200 mb-6">
            <p className="text-sm font-bold text-[#1B3A5C] mb-2">What happens after you submit:</p>
            <ol className="text-sm text-gray-700 space-y-1.5">
              <li className="flex gap-2"><span className="font-bold text-[#C5972B]">1.</span> RLCA reviews your application within 5 business days.</li>
              <li className="flex gap-2"><span className="font-bold text-[#C5972B]">2.</span> You receive an Accept, Waitlist, or Decline decision by email.</li>
              <li className="flex gap-2"><span className="font-bold text-[#C5972B]">3.</span> If accepted: enrollment agreement + deposit due within 7 days.</li>
              <li className="flex gap-2"><span className="font-bold text-[#C5972B]">4.</span> Onboarding orientation scheduled 2–3 weeks before first day.</li>
            </ol>
          </div>
        </CardContent>
      </Card>

      {/* Agreements */}
      <Card className="shadow-xl border-0">
        <CardHeader className="border-b">
          <CardTitle className="text-[#1B3A5C] text-lg">Agreements & Digital Signature</CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          <div className="space-y-3 mb-6">
            {AGREEMENTS.map(a => {
              const checked = agreements[a.id];
              return (
                <div key={a.id}
                  className={`flex items-start gap-3 p-4 rounded-xl border-2 cursor-pointer transition-all
                    ${checked ? 'border-[#1B3A5C] bg-blue-50' : 'border-gray-200 hover:border-gray-300'}`}
                  onClick={() => toggleAgreement(a.id)}>
                  <Checkbox checked={checked} onCheckedChange={() => toggleAgreement(a.id)} className="mt-0.5" />
                  <p className="text-sm text-gray-800 leading-snug">
                    {a.label}
                    {a.optional && <span className="text-gray-400 ml-1">(optional)</span>}
                  </p>
                </div>
              );
            })}
          </div>
          {errors.agreements && <p className="text-red-500 text-sm mb-4">{errors.agreements}</p>}

          {/* Digital signature */}
          <div className="p-4 rounded-xl border-2 border-[#C5972B] bg-amber-50 mb-6">
            <Label className="mb-2 block text-sm font-bold text-gray-800">
              Digital Signature <span className="text-red-500">*</span>
            </Label>
            <p className="text-xs text-gray-500 mb-3">
              Type your full legal name below as your digital signature confirming all information is accurate.
            </p>
            <Input
              value={signature}
              onChange={e => { setSignature(e.target.value); setErrors({ ...errors, signature: '' }); }}
              placeholder="Full legal name (e.g., Jane Marie Smith)"
              className={`bg-white ${errors.signature ? 'border-red-400' : 'border-[#C5972B]'}`}
            />
            {errors.signature && <p className="text-red-500 text-xs mt-1">{errors.signature}</p>}
            {signature.trim().split(' ').length >= 2 && !errors.signature && (
              <p className="text-green-600 text-xs mt-1">✓ Signature recorded</p>
            )}
          </div>

          <div className="flex justify-between">
            <Button type="button" variant="outline" onClick={onBack} disabled={isSubmitting}>Back</Button>
            <Button
              onClick={handleSubmit}
              disabled={isSubmitting}
              className="text-white px-10 text-base font-semibold"
              style={{ background: 'linear-gradient(135deg, #2D6A4F, #1B3A5C)' }}
            >
              {isSubmitting ? (
                <span className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Submitting...
                </span>
              ) : (
                <span className="flex items-center gap-2">
                  <CheckCircle className="w-5 h-5" />
                  Submit Application
                </span>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
