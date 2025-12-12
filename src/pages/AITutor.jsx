import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Brain, Send, BookOpen, Target, Lightbulb, Sparkles, Heart } from "lucide-react";
import { motion } from "framer-motion";

export default function AITutor() {
  const [studentProfile, setStudentProfile] = useState(null);
  const [mode, setMode] = useState("Explain");
  const [subject, setSubject] = useState("");
  const [topic, setTopic] = useState("");
  const [currentSession, setCurrentSession] = useState(null);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const queryClient = useQueryClient();

  useEffect(() => {
    loadUserProfile();
  }, []);

  const loadUserProfile = async () => {
    const user = await base44.auth.me();
    const students = await base44.entities.Student.filter({ student_email: user.email });
    if (students && students.length > 0) {
      setStudentProfile(students[0]);
    }
  };

  const modes = [
    { value: "Explain", icon: BookOpen, color: "blue", description: "Get clear explanations" },
    { value: "Practice", icon: Target, color: "green", description: "Work through problems" },
    { value: "Review", icon: Sparkles, color: "purple", description: "Review and reinforce" },
    { value: "Challenge", icon: Lightbulb, color: "orange", description: "Advanced thinking" },
    { value: "Entrepreneurship", icon: Sparkles, color: "gold", description: "Business thinking" },
    { value: "Faith & Character", icon: Heart, color: "red", description: "Biblical reflection" }
  ];

  const startSession = async () => {
    if (!subject || !topic) {
      alert("Please select a subject and enter a topic");
      return;
    }

    const session = await base44.entities.AITutorSession.create({
      student_id: studentProfile.id,
      subject,
      topic,
      mode,
      conversation: []
    });

    setCurrentSession(session);
    setMessages([{
      role: "tutor",
      message: getTutorGreeting(),
      timestamp: new Date().toISOString()
    }]);
  };

  const getTutorGreeting = () => {
    const greetings = {
      "Explain": `Hello! I'm your AI tutor. Let's explore ${topic} in ${subject} together. What would you like to understand better?`,
      "Practice": `Ready to practice ${topic}? I'll guide you through problems step-by-step. Remember: I'm here to help you think, not give direct answers!`,
      "Review": `Let's review ${topic}. I'll help you strengthen your understanding. What would you like to go over?`,
      "Challenge": `Ready for a challenge? Let's dive deep into ${topic} and push your thinking to the next level!`,
      "Entrepreneurship": `Let's think like entrepreneurs! How can we apply ${topic} to real-world business and problem-solving?`,
      "Faith & Character": `Let's reflect on how ${topic} connects to biblical truth, character, and wisdom. What questions do you have?`
    };
    return greetings[mode];
  };

  const sendMessage = async () => {
    if (!input.trim() || loading) return;

    const userMessage = { role: "student", message: input, timestamp: new Date().toISOString() };
    const newMessages = [...messages, userMessage];
    setMessages(newMessages);
    setInput("");
    setLoading(true);

    try {
      const tutorPrompt = `You are an AI tutor at Royal Legends Children Academy, a faith-based homeschool focused on excellence, character, and leadership.

STUDENT INFO:
- Grade Level: ${studentProfile.grade_level}
- Subject: ${subject}
- Topic: ${topic}
- Mode: ${mode}

TUTORING PRINCIPLES:
1. NEVER give direct answers - guide thinking with questions
2. Break complex concepts into simple steps
3. Encourage deep understanding over memorization
4. Connect learning to real-world applications
5. Foster critical thinking, creativity, and problem-solving
6. When relevant, integrate biblical wisdom and character lessons
7. Praise effort, perseverance, and growth mindset
8. Encourage entrepreneurial thinking (how can this solve problems?)
9. Be encouraging but maintain high standards

MODE-SPECIFIC GUIDELINES:
${mode === "Explain" ? "- Explain concepts clearly with examples\n- Check for understanding\n- Use analogies and real-world connections" : ""}
${mode === "Practice" ? "- Give hints, not answers\n- Guide step-by-step\n- Let student work through problems\n- Correct misconceptions gently" : ""}
${mode === "Review" ? "- Reinforce key concepts\n- Identify gaps in understanding\n- Build confidence through mastery" : ""}
${mode === "Challenge" ? "- Ask thought-provoking questions\n- Present complex scenarios\n- Push critical thinking to higher levels" : ""}
${mode === "Entrepreneurship" ? "- Connect to business/real-world problems\n- Discuss innovation, value creation\n- Explore practical applications" : ""}
${mode === "Faith & Character" ? "- Connect to biblical principles\n- Discuss character development\n- Explore wisdom and integrity" : ""}

CONVERSATION HISTORY:
${newMessages.map(m => `${m.role}: ${m.message}`).join('\n')}

Respond as the tutor. Be conversational, encouraging, and focused on guiding the student to discover answers.`;

      const response = await base44.integrations.Core.InvokeLLM({
        prompt: tutorPrompt
      });

      const tutorMessage = { 
        role: "tutor", 
        message: response, 
        timestamp: new Date().toISOString() 
      };
      
      const updatedMessages = [...newMessages, tutorMessage];
      setMessages(updatedMessages);

      await base44.entities.AITutorSession.update(currentSession.id, {
        conversation: updatedMessages
      });
    } catch (error) {
      console.error("Error:", error);
      alert("Failed to get response. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const endSession = () => {
    setCurrentSession(null);
    setMessages([]);
    setSubject("");
    setTopic("");
  };

  if (!studentProfile) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-pink-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-purple-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <div className="text-gray-600">Loading...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-pink-50 p-6">
      <div className="max-w-5xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex items-center gap-4 mb-6">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-purple-500 to-blue-600 flex items-center justify-center shadow-xl">
              <Brain className="w-9 h-9 text-white" />
            </div>
            <div>
              <h1 className="text-4xl font-bold text-gray-900">AI Tutor</h1>
              <p className="text-gray-600 mt-1">Your personal learning companion</p>
            </div>
          </div>
        </motion.div>

        {!currentSession ? (
          <Card className="shadow-xl">
            <CardHeader className="border-b bg-gradient-to-r from-purple-50 to-blue-50">
              <CardTitle>Start a Tutoring Session</CardTitle>
            </CardHeader>
            <CardContent className="p-6 space-y-6">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Learning Mode</label>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {modes.map(m => {
                    const Icon = m.icon;
                    return (
                      <div
                        key={m.value}
                        onClick={() => setMode(m.value)}
                        className={`p-4 rounded-lg border-2 cursor-pointer transition-all ${
                          mode === m.value
                            ? 'border-purple-500 bg-purple-50'
                            : 'border-gray-200 hover:border-purple-300'
                        }`}
                      >
                        <Icon className={`w-6 h-6 text-${m.color}-600 mb-2`} />
                        <div className="font-semibold text-sm mb-1">{m.value}</div>
                        <div className="text-xs text-gray-600">{m.description}</div>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Subject</label>
                <Select value={subject} onValueChange={setSubject}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select subject" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Mathematics">Mathematics</SelectItem>
                    <SelectItem value="English/Language Arts">English/Language Arts</SelectItem>
                    <SelectItem value="Science">Science</SelectItem>
                    <SelectItem value="History">History</SelectItem>
                    <SelectItem value="Biblical Studies">Biblical Studies</SelectItem>
                    <SelectItem value="Entrepreneurship">Entrepreneurship</SelectItem>
                    <SelectItem value="Other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">What do you want to learn?</label>
                <Textarea
                  value={topic}
                  onChange={(e) => setTopic(e.target.value)}
                  placeholder="e.g., Fractions, Photosynthesis, Abraham Lincoln, Stewardship..."
                  rows={3}
                />
              </div>

              <Button
                onClick={startSession}
                disabled={!subject || !topic}
                className="w-full bg-gradient-to-r from-purple-600 to-blue-600"
                size="lg"
              >
                <Brain className="w-5 h-5 mr-2" />
                Start Learning
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            <Card className="shadow-lg">
              <CardHeader className="border-b">
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>{topic}</CardTitle>
                    <div className="flex gap-2 mt-2">
                      <Badge>{subject}</Badge>
                      <Badge variant="outline">{mode}</Badge>
                    </div>
                  </div>
                  <Button variant="outline" onClick={endSession}>End Session</Button>
                </div>
              </CardHeader>
            </Card>

            <Card className="shadow-lg h-[500px] flex flex-col">
              <CardContent className="flex-1 overflow-y-auto p-6 space-y-4">
                {messages.map((msg, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`flex ${msg.role === 'student' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div className={`max-w-[80%] rounded-lg p-4 ${
                      msg.role === 'student'
                        ? 'bg-purple-100 text-purple-900'
                        : 'bg-gray-100 text-gray-900'
                    }`}>
                      <p className="whitespace-pre-wrap">{msg.message}</p>
                    </div>
                  </motion.div>
                ))}
                {loading && (
                  <div className="flex justify-start">
                    <div className="bg-gray-100 rounded-lg p-4">
                      <div className="flex gap-2">
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
              <div className="border-t p-4">
                <div className="flex gap-2">
                  <Textarea
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    placeholder="Ask a question or share your thinking..."
                    rows={2}
                    className="resize-none"
                    onKeyPress={(e) => {
                      if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault();
                        sendMessage();
                      }
                    }}
                  />
                  <Button onClick={sendMessage} disabled={loading || !input.trim()} className="self-end">
                    <Send className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}