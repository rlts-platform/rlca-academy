import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Users, Calendar, MapPin, Megaphone, Trophy, ArrowLeft, Pin, FileText } from 'lucide-react';
import { motion } from 'framer-motion';
import { format } from 'date-fns';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import EventCalendar from '../components/club/EventCalendar';

export default function ClubDetail() {
  const [currentUser, setCurrentUser] = useState(null);
  const [studentProfile, setStudentProfile] = useState(null);
  const [clubId, setClubId] = useState(null);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const id = params.get('id');
    setClubId(id);
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

  const { data: club } = useQuery({
    queryKey: ['club', clubId],
    queryFn: async () => {
      const clubs = await base44.entities.Club.filter({ id: clubId });
      return clubs[0] || null;
    },
    enabled: !!clubId
  });

  const { data: members = [] } = useQuery({
    queryKey: ['club-members', clubId],
    queryFn: () => base44.entities.ClubMembership.filter({ club_id: clubId, status: 'Active' }),
    enabled: !!clubId
  });

  const { data: posts = [] } = useQuery({
    queryKey: ['club-posts', clubId],
    queryFn: () => base44.entities.ClubPost.filter({ club_id: clubId }, '-created_date'),
    enabled: !!clubId
  });

  const { data: achievements = [] } = useQuery({
    queryKey: ['club-achievements', clubId],
    queryFn: () => base44.entities.ClubAchievement.filter({ club_id: clubId }, '-achievement_date'),
    enabled: !!clubId
  });

  const { data: events = [] } = useQuery({
    queryKey: ['club-events', clubId],
    queryFn: () => base44.entities.ClubEvent.filter({ club_id: clubId }, 'start_datetime'),
    enabled: !!clubId
  });

  const isMember = members.some(m => m.student_id === studentProfile?.id);
  const isAdvisor = currentUser?.email === club?.advisor_email;

  if (!club) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-pink-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-purple-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <div className="text-gray-600">Loading club...</div>
        </div>
      </div>
    );
  }

  const postTypeColors = {
    Announcement: 'bg-red-100 text-red-800',
    Update: 'bg-blue-100 text-blue-800',
    Event: 'bg-purple-100 text-purple-800',
    Achievement: 'bg-green-100 text-green-800'
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-pink-50 p-6">
      <div className="max-w-7xl mx-auto">
        <Link to={createPageUrl('ClubDirectory')}>
          <Button variant="outline" className="mb-6">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Directory
          </Button>
        </Link>

        {club.cover_image && (
          <div className="h-64 rounded-2xl overflow-hidden mb-6 shadow-xl">
            <img src={club.cover_image} alt={club.name} className="w-full h-full object-cover" />
          </div>
        )}

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <Card className="shadow-xl">
            <CardContent className="p-8">
              <div className="flex flex-col md:flex-row justify-between items-start gap-4">
                <div className="flex-1">
                  <h1 className="text-4xl font-bold text-gray-900 mb-2">{club.name}</h1>
                  <p className="text-gray-600 text-lg mb-4">{club.description}</p>
                  <div className="flex flex-wrap gap-3">
                    <Badge className="bg-purple-100 text-purple-800">{club.category}</Badge>
                    <Badge className={club.status === 'Active' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}>
                      {club.status}
                    </Badge>
                  </div>
                </div>
                {isAdvisor && (
                  <Link to={createPageUrl('ClubManagement') + `?id=${club.id}`}>
                    <Button className="bg-gradient-to-r from-purple-600 to-blue-600">
                      Manage Club
                    </Button>
                  </Link>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6 pt-6 border-t">
                <div className="flex items-center gap-3">
                  <Calendar className="w-5 h-5 text-purple-600" />
                  <div>
                    <div className="text-sm text-gray-600">Schedule</div>
                    <div className="font-semibold">{club.meeting_schedule || 'TBA'}</div>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <MapPin className="w-5 h-5 text-purple-600" />
                  <div>
                    <div className="text-sm text-gray-600">Location</div>
                    <div className="font-semibold">{club.meeting_location || 'TBA'}</div>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Users className="w-5 h-5 text-purple-600" />
                  <div>
                    <div className="text-sm text-gray-600">Members</div>
                    <div className="font-semibold">{members.length} / {club.max_members}</div>
                  </div>
                </div>
              </div>

              <div className="mt-6 pt-6 border-t">
                <div className="text-sm text-gray-600 mb-1">Club Advisor</div>
                <div className="font-semibold">{club.advisor_name}</div>
                {club.contact_info && (
                  <div className="text-sm text-gray-600 mt-1">{club.contact_info}</div>
                )}
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <Tabs defaultValue="events">
          <TabsList>
            <TabsTrigger value="events">
              <Calendar className="w-4 h-4 mr-2" />
              Events ({events.length})
            </TabsTrigger>
            <TabsTrigger value="posts">
              <Megaphone className="w-4 h-4 mr-2" />
              Posts & Announcements
            </TabsTrigger>
            <TabsTrigger value="members">
              <Users className="w-4 h-4 mr-2" />
              Members ({members.length})
            </TabsTrigger>
            <TabsTrigger value="achievements">
              <Trophy className="w-4 h-4 mr-2" />
              Achievements
            </TabsTrigger>
          </TabsList>

          <TabsContent value="events">
            <EventCalendar events={events} />
          </TabsContent>

          <TabsContent value="posts">
            <ScrollArea className="h-[600px]">
              <div className="space-y-4">
                {posts.map(post => (
                  <Card key={post.id} className="shadow-lg">
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <Badge className={postTypeColors[post.post_type]}>
                              {post.post_type}
                            </Badge>
                            {post.pinned && (
                              <Badge className="bg-yellow-100 text-yellow-800">
                                <Pin className="w-3 h-3 mr-1" />
                                Pinned
                              </Badge>
                            )}
                          </div>
                          <CardTitle className="text-xl">{post.title}</CardTitle>
                          <div className="text-sm text-gray-600 mt-1">
                            By {post.author_name} • {format(new Date(post.created_date), 'MMM d, yyyy')}
                          </div>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <p className="text-gray-700 whitespace-pre-wrap mb-3">{post.content}</p>
                      {post.event_date && (
                        <div className="flex items-center gap-2 text-sm text-purple-700 bg-purple-50 p-3 rounded-lg">
                          <Calendar className="w-4 h-4" />
                          Event Date: {format(new Date(post.event_date), 'MMMM d, yyyy h:mm a')}
                        </div>
                      )}
                      {post.attachments && post.attachments.length > 0 && (
                        <div className="mt-3 flex flex-wrap gap-2">
                          {post.attachments.map((url, i) => (
                            <a key={i} href={url} target="_blank" rel="noopener noreferrer">
                              <Button variant="outline" size="sm">
                                <FileText className="w-4 h-4 mr-1" />
                                Attachment {i + 1}
                              </Button>
                            </a>
                          ))}
                        </div>
                      )}
                    </CardContent>
                  </Card>
                ))}
                {posts.length === 0 && (
                  <div className="text-center py-12 text-gray-600">
                    <Megaphone className="w-16 h-16 mx-auto mb-4 opacity-50" />
                    <p>No posts yet</p>
                  </div>
                )}
              </div>
            </ScrollArea>
          </TabsContent>

          <TabsContent value="members">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {members.map(member => (
                <Card key={member.id} className="shadow-md">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="font-semibold text-gray-900">{member.student_name}</div>
                        <div className="text-sm text-gray-600">{member.role}</div>
                        <div className="text-xs text-gray-500 mt-1">
                          Joined {format(new Date(member.join_date), 'MMM yyyy')}
                        </div>
                      </div>
                      <Badge className={member.role === 'Member' ? 'bg-blue-100 text-blue-800' : 'bg-purple-100 text-purple-800'}>
                        {member.role}
                      </Badge>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="achievements">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {achievements.map(achievement => (
                <Card key={achievement.id} className="shadow-lg">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <CardTitle className="text-xl">{achievement.title}</CardTitle>
                        <div className="text-sm text-gray-600 mt-1">
                          By {achievement.student_name} • {format(new Date(achievement.achievement_date), 'MMM d, yyyy')}
                        </div>
                      </div>
                      <Badge className="bg-green-100 text-green-800">
                        {achievement.achievement_type}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-gray-700 mb-3">{achievement.description}</p>
                    {achievement.media_urls && achievement.media_urls.length > 0 && (
                      <div className="grid grid-cols-2 gap-2">
                        {achievement.media_urls.map((url, i) => (
                          <img key={i} src={url} alt={`Achievement ${i + 1}`} className="rounded-lg w-full h-32 object-cover" />
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
              {achievements.length === 0 && (
                <div className="col-span-full text-center py-12 text-gray-600">
                  <Trophy className="w-16 h-16 mx-auto mb-4 opacity-50" />
                  <p>No achievements showcased yet</p>
                </div>
              )}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}