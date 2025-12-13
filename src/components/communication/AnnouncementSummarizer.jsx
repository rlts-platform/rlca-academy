import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Megaphone, Sparkles, Loader2, Calendar } from "lucide-react";
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { motion } from "framer-motion";

export default function AnnouncementSummarizer({ studentGradeLevel }) {
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(false);

  const { data: announcements = [] } = useQuery({
    queryKey: ['announcements-recent'],
    queryFn: () => base44.entities.Announcement.list('-created_date', 10)
  });

  const generateSummary = async () => {
    if (announcements.length === 0) {
      alert('No announcements to summarize');
      return;
    }

    setLoading(true);
    
    try {
      const recentAnnouncements = announcements.slice(0, 5);
      
      const prompt = `You are an AI assistant helping a parent understand recent school announcements and activities.

RECENT ANNOUNCEMENTS:
${recentAnnouncements.map((a, i) => `
${i + 1}. ${a.title}
   Posted: ${a.posted_date}
   Category: ${a.category}
   Content: ${a.content}
   Priority: ${a.priority}
`).join('\n')}

STUDENT GRADE LEVEL: ${studentGradeLevel}

TASK:
Create a parent-friendly summary of these announcements. Include:
1. A brief overview highlighting the most important points
2. Key dates and deadlines parents should note
3. Any action items that require parent attention
4. Information particularly relevant to ${studentGradeLevel} students
5. A helpful prioritized list of what parents should focus on

Keep the summary clear, concise, and action-oriented.`;

      const result = await base44.integrations.Core.InvokeLLM({
        prompt,
        response_json_schema: {
          type: "object",
          properties: {
            overview: { type: "string" },
            key_dates: { type: "array", items: { type: "string" } },
            action_items: { type: "array", items: { type: "string" } },
            grade_specific_info: { type: "string" },
            priorities: { type: "array", items: { 
              type: "object",
              properties: {
                item: { type: "string" },
                urgency: { type: "string" }
              }
            }}
          }
        }
      });

      setSummary(result);
    } catch (error) {
      console.error('Error generating summary:', error);
      alert('Failed to generate summary');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (announcements.length > 0 && !summary) {
      generateSummary();
    }
  }, [announcements]);

  return (
    <Card className="shadow-lg">
      <CardHeader className="border-b bg-gradient-to-r from-amber-50 to-orange-50">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-amber-900">
            <Megaphone className="w-6 h-6" />
            Announcements Summary
          </CardTitle>
          <Button 
            onClick={generateSummary} 
            disabled={loading || announcements.length === 0}
            variant="outline"
            size="sm"
          >
            {loading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Sparkles className="w-4 h-4" />
            )}
          </Button>
        </div>
      </CardHeader>
      <CardContent className="p-6">
        {announcements.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <Megaphone className="w-12 h-12 mx-auto mb-3 text-gray-300" />
            <p>No recent announcements</p>
          </div>
        ) : loading ? (
          <div className="text-center py-12">
            <Loader2 className="w-12 h-12 animate-spin mx-auto mb-4 text-amber-600" />
            <p className="text-gray-600">Analyzing announcements...</p>
          </div>
        ) : summary ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="space-y-6"
          >
            <div className="p-4 bg-amber-50 rounded-lg border border-amber-200">
              <h4 className="font-semibold text-amber-900 mb-2">📋 Overview</h4>
              <p className="text-gray-700">{summary.overview}</p>
            </div>

            {summary.key_dates && summary.key_dates.length > 0 && (
              <div>
                <h4 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                  <Calendar className="w-5 h-5 text-blue-600" />
                  Important Dates
                </h4>
                <div className="space-y-2">
                  {summary.key_dates.map((date, i) => (
                    <div key={i} className="p-3 bg-blue-50 rounded-lg border border-blue-200 text-sm text-gray-700">
                      {date}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {summary.action_items && summary.action_items.length > 0 && (
              <div>
                <h4 className="font-semibold text-gray-900 mb-3">✅ Action Items</h4>
                <ul className="space-y-2">
                  {summary.action_items.map((item, i) => (
                    <li key={i} className="flex gap-2 text-gray-700">
                      <span className="text-green-600 font-bold">→</span>
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {summary.grade_specific_info && (
              <div className="p-4 bg-purple-50 rounded-lg border border-purple-200">
                <h4 className="font-semibold text-purple-900 mb-2">
                  📚 {studentGradeLevel} Specific Information
                </h4>
                <p className="text-gray-700">{summary.grade_specific_info}</p>
              </div>
            )}

            {summary.priorities && summary.priorities.length > 0 && (
              <div>
                <h4 className="font-semibold text-gray-900 mb-3">🎯 Priority List</h4>
                <div className="space-y-2">
                  {summary.priorities.map((priority, i) => (
                    <div key={i} className="flex items-center gap-3 p-3 bg-white rounded-lg border">
                      <Badge variant={
                        priority.urgency === 'High' ? 'destructive' :
                        priority.urgency === 'Medium' ? 'default' :
                        'outline'
                      }>
                        {priority.urgency}
                      </Badge>
                      <span className="text-gray-700">{priority.item}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="pt-4 border-t">
              <p className="text-xs text-gray-500 text-center">
                Showing summary of {announcements.length} recent announcements
              </p>
            </div>
          </motion.div>
        ) : null}
      </CardContent>
    </Card>
  );
}