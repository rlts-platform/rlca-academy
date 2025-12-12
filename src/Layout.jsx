import React from 'react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { GraduationCap, Home, Users, UserCircle, LogOut, Brain, Gamepad2, Activity, Settings } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import ActivityMonitor from '@/components/monitoring/ActivityMonitor';

export default function Layout({ children, currentPageName }) {
  const [user, setUser] = React.useState(null);

  React.useEffect(() => {
    loadUser();
  }, []);

  const loadUser = async () => {
    try {
      const currentUser = await base44.auth.me();
      setUser(currentUser);
    } catch (error) {
      console.error("User not authenticated");
    }
  };

  const handleLogout = async () => {
    await base44.auth.logout(createPageUrl('HomePage'));
  };

  return (
    <ActivityMonitor>
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-pink-50">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-md border-b border-purple-100 shadow-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <Link to={createPageUrl('HomePage')} className="flex items-center gap-3 group">
              <div className="w-12 h-12 bg-gradient-to-br from-purple-600 to-blue-600 rounded-xl flex items-center justify-center shadow-lg group-hover:shadow-xl transition-shadow">
                <GraduationCap className="w-7 h-7 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
                  Royal Legends Children Academy
                </h1>
                <p className="text-xs text-gray-600">Raising Excellent Leaders</p>
              </div>
            </Link>

            {!user ? (
              <div className="flex items-center gap-3">
                <Button
                  variant="outline"
                  onClick={() => base44.auth.redirectToLogin()}
                >
                  Sign In
                </Button>
                <Button
                  onClick={() => window.location.href = '/GetStarted'}
                  className="bg-gradient-to-r from-purple-600 to-blue-600"
                >
                  Get Started
                </Button>
              </div>
            ) : (
              <nav className="flex items-center gap-6">
                <Link
                  to={createPageUrl('StudentDashboard')}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all ${
                    currentPageName === 'StudentDashboard'
                      ? 'bg-purple-100 text-purple-700 font-semibold'
                      : 'text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  <Home className="w-4 h-4" />
                  <span className="hidden md:inline">Student</span>
                </Link>
                <Link
                  to={createPageUrl('ParentDashboard')}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all ${
                    currentPageName === 'ParentDashboard'
                      ? 'bg-purple-100 text-purple-700 font-semibold'
                      : 'text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  <Users className="w-4 h-4" />
                  <span className="hidden md:inline">Parent</span>
                </Link>
                <Link
                  to={createPageUrl('LearningPlanView')}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all ${
                    currentPageName === 'LearningPlanView' || currentPageName === 'GenerateLearningPlan'
                      ? 'bg-purple-100 text-purple-700 font-semibold'
                      : 'text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  <Brain className="w-4 h-4" />
                  <span className="hidden md:inline">AI Plan</span>
                </Link>
                <Link
                  to={createPageUrl('GamificationDashboard')}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all ${
                    currentPageName === 'GamificationDashboard'
                      ? 'bg-purple-100 text-purple-700 font-semibold'
                      : 'text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  <Gamepad2 className="w-4 h-4" />
                  <span className="hidden md:inline">Rewards</span>
                </Link>
                <Link
                  to={createPageUrl('AITutor')}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all ${
                    currentPageName === 'AITutor'
                      ? 'bg-purple-100 text-purple-700 font-semibold'
                      : 'text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  <Brain className="w-4 h-4" />
                  <span className="hidden md:inline">AI Tutor</span>
                </Link>
                <Link
                  to={createPageUrl('ClubDirectory')}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all ${
                    currentPageName === 'ClubDirectory' || currentPageName === 'ClubDetail' || currentPageName === 'ClubManagement'
                      ? 'bg-purple-100 text-purple-700 font-semibold'
                      : 'text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  <Users className="w-4 h-4" />
                  <span className="hidden md:inline">Clubs</span>
                </Link>
                {user.role === 'admin' && (
                  <>
                    <Link
                      to={createPageUrl('AdminDashboard')}
                      className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all ${
                        currentPageName === 'AdminDashboard'
                          ? 'bg-purple-100 text-purple-700 font-semibold'
                          : 'text-gray-600 hover:bg-gray-100'
                      }`}
                    >
                      <UserCircle className="w-4 h-4" />
                      <span className="hidden md:inline">Admin</span>
                    </Link>
                    <Link
                      to={createPageUrl('EnrollmentManagement')}
                      className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all ${
                        currentPageName === 'EnrollmentManagement'
                          ? 'bg-purple-100 text-purple-700 font-semibold'
                          : 'text-gray-600 hover:bg-gray-100'
                      }`}
                    >
                      <Users className="w-4 h-4" />
                      <span className="hidden md:inline">Enrollments</span>
                    </Link>
                    {user.email === 'jarivera43019@gmail.com' && (
                      <Link
                        to={createPageUrl('OwnerControlPanel')}
                        className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all ${
                          currentPageName === 'OwnerControlPanel'
                            ? 'bg-purple-100 text-purple-700 font-semibold'
                            : 'text-gray-600 hover:bg-gray-100'
                        }`}
                      >
                        <Activity className="w-4 h-4" />
                        <span className="hidden md:inline">Monitor</span>
                      </Link>
                    )}
                  </>
                )}
                <Link
                  to={createPageUrl('NotificationSettings')}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all ${
                    currentPageName === 'NotificationSettings'
                      ? 'bg-purple-100 text-purple-700 font-semibold'
                      : 'text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  <Settings className="w-4 h-4" />
                  <span className="hidden md:inline">Settings</span>
                </Link>
                <button
                  onClick={handleLogout}
                  className="flex items-center gap-2 px-4 py-2 rounded-lg text-gray-600 hover:bg-red-50 hover:text-red-600 transition-all"
                >
                  <LogOut className="w-4 h-4" />
                  <span className="hidden md:inline">Logout</span>
                </button>
              </nav>
            )}
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main>{children}</main>

      {/* Footer */}
      <footer className="bg-white/60 backdrop-blur-sm border-t border-purple-100 mt-12">
        <div className="max-w-7xl mx-auto px-6 py-8">
          <div className="text-center text-gray-600">
            <p className="text-sm">© 2024 Royal Legends Children Academy. All rights reserved.</p>
            <p className="text-xs mt-2">Raising leaders grounded in truth, excellence, and purpose</p>
          </div>
        </div>
      </footer>

      <style>{`
        :root {
          --primary: 139 92 246;
          --primary-foreground: 255 255 255;
        }
      `}</style>
      </div>
      </ActivityMonitor>
      );
      }