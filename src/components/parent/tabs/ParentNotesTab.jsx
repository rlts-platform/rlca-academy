import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { StickyNote, Plus, Trash2 } from 'lucide-react';
import { format, parseISO } from 'date-fns';
import { toast } from 'react-hot-toast';

export default function ParentNotesTab({ student }) {
  const queryClient = useQueryClient();
  const [currentUser, setCurrentUser] = React.useState(null);
  const [newNote, setNewNote] = useState({ text: '', category: 'General' });

  React.useEffect(() => {
    loadUser();
  }, []);

  const loadUser = async () => {
    const user = await base44.auth.me();
    setCurrentUser(user);
  };

  const { data: notes = [] } = useQuery({
    queryKey: ['parent-notes', currentUser?.email, student.id],
    queryFn: () => currentUser ? base44.entities.ParentNotes.filter({ 
      parent_email: currentUser.email,
      student_id: student.id 
    }, '-created_date') : [],
    enabled: !!currentUser
  });

  const createNoteMutation = useMutation({
    mutationFn: (noteData) => base44.entities.ParentNotes.create(noteData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['parent-notes'] });
      setNewNote({ text: '', category: 'General' });
      toast.success('Note added!');
    }
  });

  const deleteNoteMutation = useMutation({
    mutationFn: (noteId) => base44.entities.ParentNotes.delete(noteId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['parent-notes'] });
      toast.success('Note deleted');
    }
  });

  const handleAddNote = () => {
    if (!newNote.text.trim() || !currentUser) return;
    createNoteMutation.mutate({
      parent_email: currentUser.email,
      student_id: student.id,
      student_name: student.full_name,
      note_text: newNote.text,
      category: newNote.category,
      timestamp: new Date().toISOString()
    });
  };

  const getCategoryColor = (category) => {
    const colors = {
      Academic: "bg-blue-100 text-blue-800",
      Behavioral: "bg-purple-100 text-purple-800",
      Scheduling: "bg-green-100 text-green-800",
      Health: "bg-red-100 text-red-800",
      General: "bg-gray-100 text-gray-800"
    };
    return colors[category] || colors.General;
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Plus className="w-5 h-5 text-purple-600" />
            Add New Note
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Select 
              value={newNote.category} 
              onValueChange={(v) => setNewNote({...newNote, category: v})}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Academic">Academic</SelectItem>
                <SelectItem value="Behavioral">Behavioral</SelectItem>
                <SelectItem value="Scheduling">Scheduling</SelectItem>
                <SelectItem value="Health">Health</SelectItem>
                <SelectItem value="General">General</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <Textarea 
            placeholder="Write your private note here..."
            value={newNote.text}
            onChange={(e) => setNewNote({...newNote, text: e.target.value})}
            rows={4}
          />
          <Button 
            onClick={handleAddNote}
            className="w-full bg-gradient-to-r from-purple-600 to-blue-600"
            disabled={!newNote.text.trim() || createNoteMutation.isLoading}
          >
            Add Note
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <StickyNote className="w-5 h-5 text-purple-600" />
            Your Private Notes ({notes.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {notes.length > 0 ? (
            <div className="space-y-3">
              {notes.map((note) => (
                <Card key={note.id} className="border-2">
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between mb-2">
                      <Badge className={getCategoryColor(note.category)}>
                        {note.category}
                      </Badge>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => deleteNoteMutation.mutate(note.id)}
                        className="text-red-600 hover:text-red-700 hover:bg-red-50"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                    <p className="text-sm text-gray-700 whitespace-pre-wrap mb-2">{note.note_text}</p>
                    <p className="text-xs text-gray-500">
                      {format(parseISO(note.created_date), 'MMM d, yyyy h:mm a')}
                    </p>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              No notes yet. Add your first note above!
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}