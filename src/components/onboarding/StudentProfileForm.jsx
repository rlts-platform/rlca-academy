import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Textarea } from "@/components/ui/textarea";
import { GraduationCap } from 'lucide-react';

const LEARNING_STYLES = ['Visual', 'Auditory', 'Hands-on / Kinesthetic', 'Reading / Writing', 'Mixed'];
const INTERESTS = ['Sports', 'Art', 'Music', 'Building / Maker', 'Technology', 'Writing', 'Science', 'Reading', 'Business', 'Cooking', 'Nature / Outdoors'];
const EXTRACURRICULARS = ['Sports & Fitness', 'Art & Design', 'Music', 'Coding & Technology', 'Public Speaking', 'Creative Writing', 'Leadership Clubs', 'Entrepreneurship Projects'];
const LANGUAGES = ['Spanish', 'French', 'Hebrew', 'Latin', 'Sign Language'];
const SPECIAL_NEEDS = ['IEP (Individualized Education Program)', '504 Plan', 'Diagnosed learning difference (e.g., dyslexia, ADHD)', 'Speech / language therapy', 'None of the above'];

export default function StudentProfileForm({ data, onComplete, onBack }) {
  const [formData, setFormData] = useState({
    legal_first_name:        data.legal_first_name || '',
    legal_last_name:         data.legal_last_name || '',
    preferred_nickname:      data.preferred_nickname || '',
    date_of_birth:           data.date_of_birth || '',
    gender:                  data.gender || '',
    learning_preferences:    data.learning_preferences || [],
    interests:               data.interests || [],
    special_needs:           data.special_needs || [],
    special_needs_details:   data.special_needs_details || '',
    extracurricular_interests: data.extracurricular_interests || [],
    language_learning:       data.language_learning || [],
  });
  const [errors, setErrors] = useState({});

  const toggle = (key, value) => {
    const arr = formData[key];
    // If selecting "None of the above", clear everything else
    if (value === 'None of the above') {
      setFormData({ ...formData, [key]: ['None of the above'] });
      return;
    }
    const filtered = arr.filter(i => i !== 'None of the above');
    const updated = filtered.includes(value) ? filtered.filter(i => i !== value) : [...filtered, value];
    setFormData({ ...formData, [key]: updated });
  };

  const addLanguage = () => {
    setFormData({ ...formData, language_learning: [...formData.language_learning, { language: '', level: 'Beginner' }] });
  };
  const updateLanguage = (i, field, value) => {
    const updated = [...formData.language_learning];
    updated[i][field] = value;
    setFormData({ ...formData, language_learning: updated });
  };
  const removeLanguage = (i) => {
    setFormData({ ...formData, language_learning: formData.language_learning.filter((_, idx) => idx !== i) });
  };

  const validate = () => {
    const e = {};
    if (!formData.legal_first_name.trim()) e.legal_first_name = 'Required';
    if (!formData.legal_last_name.trim())  e.legal_last_name = 'Required';
    if (!formData.date_of_birth)           e.date_of_birth = 'Required';
    // Ensure DOB is valid and child is between 4 and 19
    if (formData.date_of_birth) {
      const age = Math.floor((Date.now() - new Date(formData.date_of_birth)) / (365.25 * 24 * 3600 * 1000));
      if (isNaN(age) || age < 4 || age > 19) e.date_of_birth = 'Please enter a valid date of birth (age 4–19).';
    }
    if (formData.special_needs.length === 0) e.special_needs = 'Please select at least one option.';
    return e;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length > 0) { setErrors(errs); return; }

    // Calculate age and estimated grade
    const age = Math.floor((Date.now() - new Date(formData.date_of_birth)) / (365.25 * 24 * 3600 * 1000));
    const ageGradeMap = { 5:'Kindergarten',6:'1st Grade',7:'2nd Grade',8:'3rd Grade',9:'4th Grade',
      10:'5th Grade',11:'6th Grade',12:'7th Grade',13:'8th Grade',14:'9th Grade',
      15:'10th Grade',16:'11th Grade',17:'12th Grade',18:'12th Grade' };
    const age_estimate_grade = ageGradeMap[age] || 'To Be Determined';

    onComplete({ ...formData, age, age_estimate_grade });
  };

  const CheckGrid = ({ label, stateKey, options, cols = 2, required = false }) => (
    <div>
      <Label className="mb-2 block text-sm font-semibold text-gray-700">
        {label}{required && <span className="text-red-500 ml-1">*</span>}
        <span className="font-normal text-gray-400 ml-1">(select all that apply)</span>
      </Label>
      <div className={`grid grid-cols-${cols} gap-2`}>
        {options.map(opt => {
          const checked = formData[stateKey].includes(opt);
          return (
            <div
              key={opt}
              className={`flex items-center gap-2 p-3 rounded-lg border-2 cursor-pointer text-sm transition-all
                ${checked ? 'border-[#1B3A5C] bg-blue-50' : 'border-gray-200 hover:border-gray-300'}`}
              onClick={() => toggle(stateKey, opt)}
            >
              <Checkbox checked={checked} onCheckedChange={() => toggle(stateKey, opt)} />
              <span className="leading-snug">{opt}</span>
            </div>
          );
        })}
      </div>
      {errors[stateKey] && <p className="text-red-500 text-xs mt-1">{errors[stateKey]}</p>}
    </div>
  );

  return (
    <Card className="shadow-xl border-0">
      <CardHeader className="rounded-t-xl pb-4" style={{ background: 'linear-gradient(135deg, #1B3A5C, #2a5485)' }}>
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ backgroundColor: '#C5972B' }}>
            <GraduationCap className="w-5 h-5 text-white" />
          </div>
          <div>
            <CardTitle className="text-white text-xl">Student Profile</CardTitle>
            <p className="text-blue-200 text-sm mt-0.5">Step 3 of 8 — Tell us about your child</p>
          </div>
        </div>
      </CardHeader>

      <CardContent className="p-6">
        <form onSubmit={handleSubmit} className="space-y-8">

          {/* Basic Info */}
          <section>
            <h3 className="text-base font-bold text-[#1B3A5C] mb-4 pb-2 border-b border-gray-100">Student Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label className="mb-1.5 block text-sm font-semibold text-gray-700">Legal First Name <span className="text-red-500">*</span></Label>
                <Input value={formData.legal_first_name}
                  onChange={e => { setFormData({...formData, legal_first_name: e.target.value}); setErrors({...errors, legal_first_name: ''}); }}
                  className={errors.legal_first_name ? 'border-red-400' : ''} />
                {errors.legal_first_name && <p className="text-red-500 text-xs mt-1">{errors.legal_first_name}</p>}
              </div>
              <div>
                <Label className="mb-1.5 block text-sm font-semibold text-gray-700">Legal Last Name <span className="text-red-500">*</span></Label>
                <Input value={formData.legal_last_name}
                  onChange={e => { setFormData({...formData, legal_last_name: e.target.value}); setErrors({...errors, legal_last_name: ''}); }}
                  className={errors.legal_last_name ? 'border-red-400' : ''} />
                {errors.legal_last_name && <p className="text-red-500 text-xs mt-1">{errors.legal_last_name}</p>}
              </div>
              <div>
                <Label className="mb-1.5 block text-sm font-semibold text-gray-700">Preferred Nickname <span className="text-gray-400 font-normal">(optional)</span></Label>
                <Input value={formData.preferred_nickname} placeholder="What should teachers call them?"
                  onChange={e => setFormData({...formData, preferred_nickname: e.target.value})} />
              </div>
              <div>
                <Label className="mb-1.5 block text-sm font-semibold text-gray-700">Date of Birth <span className="text-red-500">*</span></Label>
                <Input type="date" value={formData.date_of_birth}
                  onChange={e => { setFormData({...formData, date_of_birth: e.target.value}); setErrors({...errors, date_of_birth: ''}); }}
                  className={errors.date_of_birth ? 'border-red-400' : ''} />
                {errors.date_of_birth && <p className="text-red-500 text-xs mt-1">{errors.date_of_birth}</p>}
              </div>
              <div>
                <Label className="mb-1.5 block text-sm font-semibold text-gray-700">Gender <span className="text-gray-400 font-normal">(optional)</span></Label>
                <Select value={formData.gender} onValueChange={v => setFormData({...formData, gender: v})}>
                  <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Male">Male</SelectItem>
                    <SelectItem value="Female">Female</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </section>

          {/* Special needs / IEP */}
          <section>
            <h3 className="text-base font-bold text-[#1B3A5C] mb-2 pb-2 border-b border-gray-100">Learning Support Disclosure</h3>
            <p className="text-xs text-gray-500 mb-4">
              This helps us prepare the right support. Selecting any option does <strong>not</strong> disqualify your child.
            </p>
            <CheckGrid label="Does your child have any of the following?" stateKey="special_needs" options={SPECIAL_NEEDS} cols={1} required />
            {formData.special_needs.some(s => s !== 'None of the above') && (
              <div className="mt-4">
                <Label className="mb-1.5 block text-sm font-semibold text-gray-700">Please describe briefly <span className="text-gray-400 font-normal">(optional)</span></Label>
                <Textarea value={formData.special_needs_details} rows={2}
                  placeholder="Any diagnosis, current accommodations, or support strategies that work well..."
                  onChange={e => setFormData({...formData, special_needs_details: e.target.value})} />
              </div>
            )}
          </section>

          {/* Learning style */}
          <section>
            <h3 className="text-base font-bold text-[#1B3A5C] mb-4 pb-2 border-b border-gray-100">Learning Style & Interests</h3>
            <div className="space-y-6">
              <CheckGrid label="How does your child learn best?" stateKey="learning_preferences" options={LEARNING_STYLES} cols={2} />
              <CheckGrid label="Your child's interests" stateKey="interests" options={INTERESTS} cols={3} />
              <CheckGrid label="Extra-curricular interests" stateKey="extracurricular_interests" options={EXTRACURRICULARS} cols={2} />
            </div>
          </section>

          {/* Language learning */}
          <section>
            <div className="flex items-center justify-between mb-3">
              <Label className="text-sm font-semibold text-gray-700">Language Learning <span className="text-gray-400 font-normal">(optional)</span></Label>
              <Button type="button" size="sm" variant="outline" onClick={addLanguage} className="text-xs">+ Add Language</Button>
            </div>
            <div className="space-y-3">
              {formData.language_learning.map((lang, i) => (
                <div key={i} className="flex gap-3 items-center">
                  <Select value={lang.language} onValueChange={v => updateLanguage(i, 'language', v)}>
                    <SelectTrigger className="flex-1"><SelectValue placeholder="Select language" /></SelectTrigger>
                    <SelectContent>{LANGUAGES.map(l => <SelectItem key={l} value={l}>{l}</SelectItem>)}</SelectContent>
                  </Select>
                  <Select value={lang.level} onValueChange={v => updateLanguage(i, 'level', v)}>
                    <SelectTrigger className="w-36"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Beginner">Beginner</SelectItem>
                      <SelectItem value="Intermediate">Intermediate</SelectItem>
                      <SelectItem value="Advanced">Advanced</SelectItem>
                    </SelectContent>
                  </Select>
                  <Button type="button" size="sm" variant="ghost" onClick={() => removeLanguage(i)} className="text-red-500 hover:text-red-700">✕</Button>
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
