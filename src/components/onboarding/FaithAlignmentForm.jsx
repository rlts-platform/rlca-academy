import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Cross } from 'lucide-react';

const COMMITMENTS = [
  { id: 'statement_of_faith', label: 'Support RLCA\'s statement of faith and biblical worldview curriculum' },
  { id: 'model_character',    label: 'Model Christ-centered character at home' },
  { id: 'parent_involvement', label: 'Participate in required parent involvement responsibilities' },
  { id: 'code_of_conduct',    label: 'Follow the RLCA Code of Conduct for students and parents' },
];

export default function FaithAlignmentForm({ data, onComplete, onBack }) {
  const [formData, setFormData] = useState({
    faith_background:       data.faith_background || '',
    christ_centered_meaning: data.christ_centered_meaning || '',
    character_hopes:        data.character_hopes || '',
    commitments:            data.commitments || [],
  });
  const [errors, setErrors] = useState({});

  const toggleCommitment = (id) => {
    const current = formData.commitments;
    const updated = current.includes(id)
      ? current.filter(c => c !== id)
      : [...current, id];
    setFormData({ ...formData, commitments: updated });
    setErrors({ ...errors, commitments: '' });
  };

  const validate = () => {
    const e = {};
    if (!formData.faith_background.trim())        e.faith_background = 'Please share your faith background.';
    if (!formData.christ_centered_meaning.trim()) e.christ_centered_meaning = 'Please answer this question.';
    if (!formData.character_hopes.trim())         e.character_hopes = 'Please share your hopes.';
    if (formData.commitments.length < COMMITMENTS.length)
      e.commitments = 'Please confirm all commitments to continue.';
    return e;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length > 0) { setErrors(errs); return; }
    onComplete(formData);
  };

  const textField = (key, label, placeholder, hint = '') => (
    <div>
      <Label className="mb-1.5 block text-sm font-semibold text-gray-700">
        {label} <span className="text-red-500">*</span>
      </Label>
      {hint && <p className="text-xs text-gray-500 mb-2">{hint}</p>}
      <Textarea
        value={formData[key]}
        placeholder={placeholder}
        rows={3}
        onChange={e => { setFormData({ ...formData, [key]: e.target.value }); setErrors({ ...errors, [key]: '' }); }}
        className={errors[key] ? 'border-red-400' : ''}
      />
      {errors[key] && <p className="text-red-500 text-xs mt-1">{errors[key]}</p>}
    </div>
  );

  return (
    <Card className="shadow-xl border-0">
      <CardHeader className="rounded-t-xl pb-4" style={{ background: 'linear-gradient(135deg, #1B3A5C, #2a5485)' }}>
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ backgroundColor: '#C5972B' }}>
            <Cross className="w-5 h-5 text-white" />
          </div>
          <div>
            <CardTitle className="text-white text-xl">Faith & Mission Alignment</CardTitle>
            <p className="text-blue-200 text-sm mt-0.5">Step 2 of 8 — Helping us understand your family's faith foundation</p>
          </div>
        </div>
      </CardHeader>

      <CardContent className="p-6">
        {/* Context note */}
        <div className="mb-6 p-4 rounded-xl border border-amber-200 bg-amber-50">
          <p className="text-sm text-amber-900 leading-relaxed">
            <strong>A note from RLCA:</strong> There are no "right" answers here. We're looking for genuine
            faith commitment and a shared desire to raise children with a biblical worldview.
            Your honest responses help us serve your family well.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">

          {textField(
            'faith_background',
            'Describe your family\'s faith background and church involvement',
            'e.g., We\'ve attended Grace Community Church for 5 years. We\'re involved in small group and the kids\' ministry...',
            'Include denomination, how long you\'ve attended, and your level of involvement.'
          )}

          {textField(
            'christ_centered_meaning',
            'What does a Christ-centered education mean to your family?',
            'e.g., It means every subject points back to God\'s design. We want our children to see Scripture as the foundation of all knowledge...'
          )}

          {textField(
            'character_hopes',
            'What are your top 2–3 hopes for your child\'s character development?',
            'e.g., We hope our children develop integrity, a servant\'s heart, and the courage to stand for what\'s right...'
          )}

          {/* Commitments */}
          <div>
            <Label className="mb-3 block text-sm font-semibold text-gray-700">
              Our family commits to the following: <span className="text-red-500">*</span>
            </Label>
            <div className="space-y-3">
              {COMMITMENTS.map(c => {
                const checked = formData.commitments.includes(c.id);
                return (
                  <div
                    key={c.id}
                    className={`flex items-start gap-3 p-4 rounded-xl border-2 cursor-pointer transition-all
                      ${checked ? 'border-[#1B3A5C] bg-blue-50' : 'border-gray-200 hover:border-gray-300'}`}
                    onClick={() => toggleCommitment(c.id)}
                  >
                    <Checkbox checked={checked} onCheckedChange={() => toggleCommitment(c.id)} className="mt-0.5" />
                    <p className="text-sm text-gray-800 leading-snug">{c.label}</p>
                  </div>
                );
              })}
            </div>
            {errors.commitments && <p className="text-red-500 text-xs mt-2">{errors.commitments}</p>}
          </div>

          <div className="flex justify-between pt-2">
            <Button type="button" variant="outline" onClick={onBack}>Back</Button>
            <Button type="submit" style={{ background: 'linear-gradient(135deg, #1B3A5C, #2a5485)' }} className="text-white px-8">
              Continue →
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
