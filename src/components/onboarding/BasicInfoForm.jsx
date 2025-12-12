import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";

export default function BasicInfoForm({ data, onComplete, onBack }) {
  const [formData, setFormData] = useState({
    legal_first_name: data.legal_first_name || '',
    legal_last_name: data.legal_last_name || '',
    preferred_nickname: data.preferred_nickname || '',
    date_of_birth: data.date_of_birth || '',
    gender: data.gender || '',
    learning_preferences: data.learning_preferences || [],
    interests: data.interests || []
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.legal_first_name || !formData.legal_last_name || !formData.date_of_birth) {
      alert('Please fill in all required fields');
      return;
    }
    onComplete(formData);
  };

  const togglePreference = (pref) => {
    const prefs = formData.learning_preferences.includes(pref)
      ? formData.learning_preferences.filter(p => p !== pref)
      : [...formData.learning_preferences, pref];
    setFormData({ ...formData, learning_preferences: prefs });
  };

  const toggleInterest = (interest) => {
    const interests = formData.interests.includes(interest)
      ? formData.interests.filter(i => i !== interest)
      : [...formData.interests, interest];
    setFormData({ ...formData, interests });
  };

  return (
    <Card className="shadow-xl">
      <CardHeader className="border-b bg-gradient-to-r from-purple-50 to-blue-50">
        <CardTitle>Basic Student Information</CardTitle>
      </CardHeader>
      <CardContent className="p-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label>Legal First Name *</Label>
              <Input
                value={formData.legal_first_name}
                onChange={(e) => setFormData({ ...formData, legal_first_name: e.target.value })}
                required
              />
            </div>
            <div>
              <Label>Legal Last Name *</Label>
              <Input
                value={formData.legal_last_name}
                onChange={(e) => setFormData({ ...formData, legal_last_name: e.target.value })}
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label>Preferred Nickname (Optional)</Label>
              <Input
                value={formData.preferred_nickname}
                onChange={(e) => setFormData({ ...formData, preferred_nickname: e.target.value })}
                placeholder="What should teachers call them?"
              />
            </div>
            <div>
              <Label>Date of Birth *</Label>
              <Input
                type="date"
                value={formData.date_of_birth}
                onChange={(e) => setFormData({ ...formData, date_of_birth: e.target.value })}
                required
              />
            </div>
          </div>

          <div>
            <Label>Gender (Optional)</Label>
            <Select value={formData.gender} onValueChange={(v) => setFormData({ ...formData, gender: v })}>
              <SelectTrigger>
                <SelectValue placeholder="Select gender" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Male">Male</SelectItem>
                <SelectItem value="Female">Female</SelectItem>
                <SelectItem value="Prefer not to say">Prefer not to say</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label className="mb-3 block">Learning Preferences</Label>
            <div className="grid grid-cols-2 gap-3">
              {['Visual', 'Reading', 'Hands-on', 'Mixed'].map(pref => (
                <div key={pref} className="flex items-center space-x-2">
                  <Checkbox
                    checked={formData.learning_preferences.includes(pref)}
                    onCheckedChange={() => togglePreference(pref)}
                  />
                  <label className="text-sm">{pref}</label>
                </div>
              ))}
            </div>
          </div>

          <div>
            <Label className="mb-3 block">Interests</Label>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {['Sports', 'Art', 'Music', 'Building', 'Technology', 'Writing', 'Science', 'Reading'].map(interest => (
                <div key={interest} className="flex items-center space-x-2">
                  <Checkbox
                    checked={formData.interests.includes(interest)}
                    onCheckedChange={() => toggleInterest(interest)}
                  />
                  <label className="text-sm">{interest}</label>
                </div>
              ))}
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