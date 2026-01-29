import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { CssBaseline } from '@mui/material';
import { ThemeProvider } from './context/ThemeContext';
import { AuthProvider } from './context/AuthContext';
import { NotificationProvider } from './context/NotificationContext';
import ErrorBoundary from './components/ErrorBoundary';
import Layout from './components/Layout';

// Pages
import Login from './pages/Login';
import Departments from './pages/Departments';
import Courses from './pages/Courses';
import Semesters from './pages/Semesters';
import Forum from './pages/Forum';
import StudentDashboard from './pages/student/Dashboard';
import StudentProfile from './pages/student/Profile';
import ProfessorDashboard from './pages/professor/Dashboard';
import ProfessorStudents from './pages/professor/Students';
import ProfessorCourseManagement from './pages/professor/CourseManagement';
import AdminRootDashboard from './pages/admin/RootDashboard';
import AdminUsers from './pages/admin/Users';
import AdminCourses from './pages/admin/CoursesAdmin';
import AdminStats from './pages/admin/Stats';
import AdminSecurity from './pages/admin/Security';

function Home() {
  return (
    <div style={{ textAlign: 'center', padding: '50px' }}>
      <h1 style={{ color: '#4A90E2' }}>🎓 مكتبة كلية الهندسة</h1>
      <h2 style={{ color: '#00BCD4' }}>جامعة البحر الأحمر</h2>
      <p>مرحباً بك في نظام المكتبة الرقمية</p>
    </div>
  );
}

function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider>
        <AuthProvider>
          <NotificationProvider>
            <CssBaseline />
            <Router>
              <Layout>
                <Routes>
                  <Route path="/" element={<Home />} />
                  <Route path="/login" element={<Login />} />
                  <Route path="/departments" element={<Departments />} />
                  <Route path="/courses" element={<Courses />} />
                  <Route path="/semesters" element={<Semesters />} />
                  <Route path="/forum/:id" element={<Forum />} />
                  <Route path="/student/dashboard" element={<StudentDashboard />} />
                  <Route path="/student/profile" element={<StudentProfile />} />
                  <Route path="/professor/dashboard" element={<ProfessorDashboard />} />
                  <Route path="/professor/students" element={<ProfessorStudents />} />
                  <Route path="/professor/courses" element={<ProfessorCourseManagement />} />
                  <Route path="/admin/root" element={<AdminRootDashboard />} />
                  <Route path="/admin/dashboard" element={<AdminRootDashboard />} />
                  <Route path="/admin/users" element={<AdminUsers />} />
                  <Route path="/admin/courses" element={<AdminCourses />} />
                  <Route path="/admin/stats" element={<AdminStats />} />
                  <Route path="/admin/security" element={<AdminSecurity />} />
                </Routes>
              </Layout>
            </Router>
          </NotificationProvider>
        </AuthProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
