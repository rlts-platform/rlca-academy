import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { MessageSquare, Sparkles, Send, Loader2, RefreshCw } from "lucide-react";
import { base44 } from '@/api/base44Client';
import { motion } from "framer-motion";

export default function AIMessageComposer({ student }) {
  const [topic, setTopic] = useState('');
  const [context, setContext] = useState('');
  const [tone, setTone] = useState('professional');
  const [draftedMessage, setDraftedMessage] = useState('');
  const [loading, setLoading] = useState(false);

  const generateDraft = async () => {
    if (!topic) {
      alert('Please select a message topic');
      return;
    }

    setLoading(true);
    
    try {
      const prompt = `You are helping a parent draft a professional message to their child's teacher.

STUDENT: ${student.full_name} (${student.grade_level})
MESSAGE TOPIC: ${topic}
ADDITIONAL CONTEXT: ${context || 'None provided'}
DESIRED TONE: ${tone}

Write a well-crafted, ${tone} email message to the teacher. The message should:
- Be respectful and professional
- Clearly communicate the parent's concern or question
- Be concise but thorough
- Include an appropriate greeting and closing
- Express appreciation for the teacher's time

The message should be ready to send with minimal editing.`;

      const result = await base44.integrations.Core.InvokeLLM({
        prompt
      });

      setDraftedMessage(result);
    } catch (error) {
      console.error('Error generating draft:', error);
      alert('Failed to generate message draft');
    } finally {
      setLoading(false);
    }
  };

  const sendMessage = async () => {
    if (!draftedMessage) return;

    const confirmed = window.confirm('Send this message to the teacher?');
    if (!confirmed) return;

    try {
      await base44.entities.Message.create({
        sender_email: student.parent_email,
        sender_name: 'Parent',
        recipient_email: student.cohort_id ? 'teacher@example.com' : 'admin@school.com',
        subject: topic,
        message_body: draftedMessage,
        status: 'Sent',
        sent_date: new Date().toISOString().split('T')[0]
      });

      alert('Message sent successfully!');
      setDraftedMessage('');
      setContext('');
      setTopic('');
    } catch (error) {
      console.error('Error sending message:', error);
      alert('Failed to send message');
    }
  };

  return (
    <Card className="shadow-lg">
      <CardHeader className="border-b bg-gradient-to-r from-purple-50 to-pink-50">
        <CardTitle className="flex items-center gap-2 text-purple-900">
          <MessageSquare className="w-6 h-6" />
          AI Message Composer
        </CardTitle>
      </CardHeader>
      <CardContent className="p-6">
        <div className="space-y-4">
          <div>
            <Label>Message Topic</Label>
            <Select value={topic} onValueChange={setTopic}>
              <SelectTrigger>
                <SelectValue placeholder="Select a topic" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Academic Performance">Academic Performance</SelectItem>
                <SelectItem value="Behavioral Concern">Behavioral Concern</SelectItem>
                <SelectItem value="Schedule Change">Schedule Change</SelectItem>
                <SelectItem value="Attendance Issue">Attendance Issue</SelectItem>
                <SelectItem value="Learning Support">Learning Support Request</SelectItem>
                <SelectItem value="Assignment Question">Assignment Question</SelectItem>
                <SelectItem value="General Question">General Question</SelectItem>
                <SelectItem value="Thank You">Thank You Note</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label>Additional Context (Optional)</Label>
            <Textarea
              value={context}
              onChange={(e) => setContext(e.target.value)}
              placeholder="Provide any additional details you'd like to include in the message..."
              rows={3}
            />
          </div>

          <div>
            <Label>Message Tone</Label>
            <Select value={tone} onValueChange={setTone}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="professional">Professional</SelectItem>
                <SelectItem value="friendly">Friendly</SelectItem>
                <SelectItem value="formal">Formal</SelectItem>
                <SelectItem value="concerned">Concerned</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <Button 
            onClick={generateDraft} 
            disabled={loading || !topic}
            className="w-full bg-gradient-to-r from-purple-600 to-pink-600"
          >
            {loading ? (
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            ) : (
              <Sparkles className="w-4 h-4 mr-2" />
            )}
            {loading ? 'Generating Draft...' : 'Generate Message Draft'}
          </Button>

          {draftedMessage && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-3"
            >
              <div className="flex items-center justify-between">
                <Label>Drafted Message</Label>
                <Button 
                  onClick={generateDraft} 
                  variant="outline" 
                  size="sm"
                  disabled={loading}
                >
                  <RefreshCw className="w-3 h-3 mr-1" />
                  Regenerate
                </Button>
              </div>
              
              <Textarea
                value={draftedMessage}
                onChange={(e) => setDraftedMessage(e.target.value)}
                rows={12}
                className="font-serif"
              />

              <div className="flex gap-2">
                <Button onClick={sendMessage} className="flex-1 bg-green-600 hover:bg-green-700">
                  <Send className="w-4 h-4 mr-2" />
                  Send Message
                </Button>
                <Button 
                  onClick={() => setDraftedMessage('')} 
                  variant="outline"
                >
                  Clear
                </Button>
              </div>
            </motion.div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}