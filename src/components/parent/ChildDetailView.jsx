import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ChevronLeft, BookOpen, TrendingUp, Calendar, MessageSquare, Settings, StickyNote } from 'lucide-react';
import AcademicProgressTab from './tabs/AcademicProgressTab';
import AnalyticsTab from './tabs/AnalyticsTab';
import LearningPlanTab from './tabs/LearningPlanTab';
import ParentNotesTab from './tabs/ParentNotesTab';
import SchedulingTab from './tabs/SchedulingTab';
import CommunicationTab from './tabs/CommunicationTab';

export default function ChildDetailView({ student, onBack }) {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="outline" onClick={onBack} className="gap-2">
          <ChevronLeft className="w-4 h-4" />
          Back to Overview
        </Button>
        <div>
          <h2 className="text-3xl font-bold text-gray-900">{student.full_name}</h2>
          <p className="text-gray-600">{student.grade_level} • {student.enrollment_status}</p>
        </div>
      </div>

      <Tabs defaultValue="progress" className="w-full">
        <TabsList className="grid grid-cols-6 w-full">
          <TabsTrigger value="progress" className="gap-2">
            <BookOpen className="w-4 h-4" />
            Progress
          </TabsTrigger>
          <TabsTrigger value="analytics" className="gap-2">
            <TrendingUp className="w-4 h-4" />
            Analytics
          </TabsTrigger>
          <TabsTrigger value="plan" className="gap-2">
            <Settings className="w-4 h-4" />
            Learning Plan
          </TabsTrigger>
          <TabsTrigger value="notes" className="gap-2">
            <StickyNote className="w-4 h-4" />
            Notes
          </TabsTrigger>
          <TabsTrigger value="schedule" className="gap-2">
            <Calendar className="w-4 h-4" />
            Schedule
          </TabsTrigger>
          <TabsTrigger value="communication" className="gap-2">
            <MessageSquare className="w-4 h-4" />
            Messages
          </TabsTrigger>
        </TabsList>

        <TabsContent value="progress">
          <AcademicProgressTab student={student} />
        </TabsContent>

        <TabsContent value="analytics">
          <AnalyticsTab student={student} />
        </TabsContent>

        <TabsContent value="plan">
          <LearningPlanTab student={student} />
        </TabsContent>

        <TabsContent value="notes">
          <ParentNotesTab student={student} />
        </TabsContent>

        <TabsContent value="schedule">
          <SchedulingTab student={student} />
        </TabsContent>

        <TabsContent value="communication">
          <CommunicationTab student={student} />
        </TabsContent>
      </Tabs>
    </div>
  );
}