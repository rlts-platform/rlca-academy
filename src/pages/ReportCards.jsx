import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { FileText, Download, Eye } from "lucide-react";
import { motion } from "framer-motion";

export default function ReportCards() {
  const [currentUser, setCurrentUser] = useState(null);
  const [studentProfile, setStudentProfile] = useState(null);
  const [selectedReport, setSelectedReport] = useState(null);

  useEffect(() => {
    loadUserProfile();
  }, []);

  const loadUserProfile = async () => {
    const user = await base44.auth.me();
    setCurrentUser(user);
    const students = await base44.entities.Student.filter({ student_email: user.email });
    if (students && students.length > 0) {
      setStudentProfile(students[0]);
    }
  };

  const { data: reportCards = [] } = useQuery({
    queryKey: ['report-cards', studentProfile?.id],
    queryFn: () => studentProfile ? base44.entities.ReportCard.filter({ student_id: studentProfile.id }, '-created_date') : [],
    enabled: !!studentProfile
  });

  const getRatingColor = (rating) => {
    const colors = {
      'Exemplary': 'text-green-700',
      'Consistent': 'text-blue-700',
      'Developing': 'text-yellow-700',
      'Emerging': 'text-orange-700',
      'Exceptional': 'text-purple-700',
      'Strong': 'text-blue-700'
    };
    return colors[rating] || 'text-gray-700';
  };

  if (!studentProfile) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-pink-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-purple-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
        </div>
      </div>
    );
  }

  if (selectedReport) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-pink-50 p-6">
        <div className="max-w-4xl mx-auto">
          <Button variant="outline" onClick={() => setSelectedReport(null)} className="mb-6">
            ← Back to Reports
          </Button>

          <Card className="shadow-2xl bg-white">
            <CardHeader className="border-b bg-gradient-to-r from-purple-600 to-blue-600 text-white">
              <div className="text-center">
                <h1 className="text-3xl font-bold mb-2">Royal Legends Children Academy</h1>
                <p className="text-lg">Progress Report</p>
              </div>
            </CardHeader>
            <CardContent className="p-8 space-y-6">
              {/* Student Info */}
              <div className="grid grid-cols-2 gap-4 pb-4 border-b">
                <div>
                  <div className="text-sm text-gray-600">Student Name</div>
                  <div className="font-semibold">{selectedReport.student_name}</div>
                </div>
                <div>
                  <div className="text-sm text-gray-600">Grade Level</div>
                  <div className="font-semibold">{selectedReport.grade_level}</div>
                </div>
                <div>
                  <div className="text-sm text-gray-600">Reporting Period</div>
                  <div className="font-semibold">{selectedReport.reporting_period}</div>
                </div>
                <div>
                  <div className="text-sm text-gray-600">Academic Year</div>
                  <div className="font-semibold">{selectedReport.academic_year}</div>
                </div>
              </div>

              {/* Academic Grades */}
              <div>
                <h3 className="text-xl font-bold mb-4">Academic Performance</h3>
                <div className="space-y-3">
                  {selectedReport.subject_grades?.map((grade, i) => (
                    <Card key={i} className="border-2">
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between mb-2">
                          <h4 className="font-semibold text-lg">{grade.subject}</h4>
                          <div className="flex gap-2">
                            <Badge className="bg-purple-100 text-purple-800 text-lg">
                              {grade.letter_grade} ({grade.percentage}%)
                            </Badge>
                            <Badge variant="outline">{grade.mastery_level}</Badge>
                          </div>
                        </div>
                        <div className="text-sm text-gray-600 mb-2">
                          Effort: <span className="font-semibold">{grade.effort_rating}</span>
                        </div>
                        {grade.teacher_comment && (
                          <p className="text-sm text-gray-700 italic">{grade.teacher_comment}</p>
                        )}
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>

              {/* Character Development */}
              {selectedReport.character_development && (
                <div>
                  <h3 className="text-xl font-bold mb-4">Character Development</h3>
                  <div className="grid grid-cols-2 gap-4">
                    {Object.entries(selectedReport.character_development).filter(([key]) => key !== 'notes').map(([trait, rating]) => (
                      <div key={trait} className="p-3 bg-blue-50 rounded-lg border border-blue-200">
                        <div className="text-sm text-gray-600 capitalize">{trait}</div>
                        <div className={`font-semibold ${getRatingColor(rating)}`}>{rating}</div>
                      </div>
                    ))}
                  </div>
                  {selectedReport.character_development.notes && (
                    <p className="mt-3 text-sm text-gray-700 italic">{selectedReport.character_development.notes}</p>
                  )}
                </div>
              )}

              {/* Entrepreneurship Skills */}
              {selectedReport.entrepreneurship_skills && (
                <div>
                  <h3 className="text-xl font-bold mb-4">Entrepreneurship & Leadership</h3>
                  <div className="grid grid-cols-2 gap-4">
                    {Object.entries(selectedReport.entrepreneurship_skills).filter(([key]) => key !== 'notes').map(([skill, rating]) => (
                      <div key={skill} className="p-3 bg-green-50 rounded-lg border border-green-200">
                        <div className="text-sm text-gray-600 capitalize">{skill.replace('_', ' ')}</div>
                        <div className={`font-semibold ${getRatingColor(rating)}`}>{rating}</div>
                      </div>
                    ))}
                  </div>
                  {selectedReport.entrepreneurship_skills.notes && (
                    <p className="mt-3 text-sm text-gray-700 italic">{selectedReport.entrepreneurship_skills.notes}</p>
                  )}
                </div>
              )}

              {/* Attendance */}
              {selectedReport.attendance_summary && (
                <div>
                  <h3 className="text-xl font-bold mb-4">Attendance Summary</h3>
                  <div className="grid grid-cols-4 gap-4">
                    <div className="p-3 bg-gray-50 rounded-lg text-center">
                      <div className="text-2xl font-bold text-green-600">{selectedReport.attendance_summary.days_present}</div>
                      <div className="text-sm text-gray-600">Present</div>
                    </div>
                    <div className="p-3 bg-gray-50 rounded-lg text-center">
                      <div className="text-2xl font-bold text-red-600">{selectedReport.attendance_summary.days_absent}</div>
                      <div className="text-sm text-gray-600">Absent</div>
                    </div>
                    <div className="p-3 bg-gray-50 rounded-lg text-center">
                      <div className="text-2xl font-bold text-yellow-600">{selectedReport.attendance_summary.days_late}</div>
                      <div className="text-sm text-gray-600">Late</div>
                    </div>
                    <div className="p-3 bg-gray-50 rounded-lg text-center">
                      <div className="text-2xl font-bold text-purple-600">{selectedReport.attendance_summary.total_days}</div>
                      <div className="text-sm text-gray-600">Total Days</div>
                    </div>
                  </div>
                </div>
              )}

              {/* Teacher Narrative */}
              {selectedReport.teacher_narrative && (
                <div>
                  <h3 className="text-xl font-bold mb-4">Teacher Comments</h3>
                  <p className="text-gray-700 whitespace-pre-wrap bg-gray-50 p-4 rounded-lg">
                    {selectedReport.teacher_narrative}
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-pink-50 p-6">
      <div className="max-w-5xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-purple-500 to-blue-600 flex items-center justify-center shadow-xl">
              <FileText className="w-9 h-9 text-white" />
            </div>
            <div>
              <h1 className="text-4xl font-bold text-gray-900">Report Cards</h1>
              <p className="text-gray-600 mt-1">Academic and character progress reports</p>
            </div>
          </div>
        </motion.div>

        {reportCards.length === 0 ? (
          <Card className="shadow-lg">
            <CardContent className="p-12 text-center">
              <FileText className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-600">No report cards available yet</p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {reportCards.map(report => (
              <motion.div key={report.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
                <Card className="shadow-lg hover:shadow-xl transition-shadow cursor-pointer" onClick={() => setSelectedReport(report)}>
                  <CardHeader className="border-b bg-gradient-to-r from-purple-50 to-blue-50">
                    <CardTitle>{report.reporting_period}</CardTitle>
                    <p className="text-sm text-gray-600">{report.academic_year}</p>
                  </CardHeader>
                  <CardContent className="p-6">
                    <div className="space-y-2 mb-4">
                      <div className="text-sm text-gray-600">
                        Subjects: {report.subject_grades?.length || 0}
                      </div>
                    </div>
                    <Button className="w-full" variant="outline">
                      <Eye className="w-4 h-4 mr-2" />
                      View Report
                    </Button>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}