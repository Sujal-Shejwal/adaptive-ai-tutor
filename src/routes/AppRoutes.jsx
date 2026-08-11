import { BrowserRouter, Routes, Route } from "react-router-dom";

import DashboardPage from "../pages/student/DashboardPage";
import SubjectsPage from "../pages/student/SubjectsPage";
import StudyPage from "../pages/student/StudyPage";
import AIChatPage from "../pages/student/AIChatPage";
import QuizPage from "../pages/student/QuizPage";

import DashboardLayout from "../components/layout/DashboardLayout";

import LandingPage from "../pages/LandingPage";
import LoginPage from "../pages/LoginPage";
import SignupPage from "../pages/SignupPage";


function AppRoutes() {
    return (
        <BrowserRouter>

            <Routes>

                {/* Public Pages */}
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


                {/* Dashboard */}
                <Route
                    path="/student/dashboard"
                    element={
                        <DashboardLayout>
                            <DashboardPage />
                        </DashboardLayout>
                    }
                />


                {/* Subjects */}
                <Route
                    path="/student/subjects"
                    element={
                        <DashboardLayout>
                            <SubjectsPage />
                        </DashboardLayout>
                    }
                />


                {/* Dynamic Study */}
                <Route
                    path="/student/study/:subjectId"
                    element={
                        <DashboardLayout>
                            <StudyPage />
                        </DashboardLayout>
                    }
                />


                {/* Dynamic AI Chat */}
                <Route
                    path="/student/chat/:subjectId"
                    element={
                        <DashboardLayout>
                            <AIChatPage />
                        </DashboardLayout>
                    }
                />


                {/* Dynamic Quiz */}
                <Route
                    path="/student/quiz/:subjectId"
                    element={
                        <DashboardLayout>
                            <QuizPage />
                        </DashboardLayout>
                    }
                />

            </Routes>

        </BrowserRouter>
    );
}


export default AppRoutes;