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
    interests: data.interests || [],
    parent_full_name: data.parent_full_name || '',
    parent_email: data.parent_email || '',
    parent_phone: data.parent_phone || ''
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.legal_first_name || !formData.legal_last_name || !formData.date_of_birth) {
      alert('Please fill in all required student information');
      return;
    }
    if (!formData.parent_full_name || !formData.parent_email) {
      alert('Please fill in parent/guardian information');
      return;
    }
    onComplete(formData);
  };

  const togglePreference = (pref) => {
    const currentPrefs = formData.learning_preferences || [];
    const newPrefs = currentPrefs.includes(pref)
      ? currentPrefs.filter(p => p !== pref)
      : [...currentPrefs, pref];
    
    setFormData({ ...formData, learning_preferences: newPrefs });
  };

  const toggleInterest = (interest) => {
    const currentInterests = formData.interests || [];
    const newInterests = currentInterests.includes(interest)
      ? currentInterests.filter(i => i !== interest)
      : [...currentInterests, interest];
    
    setFormData({ ...formData, interests: newInterests });
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
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label className="mb-3 block">Learning Preferences (Select all that apply)</Label>
            <div className="grid grid-cols-2 gap-3">
              {['Visual', 'Reading', 'Hands-on', 'Mixed'].map(pref => {
                const isSelected = formData.learning_preferences.includes(pref);
                return (
                  <div 
                    key={pref}
                    className={`flex items-center space-x-2 p-3 border-2 rounded-lg hover:bg-gray-50 transition-all ${
                      isSelected
                        ? 'border-blue-500 bg-blue-50' 
                        : 'border-gray-200'
                    }`}
                  >
                    <Checkbox
                      checked={isSelected}
                      onCheckedChange={() => togglePreference(pref)}
                    />
                    <Label className="text-sm flex-1 cursor-pointer" onClick={() => togglePreference(pref)}>{pref}</Label>
                  </div>
                );
              })}
            </div>
          </div>

          <div>
            <Label className="mb-3 block">Interests (Select all that apply)</Label>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {['Sports', 'Art', 'Music', 'Building', 'Technology', 'Writing', 'Science', 'Reading'].map(interest => {
                const isSelected = formData.interests.includes(interest);
                return (
                  <div 
                    key={interest}
                    className={`flex items-center space-x-2 p-3 border-2 rounded-lg hover:bg-gray-50 transition-all ${
                      isSelected
                        ? 'border-blue-500 bg-blue-50' 
                        : 'border-gray-200'
                    }`}
                  >
                    <Checkbox
                      checked={isSelected}
                      onCheckedChange={() => toggleInterest(interest)}
                    />
                    <Label className="text-sm flex-1 cursor-pointer" onClick={() => toggleInterest(interest)}>{interest}</Label>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="border-t pt-6 mt-6">
            <h3 className="text-lg font-semibold mb-4 text-purple-700">Parent/Guardian Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="md:col-span-2">
                <Label>Parent/Guardian Full Name *</Label>
                <Input
                  value={formData.parent_full_name}
                  onChange={(e) => setFormData({ ...formData, parent_full_name: e.target.value })}
                  placeholder="John Smith"
                  required
                />
              </div>
              <div>
                <Label>Parent/Guardian Email *</Label>
                <Input
                  type="email"
                  value={formData.parent_email}
                  onChange={(e) => setFormData({ ...formData, parent_email: e.target.value })}
                  placeholder="parent@example.com"
                  required
                />
              </div>
              <div>
                <Label>Parent/Guardian Phone (Optional)</Label>
                <Input
                  type="tel"
                  value={formData.parent_phone}
                  onChange={(e) => setFormData({ ...formData, parent_phone: e.target.value })}
                  placeholder="(555) 123-4567"
                />
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