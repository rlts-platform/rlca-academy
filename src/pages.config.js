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
import TeacherDashboard from './pages/TeacherDashboard';
import TeacherGrading from './pages/TeacherGrading';
import SubjectView from './pages/SubjectView';
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
    "TeacherDashboard": TeacherDashboard,
    "TeacherGrading": TeacherGrading,
    "SubjectView": SubjectView,
    "UnitView": UnitView,
}

export const pagesConfig = {
    mainPage: "Home",
    Pages: PAGES,
    Layout: __Layout,
};