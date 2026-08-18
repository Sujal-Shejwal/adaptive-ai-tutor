import {
    GraduationCap,
    LayoutDashboard,
    BookOpen,
    MessageSquare,
    ClipboardList,
    BarChart3,
    User,
    Settings,
    LogOut,
} from "lucide-react";

import {
    Link,
    useLocation,
    useNavigate,
} from "react-router-dom";


const menuItems = [
    {
        title: "Dashboard",
        path: "/student/dashboard",
        icon: LayoutDashboard,
    },
    {
        title: "Subjects",
        path: "/student/subjects",
        icon: BookOpen,
    },
    {
        title: "AI Chat",
        path: "/student/chat/dbms",
        icon: MessageSquare,
    },
    {
        title: "Quiz",
        path: "/student/quiz/dbms",
        icon: ClipboardList,
    },
    {
        title: "Progress",
        path: "/student/progress",
        icon: BarChart3,
    },
    {
        title: "Profile",
        path: "/student/profile",
        icon: User,
    },
    {
        title: "Settings",
        path: "/student/settings",
        icon: Settings,
    },
];


function Sidebar() {

    const location = useLocation();

    const navigate = useNavigate();


    /* ===================================================== */
    /* LOGOUT                                                */
    /* ===================================================== */

    const handleLogout = () => {

        /*
         * Temporary frontend logout.
         * Real authentication/session cleanup
         * will be added with the backend.
         */

        localStorage.removeItem("token");

        localStorage.removeItem("user");

        navigate("/login");
    };


    return (
        <aside className="fixed left-0 top-0 z-50 flex h-screen w-[290px] flex-col border-r border-slate-200 bg-white">


            {/* ================================================= */}
            {/* BRAND                                             */}
            {/* ================================================= */}

            <div className="border-b border-slate-200 p-6">

                <Link
                    to="/"
                    className="flex items-center gap-4"
                >

                    <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-600">

                        <GraduationCap
                            className="h-6 w-6 text-white"
                            strokeWidth={2}
                        />

                    </div>


                    <div>

                        <h2 className="text-lg font-semibold text-slate-900">
                            Adaptive AI
                        </h2>

                        <p className="text-sm text-slate-500">
                            Tutor Platform
                        </p>

                    </div>

                </Link>

            </div>


            {/* ================================================= */}
            {/* NAVIGATION                                        */}
            {/* ================================================= */}

            <div className="p-6">

                <p className="mb-4 text-xs font-semibold uppercase tracking-wider text-slate-400">
                    Student Menu
                </p>


                <div className="space-y-2">

                    {menuItems.map((item) => {

                        const Icon =
                            item.icon;


                        const isChatActive =
                            item.title === "AI Chat" &&
                            location.pathname.startsWith(
                                "/student/chat"
                            );


                        const isQuizActive =
                            item.title === "Quiz" &&
                            location.pathname.startsWith(
                                "/student/quiz"
                            );


                        const isExactActive =
                            location.pathname === item.path;


                        const isActive =
                            isExactActive ||
                            isChatActive ||
                            isQuizActive;


                        return (
                            <Link
                                key={item.title}
                                to={item.path}
                                className={`flex items-center gap-3 rounded-xl px-4 py-3 transition ${
                                    isActive
                                        ? "bg-blue-100 text-blue-600"
                                        : "text-slate-600 hover:bg-slate-100 hover:text-blue-600"
                                }`}
                            >

                                <Icon className="h-5 w-5" />

                                <span className="text-[16px] font-medium">
                                    {item.title}
                                </span>

                            </Link>
                        );

                    })}

                </div>

            </div>


            {/* ================================================= */}
            {/* BOTTOM                                            */}
            {/* ================================================= */}

            <div className="mt-auto border-t border-slate-200 p-6">

                <button
                    type="button"
                    onClick={handleLogout}
                    className="flex w-full items-center gap-3 text-red-500 transition hover:text-red-600"
                >

                    <LogOut className="h-5 w-5" />

                    <span className="font-medium">
                        Logout
                    </span>

                </button>

            </div>

        </aside>
    );
}


export default Sidebar;