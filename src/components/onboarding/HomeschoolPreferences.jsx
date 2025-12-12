import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export default function HomeschoolPreferences({ data, onComplete, onBack }) {
  const [formData, setFormData] = useState({
    homeschooled_before: data.homeschooled_before || false,
    learning_challenges: data.learning_challenges || '',
    preferred_pace: data.preferred_pace || 'Average',
    schedule_type: data.schedule_type || 'Full-Time',
    biblical_studies: data.biblical_studies !== undefined ? data.biblical_studies : true,
    character_focus: data.character_focus || [],
    technology_access: data.technology_access || { computer_tablet: true, internet_reliable: true }
  });

  const characterTraits = ['Integrity', 'Perseverance', 'Wisdom', 'Leadership', 'Stewardship', 'Courage', 'Compassion', 'Excellence'];

  const toggleCharacterFocus = (trait) => {
    const focus = formData.character_focus.includes(trait)
      ? formData.character_focus.filter(t => t !== trait)
      : [...formData.character_focus, trait];
    setFormData({ ...formData, character_focus: focus });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onComplete(formData);
  };

  return (
    <Card className="shadow-xl">
      <CardHeader className="border-b bg-gradient-to-r from-purple-50 to-blue-50">
        <CardTitle>Homeschool Preferences</CardTitle>
      </CardHeader>
      <CardContent className="p-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <Label className="mb-3 block">Has your child been homeschooled before?</Label>
            <RadioGroup
              value={formData.homeschooled_before ? 'yes' : 'no'}
              onValueChange={(v) => setFormData({ ...formData, homeschooled_before: v === 'yes' })}
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="yes" id="hs-yes" />
                <Label htmlFor="hs-yes">Yes</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="no" id="hs-no" />
                <Label htmlFor="hs-no">No</Label>
              </div>
            </RadioGroup>
          </div>

          <div>
            <Label>Learning Challenges or Accommodations Needed</Label>
            <Textarea
              value={formData.learning_challenges}
              onChange={(e) => setFormData({ ...formData, learning_challenges: e.target.value })}
              placeholder="Any learning differences, accommodations, or special considerations..."
              rows={3}
            />
          </div>

          <div>
            <Label>Preferred Learning Pace</Label>
            <Select value={formData.preferred_pace} onValueChange={(v) => setFormData({ ...formData, preferred_pace: v })}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Slow">Slow - More time, deeper mastery</SelectItem>
                <SelectItem value="Average">Average - Standard progression</SelectItem>
                <SelectItem value="Accelerated">Accelerated - Advanced pace</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label>Schedule Preference</Label>
            <Select value={formData.schedule_type} onValueChange={(v) => setFormData({ ...formData, schedule_type: v })}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Full-Time">Full-Time (5 days/week, 36 weeks)</SelectItem>
                <SelectItem value="Part-Time">Part-Time (4 days/week, flexible)</SelectItem>
                <SelectItem value="Flexible">Flexible Self-Paced</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <div className="flex items-center space-x-2 mb-2">
              <Checkbox
                checked={formData.biblical_studies}
                onCheckedChange={(checked) => setFormData({ ...formData, biblical_studies: checked })}
              />
              <Label>Include Biblical Studies as a core subject</Label>
            </div>
          </div>

          <div>
            <Label className="mb-3 block">Character Development Priorities</Label>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {characterTraits.map(trait => (
                <div key={trait} className="flex items-center space-x-2">
                  <Checkbox
                    checked={formData.character_focus.includes(trait)}
                    onCheckedChange={() => toggleCharacterFocus(trait)}
                  />
                  <label className="text-sm">{trait}</label>
                </div>
              ))}
            </div>
          </div>

          <div>
            <Label className="mb-3 block">Technology Access</Label>
            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <Checkbox
                  checked={formData.technology_access.computer_tablet}
                  onCheckedChange={(checked) => setFormData({
                    ...formData,
                    technology_access: { ...formData.technology_access, computer_tablet: checked }
                  })}
                />
                <label className="text-sm">Computer/tablet available</label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox
                  checked={formData.technology_access.internet_reliable}
                  onCheckedChange={(checked) => setFormData({
                    ...formData,
                    technology_access: { ...formData.technology_access, internet_reliable: checked }
                  })}
                />
                <label className="text-sm">Reliable internet connection</label>
              </div>
            </div>
          </div>

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