import StudentDashboard from './pages/StudentDashboard';
import ParentDashboard from './pages/ParentDashboard';
import AdminDashboard from './pages/AdminDashboard';
import __Layout from './Layout.jsx';


export const PAGES = {
    "StudentDashboard": StudentDashboard,
    "ParentDashboard": ParentDashboard,
    "AdminDashboard": AdminDashboard,
}

export const pagesConfig = {
    mainPage: "StudentDashboard",
    Pages: PAGES,
    Layout: __Layout,
};