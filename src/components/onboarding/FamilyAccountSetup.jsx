import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Home, Users } from 'lucide-react';

const US_STATES = [
  'AL','AK','AZ','AR','CA','CO','CT','DE','FL','GA','HI','ID','IL','IN','IA',
  'KS','KY','LA','ME','MD','MA','MI','MN','MS','MO','MT','NE','NV','NH','NJ',
  'NM','NY','NC','ND','OH','OK','OR','PA','RI','SC','SD','TN','TX','UT','VT',
  'VA','WA','WV','WI','WY','DC'
];

const COMMITMENTS = [
  { id: 'statement_of_faith', label: "Support RLCA's biblical worldview curriculum" },
  { id: 'model_character',    label: 'Model Christ-centered character at home' },
  { id: 'parent_involvement', label: 'Participate in required parent involvement' },
  { id: 'code_of_conduct',    label: 'Follow the RLCA Code of Conduct' },
];

export default function FamilyAccountSetup({ data, onComplete, onBack }) {
  const [formData, setFormData] = useState({
    parent_full_name:   data.parent_full_name || '',
    parent_email:       data.parent_email || '',
    parent_phone:       data.parent_phone || '',
    parent2_full_name:  data.parent2_full_name || '',
    parent2_email:      data.parent2_email || '',
    parent2_phone:      data.parent2_phone || '',
    street_address:     data.street_address || '',
    city:               data.city || '',
    state:              data.state || '',
    zip:                data.zip || '',
    homeschool_status:  data.homeschool_status || '',
    heard_about_rlca:   data.heard_about_rlca || '',
    faith_background:   data.faith_background || '',
    commitments:        data.commitments || [],
  });
  const [errors, setErrors] = useState({});

  const set = (key, value) => {
    setFormData(prev => ({ ...prev, [key]: value }));
    setErrors(prev => ({ ...prev, [key]: '' }));
  };

  const toggleCommitment = (id) => {
    const current = formData.commitments;
    const updated = current.includes(id) ? current.filter(c => c !== id) : [...current, id];
    set('commitments', updated);
  };

  const validate = () => {
    const e = {};
    if (!formData.parent_full_name.trim()) e.parent_full_name = 'Required';
    if (!formData.parent_email.trim() || !/\S+@\S+\.\S+/.test(formData.parent_email)) e.parent_email = 'Valid email required';
    if (!formData.street_address.trim()) e.street_address = 'Required';
    if (!formData.city.trim()) e.city = 'Required';
    if (!formData.state) e.state = 'Required';
    if (!formData.zip.trim()) e.zip = 'Required';
    if (!formData.homeschool_status) e.homeschool_status = 'Required';
    return e;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length > 0) { setErrors(errs); return; }
    onComplete(formData);
  };

  const field = (key, label, type = 'text', placeholder = '', required = true) => (
    <div>
      <Label className="mb-1.5 block text-sm font-semibold text-gray-700">
        {label}{required && <span className="text-red-500 ml-1">*</span>}
      </Label>
      <Input
        type={type}
        value={formData[key]}
        placeholder={placeholder}
        onChange={e => set(key, e.target.value)}
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
            <Users className="w-5 h-5 text-white" />
          </div>
          <div>
            <CardTitle className="text-white text-xl">Family Account Setup</CardTitle>
            <p className="text-blue-200 text-sm mt-0.5">Step 1 of 5 — Your family information</p>
          </div>
        </div>
      </CardHeader>

      <CardContent className="p-6">
        <form onSubmit={handleSubmit} className="space-y-8">

          {/* Primary Parent */}
          <section>
            <h3 className="text-base font-bold text-[#1B3A5C] mb-4 pb-2 border-b border-gray-100">
              Primary Parent / Guardian
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="md:col-span-2">{field('parent_full_name', 'Full Legal Name', 'text', 'Jane Smith')}</div>
              {field('parent_email', 'Email Address', 'email', 'jane@example.com')}
              {field('parent_phone', 'Phone Number', 'tel', '(555) 123-4567', false)}
            </div>
          </section>

          {/* Secondary Parent */}
          <section>
            <h3 className="text-base font-bold text-[#1B3A5C] mb-1 pb-2 border-b border-gray-100">
              Secondary Parent / Guardian <span className="font-normal text-gray-400 text-sm">(optional)</span>
            </h3>
            <p className="text-xs text-gray-500 mb-4">Add a second parent or guardian for communications.</p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="md:col-span-2">{field('parent2_full_name', 'Full Legal Name', 'text', 'John Smith', false)}</div>
              {field('parent2_email', 'Email Address', 'email', 'john@example.com', false)}
              {field('parent2_phone', 'Phone Number', 'tel', '(555) 987-6543', false)}
            </div>
          </section>

          {/* Home Address */}
          <section>
            <h3 className="text-base font-bold text-[#1B3A5C] mb-4 pb-2 border-b border-gray-100 flex items-center gap-2">
              <Home className="w-4 h-4" /> Home Address
            </h3>
            <div className="grid grid-cols-1 gap-4">
              {field('street_address', 'Street Address', 'text', '123 Main St')}
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {field('city', 'City', 'text', 'Springfield')}
                <div>
                  <Label className="mb-1.5 block text-sm font-semibold text-gray-700">State <span className="text-red-500">*</span></Label>
                  <Select value={formData.state} onValueChange={v => set('state', v)}>
                    <SelectTrigger className={errors.state ? 'border-red-400' : ''}>
                      <SelectValue placeholder="State" />
                    </SelectTrigger>
                    <SelectContent>
                      {US_STATES.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                    </SelectContent>
                  </Select>
                  {errors.state && <p className="text-red-500 text-xs mt-1">{errors.state}</p>}
                </div>
                {field('zip', 'ZIP Code', 'text', '62701')}
              </div>
            </div>
          </section>

          {/* Homeschool Status */}
          <section>
            <h3 className="text-base font-bold text-[#1B3A5C] mb-4 pb-2 border-b border-gray-100">
              Homeschool Status <span className="text-red-500">*</span>
            </h3>
            <RadioGroup
              value={formData.homeschool_status}
              onValueChange={v => set('homeschool_status', v)}
              className="space-y-3"
            >
              {[
                { value: 'active',         label: 'Actively homeschooling',   desc: 'We already file / declare homeschool annually in our state.' },
                { value: 'starting',       label: 'Starting homeschool',      desc: 'This will be our first year homeschooling.' },
                { value: 'needs_guidance', label: 'Not yet — need guidance',  desc: 'We need help understanding the process in our state.' },
              ].map(opt => (
                <div key={opt.value}
                  className={`flex items-start gap-3 p-4 rounded-xl border-2 cursor-pointer transition-all
                    ${formData.homeschool_status === opt.value ? 'border-[#1B3A5C] bg-blue-50' : 'border-gray-200 hover:border-gray-300'}`}
                  onClick={() => set('homeschool_status', opt.value)}>
                  <RadioGroupItem value={opt.value} className="mt-0.5" />
                  <div>
                    <p className="font-semibold text-gray-900 text-sm">{opt.label}</p>
                    <p className="text-gray-500 text-xs mt-0.5">{opt.desc}</p>
                  </div>
                </div>
              ))}
            </RadioGroup>
            {errors.homeschool_status && <p className="text-red-500 text-xs mt-2">{errors.homeschool_status}</p>}
            <p className="text-xs text-gray-400 mt-3 italic">
              RLCA operates as a hybrid co-op. Families must maintain legal homeschool status.
            </p>
          </section>

          {/* Faith (lightweight) */}
          <section>
            <h3 className="text-base font-bold text-[#1B3A5C] mb-4 pb-2 border-b border-gray-100">
              Faith Foundation
            </h3>
            <div className="space-y-5">
              <div>
                <Label className="mb-1.5 block text-sm font-semibold text-gray-700">
                  Briefly describe your family's faith background <span className="text-gray-400 font-normal">(optional)</span>
                </Label>
                <Textarea
                  value={formData.faith_background}
                  placeholder="e.g., We attend Grace Community Church and are involved in small group ministry..."
                  rows={2}
                  onChange={e => set('faith_background', e.target.value)}
                />
              </div>
              <div>
                <Label className="mb-3 block text-sm font-semibold text-gray-700">Our family commits to: <span className="text-gray-400 font-normal">(optional)</span></Label>
                <div className="space-y-2">
                  {COMMITMENTS.map(c => {
                    const checked = formData.commitments.includes(c.id);
                    return (
                      <div key={c.id}
                        className={`flex items-center gap-3 p-3 rounded-lg border-2 cursor-pointer transition-all
                          ${checked ? 'border-[#1B3A5C] bg-blue-50' : 'border-gray-200 hover:border-gray-300'}`}
                        onClick={() => toggleCommitment(c.id)}>
                        <Checkbox checked={checked} onCheckedChange={() => toggleCommitment(c.id)} />
                        <p className="text-sm text-gray-800">{c.label}</p>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </section>

          {/* How did you hear */}
          <section>
            <Label className="mb-1.5 block text-sm font-semibold text-gray-700">How did you hear about RLCA?</Label>
            <Select value={formData.heard_about_rlca} onValueChange={v => set('heard_about_rlca', v)}>
              <SelectTrigger><SelectValue placeholder="Select one (optional)" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="word_of_mouth">Word of mouth / personal referral</SelectItem>
                <SelectItem value="church">Church network or pastor referral</SelectItem>
                <SelectItem value="website">RLCA website</SelectItem>
                <SelectItem value="social_media">Social media</SelectItem>
                <SelectItem value="other">Other</SelectItem>
              </SelectContent>
            </Select>
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
