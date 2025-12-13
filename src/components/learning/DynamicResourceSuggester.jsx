import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Sparkles, Loader2, ExternalLink, Video, FileText, BookOpen, Gamepad2, RefreshCw } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { base44 } from '@/api/base44Client';

export default function DynamicResourceSuggester({ learningPlan, grades, milestones }) {
  const [resources, setResources] = useState([]);
  const [loading, setLoading] = useState(false);
  const [lastGenerated, setLastGenerated] = useState(null);

  const getResourceIcon = (type) => {
    const icons = {
      'Video': Video,
      'Article': FileText,
      'Interactive': Gamepad2,
      'Book': BookOpen,
      'Worksheet': FileText,
      'Game': Gamepad2
    };
    return icons[type] || FileText;
  };

  const analyzeWeaknesses = () => {
    if (!grades || grades.length === 0) return [];

    const subjectPerformance = {};
    grades.forEach(g => {
      if (!subjectPerformance[g.subject]) {
        subjectPerformance[g.subject] = { total: 0, count: 0, grades: [] };
      }
      const percentage = (g.score / (g.max_score || 100)) * 100;
      subjectPerformance[g.subject].total += percentage;
      subjectPerformance[g.subject].count += 1;
      subjectPerformance[g.subject].grades.push(percentage);
    });

    return Object.entries(subjectPerformance)
      .map(([subject, data]) => ({
        subject,
        average: data.total / data.count,
        trend: data.grades.length >= 2 
          ? data.grades[data.grades.length - 1] - data.grades[data.grades.length - 2]
          : 0
      }))
      .filter(item => item.average < 80 || item.trend < -5)
      .sort((a, b) => a.average - b.average);
  };

  const generateResources = async () => {
    setLoading(true);
    
    try {
      const weaknesses = analyzeWeaknesses();
      const incompleteMilestones = milestones?.filter(m => !m.completed) || [];
      
      const prompt = `As an educational resource specialist, suggest 8-10 high-quality learning resources for a ${learningPlan.grade_level} student.

CURRENT LEARNING PLAN FOCUS:
${learningPlan.recommended_focus_areas?.slice(0, 3).map(fa => `- ${fa.topic} (${fa.priority} priority)`).join('\n')}

IDENTIFIED WEAKNESSES:
${weaknesses.length > 0 ? weaknesses.map(w => `- ${w.subject}: ${Math.round(w.average)}% average`).join('\n') : 'No specific weaknesses identified'}

UPCOMING MILESTONES:
${incompleteMilestones.slice(0, 3).map(m => `- ${m.title}`).join('\n')}

REQUIREMENTS:
- Prioritize resources for the weakest subjects and upcoming milestones
- Mix of videos, interactive exercises, articles, and practice worksheets
- Age-appropriate for ${learningPlan.grade_level}
- Include specific, real resources (Khan Academy, YouTube channels, educational websites)
- Each resource should have a clear learning goal

Provide diverse, engaging resources that will help this student improve.`;

      const result = await base44.integrations.Core.InvokeLLM({
        prompt,
        response_json_schema: {
          type: "object",
          properties: {
            resources: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  title: { type: "string" },
                  type: { type: "string" },
                  subject: { type: "string" },
                  description: { type: "string" },
                  reason: { type: "string" },
                  url: { type: "string" }
                }
              }
            }
          }
        }
      });

      setResources(result.resources);
      setLastGenerated(new Date());
    } catch (error) {
      console.error('Error generating resources:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="shadow-lg">
      <CardHeader className="border-b bg-gradient-to-r from-pink-50 to-purple-50">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-pink-900">
            <Sparkles className="w-6 h-6" />
            AI-Suggested Resources
          </CardTitle>
          <Button
            onClick={generateResources}
            disabled={loading}
            size="sm"
            className="bg-pink-600 hover:bg-pink-700"
          >
            {loading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <RefreshCw className="w-4 h-4" />
            )}
            {loading ? 'Generating...' : resources.length > 0 ? 'Refresh' : 'Generate'}
          </Button>
        </div>
      </CardHeader>
      <CardContent className="p-6">
        {resources.length === 0 && !loading && (
          <div className="text-center py-12">
            <Sparkles className="w-16 h-16 mx-auto mb-4 text-pink-300" />
            <p className="text-gray-600 mb-4">
              Get personalized resource recommendations based on your progress and areas for improvement
            </p>
            <Button onClick={generateResources} className="bg-gradient-to-r from-pink-600 to-purple-600">
              <Sparkles className="w-4 h-4 mr-2" />
              Generate Recommendations
            </Button>
          </div>
        )}

        {loading && (
          <div className="text-center py-12">
            <Loader2 className="w-12 h-12 animate-spin mx-auto mb-4 text-pink-600" />
            <p className="text-gray-600">Analyzing progress and finding perfect resources...</p>
          </div>
        )}

        <AnimatePresence>
          {resources.length > 0 && !loading && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="space-y-4"
            >
              {lastGenerated && (
                <div className="text-xs text-gray-500 text-center mb-4">
                  Last updated: {lastGenerated.toLocaleString()}
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {resources.map((resource, index) => {
                  const Icon = getResourceIcon(resource.type);
                  return (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className="p-4 bg-white rounded-lg border-2 border-gray-200 hover:border-pink-300 transition-all group"
                    >
                      <div className="flex items-start gap-3">
                        <div className="flex-shrink-0 w-12 h-12 bg-gradient-to-br from-pink-100 to-purple-100 rounded-lg flex items-center justify-center">
                          <Icon className="w-6 h-6 text-pink-600" />
                        </div>
                        
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-2 mb-1">
                            <h4 className="font-semibold text-gray-900 text-sm line-clamp-1">
                              {resource.title}
                            </h4>
                            <Badge variant="outline" className="text-xs flex-shrink-0">
                              {resource.type}
                            </Badge>
                          </div>
                          
                          <div className="text-xs text-purple-600 font-medium mb-2">
                            {resource.subject}
                          </div>
                          
                          <p className="text-xs text-gray-600 line-clamp-2 mb-2">
                            {resource.description}
                          </p>

                          {resource.reason && (
                            <p className="text-xs text-pink-600 italic mb-2">
                              💡 {resource.reason}
                            </p>
                          )}
                          
                          <a
                            href={resource.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 text-xs text-pink-600 hover:text-pink-700 font-medium group-hover:underline"
                          >
                            View Resource
                            <ExternalLink className="w-3 h-3" />
                          </a>
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </CardContent>
    </Card>
  );
}