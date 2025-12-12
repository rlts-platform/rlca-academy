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
}

export const pagesConfig = {
    mainPage: "StudentDashboard",
    Pages: PAGES,
    Layout: __Layout,
};