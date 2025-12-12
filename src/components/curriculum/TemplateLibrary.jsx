import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { BookTemplate, Plus, Search, Star, Users } from "lucide-react";

export default function TemplateLibrary({ onSelectTemplate, currentSubject, onCreateNew }) {
  const [searchTerm, setSearchTerm] = useState('');
  const queryClient = useQueryClient();

  const { data: templates = [] } = useQuery({
    queryKey: ['lesson-templates'],
    queryFn: () => base44.entities.LessonTemplate.list('-times_used')
  });

  const useTemplateMutation = useMutation({
    mutationFn: async (templateId) => {
      const template = templates.find(t => t.id === templateId);
      await base44.entities.LessonTemplate.update(templateId, {
        times_used: (template.times_used || 0) + 1
      });
      return template;
    },
    onSuccess: (template) => {
      queryClient.invalidateQueries({ queryKey: ['lesson-templates'] });
      onSelectTemplate(template);
    }
  });

  const filteredTemplates = templates.filter(t =>
    (t.template_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    t.description?.toLowerCase().includes(searchTerm.toLowerCase())) &&
    (!currentSubject || t.subject === currentSubject || t.subject === 'All')
  );

  return (
    <Card className="shadow-xl">
      <CardHeader className="border-b bg-gradient-to-r from-blue-50 to-purple-50">
        <CardTitle className="flex items-center gap-2">
          <BookTemplate className="w-6 h-6 text-blue-600" />
          Lesson Template Library
        </CardTitle>
      </CardHeader>
      <CardContent className="p-6 space-y-4">
        <div className="flex gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <Input
              placeholder="Search templates..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9"
            />
          </div>
          <Button onClick={onCreateNew} className="bg-gradient-to-r from-purple-600 to-blue-600">
            <Plus className="w-4 h-4 mr-2" />
            Save Current as Template
          </Button>
        </div>

        <div className="space-y-3 max-h-96 overflow-y-auto">
          {filteredTemplates.length === 0 ? (
            <div className="text-center py-8">
              <BookTemplate className="w-12 h-12 text-gray-300 mx-auto mb-2" />
              <p className="text-sm text-gray-600">No templates found</p>
            </div>
          ) : (
            filteredTemplates.map(template => (
              <Card key={template.id} className="hover:shadow-md transition-shadow cursor-pointer">
                <CardContent className="p-4">
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className="font-semibold text-gray-900">{template.template_name}</h4>
                        {template.is_public && (
                          <Badge variant="outline" className="text-xs">
                            <Users className="w-3 h-3 mr-1" />
                            Public
                          </Badge>
                        )}
                      </div>
                      <p className="text-sm text-gray-600 mb-2">{template.description}</p>
                      <div className="flex items-center gap-3 text-xs text-gray-500">
                        <span className="flex items-center gap-1">
                          <Star className="w-3 h-3" />
                          Used {template.times_used || 0} times
                        </span>
                        <Badge className="text-xs">{template.subject}</Badge>
                        {template.grade_levels?.length > 0 && (
                          <span>{template.grade_levels.join(', ')}</span>
                        )}
                      </div>
                    </div>
                    <Button
                      size="sm"
                      onClick={() => useTemplateMutation.mutate(template.id)}
                      className="ml-3"
                    >
                      Use Template
                    </Button>
                  </div>
                  {template.tags?.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-2">
                      {template.tags.map((tag, i) => (
                        <Badge key={i} variant="outline" className="text-xs">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  );
}