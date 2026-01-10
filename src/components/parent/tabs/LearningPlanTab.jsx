import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Brain, Settings, Save, AlertCircle } from 'lucide-react';
import { toast } from 'react-hot-toast';

export default function LearningPlanTab({ student }) {
  const queryClient = useQueryClient();
  const [currentUser, setCurrentUser] = React.useState(null);

  React.useEffect(() => {
    loadUser();
  }, []);

  const loadUser = async () => {
    const user = await base44.auth.me();
    setCurrentUser(user);
  };

  const { data: learningPlans = [] } = useQuery({
    queryKey: ['learning-plans', student.id],
    queryFn: () => base44.entities.LearningPlan.filter({ student_id: student.id }, '-created_date')
  });

  const { data: preferences = [] } = useQuery({
    queryKey: ['parent-prefs', currentUser?.email, student.id],
    queryFn: () => currentUser ? base44.entities.ParentPreferences.filter({ 
      parent_email: currentUser.email,
      student_id: student.id 
    }) : [],
    enabled: !!currentUser
  });

  const [localPrefs, setLocalPrefs] = useState({
    learning_pace: preferences[0]?.learning_pace || "Standard",
    daily_time_limit: preferences[0]?.daily_time_limit || 120,
    notifications_enabled: preferences[0]?.notifications_enabled ?? true
  });

  const savePreferencesMutation = useMutation({
    mutationFn: async (prefsData) => {
      if (preferences.length > 0) {
        return base44.entities.ParentPreferences.update(preferences[0].id, prefsData);
      } else {
        return base44.entities.ParentPreferences.create({
          parent_email: currentUser.email,
          student_id: student.id,
          student_name: student.full_name,
          ...prefsData
        });
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['parent-prefs'] });
      toast.success('Preferences saved successfully!');
    }
  });

  const handleSavePreferences = () => {
    savePreferencesMutation.mutate(localPrefs);
  };

  const activePlan = learningPlans.find(plan => plan.status === "Active") || learningPlans[0];

  return (
    <div className="space-y-6">
      <Card className="border-2 border-blue-200 bg-blue-50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-blue-900">
            <AlertCircle className="w-5 h-5" />
            Parent Control Notice
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-blue-800 text-sm">
            You can adjust learning pace, time limits, and preferences. You cannot edit lesson content or override grades.
          </p>
        </CardContent>
      </Card>

      {activePlan && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Brain className="w-5 h-5 text-purple-600" />
              Current AI Learning Plan
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Plan Status</span>
                <Badge className="bg-green-100 text-green-800">{activePlan.status}</Badge>
              </div>
              <div>
                <h4 className="font-semibold text-gray-900 mb-2">AI Analysis</h4>
                <p className="text-sm text-gray-700 whitespace-pre-wrap">{activePlan.ai_analysis}</p>
              </div>
              {activePlan.parent_goals && (
                <div>
                  <h4 className="font-semibold text-gray-900 mb-2">Parent Goals</h4>
                  <p className="text-sm text-gray-700 whitespace-pre-wrap">{activePlan.parent_goals}</p>
                </div>
              )}
              <div>
                <h4 className="font-semibold text-gray-900 mb-2">Focus Areas</h4>
                <div className="flex flex-wrap gap-2">
                  {activePlan.recommended_focus_areas?.map((area, idx) => (
                    <Badge key={idx} variant="outline">{area}</Badge>
                  ))}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="w-5 h-5 text-purple-600" />
            Customize Learning Preferences
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label>Learning Pace</Label>
            <Select 
              value={localPrefs.learning_pace} 
              onValueChange={(v) => setLocalPrefs({...localPrefs, learning_pace: v})}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Slow">Slow & Steady</SelectItem>
                <SelectItem value="Standard">Standard Pace</SelectItem>
                <SelectItem value="Accelerated">Accelerated</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label>Daily Time Limit (minutes)</Label>
            <Input 
              type="number" 
              value={localPrefs.daily_time_limit}
              onChange={(e) => setLocalPrefs({...localPrefs, daily_time_limit: parseInt(e.target.value)})}
              min="30"
              max="480"
            />
            <p className="text-xs text-gray-500 mt-1">
              Recommended: 90-180 minutes for {student.grade_level}
            </p>
          </div>

          <div className="flex items-center justify-between">
            <Label>Enable Notifications</Label>
            <Button
              variant={localPrefs.notifications_enabled ? "default" : "outline"}
              size="sm"
              onClick={() => setLocalPrefs({...localPrefs, notifications_enabled: !localPrefs.notifications_enabled})}
            >
              {localPrefs.notifications_enabled ? "Enabled" : "Disabled"}
            </Button>
          </div>

          <Button 
            onClick={handleSavePreferences}
            className="w-full bg-gradient-to-r from-purple-600 to-blue-600 gap-2"
            disabled={savePreferencesMutation.isLoading}
          >
            <Save className="w-4 h-4" />
            {savePreferencesMutation.isLoading ? "Saving..." : "Save Preferences"}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}