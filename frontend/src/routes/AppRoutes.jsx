import {
  BrowserRouter,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";

// =====================================================
// TEACHER
// =====================================================

import TeacherLayout from "../components/teacher/TeacherLayout";

import TeacherAIQuizGeneratorPage
  from "../pages/teacher/TeacherAIQuizGeneratorPage";

import TeacherClassroomsPage
  from "../pages/teacher/TeacherClassroomsPage";

import TeacherDashboardPage
  from "../pages/teacher/TeacherDashboardPage";

import TeacherQuizzesPage
  from "../pages/teacher/TeacherQuizzesPage";

import TeacherSubjectsPage
  from "../pages/teacher/TeacherSubjectsPage";

import TeacherUnitsPage
  from "../pages/teacher/TeacherUnitsPage";

import TeacherTopicsPage
  from "../pages/teacher/TeacherTopicsPage";

import TeacherUploadNotesPage
  from "../pages/teacher/TeacherUploadNotesPage";

import TeacherProfilePage
  from "../pages/teacher/TeacherProfilePage";

import TeacherSettingsPage
  from "../pages/teacher/TeacherSettingsPage";


// =====================================================
// STUDENT
// =====================================================

import DashboardLayout
  from "../components/layout/DashboardLayout";

import DashboardPage
  from "../pages/student/DashboardPage";

import StudentClassroomsPage
  from "../pages/student/StudentClassroomsPage";

import SubjectsPage
  from "../pages/student/SubjectsPage";

import StudyPage
  from "../pages/student/StudyPage";

import UnitLearningPage
  from "../pages/student/UnitLearningPage";

import TopicLearningPage
  from "../pages/student/TopicLearningPage";

import AIChatPage
  from "../pages/student/AIChatPage";

import QuizPage
  from "../pages/student/QuizPage";

import StudentQuizzesPage
  from "../pages/student/StudentQuizzesPage";

import ProgressPage
  from "../pages/student/ProgressPage";

import ProfilePage
  from "../pages/student/ProfilePage";

import SettingsPage
  from "../pages/student/SettingsPage";


// =====================================================
// PUBLIC
// =====================================================

import LandingPage
  from "../pages/LandingPage";

import LoginPage
  from "../pages/LoginPage";

import SignupPage
  from "../pages/SignupPage";


// =====================================================
// PROTECTED ROUTE
// =====================================================

function ProtectedRoute({
  children,
  allowedRole,
}) {

  const userRole =
    localStorage.getItem("userRole");


  // -------------------------------------------------
  // USER IS NOT LOGGED IN
  // -------------------------------------------------

  if (!userRole) {

    return (
      <Navigate
        to="/login"
        replace
      />
    );
  }


  // -------------------------------------------------
  // USER HAS WRONG ROLE
  // -------------------------------------------------

  if (
    allowedRole &&
    userRole !== allowedRole
  ) {

    if (userRole === "teacher") {

      return (
        <Navigate
          to="/teacher/dashboard"
          replace
        />
      );
    }


    return (
      <Navigate
        to="/student/dashboard"
        replace
      />
    );
  }


  return children;
}


// =====================================================
// AUTH ROUTE
// =====================================================

function AuthRoute({
  children,
}) {

  const userRole =
    localStorage.getItem("userRole");


  // -------------------------------------------------
  // ALREADY LOGGED IN AS TEACHER
  // -------------------------------------------------

  if (userRole === "teacher") {

    return (
      <Navigate
        to="/teacher/dashboard"
        replace
      />
    );
  }


  // -------------------------------------------------
  // ALREADY LOGGED IN AS STUDENT
  // -------------------------------------------------

  if (userRole === "student") {

    return (
      <Navigate
        to="/student/dashboard"
        replace
      />
    );
  }


  // -------------------------------------------------
  // USER IS NOT LOGGED IN
  // -------------------------------------------------

  return children;
}


// =====================================================
// APP ROUTES
// =====================================================

function AppRoutes() {

  return (

    <BrowserRouter>

      <Routes>

        {/* =====================================================
            PUBLIC
        ===================================================== */}

        <Route
          path="/"
          element={
            <LandingPage />
          }
        />


        {/* =====================================================
            LOGIN
        ===================================================== */}

        <Route
          path="/login"
          element={

            <AuthRoute>

              <LoginPage />

            </AuthRoute>

          }
        />


        {/* =====================================================
            SIGNUP
        ===================================================== */}

        <Route
          path="/signup"
          element={

            <AuthRoute>

              <SignupPage />

            </AuthRoute>

          }
        />


        {/* =====================================================
            TEACHER ROUTES
        ===================================================== */}

        <Route

          element={

            <ProtectedRoute
              allowedRole="teacher"
            >

              <TeacherLayout />

            </ProtectedRoute>

          }

        >

          {/* =====================================================
              TEACHER DASHBOARD
          ===================================================== */}

          <Route
            path="/teacher/dashboard"
            element={
              <TeacherDashboardPage />
            }
          />


          {/* =====================================================
              TEACHER CLASSROOMS
          ===================================================== */}

          <Route
            path="/teacher/classrooms"
            element={
              <TeacherClassroomsPage />
            }
          />


          {/* =====================================================
              TEACHER QUIZZES
          ===================================================== */}

          <Route
            path="/teacher/create-quiz"
            element={
              <TeacherQuizzesPage />
            }
          />

          <Route
            path="/teacher/quizzes"
            element={
              <TeacherQuizzesPage />
            }
          />


          {/* =====================================================
              TEACHER AI QUIZ GENERATOR
          ===================================================== */}

          <Route
            path="/teacher/ai-quiz-generator"
            element={
              <TeacherAIQuizGeneratorPage />
            }
          />


          {/* =====================================================
              TEACHER SUBJECTS
          ===================================================== */}

          <Route
            path="/teacher/subjects"
            element={
              <TeacherSubjectsPage />
            }
          />


          {/* =====================================================
              TEACHER UNITS
          ===================================================== */}

          <Route
            path="/teacher/units/:subjectId"
            element={
              <TeacherUnitsPage />
            }
          />


          {/* =====================================================
              TEACHER TOPICS
          ===================================================== */}

          <Route
            path="/teacher/topics/:unitId"
            element={
              <TeacherTopicsPage />
            }
          />


          {/* =====================================================
              TEACHER UPLOAD NOTES
          ===================================================== */}

          <Route
            path="/teacher/upload-notes"
            element={
              <TeacherUploadNotesPage />
            }
          />


          {/* =====================================================
              TEACHER PROFILE
          ===================================================== */}

          <Route
            path="/teacher/profile"
            element={
              <TeacherProfilePage />
            }
          />


          {/* =====================================================
              TEACHER SETTINGS
          ===================================================== */}

          <Route
            path="/teacher/settings"
            element={
              <TeacherSettingsPage />
            }
          />

        </Route>


        {/* =====================================================
            STUDENT DASHBOARD
        ===================================================== */}

        <Route
          path="/student/dashboard"
          element={

            <ProtectedRoute
              allowedRole="student"
            >

              <DashboardLayout>

                <DashboardPage />

              </DashboardLayout>

            </ProtectedRoute>

          }
        />


        {/* =====================================================
            STUDENT SUBJECTS
        ===================================================== */}

        <Route
          path="/student/subjects"
          element={

            <ProtectedRoute
              allowedRole="student"
            >

              <DashboardLayout>

                <SubjectsPage />

              </DashboardLayout>

            </ProtectedRoute>

          }
        />


        {/* =====================================================
            STUDENT CLASSROOMS
        ===================================================== */}

        <Route
          path="/student/classrooms"
          element={

            <ProtectedRoute
              allowedRole="student"
            >

              <DashboardLayout>

                <StudentClassroomsPage />

              </DashboardLayout>

            </ProtectedRoute>

          }
        />


        {/* =====================================================
            STUDENT STUDY
        ===================================================== */}

        <Route
          path="/student/study/:subjectId"
          element={

            <ProtectedRoute
              allowedRole="student"
            >

              <DashboardLayout>

                <StudyPage />

              </DashboardLayout>

            </ProtectedRoute>

          }
        />


        {/* =====================================================
            STUDENT UNIT LEARNING
        ===================================================== */}

        <Route
          path="/student/unit/:unitId"
          element={

            <ProtectedRoute
              allowedRole="student"
            >

              <DashboardLayout>

                <UnitLearningPage />

              </DashboardLayout>

            </ProtectedRoute>

          }
        />


        {/* =====================================================
            STUDENT TOPIC LEARNING
        ===================================================== */}

        <Route
          path="/student/topic/:topicId"
          element={

            <ProtectedRoute
              allowedRole="student"
            >

              <DashboardLayout>

                <TopicLearningPage />

              </DashboardLayout>

            </ProtectedRoute>

          }
        />


        {/* =====================================================
            STUDENT AI CHAT
        ===================================================== */}

        <Route
          path="/student/chat/:subjectId"
          element={

            <ProtectedRoute
              allowedRole="student"
            >

              <DashboardLayout>

                <AIChatPage />

              </DashboardLayout>

            </ProtectedRoute>

          }
        />


        {/* =====================================================
            STUDENT QUIZ LIST
        ===================================================== */}

        <Route
          path="/student/quizzes"
          element={

            <ProtectedRoute
              allowedRole="student"
            >

              <DashboardLayout>

                <StudentQuizzesPage />

              </DashboardLayout>

            </ProtectedRoute>

          }
        />


        {/* =====================================================
            OLD SIDEBAR QUIZ LINK
        =====================================================
        The old sidebar route points to DBMS.
        Redirect that route to the dynamic quiz list.
        ===================================================== */}

        <Route
          path="/student/quiz/dbms"
          element={
            <Navigate
              to="/student/quizzes"
              replace
            />
          }
        />


        {/* =====================================================
            STUDENT QUIZ
        ===================================================== */}

        <Route
          path="/student/quiz/:subjectId"
          element={

            <ProtectedRoute
              allowedRole="student"
            >

              <DashboardLayout>

                <QuizPage />

              </DashboardLayout>

            </ProtectedRoute>

          }
        />


        {/* =====================================================
            STUDENT PROGRESS
        ===================================================== */}

        <Route
          path="/student/progress"
          element={

            <ProtectedRoute
              allowedRole="student"
            >

              <DashboardLayout>

                <ProgressPage />

              </DashboardLayout>

            </ProtectedRoute>

          }
        />


        {/* =====================================================
            STUDENT PROFILE
        ===================================================== */}

        <Route
          path="/student/profile"
          element={

            <ProtectedRoute
              allowedRole="student"
            >

              <DashboardLayout>

                <ProfilePage />

              </DashboardLayout>

            </ProtectedRoute>

          }
        />


        {/* =====================================================
            STUDENT SETTINGS
        ===================================================== */}

        <Route
          path="/student/settings"
          element={

            <ProtectedRoute
              allowedRole="student"
            >

              <DashboardLayout>

                <SettingsPage />

              </DashboardLayout>

            </ProtectedRoute>

          }
        />


        {/* =====================================================
            FALLBACK
        ===================================================== */}

        <Route
          path="*"
          element={
            <Navigate
              to="/"
              replace
            />
          }
        />

      </Routes>

    </BrowserRouter>

  );
}


export default AppRoutes;