import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Send, Mail, Search } from "lucide-react";
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Badge } from "@/components/ui/badge";
import { format } from 'date-fns';

export default function ParentMessaging({ messages, students, currentUser }) {
  const [composing, setComposing] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [messageData, setMessageData] = useState({
    subject: '',
    body: ''
  });
  const queryClient = useQueryClient();

  const sendMessageMutation = useMutation({
    mutationFn: (data) => base44.entities.Message.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['teacher-messages'] });
      setComposing(false);
      setSelectedStudent(null);
      setMessageData({ subject: '', body: '' });
      alert('Message sent successfully!');
    }
  });

  const handleSend = () => {
    if (!selectedStudent || !messageData.subject || !messageData.body) {
      alert('Please fill in all fields');
      return;
    }

    sendMessageMutation.mutate({
      sender_email: currentUser.email,
      sender_name: currentUser.full_name || 'Teacher',
      recipient_email: selectedStudent.parent_email,
      recipient_name: 'Parent',
      subject: messageData.subject,
      message_body: messageData.body,
      status: 'Sent',
      sent_date: new Date().toISOString().split('T')[0],
      student_id: selectedStudent.id
    });
  };

  const filteredMessages = messages.filter(m =>
    m.subject?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    m.sender_name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Message Inbox */}
      <Card className="shadow-lg">
        <CardHeader className="border-b bg-gradient-to-r from-purple-50 to-pink-50">
          <CardTitle className="flex items-center gap-2">
            <Mail className="w-5 h-5" />
            Message Inbox
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          <div className="mb-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                placeholder="Search messages..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

          <div className="space-y-2 max-h-96 overflow-y-auto">
            {filteredMessages.map(message => (
              <Card key={message.id} className="hover:bg-gray-50 cursor-pointer">
                <CardContent className="p-3">
                  <div className="flex justify-between items-start mb-1">
                    <span className="font-semibold text-sm">{message.sender_name}</span>
                    <Badge variant={message.status === 'Sent' ? 'default' : 'secondary'} className="text-xs">
                      {message.status}
                    </Badge>
                  </div>
                  <p className="text-sm font-medium text-gray-900">{message.subject}</p>
                  <p className="text-xs text-gray-500 mt-1">
                    {message.sent_date && format(new Date(message.sent_date), 'MMM d, yyyy')}
                  </p>
                </CardContent>
              </Card>
            ))}

            {filteredMessages.length === 0 && (
              <div className="text-center py-12 text-gray-500">
                <p>No messages found</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Compose Message */}
      <Card className="shadow-lg">
        <CardHeader className="border-b bg-gradient-to-r from-blue-50 to-cyan-50">
          <CardTitle className="flex items-center gap-2">
            <Send className="w-5 h-5" />
            Compose Message to Parent
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          <div className="space-y-4">
            <div>
              <Label>Select Student</Label>
              <Select 
                value={selectedStudent?.id} 
                onValueChange={(id) => setSelectedStudent(students.find(s => s.id === id))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Choose a student" />
                </SelectTrigger>
                <SelectContent>
                  {students.map(student => (
                    <SelectItem key={student.id} value={student.id}>
                      {student.full_name} ({student.grade_level})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {selectedStudent && (
                <p className="text-xs text-gray-600 mt-1">
                  Parent: {selectedStudent.parent_email}
                </p>
              )}
            </div>

            <div>
              <Label>Subject</Label>
              <Input
                value={messageData.subject}
                onChange={(e) => setMessageData({...messageData, subject: e.target.value})}
                placeholder="Update on student progress..."
              />
            </div>

            <div>
              <Label>Message</Label>
              <Textarea
                value={messageData.body}
                onChange={(e) => setMessageData({...messageData, body: e.target.value})}
                placeholder="Dear Parent,..."
                rows={8}
              />
            </div>

            <Button 
              onClick={handleSend} 
              disabled={!selectedStudent || !messageData.subject || !messageData.body}
              className="w-full bg-blue-600"
            >
              <Send className="w-4 h-4 mr-2" />
              Send Message
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}