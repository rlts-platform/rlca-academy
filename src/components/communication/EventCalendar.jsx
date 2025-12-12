import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Calendar, MapPin, Users } from "lucide-react";
import { format, parseISO } from "date-fns";
import { motion } from "framer-motion";

export default function EventCalendar({ events, onEventClick }) {
  const typeColors = {
    parent_teacher_meeting: "bg-blue-100 text-blue-800 border-blue-300",
    school_event: "bg-purple-100 text-purple-800 border-purple-300",
    class_activity: "bg-green-100 text-green-800 border-green-300",
    deadline: "bg-orange-100 text-orange-800 border-orange-300",
    holiday: "bg-pink-100 text-pink-800 border-pink-300"
  };

  const sortedEvents = [...events].sort((a, b) => 
    new Date(a.start_date) - new Date(b.start_date)
  );

  return (
    <div className="space-y-4">
      {sortedEvents.map((event, i) => (
        <motion.div
          key={event.id}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: i * 0.05 }}
        >
          <Card 
            className="cursor-pointer hover:shadow-lg transition-all border-l-4 border-purple-500"
            onClick={() => onEventClick && onEventClick(event)}
          >
            <CardContent className="p-5">
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1">
                  <h3 className="font-bold text-gray-900 mb-1">{event.title}</h3>
                  <Badge className={`${typeColors[event.event_type]} border text-xs`}>
                    {event.event_type.replace(/_/g, ' ')}
                  </Badge>
                </div>
              </div>
              
              {event.description && (
                <p className="text-sm text-gray-700 mb-3">{event.description}</p>
              )}
              
              <div className="space-y-2 text-sm text-gray-600">
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4" />
                  <span>
                    {format(parseISO(event.start_date), 'MMM d, yyyy h:mm a')}
                    {event.end_date && ` - ${format(parseISO(event.end_date), 'h:mm a')}`}
                  </span>
                </div>
                
                {event.location && (
                  <div className="flex items-center gap-2">
                    <MapPin className="w-4 h-4" />
                    <span>{event.location}</span>
                  </div>
                )}
                
                {event.organizer_name && (
                  <div className="flex items-center gap-2">
                    <Users className="w-4 h-4" />
                    <span>Organized by {event.organizer_name}</span>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      ))}
    </div>
  );
}