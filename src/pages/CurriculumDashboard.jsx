import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BookOpen, Plus, Search, Sparkles, Target, BookTemplate } from "lucide-react";
import { motion } from "framer-motion";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

import SubjectCard from '../components/curriculum/SubjectCard';
import AIGenerationModal from '../components/curriculum/AIGenerationModal';
import TemplateLibrary from '../components/curriculum/TemplateLibrary';

export default function CurriculumDashboard() {
  const [searchTerm, setSearchTerm] = useState("");
  const [showAIModal, setShowAIModal] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const queryClient = useQueryClient();

  const { data: subjects = [] } = useQuery({
    queryKey: ['subjects'],
    queryFn: () => base44.entities.Subject.list()
  });

  const { data: projects = [] } = useQuery({
    queryKey: ['projects'],
    queryFn: () => base44.entities.ProjectModule.list()
  });

  const createSubjectMutation = useMutation({
    mutationFn: (data) => base44.entities.Subject.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['subjects'] });
    }
  });

  const deleteSubjectMutation = useMutation({
    mutationFn: (id) => base44.entities.Subject.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['subjects'] });
    }
  });

  const handleAIGenerate = async ({ prompt, gradeLevel, subject }) => {
    setIsGenerating(true);
    
    try {
      const aiPrompt = `You are an expert curriculum designer. Create a comprehensive curriculum structure for:

Grade Level: ${gradeLevel}
Subject: ${subject}
Requirements: ${prompt}

Generate a complete curriculum with:
1. Overall subject structure with 6-8 major units
2. Each unit should have:
   - Title
   - Description (2-3 sentences)
   - 3-5 learning objectives
   - 4-6 lessons with titles and summaries
   - Estimated duration in weeks

Format the response as a structured curriculum plan.`;

      const result = await base44.integrations.Core.InvokeLLM({
        prompt: aiPrompt,
        response_json_schema: {
          type: "object",
          properties: {
            subject_name: { type: "string" },
            description: { type: "string" },
            units: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  title: { type: "string" },
                  description: { type: "string" },
                  learning_objectives: { type: "array", items: { type: "string" } },
                  estimated_duration_weeks: { type: "number" },
                  lessons: {
                    type: "array",
                    items: {
                      type: "object",
                      properties: {
                        title: { type: "string" },
                        summary: { type: "string" }
                      }
                    }
                  }
                }
              }
            }
          }
        }
      });

      // Create subject
      const newSubject = await base44.entities.Subject.create({
        name: result.subject_name,
        description: result.description,
        grade_levels: [gradeLevel],
        status: "Draft",
        total_units: result.units.length,
        color: "bg-purple-500"
      });

      // Create units and lessons
      for (let i = 0; i < result.units.length; i++) {
        const unitData = result.units[i];
        const newUnit = await base44.entities.Unit.create({
          subject_id: newSubject.id,
          subject_name: newSubject.name,
          grade_level: gradeLevel,
          title: unitData.title,
          description: unitData.description,
          learning_objectives: unitData.learning_objectives,
          estimated_duration_weeks: unitData.estimated_duration_weeks,
          order: i,
          status: "Draft",
          total_lessons: unitData.lessons.length
        });

        // Create lessons for this unit
        for (let j = 0; j < unitData.lessons.length; j++) {
          const lessonData = unitData.lessons[j];
          await base44.entities.Lesson.create({
            unit_id: newUnit.id,
            unit_title: newUnit.title,
            subject_name: newSubject.name,
            grade_level: gradeLevel,
            title: lessonData.title,
            summary: lessonData.summary,
            order: j,
            status: "Draft"
          });
        }
      }

      queryClient.invalidateQueries({ queryKey: ['subjects'] });
      setShowAIModal(false);
    } catch (error) {
      console.error("AI generation error:", error);
    } finally {
      setIsGenerating(false);
    }
  };

  const filteredSubjects = subjects.filter(s =>
    s.name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 p-6">
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center shadow-xl">
                <BookOpen className="w-9 h-9 text-white" />
              </div>
              <div>
                <h1 className="text-4xl font-bold text-gray-900">Curriculum Builder</h1>
                <p className="text-gray-600 mt-1">Design and manage your course content</p>
              </div>
            </div>
            <div className="flex gap-3">
              <Button
                onClick={() => setShowAIModal(true)}
                className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
              >
                <Sparkles className="w-4 h-4 mr-2" />
                AI Generate
              </Button>
              <Button
                onClick={() => {
                  createSubjectMutation.mutate({
                    name: "New Subject",
                    description: "",
                    grade_levels: ["All"],
                    status: "Draft",
                    total_units: 0
                  });
                }}
              >
                <Plus className="w-4 h-4 mr-2" />
                New Subject
              </Button>
            </div>
          </div>

          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <Input
              placeholder="Search subjects..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 bg-white"
            />
          </div>
        </motion.div>

        <Tabs defaultValue="all">
          <TabsList className="bg-white/80 backdrop-blur-sm shadow-md mb-6">
            <TabsTrigger value="all">All Subjects</TabsTrigger>
            <TabsTrigger value="published">Published</TabsTrigger>
            <TabsTrigger value="draft">Drafts</TabsTrigger>
            <TabsTrigger value="projects">
              <Target className="w-4 h-4 mr-2" />
              Projects
            </TabsTrigger>
            <TabsTrigger value="templates">
              <BookTemplate className="w-4 h-4 mr-2" />
              Templates
            </TabsTrigger>
          </TabsList>

          <TabsContent value="all">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredSubjects.map((subject) => (
                <SubjectCard
                  key={subject.id}
                  subject={subject}
                  onClick={() => window.location.href = `/SubjectView?id=${subject.id}`}
                  onDelete={(id) => deleteSubjectMutation.mutate(id)}
                />
              ))}
            </div>
          </TabsContent>

          <TabsContent value="published">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredSubjects.filter(s => s.status === "Published").map((subject) => (
                <SubjectCard
                  key={subject.id}
                  subject={subject}
                  onClick={() => window.location.href = `/SubjectView?id=${subject.id}`}
                  onDelete={(id) => deleteSubjectMutation.mutate(id)}
                />
              ))}
            </div>
          </TabsContent>

          <TabsContent value="draft">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredSubjects.filter(s => s.status === "Draft").map((subject) => (
                <SubjectCard
                  key={subject.id}
                  subject={subject}
                  onClick={() => window.location.href = `/SubjectView?id=${subject.id}`}
                  onDelete={(id) => deleteSubjectMutation.mutate(id)}
                />
              ))}
            </div>
          </TabsContent>

          <TabsContent value="projects">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {projects.map(project => (
                <Card key={project.id} className="shadow-lg hover:shadow-xl transition-shadow cursor-pointer border-l-4 border-green-500">
                  <CardHeader className="bg-gradient-to-r from-green-50 to-emerald-50">
                    <div className="flex items-center gap-2">
                      <Target className="w-5 h-5 text-green-600" />
                      <CardTitle className="text-lg">{project.title}</CardTitle>
                    </div>
                  </CardHeader>
                  <CardContent className="p-4">
                    <p className="text-sm text-gray-600 mb-3">{project.description}</p>
                    <div className="flex items-center justify-between text-xs text-gray-500">
                      <span>{project.milestones?.length || 0} milestones</span>
                      <span>{project.duration_weeks} weeks</span>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
            {projects.length === 0 && (
              <div className="text-center py-16">
                <Target className="w-20 h-20 text-gray-300 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-900 mb-2">No project modules yet</h3>
                <p className="text-gray-600">Create project-based learning modules from unit pages</p>
              </div>
            )}
          </TabsContent>

          <TabsContent value="templates">
            <TemplateLibrary
              onSelectTemplate={(template) => console.log('Template selected:', template)}
              onCreateNew={() => alert('Save current lesson as template from lesson editor')}
            />
          </TabsContent>
        </Tabs>

        {filteredSubjects.length === 0 && (
          <div className="text-center py-16">
            <BookOpen className="w-20 h-20 text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No subjects yet</h3>
            <p className="text-gray-600 mb-6">Create your first subject or use AI to generate a curriculum</p>
            <Button onClick={() => setShowAIModal(true)} className="bg-gradient-to-r from-purple-600 to-blue-600">
              <Sparkles className="w-4 h-4 mr-2" />
              Generate with AI
            </Button>
          </div>
        )}
      </div>

      <AIGenerationModal
        open={showAIModal}
        onClose={() => setShowAIModal(false)}
        type="curriculum"
        onGenerate={handleAIGenerate}
        isGenerating={isGenerating}
      />
    </div>
  );
}