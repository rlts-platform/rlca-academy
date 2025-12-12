import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Send, Paperclip } from "lucide-react";
import { format, parseISO } from "date-fns";
import { motion } from "framer-motion";

export default function MessageThread({ messages, currentUserId, onSendMessage }) {
  const [newMessage, setNewMessage] = useState("");
  const [sending, setSending] = useState(false);

  const handleSend = async () => {
    if (!newMessage.trim()) return;
    setSending(true);
    await onSendMessage(newMessage);
    setNewMessage("");
    setSending(false);
  };

  return (
    <Card className="shadow-lg h-[600px] flex flex-col">
      <CardHeader className="border-b">
        <CardTitle>Messages</CardTitle>
      </CardHeader>
      <CardContent className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((msg, i) => {
          const isOwn = msg.sender_id === currentUserId;
          return (
            <motion.div
              key={msg.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              className={`flex ${isOwn ? 'justify-end' : 'justify-start'}`}
            >
              <div className={`max-w-[70%] ${isOwn ? 'bg-purple-100' : 'bg-gray-100'} rounded-lg p-4`}>
                <div className="flex items-center gap-2 mb-2">
                  <span className="font-semibold text-sm">{msg.sender_name}</span>
                  <Badge variant="outline" className="text-xs">
                    {msg.sender_role}
                  </Badge>
                </div>
                <p className="text-gray-800 whitespace-pre-wrap">{msg.content}</p>
                <p className="text-xs text-gray-500 mt-2">
                  {format(parseISO(msg.created_date), 'MMM d, h:mm a')}
                </p>
              </div>
            </motion.div>
          );
        })}
      </CardContent>
      <div className="border-t p-4">
        <div className="flex gap-2">
          <Textarea
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="Type your message..."
            rows={3}
            className="resize-none"
            onKeyPress={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleSend();
              }
            }}
          />
          <div className="flex flex-col gap-2">
            <Button onClick={handleSend} disabled={sending || !newMessage.trim()}>
              <Send className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>
    </Card>
  );
}