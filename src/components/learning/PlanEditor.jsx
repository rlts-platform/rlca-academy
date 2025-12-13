import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Edit, Plus, Trash2, Save } from "lucide-react";
import { motion } from "framer-motion";

export default function PlanEditor({ learningPlan, onSave }) {
  const [isEditing, setIsEditing] = useState(false);
  const [editedPlan, setEditedPlan] = useState(learningPlan);
  const [editingWeek, setEditingWeek] = useState(null);

  const handleSave = () => {
    onSave(editedPlan);
    setIsEditing(false);
  };

  const updateFocusArea = (index, field, value) => {
    const updated = [...editedPlan.recommended_focus_areas];
    updated[index] = { ...updated[index], [field]: value };
    setEditedPlan({ ...editedPlan, recommended_focus_areas: updated });
  };

  const removeFocusArea = (index) => {
    const updated = editedPlan.recommended_focus_areas.filter((_, i) => i !== index);
    setEditedPlan({ ...editedPlan, recommended_focus_areas: updated });
  };

  const addFocusArea = () => {
    const newArea = {
      subject: '',
      topic: '',
      priority: 'Medium',
      reason: '',
      estimated_weeks: 2
    };
    setEditedPlan({
      ...editedPlan,
      recommended_focus_areas: [...(editedPlan.recommended_focus_areas || []), newArea]
    });
  };

  const updateWeekPlan = (index, field, value) => {
    const updated = [...editedPlan.lesson_path];
    updated[index] = { ...updated[index], [field]: value };
    setEditedPlan({ ...editedPlan, lesson_path: updated });
  };

  return (
    <Card className="shadow-lg">
      <CardHeader className="border-b bg-gradient-to-r from-purple-50 to-blue-50">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-purple-900">
            <Edit className="w-6 h-6" />
            Customize Your Learning Plan
          </CardTitle>
          {!isEditing ? (
            <Button onClick={() => setIsEditing(true)} variant="outline">
              <Edit className="w-4 h-4 mr-2" />
              Edit Plan
            </Button>
          ) : (
            <div className="flex gap-2">
              <Button onClick={handleSave} className="bg-green-600 hover:bg-green-700">
                <Save className="w-4 h-4 mr-2" />
                Save Changes
              </Button>
              <Button onClick={() => {
                setEditedPlan(learningPlan);
                setIsEditing(false);
              }} variant="outline">
                Cancel
              </Button>
            </div>
          )}
        </div>
      </CardHeader>
      <CardContent className="p-6">
        {!isEditing ? (
          <div className="text-center py-8 text-gray-500">
            <Edit className="w-12 h-12 mx-auto mb-3 text-gray-300" />
            <p>Click "Edit Plan" to customize focus areas, lesson schedules, and milestones</p>
          </div>
        ) : (
          <div className="space-y-8">
            {/* Edit Parent Goals */}
            <div>
              <Label className="text-base font-semibold mb-2">Learning Goals & Priorities</Label>
              <Textarea
                value={editedPlan.parent_goals || ''}
                onChange={(e) => setEditedPlan({ ...editedPlan, parent_goals: e.target.value })}
                rows={4}
                placeholder="What are your goals for this learning plan?"
              />
            </div>

            {/* Edit Focus Areas */}
            <div>
              <div className="flex items-center justify-between mb-4">
                <Label className="text-base font-semibold">Focus Areas</Label>
                <Button onClick={addFocusArea} size="sm" variant="outline">
                  <Plus className="w-4 h-4 mr-1" />
                  Add Focus Area
                </Button>
              </div>
              
              <div className="space-y-4">
                {editedPlan.recommended_focus_areas?.map((area, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="p-4 bg-gray-50 rounded-lg border space-y-3"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-semibold text-gray-700">Focus Area {index + 1}</span>
                      <Button
                        onClick={() => removeFocusArea(index)}
                        size="sm"
                        variant="ghost"
                        className="text-red-600 hover:text-red-700 hover:bg-red-50"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <Label className="text-xs">Subject</Label>
                        <Input
                          value={area.subject}
                          onChange={(e) => updateFocusArea(index, 'subject', e.target.value)}
                          placeholder="e.g., Mathematics"
                        />
                      </div>
                      <div>
                        <Label className="text-xs">Priority</Label>
                        <Select
                          value={area.priority}
                          onValueChange={(v) => updateFocusArea(index, 'priority', v)}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="High">High</SelectItem>
                            <SelectItem value="Medium">Medium</SelectItem>
                            <SelectItem value="Low">Low</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <div>
                      <Label className="text-xs">Topic</Label>
                      <Input
                        value={area.topic}
                        onChange={(e) => updateFocusArea(index, 'topic', e.target.value)}
                        placeholder="e.g., Fractions and Decimals"
                      />
                    </div>

                    <div>
                      <Label className="text-xs">Reason</Label>
                      <Textarea
                        value={area.reason}
                        onChange={(e) => updateFocusArea(index, 'reason', e.target.value)}
                        rows={2}
                        placeholder="Why is this important?"
                      />
                    </div>

                    <div>
                      <Label className="text-xs">Estimated Weeks</Label>
                      <Input
                        type="number"
                        value={area.estimated_weeks}
                        onChange={(e) => updateFocusArea(index, 'estimated_weeks', parseInt(e.target.value))}
                        min={1}
                        max={12}
                      />
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>

            {/* Edit Lesson Path */}
            <div>
              <Label className="text-base font-semibold mb-4">Weekly Lesson Plan</Label>
              <div className="space-y-3">
                {editedPlan.lesson_path?.slice(0, 4).map((week, index) => (
                  <Dialog key={index}>
                    <DialogTrigger asChild>
                      <div className="p-4 bg-white rounded-lg border hover:border-purple-300 cursor-pointer transition-all">
                        <div className="flex items-center justify-between">
                          <div>
                            <div className="font-semibold text-gray-900">Week {week.week} - {week.subject}</div>
                            <div className="text-sm text-gray-600">{week.topics?.join(', ')}</div>
                          </div>
                          <Edit className="w-4 h-4 text-purple-600" />
                        </div>
                      </div>
                    </DialogTrigger>
                    <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
                      <DialogHeader>
                        <DialogTitle>Edit Week {week.week}</DialogTitle>
                      </DialogHeader>
                      <div className="space-y-4 mt-4">
                        <div>
                          <Label>Subject</Label>
                          <Input
                            value={week.subject}
                            onChange={(e) => updateWeekPlan(index, 'subject', e.target.value)}
                          />
                        </div>
                        <div>
                          <Label>Topics (comma-separated)</Label>
                          <Input
                            value={week.topics?.join(', ') || ''}
                            onChange={(e) => updateWeekPlan(index, 'topics', e.target.value.split(',').map(t => t.trim()))}
                          />
                        </div>
                        <div>
                          <Label>Learning Objectives (comma-separated)</Label>
                          <Textarea
                            value={week.learning_objectives?.join(', ') || ''}
                            onChange={(e) => updateWeekPlan(index, 'learning_objectives', e.target.value.split(',').map(t => t.trim()))}
                            rows={3}
                          />
                        </div>
                      </div>
                    </DialogContent>
                  </Dialog>
                ))}
                <div className="text-xs text-gray-500 text-center">
                  Showing first 4 weeks. All weeks can be edited after saving.
                </div>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}