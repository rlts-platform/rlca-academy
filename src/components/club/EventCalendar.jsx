import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon } from 'lucide-react';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isSameDay, parseISO, startOfWeek, endOfWeek } from 'date-fns';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';

export default function EventCalendar({ events }) {
  const [currentDate, setCurrentDate] = useState(new Date());

  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(currentDate);
  const calendarStart = startOfWeek(monthStart);
  const calendarEnd = endOfWeek(monthEnd);
  
  const calendarDays = eachDayOfInterval({ start: calendarStart, end: calendarEnd });

  const getEventsForDay = (day) => {
    return events.filter(event => 
      isSameDay(parseISO(event.start_datetime), day)
    );
  };

  const previousMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1));
  };

  const nextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1));
  };

  const eventTypeColors = {
    Meeting: 'bg-blue-500',
    Practice: 'bg-green-500',
    Performance: 'bg-purple-500',
    Competition: 'bg-red-500',
    Workshop: 'bg-yellow-500',
    Social: 'bg-pink-500',
    Service: 'bg-orange-500',
    Other: 'bg-gray-500'
  };

  return (
    <Card className="shadow-lg">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <CalendarIcon className="w-5 h-5" />
            Event Calendar
          </CardTitle>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={previousMonth}>
              <ChevronLeft className="w-4 h-4" />
            </Button>
            <div className="text-lg font-semibold min-w-[150px] text-center">
              {format(currentDate, 'MMMM yyyy')}
            </div>
            <Button variant="outline" size="sm" onClick={nextMonth}>
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-7 gap-2">
          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
            <div key={day} className="text-center font-semibold text-gray-600 text-sm p-2">
              {day}
            </div>
          ))}
          {calendarDays.map(day => {
            const dayEvents = getEventsForDay(day);
            const isCurrentMonth = isSameMonth(day, currentDate);
            const isToday = isSameDay(day, new Date());

            return (
              <div
                key={day.toISOString()}
                className={`min-h-[100px] p-2 border rounded-lg ${
                  isCurrentMonth ? 'bg-white' : 'bg-gray-50'
                } ${isToday ? 'border-purple-500 border-2' : 'border-gray-200'}`}
              >
                <div className={`text-sm font-semibold mb-1 ${
                  isToday ? 'text-purple-600' : isCurrentMonth ? 'text-gray-900' : 'text-gray-400'
                }`}>
                  {format(day, 'd')}
                </div>
                <div className="space-y-1">
                  {dayEvents.map(event => (
                    <Link key={event.id} to={createPageUrl('ClubEventDetail') + `?id=${event.id}`}>
                      <div className={`text-xs p-1 rounded ${eventTypeColors[event.event_type]} text-white truncate cursor-pointer hover:opacity-80`}>
                        {format(parseISO(event.start_datetime), 'h:mm a')} {event.title}
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            );
          })}
        </div>

        <div className="mt-4 flex flex-wrap gap-2">
          {Object.entries(eventTypeColors).map(([type, color]) => (
            <div key={type} className="flex items-center gap-1 text-xs">
              <div className={`w-3 h-3 rounded ${color}`}></div>
              <span className="text-gray-600">{type}</span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}