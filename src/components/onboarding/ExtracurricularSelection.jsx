import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Trash2 } from "lucide-react";

export default function ExtracurricularSelection({ data, onComplete, onBack }) {
  const [formData, setFormData] = useState({
    extracurricular_interests: data.extracurricular_interests || [],
    language_learning: data.language_learning || []
  });

  const extracurriculars = [
    'Sports & Fitness',
    'Art & Design',
    'Music',
    'Coding & Technology',
    'Public Speaking',
    'Creative Writing',
    'Leadership Clubs',
    'Entrepreneurship Projects'
  ];

  const languages = ['Spanish', 'French', 'Hebrew', 'Latin', 'Sign Language'];

  const toggleExtra = (extra) => {
    const interests = formData.extracurricular_interests.includes(extra)
      ? formData.extracurricular_interests.filter(e => e !== extra)
      : [...formData.extracurricular_interests, extra];
    setFormData({ ...formData, extracurricular_interests: interests });
  };

  const addLanguage = () => {
    setFormData({
      ...formData,
      language_learning: [...formData.language_learning, { language: '', level: 'Beginner' }]
    });
  };

  const updateLanguage = (index, field, value) => {
    const updated = [...formData.language_learning];
    updated[index][field] = value;
    setFormData({ ...formData, language_learning: updated });
  };

  const removeLanguage = (index) => {
    const updated = formData.language_learning.filter((_, i) => i !== index);
    setFormData({ ...formData, language_learning: updated });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onComplete(formData);
  };

  return (
    <Card className="shadow-xl">
      <CardHeader className="border-b bg-gradient-to-r from-purple-50 to-blue-50">
        <CardTitle>Interests & Extra-Curricular Activities</CardTitle>
      </CardHeader>
      <CardContent className="p-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <Label className="mb-3 block">Extra-Curricular Interests</Label>
            <p className="text-sm text-gray-600 mb-3">
              These don't affect grade placement but help us enrich the curriculum
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {extracurriculars.map(extra => (
                <div key={extra} className="flex items-center space-x-2">
                  <Checkbox
                    checked={formData.extracurricular_interests.includes(extra)}
                    onCheckedChange={() => toggleExtra(extra)}
                  />
                  <Label className="text-sm cursor-pointer" onClick={() => toggleExtra(extra)}>
                    {extra}
                  </Label>
                </div>
              ))}
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-3">
              <Label>Language Learning (Optional)</Label>
              <Button type="button" size="sm" variant="outline" onClick={addLanguage}>
                <Plus className="w-4 h-4 mr-1" />
                Add Language
              </Button>
            </div>
            <div className="space-y-3">
              {formData.language_learning.map((lang, i) => (
                <div key={i} className="flex gap-3 items-center">
                  <Select
                    value={lang.language}
                    onValueChange={(v) => updateLanguage(i, 'language', v)}
                  >
                    <SelectTrigger className="flex-1">
                      <SelectValue placeholder="Select language" />
                    </SelectTrigger>
                    <SelectContent>
                      {languages.map(l => (
                        <SelectItem key={l} value={l}>{l}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Select
                    value={lang.level}
                    onValueChange={(v) => updateLanguage(i, 'level', v)}
                  >
                    <SelectTrigger className="w-40">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Beginner">Beginner</SelectItem>
                      <SelectItem value="Intermediate">Intermediate</SelectItem>
                      <SelectItem value="Advanced">Advanced</SelectItem>
                    </SelectContent>
                  </Select>
                  <Button
                    type="button"
                    size="sm"
                    variant="ghost"
                    onClick={() => removeLanguage(i)}
                  >
                    <Trash2 className="w-4 h-4 text-red-600" />
                  </Button>
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