/**
 * pages.config.js - Page routing configuration
 * 
 * This file is AUTO-GENERATED. Do not add imports or modify PAGES manually.
 * Pages are auto-registered when you create files in the ./pages/ folder.
 * 
 * THE ONLY EDITABLE VALUE: mainPage
 * This controls which page is the landing page (shown when users visit the app).
 * 
 * Example file structure:
 * 
 *   import HomePage from './pages/HomePage';
 *   import Dashboard from './pages/Dashboard';
 *   import Settings from './pages/Settings';
 *   
 *   export const PAGES = {
 *       "HomePage": HomePage,
 *       "Dashboard": Dashboard,
 *       "Settings": Settings,
 *   }
 *   
 *   export const pagesConfig = {
 *       mainPage: "HomePage",
 *       Pages: PAGES,
 *   };
 * 
 * Example with Layout (wraps all pages):
 *
 *   import Home from './pages/Home';
 *   import Settings from './pages/Settings';
 *   import __Layout from './Layout.jsx';
 *
 *   export const PAGES = {
 *       "Home": Home,
 *       "Settings": Settings,
 *   }
 *
 *   export const pagesConfig = {
 *       mainPage: "Home",
 *       Pages: PAGES,
 *       Layout: __Layout,
 *   };
 *
 * To change the main page from HomePage to Dashboard, use find_replace:
 *   Old: mainPage: "HomePage",
 *   New: mainPage: "Dashboard",
 *
 * The mainPage value must match a key in the PAGES object exactly.
 */
import AITutor from './pages/AITutor';
import AdminDashboard from './pages/AdminDashboard';
import AssignmentSubmission from './pages/AssignmentSubmission';
import ClubDetail from './pages/ClubDetail';
import ClubDirectory from './pages/ClubDirectory';
import ClubEventDetail from './pages/ClubEventDetail';
import ClubManagement from './pages/ClubManagement';
import CurriculumDashboard from './pages/CurriculumDashboard';
import EnrollmentManagement from './pages/EnrollmentManagement';
import GamificationDashboard from './pages/GamificationDashboard';
import GenerateLearningPlan from './pages/GenerateLearningPlan';
import GetStarted from './pages/GetStarted';
import Home from './pages/Home';
import HomePage from './pages/HomePage';
import LearningPlanView from './pages/LearningPlanView';
import LessonViewer from './pages/LessonViewer';
import NotificationSettings from './pages/NotificationSettings';
import OwnerControlPanel from './pages/OwnerControlPanel';
import ParentCommunication from './pages/ParentCommunication';
import ParentDashboard from './pages/ParentDashboard';
import QuizView from './pages/QuizView';
import ReportCards from './pages/ReportCards';
import StudentAssignments from './pages/StudentAssignments';
import StudentDashboard from './pages/StudentDashboard';
import StudentOnboarding from './pages/StudentOnboarding';
import SubjectView from './pages/SubjectView';
import TeacherDashboard from './pages/TeacherDashboard';
import TeacherGrading from './pages/TeacherGrading';
import UnitView from './pages/UnitView';
import __Layout from './Layout.jsx';


export const PAGES = {
    "AITutor": AITutor,
    "AdminDashboard": AdminDashboard,
    "AssignmentSubmission": AssignmentSubmission,
    "ClubDetail": ClubDetail,
    "ClubDirectory": ClubDirectory,
    "ClubEventDetail": ClubEventDetail,
    "ClubManagement": ClubManagement,
    "CurriculumDashboard": CurriculumDashboard,
    "EnrollmentManagement": EnrollmentManagement,
    "GamificationDashboard": GamificationDashboard,
    "GenerateLearningPlan": GenerateLearningPlan,
    "GetStarted": GetStarted,
    "Home": Home,
    "HomePage": HomePage,
    "LearningPlanView": LearningPlanView,
    "LessonViewer": LessonViewer,
    "NotificationSettings": NotificationSettings,
    "OwnerControlPanel": OwnerControlPanel,
    "ParentCommunication": ParentCommunication,
    "ParentDashboard": ParentDashboard,
    "QuizView": QuizView,
    "ReportCards": ReportCards,
    "StudentAssignments": StudentAssignments,
    "StudentDashboard": StudentDashboard,
    "StudentOnboarding": StudentOnboarding,
    "SubjectView": SubjectView,
    "TeacherDashboard": TeacherDashboard,
    "TeacherGrading": TeacherGrading,
    "UnitView": UnitView,
}

export const pagesConfig = {
    mainPage: "HomePage",
    Pages: PAGES,
    Layout: __Layout,
};