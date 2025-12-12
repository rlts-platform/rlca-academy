import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Plus, Trash2, Target } from "lucide-react";

export default function ProjectBuilder({ unitId, subjectName, gradeLevel, onSave, onCancel }) {
  const [project, setProject] = useState({
    unit_id: unitId,
    subject_name: subjectName,
    grade_level: gradeLevel,
    title: '',
    description: '',
    learning_objectives: [''],
    duration_weeks: 2,
    milestones: [{ title: '', description: '', due_days: 7, deliverables: [''], assessment_criteria: '' }],
    rubric: [{ criteria: '', description: '', points: 10 }],
    character_integration: '',
    entrepreneurship_connection: '',
    resources: [''],
    status: 'Draft'
  });

  const addItem = (field, defaultValue) => {
    setProject({ ...project, [field]: [...project[field], defaultValue] });
  };

  const updateItem = (field, index, value) => {
    const updated = [...project[field]];
    updated[index] = value;
    setProject({ ...project, [field]: updated });
  };

  const updateMilestone = (index, field, value) => {
    const updated = [...project.milestones];
    updated[index][field] = value;
    setProject({ ...project, milestones: updated });
  };

  const removeItem = (field, index) => {
    const updated = project[field].filter((_, i) => i !== index);
    setProject({ ...project, [field]: updated });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(project);
  };

  return (
    <Card className="shadow-xl">
      <CardHeader className="border-b bg-gradient-to-r from-green-50 to-emerald-50">
        <CardTitle className="flex items-center gap-2">
          <Target className="w-6 h-6 text-green-600" />
          Create Project-Based Learning Module
        </CardTitle>
      </CardHeader>
      <CardContent className="p-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <Label>Project Title *</Label>
            <Input
              value={project.title}
              onChange={(e) => setProject({ ...project, title: e.target.value })}
              placeholder="e.g., Design Your Own Business, Community Garden Project"
              required
            />
          </div>

          <div>
            <Label>Project Description *</Label>
            <Textarea
              value={project.description}
              onChange={(e) => setProject({ ...project, description: e.target.value })}
              placeholder="Describe the project, its purpose, and expected outcomes..."
              rows={3}
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Duration (Weeks)</Label>
              <Input
                type="number"
                value={project.duration_weeks}
                onChange={(e) => setProject({ ...project, duration_weeks: parseInt(e.target.value) })}
                min={1}
              />
            </div>
          </div>

          <div>
            <div className="flex justify-between items-center mb-2">
              <Label>Learning Objectives</Label>
              <Button type="button" size="sm" variant="outline" onClick={() => addItem('learning_objectives', '')}>
                <Plus className="w-3 h-3 mr-1" />
                Add
              </Button>
            </div>
            {project.learning_objectives.map((obj, i) => (
              <div key={i} className="flex gap-2 mb-2">
                <Input
                  value={obj}
                  onChange={(e) => updateItem('learning_objectives', i, e.target.value)}
                  placeholder="Learning objective..."
                />
                {project.learning_objectives.length > 1 && (
                  <Button type="button" size="sm" variant="ghost" onClick={() => removeItem('learning_objectives', i)}>
                    <Trash2 className="w-4 h-4 text-red-600" />
                  </Button>
                )}
              </div>
            ))}
          </div>

          <div>
            <div className="flex justify-between items-center mb-3">
              <Label className="text-lg font-semibold">Project Milestones</Label>
              <Button
                type="button"
                size="sm"
                variant="outline"
                onClick={() => addItem('milestones', { title: '', description: '', due_days: 7, deliverables: [''], assessment_criteria: '' })}
              >
                <Plus className="w-3 h-3 mr-1" />
                Add Milestone
              </Button>
            </div>
            {project.milestones.map((milestone, i) => (
              <Card key={i} className="mb-4 bg-gray-50">
                <CardContent className="p-4 space-y-3">
                  <div className="flex justify-between">
                    <Label className="text-sm font-semibold">Milestone {i + 1}</Label>
                    {project.milestones.length > 1 && (
                      <Button type="button" size="sm" variant="ghost" onClick={() => removeItem('milestones', i)}>
                        <Trash2 className="w-3 h-3 text-red-600" />
                      </Button>
                    )}
                  </div>
                  <Input
                    value={milestone.title}
                    onChange={(e) => updateMilestone(i, 'title', e.target.value)}
                    placeholder="Milestone title..."
                  />
                  <Textarea
                    value={milestone.description}
                    onChange={(e) => updateMilestone(i, 'description', e.target.value)}
                    placeholder="What students need to accomplish..."
                    rows={2}
                  />
                  <Input
                    type="number"
                    value={milestone.due_days}
                    onChange={(e) => updateMilestone(i, 'due_days', parseInt(e.target.value))}
                    placeholder="Days from project start"
                  />
                  <Textarea
                    value={milestone.assessment_criteria}
                    onChange={(e) => updateMilestone(i, 'assessment_criteria', e.target.value)}
                    placeholder="How will this be assessed?"
                    rows={2}
                  />
                </CardContent>
              </Card>
            ))}
          </div>

          <div>
            <Label>Character Integration (Royal Legends Values)</Label>
            <Textarea
              value={project.character_integration}
              onChange={(e) => setProject({ ...project, character_integration: e.target.value })}
              placeholder="How does this project develop integrity, leadership, perseverance, etc.?"
              rows={2}
            />
          </div>

          <div>
            <Label>Entrepreneurship Connection</Label>
            <Textarea
              value={project.entrepreneurship_connection}
              onChange={(e) => setProject({ ...project, entrepreneurship_connection: e.target.value })}
              placeholder="How does this connect to real-world business or problem-solving?"
              rows={2}
            />
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <Button type="button" variant="outline" onClick={onCancel}>Cancel</Button>
            <Button type="submit" className="bg-gradient-to-r from-green-600 to-emerald-600">
              Create Project
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}