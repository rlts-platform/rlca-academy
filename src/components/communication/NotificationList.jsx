import React from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Bell, CheckCircle, AlertCircle, Calendar, FileText, MessageSquare } from "lucide-react";
import { motion } from "framer-motion";
import { format, parseISO } from "date-fns";

export default function NotificationList({ notifications, onMarkRead, onNotificationClick }) {
  const getIcon = (type) => {
    switch (type) {
      case 'assignment_due': return <Calendar className="w-5 h-5 text-orange-600" />;
      case 'late_submission': return <AlertCircle className="w-5 h-5 text-red-600" />;
      case 'graded_work': return <CheckCircle className="w-5 h-5 text-green-600" />;
      case 'message': return <MessageSquare className="w-5 h-5 text-blue-600" />;
      case 'announcement': return <Bell className="w-5 h-5 text-purple-600" />;
      default: return <Bell className="w-5 h-5 text-gray-600" />;
    }
  };

  const priorityColors = {
    low: "bg-gray-100 text-gray-800",
    medium: "bg-blue-100 text-blue-800",
    high: "bg-orange-100 text-orange-800",
    urgent: "bg-red-100 text-red-800"
  };

  return (
    <div className="space-y-3">
      {notifications.map((notif, i) => (
        <motion.div
          key={notif.id}
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: i * 0.05 }}
        >
          <Card 
            className={`cursor-pointer transition-all ${notif.read ? 'opacity-60' : 'border-l-4 border-purple-500'} hover:shadow-lg`}
            onClick={() => onNotificationClick && onNotificationClick(notif)}
          >
            <CardContent className="p-4">
              <div className="flex items-start gap-3">
                <div className="flex-shrink-0 mt-1">
                  {getIcon(notif.type)}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <h4 className="font-semibold text-gray-900">{notif.title}</h4>
                    <Badge className={`${priorityColors[notif.priority]} text-xs`}>
                      {notif.priority}
                    </Badge>
                  </div>
                  <p className="text-sm text-gray-700">{notif.message}</p>
                  <p className="text-xs text-gray-500 mt-2">
                    {format(parseISO(notif.created_date), 'MMM d, h:mm a')}
                  </p>
                </div>
                {!notif.read && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      onMarkRead && onMarkRead(notif.id);
                    }}
                  >
                    <CheckCircle className="w-4 h-4" />
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      ))}
    </div>
  );
}