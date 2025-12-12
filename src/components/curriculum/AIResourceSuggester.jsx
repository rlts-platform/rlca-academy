import React, { useState } from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Sparkles, ExternalLink, Video, FileText, Link as LinkIcon } from "lucide-react";
import { base44 } from '@/api/base44Client';

export default function AIResourceSuggester({ lesson, onAddResources }) {
  const [suggestions, setSuggestions] = useState(null);
  const [loading, setLoading] = useState(false);

  const generateSuggestions = async () => {
    setLoading(true);
    try {
      const prompt = `You are an educational resource curator for Royal Legends Children Academy, a faith-based homeschool focused on excellence, character, and leadership.

LESSON CONTEXT:
Subject: ${lesson.subject_name}
Grade Level: ${lesson.grade_level}
Lesson Title: ${lesson.title}
Summary: ${lesson.summary || 'N/A'}
Learning Objectives: ${lesson.learning_objectives?.join(', ') || 'N/A'}

ROYAL LEGENDS ACADEMY VALUES:
- Biblical truth and character development
- Critical thinking and deep learning
- Creativity and innovation
- Real-world application
- Entrepreneurial mindset
- Excellence in all things

TASK:
Suggest 5-7 supplementary learning resources (videos, articles, interactive tools, external links) that:
1. Align with the lesson content
2. Support Royal Legends Academy values
3. Are age-appropriate for ${lesson.grade_level}
4. Include a mix of media types
5. Are from reputable, faith-friendly sources when possible

For each resource, provide:
- Title
- Type (video, article, interactive, website)
- URL (real, educational URLs only)
- Description (why it's valuable)
- Academy value alignment (which values it supports)`;

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
                  type: { type: "string", enum: ["video", "article", "interactive", "website"] },
                  url: { type: "string" },
                  description: { type: "string" },
                  values_alignment: { type: "array", items: { type: "string" } }
                }
              }
            }
          }
        }
      });

      setSuggestions(result.resources);
    } catch (error) {
      console.error("AI resource suggestion error:", error);
      alert("Failed to generate suggestions. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const getTypeIcon = (type) => {
    switch (type) {
      case 'video': return <Video className="w-4 h-4" />;
      case 'article': return <FileText className="w-4 h-4" />;
      default: return <LinkIcon className="w-4 h-4" />;
    }
  };

  const handleAddResource = (resource) => {
    const existingResources = lesson.resources || [];
    onAddResources([...existingResources, {
      title: resource.title,
      type: resource.type,
      url: resource.url
    }]);
  };

  return (
    <Card className="border-2 border-purple-200 bg-gradient-to-br from-purple-50 to-blue-50">
      <CardContent className="p-4">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-purple-600" />
            <h3 className="font-semibold text-gray-900">AI Resource Suggestions</h3>
          </div>
          {!suggestions && (
            <Button
              onClick={generateSuggestions}
              disabled={loading}
              size="sm"
              className="bg-gradient-to-r from-purple-600 to-blue-600"
            >
              {loading ? 'Generating...' : 'Get Suggestions'}
            </Button>
          )}
        </div>

        {loading && (
          <div className="text-center py-8">
            <div className="w-8 h-8 border-4 border-purple-600 border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
            <p className="text-sm text-gray-600">Finding resources aligned with Royal Legends values...</p>
          </div>
        )}

        {suggestions && (
          <div className="space-y-3">
            {suggestions.map((resource, i) => (
              <Card key={i} className="bg-white shadow-sm hover:shadow-md transition-shadow">
                <CardContent className="p-3">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        {getTypeIcon(resource.type)}
                        <h4 className="font-semibold text-sm text-gray-900">{resource.title}</h4>
                        <Badge variant="outline" className="text-xs">{resource.type}</Badge>
                      </div>
                      <p className="text-xs text-gray-700 mb-2">{resource.description}</p>
                      <div className="flex flex-wrap gap-1">
                        {resource.values_alignment?.map((value, j) => (
                          <Badge key={j} className="text-xs bg-purple-100 text-purple-800">{value}</Badge>
                        ))}
                      </div>
                    </div>
                    <div className="flex flex-col gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => window.open(resource.url, '_blank')}
                      >
                        <ExternalLink className="w-3 h-3" />
                      </Button>
                      <Button
                        size="sm"
                        onClick={() => handleAddResource(resource)}
                        className="bg-green-600 hover:bg-green-700 text-white"
                      >
                        Add
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
            <Button
              variant="outline"
              size="sm"
              onClick={() => setSuggestions(null)}
              className="w-full"
            >
              Generate New Suggestions
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}