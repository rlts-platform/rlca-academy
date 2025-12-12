import React, { useEffect } from 'react';
import { base44 } from '@/api/base44Client';

export default function ActivityMonitor({ children }) {
  useEffect(() => {
    // Track page visibility and activity
    const logActivity = async (activityType, details = {}) => {
      try {
        const user = await base44.auth.me().catch(() => null);
        
        await base44.entities.ActivityLog.create({
          timestamp: new Date().toISOString(),
          activity_type: activityType,
          user_email: user?.email || 'anonymous',
          user_role: user?.role || 'guest',
          page_name: window.location.pathname,
          action_details: details,
          device_info: navigator.userAgent,
          severity: 'low'
        });
      } catch (error) {
        console.error('Failed to log activity:', error);
      }
    };

    // Global error handler
    const handleError = async (error, errorInfo) => {
      try {
        const user = await base44.auth.me().catch(() => null);
        
        // Log the error
        const activityLog = await base44.entities.ActivityLog.create({
          timestamp: new Date().toISOString(),
          activity_type: 'error',
          user_email: user?.email || 'anonymous',
          user_role: user?.role || 'guest',
          page_name: window.location.pathname,
          error_message: error.message || String(error),
          error_stack: error.stack || JSON.stringify(errorInfo),
          severity: 'high',
          device_info: navigator.userAgent
        });

        // Create system issue ticket
        await base44.entities.SystemIssue.create({
          ticket_id: `ERR-${Date.now()}`,
          title: `Error: ${error.message || 'Unknown Error'}`,
          description: `Error occurred on ${window.location.pathname}\n\nDetails: ${error.message}\n\nStack: ${error.stack}`,
          issue_type: 'error',
          severity: 'high',
          affected_users: user ? [user.email] : [],
          affected_page: window.location.pathname,
          error_details: {
            message: error.message,
            stack: error.stack,
            errorInfo: errorInfo
          },
          activity_log_ids: [activityLog.id],
          auto_detected: true
        });
      } catch (logError) {
        console.error('Failed to log error:', logError);
      }
    };

    // Listen for global errors
    const errorHandler = (event) => {
      handleError(event.error, { type: 'window.error' });
    };

    const unhandledRejectionHandler = (event) => {
      handleError(event.reason, { type: 'unhandledRejection' });
    };

    window.addEventListener('error', errorHandler);
    window.addEventListener('unhandledrejection', unhandledRejectionHandler);

    // Track page visits
    logActivity('page_visit', { url: window.location.href });

    // Performance monitoring
    const checkPerformance = async () => {
      if (window.performance && window.performance.timing) {
        const loadTime = window.performance.timing.loadEventEnd - window.performance.timing.navigationStart;
        
        if (loadTime > 5000) {
          const user = await base44.auth.me().catch(() => null);
          
          await base44.entities.SystemIssue.create({
            ticket_id: `PERF-${Date.now()}`,
            title: 'Slow Page Load Detected',
            description: `Page load time exceeded 5 seconds: ${loadTime}ms on ${window.location.pathname}`,
            issue_type: 'performance',
            severity: 'medium',
            affected_users: user ? [user.email] : [],
            affected_page: window.location.pathname,
            error_details: { loadTime, url: window.location.href },
            auto_detected: true
          });
        }
      }
    };

    setTimeout(checkPerformance, 1000);

    return () => {
      window.removeEventListener('error', errorHandler);
      window.removeEventListener('unhandledrejection', unhandledRejectionHandler);
    };
  }, []);

  return <>{children}</>;
}

// Hook for manual activity logging
export const useActivityLogger = () => {
  const logActivity = async (activityType, details = {}) => {
    try {
      const user = await base44.auth.me().catch(() => null);
      
      await base44.entities.ActivityLog.create({
        timestamp: new Date().toISOString(),
        activity_type: activityType,
        user_email: user?.email || 'anonymous',
        user_role: user?.role || 'guest',
        page_name: window.location.pathname,
        action_details: details,
        device_info: navigator.userAgent,
        severity: details.severity || 'low'
      });
    } catch (error) {
      console.error('Failed to log activity:', error);
    }
  };

  return { logActivity };
};