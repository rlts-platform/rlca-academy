import { base44 } from '@/api/base44Client';

export async function getUserPreferences(userEmail) {
  try {
    const prefs = await base44.entities.NotificationPreference.filter({ user_email: userEmail });
    if (prefs && prefs.length > 0) {
      return prefs[0];
    }
    return {
      enrollment_notifications: true,
      enrollment_status_changes: true,
      grade_updates: true,
      attendance_updates: true,
      event_reminders: true,
      announcements: true,
      assignment_reminders: true
    };
  } catch (error) {
    console.error('Error fetching preferences:', error);
    return null;
  }
}

export async function createNotification({ recipient_email, type, title, message, related_id, priority = 'medium' }) {
  try {
    const prefs = await getUserPreferences(recipient_email);
    if (!prefs) return;

    const preferenceMap = {
      'enrollment': 'enrollment_notifications',
      'enrollment_status': 'enrollment_status_changes',
      'grade': 'grade_updates',
      'attendance': 'attendance_updates',
      'event': 'event_reminders',
      'announcement': 'announcements',
      'assignment': 'assignment_reminders'
    };

    const prefKey = preferenceMap[type];
    if (prefKey && prefs[prefKey] === false) {
      return;
    }

    await base44.entities.Notification.create({
      recipient_email,
      type,
      title,
      message,
      related_id,
      priority,
      read: false
    });
  } catch (error) {
    console.error('Error creating notification:', error);
  }
}

export async function notifyNewEnrollment(enrollment, adminEmails) {
  for (const adminEmail of adminEmails) {
    await createNotification({
      recipient_email: adminEmail,
      type: 'enrollment',
      title: 'New Student Enrollment',
      message: `${enrollment.student_name} has been enrolled in ${enrollment.course_name}`,
      related_id: enrollment.id,
      priority: 'high'
    });
  }
}

export async function notifyEnrollmentStatusChange(enrollment, oldStatus) {
  if (enrollment.enrolled_by) {
    await createNotification({
      recipient_email: enrollment.enrolled_by,
      type: 'enrollment_status',
      title: 'Enrollment Status Changed',
      message: `${enrollment.student_name}'s enrollment in ${enrollment.course_name} changed from ${oldStatus} to ${enrollment.status}`,
      related_id: enrollment.id,
      priority: 'medium'
    });
  }

  if (enrollment.student_email) {
    const students = await base44.entities.Student.filter({ student_email: enrollment.student_email });
    if (students && students.length > 0 && students[0].parent_email) {
      await createNotification({
        recipient_email: students[0].parent_email,
        type: 'enrollment_status',
        title: 'Course Enrollment Update',
        message: `${enrollment.student_name}'s enrollment in ${enrollment.course_name} is now ${enrollment.status}`,
        related_id: enrollment.id,
        priority: 'medium'
      });
    }
  }
}

export async function notifyNewGrade(grade) {
  try {
    const students = await base44.entities.Student.filter({ id: grade.student_id });
    if (students && students.length > 0 && students[0].parent_email) {
      await createNotification({
        recipient_email: students[0].parent_email,
        type: 'grade',
        title: 'New Grade Posted',
        message: `${grade.student_name} received ${grade.score}/${grade.max_score || 100} on ${grade.assignment_name}`,
        related_id: grade.id,
        priority: 'medium'
      });
    }
  } catch (error) {
    console.error('Error notifying grade:', error);
  }
}

export async function notifyAttendanceUpdate(attendance) {
  try {
    const students = await base44.entities.Student.filter({ id: attendance.student_id });
    if (students && students.length > 0 && students[0].parent_email) {
      const statusText = attendance.status === 'Absent' ? '❌ marked absent' : 
                        attendance.status === 'Late' ? '🕐 marked late' : 
                        attendance.status === 'Excused' ? 'excused absence' : '✓ present';
      
      await createNotification({
        recipient_email: students[0].parent_email,
        type: 'attendance',
        title: 'Attendance Update',
        message: `${attendance.student_name} was ${statusText} on ${new Date(attendance.date).toLocaleDateString()}`,
        related_id: attendance.id,
        priority: attendance.status === 'Absent' ? 'high' : 'low'
      });
    }
  } catch (error) {
    console.error('Error notifying attendance:', error);
  }
}

export async function notifyUpcomingEvent(event, recipientEmails) {
  for (const email of recipientEmails) {
    await createNotification({
      recipient_email: email,
      type: 'event',
      title: 'Upcoming Event Reminder',
      message: `${event.title} is coming up on ${new Date(event.start_datetime).toLocaleDateString()}`,
      related_id: event.id,
      priority: 'medium'
    });
  }
}

export async function notifyAnnouncement(announcement, recipientEmails) {
  for (const email of recipientEmails) {
    await createNotification({
      recipient_email: email,
      type: 'announcement',
      title: announcement.title,
      message: announcement.content.substring(0, 100) + '...',
      related_id: announcement.id,
      priority: announcement.priority || 'medium'
    });
  }
}