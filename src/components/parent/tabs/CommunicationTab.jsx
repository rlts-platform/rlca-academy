import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { MessageSquare, Send, User } from 'lucide-react';
import { format, parseISO } from 'date-fns';
import { toast } from 'react-hot-toast';

export default function CommunicationTab({ student }) {
  const queryClient = useQueryClient();
  const [currentUser, setCurrentUser] = React.useState(null);
  const [newMessage, setNewMessage] = useState({ subject: '', body: '' });

  React.useEffect(() => {
    loadUser();
  }, []);

  const loadUser = async () => {
    const user = await base44.auth.me();
    setCurrentUser(user);
  };

  const { data: messages = [] } = useQuery({
    queryKey: ['parent-messages', student.id],
    queryFn: async () => {
      const sent = await base44.entities.Message.filter({ sender_email: currentUser?.email, related_student_id: student.id }, '-created_date');
      const received = await base44.entities.Message.filter({ recipient_email: currentUser?.email, related_student_id: student.id }, '-created_date');
      return [...sent, ...received].sort((a, b) => new Date(b.created_date) - new Date(a.created_date));
    },
    enabled: !!currentUser
  });

  const sendMessageMutation = useMutation({
    mutationFn: async (messageData) => {
      return base44.entities.Message.create(messageData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['parent-messages'] });
      setNewMessage({ subject: '', body: '' });
      toast.success('Message sent to teacher!');
    }
  });

  const handleSendMessage = () => {
    if (!newMessage.subject.trim() || !newMessage.body.trim() || !currentUser) return;
    
    sendMessageMutation.mutate({
      sender_email: currentUser.email,
      sender_name: currentUser.full_name,
      recipient_email: student.teacher_email || "admin@rlca.test",
      recipient_name: student.teacher_name || "School Admin",
      subject: newMessage.subject,
      body: newMessage.body,
      related_student_id: student.id,
      status: "Sent"
    });
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Send className="w-5 h-5 text-purple-600" />
            Send Message to Teacher
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label>Subject</Label>
            <Input 
              placeholder="Message subject..."
              value={newMessage.subject}
              onChange={(e) => setNewMessage({...newMessage, subject: e.target.value})}
            />
          </div>
          <div>
            <Label>Message</Label>
            <Textarea 
              placeholder="Write your message here..."
              value={newMessage.body}
              onChange={(e) => setNewMessage({...newMessage, body: e.target.value})}
              rows={6}
            />
          </div>
          <Button 
            onClick={handleSendMessage}
            className="w-full bg-gradient-to-r from-purple-600 to-blue-600 gap-2"
            disabled={!newMessage.subject.trim() || !newMessage.body.trim() || sendMessageMutation.isLoading}
          >
            <Send className="w-4 h-4" />
            {sendMessageMutation.isLoading ? "Sending..." : "Send Message"}
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MessageSquare className="w-5 h-5 text-purple-600" />
            Message History
          </CardTitle>
        </CardHeader>
        <CardContent>
          {messages.length > 0 ? (
            <div className="space-y-3">
              {messages.map((message) => {
                const isSent = message.sender_email === currentUser?.email;
                return (
                  <Card key={message.id} className={`border-2 ${isSent ? 'bg-blue-50 border-blue-200' : 'bg-gray-50'}`}>
                    <CardContent className="p-4">
                      <div className="flex items-start gap-3">
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center ${isSent ? 'bg-blue-200' : 'bg-gray-200'}`}>
                          <User className="w-5 h-5 text-gray-700" />
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center justify-between mb-1">
                            <h4 className="font-semibold text-gray-900">
                              {isSent ? 'You' : message.sender_name}
                            </h4>
                            <span className="text-xs text-gray-500">
                              {format(parseISO(message.created_date), 'MMM d, h:mm a')}
                            </span>
                          </div>
                          <h5 className="text-sm font-medium text-gray-700 mb-1">{message.subject}</h5>
                          <p className="text-sm text-gray-600 whitespace-pre-wrap">{message.body}</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              No messages yet. Send your first message above!
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}