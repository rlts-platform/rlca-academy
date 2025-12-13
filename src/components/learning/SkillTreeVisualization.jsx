import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { GitBranch, Lock, CheckCircle, Star, BookOpen } from "lucide-react";
import { motion } from "framer-motion";

export default function SkillTreeVisualization({ grades, student }) {
  const [selectedSubject, setSelectedSubject] = useState(null);

  // Calculate skill levels based on grades
  const calculateSkillTree = () => {
    if (!grades || grades.length === 0) return [];

    const subjectData = {};
    
    grades.forEach(grade => {
      if (!subjectData[grade.subject]) {
        subjectData[grade.subject] = {
          subject: grade.subject,
          grades: [],
          totalScore: 0,
          count: 0,
          skills: []
        };
      }
      
      const percentage = (grade.score / (grade.max_score || 100)) * 100;
      subjectData[grade.subject].grades.push(percentage);
      subjectData[grade.subject].totalScore += percentage;
      subjectData[grade.subject].count += 1;
    });

    return Object.values(subjectData).map(subject => {
      const average = subject.totalScore / subject.count;
      const level = Math.min(5, Math.floor(average / 20) + 1);
      const progress = (average % 20) * 5;
      
      return {
        subject: subject.subject,
        level,
        progress,
        average: Math.round(average),
        masteryLevel: getMasteryLevel(average),
        skills: generateSkillsForSubject(subject.subject, level)
      };
    });
  };

  const getMasteryLevel = (average) => {
    if (average >= 95) return { label: 'Master', color: 'gold' };
    if (average >= 85) return { label: 'Advanced', color: 'purple' };
    if (average >= 75) return { label: 'Proficient', color: 'blue' };
    if (average >= 65) return { label: 'Developing', color: 'green' };
    return { label: 'Beginner', color: 'gray' };
  };

  const generateSkillsForSubject = (subject, level) => {
    const skillMap = {
      'Mathematics': [
        { name: 'Basic Operations', minLevel: 1, icon: '➕' },
        { name: 'Problem Solving', minLevel: 2, icon: '🧮' },
        { name: 'Algebra Fundamentals', minLevel: 3, icon: '📐' },
        { name: 'Advanced Concepts', minLevel: 4, icon: '🔢' },
        { name: 'Mathematical Mastery', minLevel: 5, icon: '🏆' }
      ],
      'English/Language Arts': [
        { name: 'Reading Comprehension', minLevel: 1, icon: '📖' },
        { name: 'Vocabulary Building', minLevel: 2, icon: '📚' },
        { name: 'Writing Skills', minLevel: 3, icon: '✍️' },
        { name: 'Critical Analysis', minLevel: 4, icon: '🔍' },
        { name: 'Literary Excellence', minLevel: 5, icon: '🎓' }
      ],
      'Science': [
        { name: 'Scientific Method', minLevel: 1, icon: '🔬' },
        { name: 'Observation & Inquiry', minLevel: 2, icon: '👁️' },
        { name: 'Experimentation', minLevel: 3, icon: '⚗️' },
        { name: 'Analysis & Synthesis', minLevel: 4, icon: '🧪' },
        { name: 'Scientific Mastery', minLevel: 5, icon: '🌟' }
      ],
      'History': [
        { name: 'Timeline Understanding', minLevel: 1, icon: '📅' },
        { name: 'Historical Analysis', minLevel: 2, icon: '🏛️' },
        { name: 'Context & Connections', minLevel: 3, icon: '🌍' },
        { name: 'Critical Thinking', minLevel: 4, icon: '💭' },
        { name: 'Historical Expertise', minLevel: 5, icon: '👑' }
      ]
    };

    const defaultSkills = [
      { name: 'Foundations', minLevel: 1, icon: '📝' },
      { name: 'Application', minLevel: 2, icon: '💡' },
      { name: 'Analysis', minLevel: 3, icon: '🎯' },
      { name: 'Synthesis', minLevel: 4, icon: '⭐' },
      { name: 'Mastery', minLevel: 5, icon: '🏆' }
    ];

    const skills = skillMap[subject] || defaultSkills;
    return skills.map(skill => ({
      ...skill,
      unlocked: level >= skill.minLevel,
      inProgress: level === skill.minLevel - 1
    }));
  };

  const skillTree = calculateSkillTree();

  const getLevelColor = (level) => {
    const colors = {
      1: 'from-gray-400 to-gray-500',
      2: 'from-green-400 to-green-500',
      3: 'from-blue-400 to-blue-500',
      4: 'from-purple-400 to-purple-500',
      5: 'from-yellow-400 to-yellow-500'
    };
    return colors[level] || colors[1];
  };

  if (skillTree.length === 0) {
    return (
      <Card className="shadow-lg">
        <CardHeader className="border-b bg-gradient-to-r from-indigo-50 to-purple-50">
          <CardTitle className="flex items-center gap-2 text-indigo-900">
            <GitBranch className="w-6 h-6" />
            Skill Tree
          </CardTitle>
        </CardHeader>
        <CardContent className="p-12 text-center">
          <BookOpen className="w-16 h-16 mx-auto mb-4 text-gray-300" />
          <p className="text-gray-500">No skill data yet - grades will unlock your skill tree!</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="shadow-lg">
      <CardHeader className="border-b bg-gradient-to-r from-indigo-50 to-purple-50">
        <CardTitle className="flex items-center gap-2 text-indigo-900">
          <GitBranch className="w-6 h-6" />
          Skill Tree Progress
        </CardTitle>
      </CardHeader>
      <CardContent className="p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {skillTree.map((subject, index) => (
            <motion.div
              key={subject.subject}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: index * 0.1 }}
              className="relative"
            >
              <div 
                className={`p-6 rounded-xl cursor-pointer transition-all ${
                  selectedSubject === subject.subject
                    ? 'ring-4 ring-purple-400 shadow-2xl'
                    : 'hover:shadow-xl'
                } bg-gradient-to-br ${getLevelColor(subject.level)}`}
                onClick={() => setSelectedSubject(selectedSubject === subject.subject ? null : subject.subject)}
              >
                {/* Subject Header */}
                <div className="text-white mb-4">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="text-xl font-bold">{subject.subject}</h3>
                    <Badge className={`bg-white/20 backdrop-blur-sm text-white border-white/30`}>
                      Level {subject.level}
                    </Badge>
                  </div>
                  <div className="text-sm opacity-90">
                    {subject.masteryLevel.label} • {subject.average}% Average
                  </div>
                </div>

                {/* Level Progress Bar */}
                <div className="bg-white/20 backdrop-blur-sm rounded-full h-3 overflow-hidden mb-4">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${subject.progress}%` }}
                    transition={{ duration: 1, delay: index * 0.1 }}
                    className="h-full bg-white"
                  />
                </div>

                {/* Skills Preview */}
                <div className="flex gap-2 flex-wrap">
                  {subject.skills.map((skill, skillIndex) => (
                    <div
                      key={skillIndex}
                      className={`w-10 h-10 rounded-lg flex items-center justify-center text-lg transition-transform hover:scale-110 ${
                        skill.unlocked
                          ? 'bg-white text-gray-900 shadow-md'
                          : skill.inProgress
                          ? 'bg-white/40 text-white'
                          : 'bg-white/20 text-white/50'
                      }`}
                      title={skill.name}
                    >
                      {skill.unlocked ? skill.icon : <Lock className="w-4 h-4" />}
                    </div>
                  ))}
                </div>
              </div>

              {/* Expanded Skills Detail */}
              {selectedSubject === subject.subject && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mt-4 p-4 bg-white rounded-lg border-2 border-purple-200 shadow-lg"
                >
                  <h4 className="font-semibold text-gray-900 mb-3">Skill Breakdown</h4>
                  <div className="space-y-2">
                    {subject.skills.map((skill, skillIndex) => (
                      <div
                        key={skillIndex}
                        className={`flex items-center gap-3 p-3 rounded-lg ${
                          skill.unlocked
                            ? 'bg-green-50 border border-green-200'
                            : skill.inProgress
                            ? 'bg-yellow-50 border border-yellow-200'
                            : 'bg-gray-50 border border-gray-200'
                        }`}
                      >
                        <div className="text-2xl">{skill.unlocked ? skill.icon : '🔒'}</div>
                        <div className="flex-1">
                          <div className={`font-semibold text-sm ${
                            skill.unlocked ? 'text-green-900' : 'text-gray-600'
                          }`}>
                            {skill.name}
                          </div>
                          <div className="text-xs text-gray-500">
                            {skill.unlocked ? 'Unlocked!' : skill.inProgress ? 'In Progress' : `Requires Level ${skill.minLevel}`}
                          </div>
                        </div>
                        {skill.unlocked && <CheckCircle className="w-5 h-5 text-green-600" />}
                      </div>
                    ))}
                  </div>
                </motion.div>
              )}
            </motion.div>
          ))}
        </div>

        {/* Legend */}
        <div className="mt-6 p-4 bg-gray-50 rounded-lg">
          <h4 className="font-semibold text-gray-700 mb-2 text-sm">Skill Tree Legend</h4>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-2 text-xs">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded bg-gradient-to-br from-gray-400 to-gray-500"></div>
              <span>Level 1</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded bg-gradient-to-br from-green-400 to-green-500"></div>
              <span>Level 2</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded bg-gradient-to-br from-blue-400 to-blue-500"></div>
              <span>Level 3</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded bg-gradient-to-br from-purple-400 to-purple-500"></div>
              <span>Level 4</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded bg-gradient-to-br from-yellow-400 to-yellow-500"></div>
              <span>Level 5 🏆</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}