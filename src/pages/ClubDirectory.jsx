import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Users, Calendar, MapPin, Search, Sparkles, CheckCircle, UserPlus } from 'lucide-react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';

export default function ClubDirectory() {
  const [currentUser, setCurrentUser] = useState(null);
  const [studentProfile, setStudentProfile] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const queryClient = useQueryClient();

  useEffect(() => {
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

  const { data: clubs = [] } = useQuery({
    queryKey: ['clubs'],
    queryFn: () => base44.entities.Club.list('-created_date'),
    enabled: !!currentUser
  });

  const { data: memberships = [] } = useQuery({
    queryKey: ['my-memberships', studentProfile?.id],
    queryFn: () => studentProfile ? base44.entities.ClubMembership.filter({ student_id: studentProfile.id }) : [],
    enabled: !!studentProfile
  });

  const joinClubMutation = useMutation({
    mutationFn: async ({ club }) => {
      await base44.entities.ClubMembership.create({
        club_id: club.id,
        club_name: club.name,
        student_id: studentProfile.id,
        student_name: studentProfile.full_name,
        student_email: studentProfile.student_email || currentUser.email,
        join_date: new Date().toISOString().split('T')[0],
        status: 'Active'
      });
      await base44.entities.Club.update(club.id, {
        current_members: (club.current_members || 0) + 1
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['my-memberships'] });
      queryClient.invalidateQueries({ queryKey: ['clubs'] });
    }
  });

  const isMember = (clubId) => memberships.some(m => m.club_id === clubId);

  const filteredClubs = clubs.filter(club => {
    const matchesSearch = searchTerm === '' || 
      club.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      club.description?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = categoryFilter === 'all' || club.category === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  const categoryColors = {
    Sports: 'bg-blue-100 text-blue-800',
    Arts: 'bg-pink-100 text-pink-800',
    Music: 'bg-purple-100 text-purple-800',
    STEM: 'bg-green-100 text-green-800',
    Service: 'bg-yellow-100 text-yellow-800',
    Leadership: 'bg-orange-100 text-orange-800',
    Faith: 'bg-indigo-100 text-indigo-800',
    Academic: 'bg-cyan-100 text-cyan-800',
    Other: 'bg-gray-100 text-gray-800'
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-pink-50 p-6">
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex items-center gap-4 mb-6">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-purple-500 to-blue-600 flex items-center justify-center shadow-xl">
              <Sparkles className="w-9 h-9 text-white" />
            </div>
            <div>
              <h1 className="text-4xl font-bold text-gray-900">Clubs & Activities</h1>
              <p className="text-gray-600 mt-1">Discover and join extracurricular activities</p>
            </div>
          </div>

          <div className="flex flex-wrap gap-4 mb-6">
            <div className="relative flex-1 min-w-[250px]">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input
                placeholder="Search clubs..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                <SelectItem value="Sports">Sports</SelectItem>
                <SelectItem value="Arts">Arts</SelectItem>
                <SelectItem value="Music">Music</SelectItem>
                <SelectItem value="STEM">STEM</SelectItem>
                <SelectItem value="Service">Service</SelectItem>
                <SelectItem value="Leadership">Leadership</SelectItem>
                <SelectItem value="Faith">Faith</SelectItem>
                <SelectItem value="Academic">Academic</SelectItem>
                <SelectItem value="Other">Other</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {memberships.length > 0 && (
            <div className="mb-6 p-4 bg-white rounded-xl shadow-lg">
              <h3 className="font-semibold text-gray-900 mb-2">Your Clubs ({memberships.length})</h3>
              <div className="flex flex-wrap gap-2">
                {memberships.map(m => (
                  <Badge key={m.id} className="bg-purple-100 text-purple-800">
                    {m.club_name}
                  </Badge>
                ))}
              </div>
            </div>
          )}
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredClubs.map((club, i) => (
            <motion.div
              key={club.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
            >
              <Card className="h-full shadow-lg hover:shadow-xl transition-shadow">
                {club.cover_image && (
                  <div className="h-40 overflow-hidden rounded-t-xl">
                    <img src={club.cover_image} alt={club.name} className="w-full h-full object-cover" />
                  </div>
                )}
                <CardHeader>
                  <div className="flex items-start justify-between mb-2">
                    <CardTitle className="text-xl">{club.name}</CardTitle>
                    <Badge className={categoryColors[club.category] || 'bg-gray-100 text-gray-800'}>
                      {club.category}
                    </Badge>
                  </div>
                  <p className="text-sm text-gray-600 line-clamp-2">{club.description}</p>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3 mb-4">
                    {club.meeting_schedule && (
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <Calendar className="w-4 h-4" />
                        {club.meeting_schedule}
                      </div>
                    )}
                    {club.meeting_location && (
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <MapPin className="w-4 h-4" />
                        {club.meeting_location}
                      </div>
                    )}
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <Users className="w-4 h-4" />
                      {club.current_members || 0} / {club.max_members || 30} members
                    </div>
                    <div className="text-sm text-gray-600">
                      <strong>Advisor:</strong> {club.advisor_name}
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <Link to={createPageUrl('ClubDetail') + `?id=${club.id}`} className="flex-1">
                      <Button variant="outline" className="w-full">
                        View Details
                      </Button>
                    </Link>
                    {studentProfile && !isMember(club.id) && club.status === 'Active' && (
                      <Button
                        onClick={() => joinClubMutation.mutate({ club })}
                        disabled={joinClubMutation.isPending}
                        className="bg-gradient-to-r from-purple-600 to-blue-600"
                      >
                        {joinClubMutation.isPending ? '...' : <UserPlus className="w-4 h-4" />}
                      </Button>
                    )}
                    {isMember(club.id) && (
                      <div className="flex items-center gap-1 text-green-600 text-sm font-semibold">
                        <CheckCircle className="w-4 h-4" />
                        Joined
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        {filteredClubs.length === 0 && (
          <div className="text-center py-12">
            <Sparkles className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600">No clubs found matching your search</p>
          </div>
        )}
      </div>
    </div>
  );
}