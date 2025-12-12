import StudentDashboard from './pages/StudentDashboard';
import ParentDashboard from './pages/ParentDashboard';
import AdminDashboard from './pages/AdminDashboard';
import GenerateLearningPlan from './pages/GenerateLearningPlan';
import LearningPlanView from './pages/LearningPlanView';
import GamificationDashboard from './pages/GamificationDashboard';
import CurriculumDashboard from './pages/CurriculumDashboard';
import QuizView from './pages/QuizView';
import StudentAssignments from './pages/StudentAssignments';
import AssignmentSubmission from './pages/AssignmentSubmission';
import LessonViewer from './pages/LessonViewer';
import ParentCommunication from './pages/ParentCommunication';
import TeacherGrading from './pages/TeacherGrading';
import AITutor from './pages/AITutor';
import ReportCards from './pages/ReportCards';
import StudentOnboarding from './pages/StudentOnboarding';
import GetStarted from './pages/GetStarted';
import HomePage from './pages/HomePage';
import OwnerControlPanel from './pages/OwnerControlPanel';
import ClubDirectory from './pages/ClubDirectory';
import ClubDetail from './pages/ClubDetail';
import ClubManagement from './pages/ClubManagement';
import ClubEventDetail from './pages/ClubEventDetail';
import __Layout from './Layout.jsx';


export const PAGES = {
    "StudentDashboard": StudentDashboard,
    "ParentDashboard": ParentDashboard,
    "AdminDashboard": AdminDashboard,
    "GenerateLearningPlan": GenerateLearningPlan,
    "LearningPlanView": LearningPlanView,
    "GamificationDashboard": GamificationDashboard,
    "CurriculumDashboard": CurriculumDashboard,
    "QuizView": QuizView,
    "StudentAssignments": StudentAssignments,
    "AssignmentSubmission": AssignmentSubmission,
    "LessonViewer": LessonViewer,
    "ParentCommunication": ParentCommunication,
    "TeacherGrading": TeacherGrading,
    "AITutor": AITutor,
    "ReportCards": ReportCards,
    "StudentOnboarding": StudentOnboarding,
    "GetStarted": GetStarted,
    "HomePage": HomePage,
    "OwnerControlPanel": OwnerControlPanel,
    "ClubDirectory": ClubDirectory,
    "ClubDetail": ClubDetail,
    "ClubManagement": ClubManagement,
    "ClubEventDetail": ClubEventDetail,
}

export const pagesConfig = {
    mainPage: "StudentDashboard",
    Pages: PAGES,
    Layout: __Layout,
};