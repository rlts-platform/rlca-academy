import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Calendar, CheckCircle, XCircle, Clock, AlertCircle } from "lucide-react";
import { format, parseISO } from "date-fns";

export default function AttendanceCalendar({ attendance, title = "Attendance History" }) {
  const getStatusIcon = (status) => {
    switch (status) {
      case "Present":
        return <CheckCircle className="w-4 h-4" />;
      case "Absent":
        return <XCircle className="w-4 h-4" />;
      case "Late":
        return <Clock className="w-4 h-4" />;
      case "Excused":
        return <AlertCircle className="w-4 h-4" />;
      default:
        return null;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "Present":
        return "bg-green-100 text-green-800 border-green-200";
      case "Absent":
        return "bg-red-100 text-red-800 border-red-200";
      case "Late":
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "Excused":
        return "bg-blue-100 text-blue-800 border-blue-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const calculateStats = () => {
    if (!attendance || attendance.length === 0) return { present: 0, absent: 0, late: 0, rate: 0 };
    
    const present = attendance.filter(a => a.status === "Present").length;
    const absent = attendance.filter(a => a.status === "Absent").length;
    const late = attendance.filter(a => a.status === "Late").length;
    const rate = Math.round((present / attendance.length) * 100);
    
    return { present, absent, late, rate };
  };

  const stats = calculateStats();

  return (
    <Card className="shadow-lg">
      <CardHeader className="border-b bg-gradient-to-r from-blue-50 to-purple-50">
        <CardTitle className="flex items-center gap-2 text-blue-900">
          <Calendar className="w-5 h-5" />
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent className="p-6">
        <div className="grid grid-cols-4 gap-3 mb-6">
          <div className="text-center p-3 bg-green-50 rounded-lg border border-green-200">
            <div className="text-2xl font-bold text-green-700">{stats.present}</div>
            <div className="text-xs text-green-600">Present</div>
          </div>
          <div className="text-center p-3 bg-red-50 rounded-lg border border-red-200">
            <div className="text-2xl font-bold text-red-700">{stats.absent}</div>
            <div className="text-xs text-red-600">Absent</div>
          </div>
          <div className="text-center p-3 bg-yellow-50 rounded-lg border border-yellow-200">
            <div className="text-2xl font-bold text-yellow-700">{stats.late}</div>
            <div className="text-xs text-yellow-600">Late</div>
          </div>
          <div className="text-center p-3 bg-purple-50 rounded-lg border border-purple-200">
            <div className="text-2xl font-bold text-purple-700">{stats.rate}%</div>
            <div className="text-xs text-purple-600">Rate</div>
          </div>
        </div>

        {!attendance || attendance.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            No attendance records yet
          </div>
        ) : (
          <div className="space-y-2 max-h-64 overflow-y-auto">
            {attendance.slice(0, 15).map((record) => (
              <div
                key={record.id}
                className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className="text-sm font-medium text-gray-700">
                    {format(parseISO(record.date), 'MMM d, yyyy')}
                  </div>
                  {record.notes && (
                    <div className="text-xs text-gray-500">- {record.notes}</div>
                  )}
                </div>
                <Badge className={`${getStatusColor(record.status)} border flex items-center gap-1`}>
                  {getStatusIcon(record.status)}
                  {record.status}
                </Badge>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}