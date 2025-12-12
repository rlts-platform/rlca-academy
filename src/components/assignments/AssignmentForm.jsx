import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Plus, Trash2, Sparkles } from "lucide-react";
import { Badge } from "@/components/ui/badge";

export default function AssignmentForm({ assignment, onChange, onAIGenerate }) {
  const [rubricItem, setRubricItem] = useState({ criteria: "", description: "", points: 0 });

  const addRubricItem = () => {
    if (!rubricItem.criteria) return;
    const rubric = [...(assignment.rubric || []), rubricItem];
    onChange({ ...assignment, rubric });
    setRubricItem({ criteria: "", description: "", points: 0 });
  };

  const removeRubricItem = (index) => {
    const rubric = assignment.rubric.filter((_, i) => i !== index);
    onChange({ ...assignment, rubric });
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="border-b bg-gradient-to-r from-purple-50 to-blue-50">
          <div className="flex items-center justify-between">
            <CardTitle>Assignment Details</CardTitle>
            <Button
              variant="outline"
              size="sm"
              onClick={onAIGenerate}
              className="gap-2"
            >
              <Sparkles className="w-4 h-4" />
              AI Generate
            </Button>
          </div>
        </CardHeader>
        <CardContent className="p-6 space-y-4">
          <div>
            <Label>Title</Label>
            <Input
              value={assignment.title || ""}
              onChange={(e) => onChange({ ...assignment, title: e.target.value })}
              placeholder="Assignment title..."
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Subject</Label>
              <Select
                value={assignment.subject}
                onValueChange={(value) => onChange({ ...assignment, subject: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select subject" />
                </SelectTrigger>
                <SelectContent>
                  {["Mathematics", "English/Language Arts", "Science", "History", "Geography", "Bible", "Art", "Music", "Business/Entrepreneurship", "Computer Science", "Life Skills"].map(s => (
                    <SelectItem key={s} value={s}>{s}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>Grade Level</Label>
              <Select
                value={assignment.grade_level}
                onValueChange={(value) => onChange({ ...assignment, grade_level: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select grade" />
                </SelectTrigger>
                <SelectContent>
                  {["Pre-K", "Kindergarten", "1st Grade", "2nd Grade", "3rd Grade", "4th Grade", "5th Grade", "6th Grade", "7th Grade", "8th Grade", "9th Grade", "10th Grade", "11th Grade", "12th Grade"].map(g => (
                    <SelectItem key={g} value={g}>{g}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Assignment Type</Label>
              <Select
                value={assignment.assignment_type}
                onValueChange={(value) => onChange({ ...assignment, assignment_type: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent>
                  {["Written Assignment", "Problem Set", "Project", "Reading Response", "Entrepreneurship Challenge", "Creative Work", "Group Assignment", "Reflection", "Presentation"].map(t => (
                    <SelectItem key={t} value={t}>{t}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>Faith & Character Tag (Optional)</Label>
              <Select
                value={assignment.faith_character_tag || ""}
                onValueChange={(value) => onChange({ ...assignment, faith_character_tag: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select tag" />
                </SelectTrigger>
                <SelectContent>
                  {["Integrity", "Perseverance", "Wisdom", "Courage", "Compassion", "Stewardship", "Excellence", "Leadership", "Creativity", "Service"].map(t => (
                    <SelectItem key={t} value={t}>{t}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div>
            <Label>Description</Label>
            <Textarea
              value={assignment.description || ""}
              onChange={(e) => onChange({ ...assignment, description: e.target.value })}
              placeholder="Brief description..."
              rows={2}
            />
          </div>

          <div>
            <Label>Instructions (Markdown supported)</Label>
            <Textarea
              value={assignment.instructions || ""}
              onChange={(e) => onChange({ ...assignment, instructions: e.target.value })}
              placeholder="Detailed instructions for students..."
              rows={6}
            />
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div>
              <Label>Due Date</Label>
              <Input
                type="date"
                value={assignment.due_date || ""}
                onChange={(e) => onChange({ ...assignment, due_date: e.target.value })}
              />
            </div>

            <div>
              <Label>Points Possible</Label>
              <Input
                type="number"
                value={assignment.points_possible || 100}
                onChange={(e) => onChange({ ...assignment, points_possible: parseInt(e.target.value) })}
              />
            </div>

            <div>
              <Label>Difficulty Level (1-5)</Label>
              <Input
                type="number"
                min="1"
                max="5"
                value={assignment.difficulty_level || 3}
                onChange={(e) => onChange({ ...assignment, difficulty_level: parseInt(e.target.value) })}
              />
            </div>
          </div>

          <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
            <div>
              <Label>Show Rubric to Students</Label>
              <p className="text-xs text-gray-600">Let students see grading criteria</p>
            </div>
            <Switch
              checked={assignment.show_rubric_to_students !== false}
              onCheckedChange={(value) => onChange({ ...assignment, show_rubric_to_students: value })}
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="border-b">
          <CardTitle>Grading Rubric</CardTitle>
        </CardHeader>
        <CardContent className="p-6 space-y-4">
          {assignment.rubric?.map((item, index) => (
            <Card key={index} className="border-2 border-gray-200">
              <CardContent className="p-4">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="font-semibold text-gray-900 mb-1">{item.criteria}</div>
                    <p className="text-sm text-gray-600 mb-2">{item.description}</p>
                    <Badge variant="outline">{item.points} points</Badge>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => removeRubricItem(index)}
                  >
                    <Trash2 className="w-4 h-4 text-red-600" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}

          <Card className="border-2 border-dashed border-purple-300 bg-purple-50">
            <CardContent className="p-4 space-y-3">
              <h4 className="font-semibold">Add Rubric Criteria</h4>
              <Input
                placeholder="Criteria (e.g., Understanding, Effort, Creativity)"
                value={rubricItem.criteria}
                onChange={(e) => setRubricItem({ ...rubricItem, criteria: e.target.value })}
              />
              <Textarea
                placeholder="Description..."
                value={rubricItem.description}
                onChange={(e) => setRubricItem({ ...rubricItem, description: e.target.value })}
                rows={2}
              />
              <Input
                type="number"
                placeholder="Points"
                value={rubricItem.points || ""}
                onChange={(e) => setRubricItem({ ...rubricItem, points: parseInt(e.target.value) })}
              />
              <Button onClick={addRubricItem} className="w-full" size="sm">
                <Plus className="w-4 h-4 mr-2" />
                Add Criteria
              </Button>
            </CardContent>
          </Card>
        </CardContent>
      </Card>
    </div>
  );
}