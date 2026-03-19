// src/components/onboarding/ParentLearningProfile.jsx
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Brain } from 'lucide-react';

const CHARACTER_TRAITS = ['Integrity', 'Perseverance', 'Wisdom', 'Leadership', 'Stewardship', 'Courage', 'Compassion', 'Excellence'];

// ─── Helper components defined OUTSIDE to prevent remount issues ──────
function TextAreaField({ fieldKey, label, placeholder, hint, required = true, value, error, onChange }) {
  return (
    <div>
      <Label className="mb-1.5 block text-sm font-semibold text-gray-700">
        {label}{required && <span className="text-red-500 ml-1">*</span>}
      </Label>
      {hint && <p className="text-xs text-gray-500 mb-2">{hint}</p>}
      <Textarea
        value={value}
        placeholder={placeholder}
        rows={3}
        onChange={e => onChange(prev => ({ ...prev, [fieldKey]: e.target.value }))}
        className={error ? 'border-red-400' : ''}
      />
      {error && <p className="text-red-500 text-xs mt-1">{error}</p>}
    </div>
  );
}

export default function ParentLearningProfile({ data, onComplete, onBack }) {
  const [formData, setFormData] = useState({
    learning_success_story:  data.learning_success_story || '',
    learning_struggle_story: data.learning_struggle_story || '',
    academic_strengths:      data.academic_strengths || '',
    academic_challenges:     data.academic_challenges || '',
    frustration_response:    data.frustration_response || '',
    additional_notes:        data.additional_notes || '',
    preferred_pace:          data.preferred_pace || 'Average',
    schedule_type:           data.schedule_type || 'Full-Time',
    biblical_studies:        data.biblical_studies !== undefined ? data.biblical_studies : true,
    character_focus:         data.character_focus || [],
    technology_access:       data.technology_access || { computer_tablet: true, internet_reliable: true },
    homeschooled_before:     data.homeschooled_before !== undefined ? data.homeschooled_before : false,
  });
  const [errors, setErrors] = useState({});

  const validate = () => {
    const e = {};
    if (!formData.learning_success_story.trim()) e.learning_success_story = 'Please share an example.';
    if (!formData.learning_struggle_story.trim()) e.learning_struggle_story = 'Please share an example.';
    if (!formData.frustration_response.trim()) e.frustration_response = 'Please describe how your child handles frustration.';
    return e;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length > 0) { setErrors(errs); return; }
    onComplete(formData);
  };

  return (
    <Card className="shadow-xl border-0">
      <CardHeader className="rounded-t-xl pb-4" style={{ background: 'linear-gradient(135deg, #1B3A5C, #2a5485)' }}>
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ backgroundColor: '#C5972B' }}>
            <Brain className="w-5 h-5 text-white" />
          </div>
          <div>
            <CardTitle className="text-white text-xl">Parent Learning Profile</CardTitle>
            <p className="text-blue-200 text-sm mt-0.5">Step 3 of 5 — Help us understand how your child learns best</p>
          </div>
        </div>
      </CardHeader>

      <CardContent className="p-6">
        <div className="mb-6 p-4 rounded-xl border border-amber-200 bg-amber-50">
          <p className="text-sm text-amber-900">
            <strong>Why this matters:</strong> This section is how RLCA adapts instruction to your child from Day 1.
            There are no wrong answers — honest detail is the most helpful thing you can give us.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8">

          {/* Learning stories */}
          <section>
            <h3 className="text-base font-bold text-[#1B3A5C] mb-4 pb-2 border-b border-gray-100">Learning Stories</h3>
            <div className="space-y-5">
              <TextAreaField 
                fieldKey="learning_success_story" 
                label="Describe a time your child learned something quickly and easily. What made it work?" 
                placeholder="e.g., When we used Legos to explain fractions, it clicked immediately. She loves building things..." 
                value={formData.learning_success_story} 
                error={errors.learning_success_story} 
                onChange={setFormData} 
              />
              <TextAreaField 
                fieldKey="learning_struggle_story" 
                label="Describe a time learning was really hard for your child. What caused it?" 
                placeholder="e.g., He really struggles with reading comprehension when the material isn't interesting to him..." 
                value={formData.learning_struggle_story} 
                error={errors.learning_struggle_story} 
                onChange={setFormData} 
              />
            </div>
          </section>

          {/* Academics */}
          <section>
            <h3 className="text-base font-bold text-[#1B3A5C] mb-4 pb-2 border-b border-gray-100">Academic Strengths & Challenges</h3>
            <div className="space-y-5">
              <TextAreaField 
                fieldKey="academic_strengths" 
                label="What subjects or skills does your child naturally excel at?" 
                placeholder="e.g., Math, anything creative, science experiments..." 
                required={false} 
                value={formData.academic_strengths} 
                error={errors.academic_strengths} 
                onChange={setFormData} 
              />
              <TextAreaField 
                fieldKey="academic_challenges" 
                label="What subjects or skills are the hardest for your child?" 
                placeholder="e.g., Writing, sitting still for long periods, spelling..." 
                required={false} 
                value={formData.academic_challenges} 
                error={errors.academic_challenges} 
                onChange={setFormData} 
              />
            </div>
          </section>

          {/* Behavior & Social */}
          <section>
            <h3 className="text-base font-bold text-[#1B3A5C] mb-4 pb-2 border-b border-gray-100">Behavior, Social & Emotional Patterns</h3>
            <div className="space-y-5">
              <TextAreaField 
                fieldKey="frustration_response" 
                label="How does your child handle frustration when something is hard?" 
                placeholder="e.g., She tends to shut down and needs a short break. Once she resets she tries again..." 
                value={formData.frustration_response} 
                error={errors.frustration_response} 
                onChange={setFormData} 
              />
              <TextAreaField 
                fieldKey="additional_notes" 
                label="Anything else about your child's personality or needs we should know before Day 1?" 
                placeholder="e.g., She has a twin sister who may also enroll. He is very competitive and responds well to challenges..." 
                required={false} 
                value={formData.additional_notes} 
                error={errors.additional_notes} 
                onChange={setFormData} 
              />
            </div>
          </section>

          {/* Schedule & Pace */}
          <section>
            <h3 className="text-base font-bold text-[#1B3A5C] mb-4 pb-2 border-b border-gray-100">Schedule & Learning Preferences</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <Label className="mb-1.5 block text-sm font-semibold text-gray-700">Preferred Learning Pace</Label>
                <Select value={formData.preferred_pace} onValueChange={v => setFormData(prev => ({ ...prev, preferred_pace: v }))}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Slow">Slow — More time, deeper mastery</SelectItem>
                    <SelectItem value="Average">Average — Standard progression</SelectItem>
                    <SelectItem value="Accelerated">Accelerated — Advanced pace</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label className="mb-1.5 block text-sm font-semibold text-gray-700">Schedule Preference</Label>
                <Select value={formData.schedule_type} onValueChange={v => setFormData(prev => ({ ...prev, schedule_type: v }))}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Full-Time">Full-Time (5 days/week)</SelectItem>
                    <SelectItem value="Part-Time">Part-Time (2–3 days/week)</SelectItem>
                    <SelectItem value="Flexible">Flexible Self-Paced</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="mt-4">
              <Label className="mb-1.5 block text-sm font-semibold text-gray-700">Previously homeschooled?</Label>
              <RadioGroup
                value={formData.homeschooled_before ? 'yes' : 'no'}
                onValueChange={v => setFormData(prev => ({ ...prev, homeschooled_before: v === 'yes' }))}
                className="flex gap-6 mt-2"
              >
                <div className="flex items-center gap-2">
                  <RadioGroupItem value="yes" id="hs-y" />
                  <Label htmlFor="hs-y">Yes</Label>
                </div>
                <div className="flex items-center gap-2">
                  <RadioGroupItem value="no" id="hs-n" />
                  <Label htmlFor="hs-n">No</Label>
                </div>
              </RadioGroup>
            </div>
          </section>

          {/* Faith & Character */}
          <section>
            <h3 className="text-base font-bold text-[#1B3A5C] mb-4 pb-2 border-b border-gray-100">Faith & Character Priorities</h3>
            <div className="space-y-4">
              <div className={`flex items-center gap-3 p-4 rounded-xl border-2 transition-all border-[#1B3A5C] bg-blue-50`}>
                <Checkbox 
                  checked={formData.biblical_studies} 
                  onCheckedChange={checked => setFormData(prev => ({ ...prev, biblical_studies: checked }))}
                />
                <div>
                  <p className="text-sm font-semibold text-gray-900">Include Biblical Studies as a core subject</p>
                  <p className="text-xs text-gray-500">Covers Scripture, biblical figures, and faith foundations</p>
                </div>
              </div>

              <div>
                <Label className="mb-2 block text-sm font-semibold text-gray-700">
                  Character Development Priorities <span className="text-gray-400 font-normal text-xs">(select all that apply)</span>
                </Label>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                  {CHARACTER_TRAITS.map(trait => {
                    const checked = formData.character_focus.includes(trait);
                    return (
                      <div key={trait}
                        className={`flex items-center gap-2 p-3 rounded-lg border-2 text-sm transition-all
                          ${checked ? 'border-[#C5972B] bg-amber-50' : 'border-gray-200 hover:border-gray-300'}`}>
                        <Checkbox 
                          checked={checked} 
                          onCheckedChange={isChecked => {
                            setFormData(prev => {
                              const arr = prev.character_focus;
                              return { ...prev, character_focus: isChecked ? [...arr, trait] : arr.filter(t => t !== trait) };
                            });
                          }}
                        />
                        <span>{trait}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </section>

          {/* Technology */}
          <section>
            <h3 className="text-base font-bold text-[#1B3A5C] mb-4 pb-2 border-b border-gray-100">Technology Access</h3>
            <div className="space-y-3">
              {[
                { key: 'computer_tablet', label: 'Computer or tablet available for school use' },
                { key: 'internet_reliable', label: 'Reliable internet connection at home' },
              ].map(item => (
                <div key={item.key}
                  className={`flex items-center gap-3 p-4 rounded-xl border-2 transition-all
                    ${formData.technology_access[item.key] ? 'border-[#1B3A5C] bg-blue-50' : 'border-gray-200'}`}>
                  <Checkbox 
                    checked={formData.technology_access[item.key]} 
                    onCheckedChange={checked => setFormData(prev => ({
                      ...prev,
                      technology_access: { ...prev.technology_access, [item.key]: checked }
                    }))}
                  />
                  <span className="text-sm font-medium text-gray-800">{item.label}</span>
                </div>
              ))}
            </div>
          </section>

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