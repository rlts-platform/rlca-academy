import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Megaphone, Trophy, ArrowLeft, Calendar } from 'lucide-react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';

export default function ClubManagement() {
  const [currentUser, setCurrentUser] = useState(null);
  const [clubId, setClubId] = useState(null);
  const queryClient = useQueryClient();

  const [postForm, setPostForm] = useState({
    title: '',
    content: '',
    post_type: 'Update',
    event_date: '',
    pinned: false
  });

  const [eventForm, setEventForm] = useState({
    title: '',
    description: '',
    event_type: 'Meeting',
    start_datetime: '',
    end_datetime: '',
    location: '',
    virtual_link: '',
    max_attendees: 30,
    rsvp_required: true,
    rsvp_deadline: '',
    notes: ''
  });

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const id = params.get('id');
    setClubId(id);
    loadUser();
  }, []);

  const loadUser = async () => {
    try {
      const user = await base44.auth.me();
      setCurrentUser(user);
    } catch (error) {
      console.error("Error loading user:", error);
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

  const createPostMutation = useMutation({
    mutationFn: (data) => base44.entities.ClubPost.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['club-posts'] });
      setPostForm({ title: '', content: '', post_type: 'Update', event_date: '', pinned: false });
    }
  });

  const createEventMutation = useMutation({
    mutationFn: (data) => base44.entities.ClubEvent.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['club-events'] });
      setEventForm({
        title: '',
        description: '',
        event_type: 'Meeting',
        start_datetime: '',
        end_datetime: '',
        location: '',
        virtual_link: '',
        max_attendees: 30,
        rsvp_required: true,
        rsvp_deadline: '',
        notes: ''
      });
    }
  });

  const handlePostSubmit = (e) => {
    e.preventDefault();
    createPostMutation.mutate({
      club_id: clubId,
      club_name: club.name,
      author_name: currentUser.full_name,
      author_email: currentUser.email,
      ...postForm
    });
  };

  const handleEventSubmit = (e) => {
    e.preventDefault();
    createEventMutation.mutate({
      club_id: clubId,
      club_name: club.name,
      organizer_name: currentUser.full_name,
      organizer_email: currentUser.email,
      status: 'Upcoming',
      ...eventForm
    });
  };

  if (!club || !currentUser) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-pink-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-purple-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <div className="text-gray-600">Loading...</div>
        </div>
      </div>
    );
  }

  if (currentUser.email !== club.advisor_email && currentUser.role !== 'admin') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-pink-50 flex items-center justify-center p-6">
        <Card className="max-w-md">
          <CardContent className="p-8 text-center">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Access Denied</h2>
            <p className="text-gray-600">Only club advisors can manage this club.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-pink-50 p-6">
      <div className="max-w-4xl mx-auto">
        <Link to={createPageUrl('ClubDetail') + `?id=${clubId}`}>
          <Button variant="outline" className="mb-6">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Club
          </Button>
        </Link>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Manage {club.name}</h1>
          <p className="text-gray-600">Post updates, announcements, and approve achievements</p>
        </motion.div>

        <Tabs defaultValue="event">
          <TabsList>
            <TabsTrigger value="event">
              <Calendar className="w-4 h-4 mr-2" />
              Create Event
            </TabsTrigger>
            <TabsTrigger value="post">
              <Megaphone className="w-4 h-4 mr-2" />
              Create Post
            </TabsTrigger>
            <TabsTrigger value="achievements">
              <Trophy className="w-4 h-4 mr-2" />
              Review Achievements
            </TabsTrigger>
          </TabsList>

          <TabsContent value="event">
            <Card className="shadow-xl">
              <CardHeader>
                <CardTitle>Create New Event</CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleEventSubmit} className="space-y-4">
                  <div>
                    <Label>Event Type</Label>
                    <Select value={eventForm.event_type} onValueChange={(v) => setEventForm({ ...eventForm, event_type: v })}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Meeting">Meeting</SelectItem>
                        <SelectItem value="Practice">Practice</SelectItem>
                        <SelectItem value="Performance">Performance</SelectItem>
                        <SelectItem value="Competition">Competition</SelectItem>
                        <SelectItem value="Workshop">Workshop</SelectItem>
                        <SelectItem value="Social">Social</SelectItem>
                        <SelectItem value="Service">Service</SelectItem>
                        <SelectItem value="Other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label>Event Title</Label>
                    <Input
                      value={eventForm.title}
                      onChange={(e) => setEventForm({ ...eventForm, title: e.target.value })}
                      placeholder="Event title"
                      required
                    />
                  </div>

                  <div>
                    <Label>Description</Label>
                    <Textarea
                      value={eventForm.description}
                      onChange={(e) => setEventForm({ ...eventForm, description: e.target.value })}
                      placeholder="Event description"
                      rows={4}
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label>Start Date & Time</Label>
                      <Input
                        type="datetime-local"
                        value={eventForm.start_datetime}
                        onChange={(e) => setEventForm({ ...eventForm, start_datetime: e.target.value })}
                        required
                      />
                    </div>
                    <div>
                      <Label>End Date & Time</Label>
                      <Input
                        type="datetime-local"
                        value={eventForm.end_datetime}
                        onChange={(e) => setEventForm({ ...eventForm, end_datetime: e.target.value })}
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <Label>Location</Label>
                    <Input
                      value={eventForm.location}
                      onChange={(e) => setEventForm({ ...eventForm, location: e.target.value })}
                      placeholder="Event location"
                    />
                  </div>

                  <div>
                    <Label>Virtual Meeting Link (Optional)</Label>
                    <Input
                      value={eventForm.virtual_link}
                      onChange={(e) => setEventForm({ ...eventForm, virtual_link: e.target.value })}
                      placeholder="https://meet.google.com/..."
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label>Max Attendees</Label>
                      <Input
                        type="number"
                        value={eventForm.max_attendees}
                        onChange={(e) => setEventForm({ ...eventForm, max_attendees: parseInt(e.target.value) })}
                      />
                    </div>
                    <div>
                      <Label>RSVP Deadline</Label>
                      <Input
                        type="datetime-local"
                        value={eventForm.rsvp_deadline}
                        onChange={(e) => setEventForm({ ...eventForm, rsvp_deadline: e.target.value })}
                      />
                    </div>
                  </div>

                  <div>
                    <Label>Additional Notes</Label>
                    <Textarea
                      value={eventForm.notes}
                      onChange={(e) => setEventForm({ ...eventForm, notes: e.target.value })}
                      placeholder="Any additional information..."
                      rows={3}
                    />
                  </div>

                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="rsvp_required"
                      checked={eventForm.rsvp_required}
                      onCheckedChange={(checked) => setEventForm({ ...eventForm, rsvp_required: checked })}
                    />
                    <label htmlFor="rsvp_required" className="text-sm">RSVP Required</label>
                  </div>

                  <Button type="submit" disabled={createEventMutation.isPending} className="w-full bg-gradient-to-r from-purple-600 to-blue-600">
                    {createEventMutation.isPending ? 'Creating Event...' : 'Create Event'}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="post">
            <Card className="shadow-xl">
              <CardHeader>
                <CardTitle>Create New Post</CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handlePostSubmit} className="space-y-4">
                  <div>
                    <Label>Post Type</Label>
                    <Select value={postForm.post_type} onValueChange={(v) => setPostForm({ ...postForm, post_type: v })}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Announcement">Announcement</SelectItem>
                        <SelectItem value="Update">Update</SelectItem>
                        <SelectItem value="Event">Event</SelectItem>
                        <SelectItem value="Achievement">Achievement</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label>Title</Label>
                    <Input
                      value={postForm.title}
                      onChange={(e) => setPostForm({ ...postForm, title: e.target.value })}
                      placeholder="Post title"
                      required
                    />
                  </div>

                  <div>
                    <Label>Content</Label>
                    <Textarea
                      value={postForm.content}
                      onChange={(e) => setPostForm({ ...postForm, content: e.target.value })}
                      placeholder="What would you like to share with club members?"
                      rows={6}
                      required
                    />
                  </div>

                  {postForm.post_type === 'Event' && (
                    <div>
                      <Label>Event Date & Time</Label>
                      <Input
                        type="datetime-local"
                        value={postForm.event_date}
                        onChange={(e) => setPostForm({ ...postForm, event_date: e.target.value })}
                      />
                    </div>
                  )}

                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="pinned"
                      checked={postForm.pinned}
                      onCheckedChange={(checked) => setPostForm({ ...postForm, pinned: checked })}
                    />
                    <label htmlFor="pinned" className="text-sm">Pin this post to the top</label>
                  </div>

                  <Button type="submit" disabled={createPostMutation.isPending} className="w-full bg-gradient-to-r from-purple-600 to-blue-600">
                    {createPostMutation.isPending ? 'Publishing...' : 'Publish Post'}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="achievements">
            <Card className="shadow-xl">
              <CardHeader>
                <CardTitle>Achievement Reviews</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">Achievement review functionality coming soon...</p>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}