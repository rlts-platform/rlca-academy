import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';

export default function EnrollmentForm({ students, subjects, units, clubs, onSubmit, onCancel, currentUser }) {
  const [formData, setFormData] = useState({
    student_id: '',
    course_type: '',
    course_id: '',
    enrollment_date: new Date().toISOString().split('T')[0],
    status: 'Active',
    academic_year: '2024-2025',
    semester: 'Full Year',
    notes: ''
  });

  const selectedStudent = students.find(s => s.id === formData.student_id);

  const getCourseOptions = () => {
    switch (formData.course_type) {
      case 'Subject':
        return subjects;
      case 'Unit':
        return units;
      case 'Club':
        return clubs;
      default:
        return [];
    }
  };

  const getCourseName = () => {
    const options = getCourseOptions();
    const course = options.find(c => c.id === formData.course_id);
    return course ? (course.name || course.title) : '';
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.student_id || !formData.course_type || !formData.course_id) {
      alert('Please fill in all required fields');
      return;
    }

    onSubmit({
      ...formData,
      student_name: selectedStudent?.full_name || '',
      student_email: selectedStudent?.student_email || '',
      course_name: getCourseName(),
      grade_level: selectedStudent?.grade_level || '',
      enrolled_by: currentUser.email
    });
  };

  return (
    <Card>
      <CardHeader className="border-b bg-gradient-to-r from-purple-600 to-blue-600 text-white">
        <CardTitle>Enroll Student in Course</CardTitle>
      </CardHeader>
      <CardContent className="p-6">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label>Select Student *</Label>
            <Select
              value={formData.student_id}
              onValueChange={(value) => setFormData({ ...formData, student_id: value })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Choose a student" />
              </SelectTrigger>
              <SelectContent>
                {students.map((student) => (
                  <SelectItem key={student.id} value={student.id}>
                    {student.full_name} ({student.grade_level})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label>Course Type *</Label>
            <Select
              value={formData.course_type}
              onValueChange={(value) => setFormData({ ...formData, course_type: value, course_id: '' })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select course type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Subject">Subject</SelectItem>
                <SelectItem value="Unit">Unit</SelectItem>
                <SelectItem value="Club">Club</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {formData.course_type && (
            <div>
              <Label>Select {formData.course_type} *</Label>
              <Select
                value={formData.course_id}
                onValueChange={(value) => setFormData({ ...formData, course_id: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder={`Choose a ${formData.course_type.toLowerCase()}`} />
                </SelectTrigger>
                <SelectContent>
                  {getCourseOptions().map((course) => (
                    <SelectItem key={course.id} value={course.id}>
                      {course.name || course.title}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Enrollment Date *</Label>
              <Input
                type="date"
                value={formData.enrollment_date}
                onChange={(e) => setFormData({ ...formData, enrollment_date: e.target.value })}
                required
              />
            </div>
            <div>
              <Label>Status</Label>
              <Select
                value={formData.status}
                onValueChange={(value) => setFormData({ ...formData, status: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Active">Active</SelectItem>
                  <SelectItem value="Pending">Pending</SelectItem>
                  <SelectItem value="Waitlisted">Waitlisted</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Academic Year</Label>
              <Input
                value={formData.academic_year}
                onChange={(e) => setFormData({ ...formData, academic_year: e.target.value })}
              />
            </div>
            <div>
              <Label>Semester</Label>
              <Select
                value={formData.semester}
                onValueChange={(value) => setFormData({ ...formData, semester: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Fall">Fall</SelectItem>
                  <SelectItem value="Spring">Spring</SelectItem>
                  <SelectItem value="Summer">Summer</SelectItem>
                  <SelectItem value="Full Year">Full Year</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div>
            <Label>Notes (Optional)</Label>
            <Textarea
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              placeholder="Add any additional notes..."
              rows={3}
            />
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <Button type="button" variant="outline" onClick={onCancel}>
              Cancel
            </Button>
            <Button type="submit" className="bg-gradient-to-r from-purple-600 to-blue-600">
              Enroll Student
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}