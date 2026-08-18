import {
    MessageSquare,
    ClipboardCheck,
    BarChart3,
    BookOpen,
    ArrowRight,
} from "lucide-react";

import { Link } from "react-router-dom";


const QuickActions = () => {

    const actions = [
        {
            icon: MessageSquare,
            label: "Start AI Chat",
            color: "blue",
            path: "/student/chat/dbms",
        },
        {
            icon: ClipboardCheck,
            label: "Take a Quiz",
            color: "green",
            path: "/student/quiz/dbms",
        },
        {
            icon: BarChart3,
            label: "View Progress",
            color: "purple",
            path: "/student/progress",
        },
        {
            icon: BookOpen,
            label: "Browse Notes",
            color: "orange",
            path: "/student/subjects",
        },
    ];


    return (
        <section className="rounded-2xl border border-gray-200 bg-white p-5">

            <h2 className="text-lg font-semibold text-gray-900">
                Quick Actions
            </h2>


            <div className="mt-5 space-y-2">

                {actions.map((action) => {

                    const Icon = action.icon;


                    return (
                        <Link
                            key={action.label}
                            to={action.path}
                            className="flex w-full items-center justify-between rounded-xl px-3 py-3 text-left transition hover:bg-gray-50"
                        >

                            <div className="flex items-center gap-3">

                                <div
                                    className={`flex h-8 w-8 items-center justify-center rounded-lg ${
                                        action.color === "blue"
                                            ? "bg-blue-100 text-blue-600"
                                            : action.color === "green"
                                            ? "bg-emerald-100 text-emerald-600"
                                            : action.color === "purple"
                                            ? "bg-purple-100 text-purple-600"
                                            : "bg-orange-100 text-orange-600"
                                    }`}
                                >

                                    <Icon size={16} />

                                </div>


                                <span className="text-sm font-medium text-gray-800">
                                    {action.label}
                                </span>

                            </div>


                            <ArrowRight
                                size={16}
                                className="text-gray-300"
                            />

                        </Link>
                    );

                })}

            </div>

        </section>
    );
};


export default QuickActions;