import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Calendar, MapPin, Users, Video, Clock, CheckCircle, XCircle, HelpCircle, ArrowLeft, FileText } from 'lucide-react';
import { motion } from 'framer-motion';
import { format, parseISO, isPast } from 'date-fns';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';

export default function ClubEventDetail() {
  const [currentUser, setCurrentUser] = useState(null);
  const [studentProfile, setStudentProfile] = useState(null);
  const [eventId, setEventId] = useState(null);
  const queryClient = useQueryClient();

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const id = params.get('id');
    setEventId(id);
    loadUserProfile();
  }, []);

  const loadUserProfile = async () => {
    try {
      const user = await base44.auth.me();
      setCurrentUser(user);
      const students = await base44.entities.Student.filter({ student_email: user.email });
      if (students && students.length > 0) {
        setStudentProfile(students[0]);
      }
    } catch (error) {
      console.error("Error loading profile:", error);
    }
  };

  const { data: event } = useQuery({
    queryKey: ['club-event', eventId],
    queryFn: async () => {
      const events = await base44.entities.ClubEvent.filter({ id: eventId });
      return events[0] || null;
    },
    enabled: !!eventId
  });

  const { data: rsvps = [] } = useQuery({
    queryKey: ['event-rsvps', eventId],
    queryFn: () => base44.entities.ClubEventRSVP.filter({ event_id: eventId }),
    enabled: !!eventId
  });

  const { data: myRsvp } = useQuery({
    queryKey: ['my-rsvp', eventId, studentProfile?.id],
    queryFn: async () => {
      const myRsvps = await base44.entities.ClubEventRSVP.filter({ event_id: eventId, student_id: studentProfile.id });
      return myRsvps[0] || null;
    },
    enabled: !!eventId && !!studentProfile
  });

  const rsvpMutation = useMutation({
    mutationFn: async ({ response }) => {
      if (myRsvp) {
        await base44.entities.ClubEventRSVP.update(myRsvp.id, { response });
      } else {
        await base44.entities.ClubEventRSVP.create({
          event_id: eventId,
          event_title: event.title,
          student_id: studentProfile.id,
          student_name: studentProfile.full_name,
          student_email: studentProfile.student_email || currentUser.email,
          response
        });
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['event-rsvps'] });
      queryClient.invalidateQueries({ queryKey: ['my-rsvp'] });
    }
  });

  if (!event) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-pink-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-purple-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <div className="text-gray-600">Loading event...</div>
        </div>
      </div>
    );
  }

  const isOrganizer = currentUser?.email === event.organizer_email;
  const goingCount = rsvps.filter(r => r.response === 'Going').length;
  const maybeCount = rsvps.filter(r => r.response === 'Maybe').length;
  const notGoingCount = rsvps.filter(r => r.response === 'Not Going').length;
  const isPastEvent = isPast(parseISO(event.start_datetime));
  const isRsvpDeadlinePassed = event.rsvp_deadline && isPast(parseISO(event.rsvp_deadline));

  const eventTypeColors = {
    Meeting: 'bg-blue-100 text-blue-800',
    Practice: 'bg-green-100 text-green-800',
    Performance: 'bg-purple-100 text-purple-800',
    Competition: 'bg-red-100 text-red-800',
    Workshop: 'bg-yellow-100 text-yellow-800',
    Social: 'bg-pink-100 text-pink-800',
    Service: 'bg-orange-100 text-orange-800',
    Other: 'bg-gray-100 text-gray-800'
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-pink-50 p-6">
      <div className="max-w-5xl mx-auto">
        <Link to={createPageUrl('ClubDetail') + `?id=${event.club_id}`}>
          <Button variant="outline" className="mb-6">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Club
          </Button>
        </Link>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <Card className="shadow-xl mb-6">
            <CardHeader className="border-b bg-gradient-to-r from-purple-50 to-blue-50">
              <div className="flex flex-col md:flex-row justify-between items-start gap-4">
                <div className="flex-1">
                  <div className="flex flex-wrap gap-2 mb-3">
                    <Badge className={eventTypeColors[event.event_type]}>
                      {event.event_type}
                    </Badge>
                    <Badge className={isPastEvent ? 'bg-gray-100 text-gray-800' : 'bg-green-100 text-green-800'}>
                      {event.status}
                    </Badge>
                    <Badge className="bg-purple-100 text-purple-800">{event.club_name}</Badge>
                  </div>
                  <CardTitle className="text-3xl mb-2">{event.title}</CardTitle>
                  <p className="text-gray-600">{event.description}</p>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <div className="space-y-4">
                  <div className="flex items-start gap-3">
                    <Calendar className="w-5 h-5 text-purple-600 mt-1" />
                    <div>
                      <div className="font-semibold text-gray-900">Date & Time</div>
                      <div className="text-gray-600">
                        {format(parseISO(event.start_datetime), 'EEEE, MMMM d, yyyy')}
                      </div>
                      <div className="text-gray-600">
                        {format(parseISO(event.start_datetime), 'h:mm a')} - {format(parseISO(event.end_datetime), 'h:mm a')}
                      </div>
                    </div>
                  </div>

                  {event.location && (
                    <div className="flex items-start gap-3">
                      <MapPin className="w-5 h-5 text-purple-600 mt-1" />
                      <div>
                        <div className="font-semibold text-gray-900">Location</div>
                        <div className="text-gray-600">{event.location}</div>
                      </div>
                    </div>
                  )}

                  {event.virtual_link && (
                    <div className="flex items-start gap-3">
                      <Video className="w-5 h-5 text-purple-600 mt-1" />
                      <div>
                        <div className="font-semibold text-gray-900">Virtual Meeting</div>
                        <a href={event.virtual_link} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                          Join Meeting
                        </a>
                      </div>
                    </div>
                  )}
                </div>

                <div className="space-y-4">
                  <div className="flex items-start gap-3">
                    <Users className="w-5 h-5 text-purple-600 mt-1" />
                    <div>
                      <div className="font-semibold text-gray-900">Organizer</div>
                      <div className="text-gray-600">{event.organizer_name}</div>
                    </div>
                  </div>

                  {event.rsvp_deadline && (
                    <div className="flex items-start gap-3">
                      <Clock className="w-5 h-5 text-purple-600 mt-1" />
                      <div>
                        <div className="font-semibold text-gray-900">RSVP Deadline</div>
                        <div className="text-gray-600">
                          {format(parseISO(event.rsvp_deadline), 'MMM d, yyyy h:mm a')}
                        </div>
                      </div>
                    </div>
                  )}

                  {event.max_attendees && (
                    <div className="flex items-start gap-3">
                      <Users className="w-5 h-5 text-purple-600 mt-1" />
                      <div>
                        <div className="font-semibold text-gray-900">Capacity</div>
                        <div className="text-gray-600">{goingCount} / {event.max_attendees} attendees</div>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {event.notes && (
                <div className="p-4 bg-blue-50 rounded-lg mb-6">
                  <div className="font-semibold text-gray-900 mb-2">Additional Information</div>
                  <p className="text-gray-700 whitespace-pre-wrap">{event.notes}</p>
                </div>
              )}

              {event.attachments && event.attachments.length > 0 && (
                <div className="mb-6">
                  <div className="font-semibold text-gray-900 mb-2">Attachments</div>
                  <div className="flex flex-wrap gap-2">
                    {event.attachments.map((url, i) => (
                      <a key={i} href={url} target="_blank" rel="noopener noreferrer">
                        <Button variant="outline" size="sm">
                          <FileText className="w-4 h-4 mr-1" />
                          Attachment {i + 1}
                        </Button>
                      </a>
                    ))}
                  </div>
                </div>
              )}

              {studentProfile && !isPastEvent && !isRsvpDeadlinePassed && (
                <div className="border-t pt-6">
                  <div className="text-lg font-semibold text-gray-900 mb-4">Your RSVP</div>
                  <div className="flex flex-wrap gap-3">
                    <Button
                      onClick={() => rsvpMutation.mutate({ response: 'Going' })}
                      disabled={rsvpMutation.isPending}
                      className={myRsvp?.response === 'Going' ? 'bg-green-600' : ''}
                    >
                      <CheckCircle className="w-4 h-4 mr-2" />
                      Going
                    </Button>
                    <Button
                      onClick={() => rsvpMutation.mutate({ response: 'Maybe' })}
                      disabled={rsvpMutation.isPending}
                      variant="outline"
                      className={myRsvp?.response === 'Maybe' ? 'border-yellow-500 text-yellow-700' : ''}
                    >
                      <HelpCircle className="w-4 h-4 mr-2" />
                      Maybe
                    </Button>
                    <Button
                      onClick={() => rsvpMutation.mutate({ response: 'Not Going' })}
                      disabled={rsvpMutation.isPending}
                      variant="outline"
                      className={myRsvp?.response === 'Not Going' ? 'border-red-500 text-red-700' : ''}
                    >
                      <XCircle className="w-4 h-4 mr-2" />
                      Not Going
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          <Tabs defaultValue="rsvps">
            <TabsList>
              <TabsTrigger value="rsvps">
                RSVPs ({goingCount} Going)
              </TabsTrigger>
              {isOrganizer && (
                <TabsTrigger value="attendance">
                  Attendance Tracking
                </TabsTrigger>
              )}
            </TabsList>

            <TabsContent value="rsvps">
              <Card className="shadow-lg">
                <CardHeader>
                  <CardTitle>RSVP Summary</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-3 gap-4 mb-6">
                    <div className="p-4 bg-green-50 rounded-lg text-center">
                      <div className="text-3xl font-bold text-green-700">{goingCount}</div>
                      <div className="text-sm text-gray-600">Going</div>
                    </div>
                    <div className="p-4 bg-yellow-50 rounded-lg text-center">
                      <div className="text-3xl font-bold text-yellow-700">{maybeCount}</div>
                      <div className="text-sm text-gray-600">Maybe</div>
                    </div>
                    <div className="p-4 bg-red-50 rounded-lg text-center">
                      <div className="text-3xl font-bold text-red-700">{notGoingCount}</div>
                      <div className="text-sm text-gray-600">Not Going</div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    {rsvps.filter(r => r.response === 'Going').map(rsvp => (
                      <div key={rsvp.id} className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                        <span className="font-semibold text-gray-900">{rsvp.student_name}</span>
                        <Badge className="bg-green-600 text-white">Going</Badge>
                      </div>
                    ))}
                    {rsvps.filter(r => r.response === 'Maybe').map(rsvp => (
                      <div key={rsvp.id} className="flex items-center justify-between p-3 bg-yellow-50 rounded-lg">
                        <span className="font-semibold text-gray-900">{rsvp.student_name}</span>
                        <Badge className="bg-yellow-600 text-white">Maybe</Badge>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {isOrganizer && (
              <TabsContent value="attendance">
                <Card className="shadow-lg">
                  <CardHeader>
                    <CardTitle>Attendance Tracking</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      {rsvps.filter(r => r.response === 'Going').map(rsvp => (
                        <div key={rsvp.id} className="flex items-center justify-between p-3 bg-white border rounded-lg">
                          <span className="font-semibold text-gray-900">{rsvp.student_name}</span>
                          <Badge className={rsvp.attended ? 'bg-green-600 text-white' : 'bg-gray-200 text-gray-700'}>
                            {rsvp.attended ? 'Attended' : 'Not Marked'}
                          </Badge>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            )}
          </Tabs>
        </motion.div>
      </div>
    </div>
  );
}