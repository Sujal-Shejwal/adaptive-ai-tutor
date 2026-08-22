import {
  BrowserRouter,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";

// =========================
// TEACHER
// =========================

import TeacherLayout
  from "../components/teacher/TeacherLayout";

import TeacherDashboardPage
  from "../pages/teacher/TeacherDashboardPage";

import TeacherUploadNotesPage
  from "../pages/teacher/TeacherUploadNotesPage";

import TeacherProfilePage
  from "../pages/teacher/TeacherProfilePage";

import TeacherSettingsPage
  from "../pages/teacher/TeacherSettingsPage";

// =========================
// STUDENT
// =========================

import DashboardLayout
  from "../components/layout/DashboardLayout";

import DashboardPage
  from "../pages/student/DashboardPage";

import SubjectsPage
  from "../pages/student/SubjectsPage";

import StudyPage
  from "../pages/student/StudyPage";

import AIChatPage
  from "../pages/student/AIChatPage";

import QuizPage
  from "../pages/student/QuizPage";

import ProgressPage
  from "../pages/student/ProgressPage";

import ProfilePage
  from "../pages/student/ProfilePage";

import SettingsPage
  from "../pages/student/SettingsPage";

// =========================
// PUBLIC
// =========================

import LandingPage
  from "../pages/LandingPage";

import LoginPage
  from "../pages/LoginPage";

import SignupPage
  from "../pages/SignupPage";


// =========================
// PROTECTED ROUTE
// =========================

function ProtectedRoute({ children, allowedRole }) {
  const userRole = localStorage.getItem("userRole");

  // User is not logged in
  if (!userRole) {
    return <Navigate to="/login" replace />;
  }

  // User is logged in but has the wrong role
  if (allowedRole && userRole !== allowedRole) {
    if (userRole === "teacher") {
      return <Navigate to="/teacher/dashboard" replace />;
    }

    return <Navigate to="/student/dashboard" replace />;
  }

  return children;
}


// =========================
// AUTH ROUTE
// =========================

function AuthRoute({ children }) {
  const userRole = localStorage.getItem("userRole");

  // User is already logged in
  if (userRole === "teacher") {
    return <Navigate to="/teacher/dashboard" replace />;
  }

  if (userRole === "student") {
    return <Navigate to="/student/dashboard" replace />;
  }

  // User is not logged in
  return children;
}


// =========================
// APP ROUTES
// =========================

function AppRoutes() {
  return (
    <BrowserRouter>

      <Routes>

        {/* ========================= */}
        {/* PUBLIC PAGES */}
        {/* ========================= */}

        <Route
          path="/"
          element={<LandingPage />}
        />

        {/* Login only for logged-out users */}
        <Route
          path="/login"
          element={
            <AuthRoute>
              <LoginPage />
            </AuthRoute>
          }
        />

        {/* Signup only for logged-out users */}
        <Route
          path="/signup"
          element={
            <AuthRoute>
              <SignupPage />
            </AuthRoute>
          }
        />


        {/* ========================= */}
        {/* TEACHER PAGES */}
        {/* ========================= */}

        <Route
          element={
            <ProtectedRoute allowedRole="teacher">
              <TeacherLayout />
            </ProtectedRoute>
          }
        >

          {/* Teacher Settings */}
          <Route
            path="/teacher/settings"
            element={<TeacherSettingsPage />}
          />

          {/* Teacher Profile */}
          <Route
            path="/teacher/profile"
            element={<TeacherProfilePage />}
          />

          {/* Teacher Dashboard */}
          <Route
            path="/teacher/dashboard"
            element={<TeacherDashboardPage />}
          />

          {/* Teacher Upload Notes */}
          <Route
            path="/teacher/upload-notes"
            element={<TeacherUploadNotesPage />}
          />

        </Route>


        {/* ========================= */}
        {/* STUDENT DASHBOARD */}
        {/* ========================= */}

        <Route
          path="/student/dashboard"
          element={
            <ProtectedRoute allowedRole="student">
              <DashboardLayout>
                <DashboardPage />
              </DashboardLayout>
            </ProtectedRoute>
          }
        />


        {/* ========================= */}
        {/* STUDENT SETTINGS */}
        {/* ========================= */}

        <Route
          path="/student/settings"
          element={
            <ProtectedRoute allowedRole="student">
              <DashboardLayout>
                <SettingsPage />
              </DashboardLayout>
            </ProtectedRoute>
          }
        />


        {/* ========================= */}
        {/* STUDENT SUBJECTS */}
        {/* ========================= */}

        <Route
          path="/student/subjects"
          element={
            <ProtectedRoute allowedRole="student">
              <DashboardLayout>
                <SubjectsPage />
              </DashboardLayout>
            </ProtectedRoute>
          }
        />


        {/* ========================= */}
        {/* STUDENT STUDY */}
        {/* ========================= */}

        <Route
          path="/student/study/:subjectId"
          element={
            <ProtectedRoute allowedRole="student">
              <DashboardLayout>
                <StudyPage />
              </DashboardLayout>
            </ProtectedRoute>
          }
        />


        {/* ========================= */}
        {/* STUDENT AI CHAT */}
        {/* ========================= */}

        <Route
          path="/student/chat/:subjectId"
          element={
            <ProtectedRoute allowedRole="student">
              <DashboardLayout>
                <AIChatPage />
              </DashboardLayout>
            </ProtectedRoute>
          }
        />


        {/* ========================= */}
        {/* STUDENT QUIZ */}
        {/* ========================= */}

        <Route
          path="/student/quiz/:subjectId"
          element={
            <ProtectedRoute allowedRole="student">
              <DashboardLayout>
                <QuizPage />
              </DashboardLayout>
            </ProtectedRoute>
          }
        />


        {/* ========================= */}
        {/* STUDENT PROFILE */}
        {/* ========================= */}

        <Route
          path="/student/profile"
          element={
            <ProtectedRoute allowedRole="student">
              <DashboardLayout>
                <ProfilePage />
              </DashboardLayout>
            </ProtectedRoute>
          }
        />


        {/* ========================= */}
        {/* STUDENT PROGRESS */}
        {/* ========================= */}

        <Route
          path="/student/progress"
          element={
            <ProtectedRoute allowedRole="student">
              <DashboardLayout>
                <ProgressPage />
              </DashboardLayout>
            </ProtectedRoute>
          }
        />

      </Routes>

    </BrowserRouter>
  );
}


export default AppRoutes;