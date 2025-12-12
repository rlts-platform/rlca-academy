import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ScrollArea } from "@/components/ui/scroll-area";
import { 
  Activity, AlertTriangle, Bug, Clock, Database, 
  TrendingUp, Users, Zap, CheckCircle, XCircle, 
  AlertCircle, Search, Filter, RefreshCw
} from 'lucide-react';
import { motion } from 'framer-motion';
import { format } from 'date-fns';

export default function OwnerControlPanel() {
  const [currentUser, setCurrentUser] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [severityFilter, setSeverityFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');
  const queryClient = useQueryClient();

  useEffect(() => {
    loadUser();
  }, []);

  const loadUser = async () => {
    try {
      const user = await base44.auth.me();
      if (user.email !== 'jarivera43019@gmail.com' && user.role !== 'admin') {
        window.location.href = '/';
        return;
      }
      setCurrentUser(user);
    } catch (error) {
      window.location.href = '/';
    }
  };

  const { data: activityLogs = [], refetch: refetchLogs } = useQuery({
    queryKey: ['activity-logs'],
    queryFn: () => base44.entities.ActivityLog.list('-timestamp', 500),
    enabled: !!currentUser,
    refetchInterval: 30000 // Refresh every 30 seconds
  });

  const { data: systemIssues = [], refetch: refetchIssues } = useQuery({
    queryKey: ['system-issues'],
    queryFn: () => base44.entities.SystemIssue.list('-created_date', 200),
    enabled: !!currentUser,
    refetchInterval: 30000
  });

  const updateIssueMutation = useMutation({
    mutationFn: ({ id, data }) => base44.entities.SystemIssue.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['system-issues'] });
    }
  });

  const handleResolveIssue = (issueId) => {
    updateIssueMutation.mutate({
      id: issueId,
      data: {
        status: 'resolved',
        resolved_date: new Date().toISOString(),
        resolution_notes: 'Marked as resolved by owner'
      }
    });
  };

  const handleRefresh = () => {
    refetchLogs();
    refetchIssues();
  };

  if (!currentUser) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 flex items-center justify-center">
        <div className="text-white text-center">
          <div className="w-16 h-16 border-4 border-white border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p>Verifying access...</p>
        </div>
      </div>
    );
  }

  // Statistics
  const stats = {
    totalActivities: activityLogs.length,
    totalIssues: systemIssues.length,
    openIssues: systemIssues.filter(i => i.status === 'open').length,
    criticalIssues: systemIssues.filter(i => i.severity === 'critical').length,
    recentErrors: activityLogs.filter(l => l.activity_type === 'error').length,
    uniqueUsers: new Set(activityLogs.map(l => l.user_email)).size
  };

  // Filtered issues
  const filteredIssues = systemIssues.filter(issue => {
    const matchesSearch = searchTerm === '' || 
      issue.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      issue.description?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesSeverity = severityFilter === 'all' || issue.severity === severityFilter;
    const matchesType = typeFilter === 'all' || issue.issue_type === typeFilter;
    return matchesSearch && matchesSeverity && matchesType;
  });

  const severityColors = {
    low: 'bg-blue-100 text-blue-800',
    medium: 'bg-yellow-100 text-yellow-800',
    high: 'bg-orange-100 text-orange-800',
    critical: 'bg-red-100 text-red-800'
  };

  const statusColors = {
    open: 'bg-red-100 text-red-800',
    investigating: 'bg-yellow-100 text-yellow-800',
    resolved: 'bg-green-100 text-green-800',
    closed: 'bg-gray-100 text-gray-800'
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-purple-500 to-blue-600 flex items-center justify-center shadow-xl">
                <Activity className="w-9 h-9 text-white" />
              </div>
              <div>
                <h1 className="text-4xl font-bold text-white">Owner Control Panel</h1>
                <p className="text-gray-300 mt-1">Real-time platform monitoring & issue tracking</p>
              </div>
            </div>
            <Button onClick={handleRefresh} variant="outline" className="bg-white/10 text-white border-white/20 hover:bg-white/20">
              <RefreshCw className="w-4 h-4 mr-2" />
              Refresh
            </Button>
          </div>
        </motion.div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-8">
          <StatsCard
            icon={Activity}
            title="Total Activities"
            value={stats.totalActivities}
            color="purple"
          />
          <StatsCard
            icon={AlertTriangle}
            title="Total Issues"
            value={stats.totalIssues}
            color="orange"
          />
          <StatsCard
            icon={AlertCircle}
            title="Open Issues"
            value={stats.openIssues}
            color="red"
          />
          <StatsCard
            icon={Zap}
            title="Critical"
            value={stats.criticalIssues}
            color="red"
          />
          <StatsCard
            icon={Bug}
            title="Recent Errors"
            value={stats.recentErrors}
            color="orange"
          />
          <StatsCard
            icon={Users}
            title="Unique Users"
            value={stats.uniqueUsers}
            color="blue"
          />
        </div>

        {/* Main Content */}
        <Tabs defaultValue="issues">
          <TabsList className="bg-white/10 border-white/20">
            <TabsTrigger value="issues" className="data-[state=active]:bg-white/20 text-white">
              System Issues ({stats.openIssues})
            </TabsTrigger>
            <TabsTrigger value="activity" className="data-[state=active]:bg-white/20 text-white">
              Activity Logs
            </TabsTrigger>
            <TabsTrigger value="analytics" className="data-[state=active]:bg-white/20 text-white">
              Analytics
            </TabsTrigger>
          </TabsList>

          <TabsContent value="issues">
            <Card className="bg-white/5 backdrop-blur-xl border-white/10 shadow-2xl">
              <CardHeader className="border-b border-white/10">
                <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
                  <CardTitle className="text-white">System Issues & Tickets</CardTitle>
                  <div className="flex flex-wrap gap-2">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                      <Input
                        placeholder="Search issues..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-10 bg-white/10 border-white/20 text-white placeholder:text-gray-400"
                      />
                    </div>
                    <Select value={severityFilter} onValueChange={setSeverityFilter}>
                      <SelectTrigger className="w-32 bg-white/10 border-white/20 text-white">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Severity</SelectItem>
                        <SelectItem value="low">Low</SelectItem>
                        <SelectItem value="medium">Medium</SelectItem>
                        <SelectItem value="high">High</SelectItem>
                        <SelectItem value="critical">Critical</SelectItem>
                      </SelectContent>
                    </Select>
                    <Select value={typeFilter} onValueChange={setTypeFilter}>
                      <SelectTrigger className="w-32 bg-white/10 border-white/20 text-white">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Types</SelectItem>
                        <SelectItem value="error">Error</SelectItem>
                        <SelectItem value="bug">Bug</SelectItem>
                        <SelectItem value="performance">Performance</SelectItem>
                        <SelectItem value="security">Security</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="p-6">
                <ScrollArea className="h-[600px]">
                  <div className="space-y-4">
                    {filteredIssues.map((issue) => (
                      <motion.div
                        key={issue.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="p-4 bg-white/5 rounded-lg border border-white/10 hover:bg-white/10 transition-colors"
                      >
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex-1">
                            <div className="flex items-center gap-3 mb-2">
                              <Badge className={severityColors[issue.severity]}>
                                {issue.severity}
                              </Badge>
                              <Badge className={statusColors[issue.status]}>
                                {issue.status}
                              </Badge>
                              <span className="text-xs text-gray-400">#{issue.ticket_id}</span>
                            </div>
                            <h3 className="text-lg font-semibold text-white mb-1">{issue.title}</h3>
                            <p className="text-sm text-gray-300 mb-2">{issue.description}</p>
                            <div className="flex flex-wrap gap-3 text-xs text-gray-400">
                              <span>📅 {format(new Date(issue.created_date), 'MMM d, yyyy h:mm a')}</span>
                              {issue.affected_page && <span>📍 {issue.affected_page}</span>}
                              {issue.affected_users?.length > 0 && (
                                <span>👥 {issue.affected_users.length} user(s)</span>
                              )}
                            </div>
                          </div>
                          {issue.status === 'open' && (
                            <Button
                              onClick={() => handleResolveIssue(issue.id)}
                              size="sm"
                              className="bg-green-600 hover:bg-green-700"
                            >
                              <CheckCircle className="w-4 h-4 mr-1" />
                              Resolve
                            </Button>
                          )}
                        </div>
                      </motion.div>
                    ))}
                    {filteredIssues.length === 0 && (
                      <div className="text-center py-12 text-gray-400">
                        <CheckCircle className="w-16 h-16 mx-auto mb-4 opacity-50" />
                        <p>No issues found</p>
                      </div>
                    )}
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="activity">
            <Card className="bg-white/5 backdrop-blur-xl border-white/10 shadow-2xl">
              <CardHeader className="border-b border-white/10">
                <CardTitle className="text-white">Recent Activity Logs</CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <ScrollArea className="h-[600px]">
                  <div className="space-y-2">
                    {activityLogs.map((log) => (
                      <div
                        key={log.id}
                        className="p-3 bg-white/5 rounded-lg border border-white/10 hover:bg-white/10 transition-colors"
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <Badge className={severityColors[log.severity] || 'bg-gray-100 text-gray-800'}>
                                {log.activity_type}
                              </Badge>
                              <span className="text-xs text-gray-400">
                                {format(new Date(log.timestamp), 'MMM d, h:mm:ss a')}
                              </span>
                            </div>
                            <div className="text-sm text-gray-300">
                              <span className="font-semibold">{log.user_email}</span>
                              {' • '}
                              <span>{log.page_name}</span>
                            </div>
                            {log.error_message && (
                              <div className="mt-2 text-xs text-red-300 bg-red-900/20 p-2 rounded">
                                {log.error_message}
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="analytics">
            <Card className="bg-white/5 backdrop-blur-xl border-white/10 shadow-2xl">
              <CardHeader className="border-b border-white/10">
                <CardTitle className="text-white">Platform Analytics</CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="p-6 bg-white/5 rounded-xl">
                    <h3 className="text-lg font-semibold text-white mb-4">Activity Breakdown</h3>
                    <div className="space-y-3">
                      {Object.entries(
                        activityLogs.reduce((acc, log) => {
                          acc[log.activity_type] = (acc[log.activity_type] || 0) + 1;
                          return acc;
                        }, {})
                      ).map(([type, count]) => (
                        <div key={type} className="flex justify-between items-center">
                          <span className="text-gray-300">{type}</span>
                          <Badge className="bg-purple-100 text-purple-800">{count}</Badge>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="p-6 bg-white/5 rounded-xl">
                    <h3 className="text-lg font-semibold text-white mb-4">Issue Types</h3>
                    <div className="space-y-3">
                      {Object.entries(
                        systemIssues.reduce((acc, issue) => {
                          acc[issue.issue_type] = (acc[issue.issue_type] || 0) + 1;
                          return acc;
                        }, {})
                      ).map(([type, count]) => (
                        <div key={type} className="flex justify-between items-center">
                          <span className="text-gray-300">{type}</span>
                          <Badge className="bg-orange-100 text-orange-800">{count}</Badge>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}

function StatsCard({ icon: Icon, title, value, color }) {
  const colors = {
    purple: 'from-purple-500 to-purple-600',
    blue: 'from-blue-500 to-blue-600',
    green: 'from-green-500 to-green-600',
    red: 'from-red-500 to-red-600',
    orange: 'from-orange-500 to-orange-600',
    gold: 'from-yellow-500 to-yellow-600'
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      className="p-4 bg-white/5 backdrop-blur-xl rounded-xl border border-white/10 shadow-lg"
    >
      <div className={`w-12 h-12 rounded-lg bg-gradient-to-br ${colors[color]} flex items-center justify-center mb-3 shadow-lg`}>
        <Icon className="w-6 h-6 text-white" />
      </div>
      <div className="text-xs text-gray-400 mb-1">{title}</div>
      <div className="text-2xl font-bold text-white">{value}</div>
    </motion.div>
  );
}