import {
    BrowserRouter,
    Routes,
    Route,
} from "react-router-dom";


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
                {/* STUDY PAGE */}
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
                {/* AI CHAT PAGE */}
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
                {/* QUIZ PAGE */}
                {/* ========================= */}

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