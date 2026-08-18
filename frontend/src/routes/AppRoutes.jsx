import {
  BrowserRouter,
  Routes,
  Route,
} from "react-router-dom";


// =========================
// TEACHER
// =========================

import TeacherLayout from "../components/teacher/TeacherLayout";

import TeacherDashboardPage
  from "../pages/teacher/TeacherDashboardPage";

import TeacherUploadNotesPage
  from "../pages/teacher/TeacherUploadNotesPage";
  import TeacherProfilePage from "../pages/teacher/TeacherProfilePage";
import TeacherSettingsPage from "../pages/teacher/TeacherSettingsPage";

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

        <Route
          path="/login"
          element={<LoginPage />}
        />

        <Route
          path="/signup"
          element={<SignupPage />}
        />


        {/* ========================= */}
        {/* TEACHER PAGES */}
        {/* ========================= */}

        <Route element={<TeacherLayout />}>



        <Route
    path="/teacher/settings"
    element={<TeacherSettingsPage />}
  />



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
            <DashboardLayout>
              <DashboardPage />
            </DashboardLayout>
          }
        />


        {/* ========================= */}
        {/* STUDENT SETTINGS */}
        {/* ========================= */}

        <Route
          path="/student/settings"
          element={
            <DashboardLayout>
              <SettingsPage />
            </DashboardLayout>
          }
        />


        {/* ========================= */}
        {/* STUDENT SUBJECTS */}
        {/* ========================= */}

        <Route
          path="/student/subjects"
          element={
            <DashboardLayout>
              <SubjectsPage />
            </DashboardLayout>
          }
        />


        {/* ========================= */}
        {/* STUDENT STUDY */}
        {/* ========================= */}

        <Route
          path="/student/study/:subjectId"
          element={
            <DashboardLayout>
              <StudyPage />
            </DashboardLayout>
          }
        />


        {/* ========================= */}
        {/* STUDENT AI CHAT */}
        {/* ========================= */}

        <Route
          path="/student/chat/:subjectId"
          element={
            <DashboardLayout>
              <AIChatPage />
            </DashboardLayout>
          }
        />


        {/* ========================= */}
        {/* STUDENT QUIZ */}
        {/* ========================= */}

        <Route
          path="/student/quiz/:subjectId"
          element={
            <DashboardLayout>
              <QuizPage />
            </DashboardLayout>
          }
        />


        {/* ========================= */}
        {/* STUDENT PROFILE */}
        {/* ========================= */}

        <Route
          path="/student/profile"
          element={
            <DashboardLayout>
              <ProfilePage />
            </DashboardLayout>
          }
        />


        {/* ========================= */}
        {/* STUDENT PROGRESS */}
        {/* ========================= */}

        <Route
          path="/student/progress"
          element={
            <DashboardLayout>
              <ProgressPage />
            </DashboardLayout>
          }
        />


      </Routes>

    </BrowserRouter>

  );
}


export default AppRoutes;