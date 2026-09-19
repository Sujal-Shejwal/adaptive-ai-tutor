import {
    MessageSquare,
    ClipboardCheck,
    BarChart3,
    BookOpen,
    ArrowRight,
} from "lucide-react";

import { Link } from "react-router-dom";
import { useCallback, useEffect, useState } from "react";


const QuickActions = () => {

    const [subjects, setSubjects] = useState([]);


    // =========================================================
    // GET SUBJECTS
    // =========================================================

    const fetchSubjects = useCallback(async () => {

        try {

            const response = await fetch(
                "http://localhost:8080/api/subjects"
            );


            if (!response.ok) {

                throw new Error(
                    "Failed to fetch subjects"
                );

            }


            const data =
                await response.json();


            setSubjects(
                Array.isArray(data)
                    ? data
                    : []
            );

        } catch (error) {

            console.error(
                "Quick actions subject error:",
                error
            );

            setSubjects([]);

        }

    }, []);


    // =========================================================
    // INITIAL LOAD
    // =========================================================

    useEffect(() => {

        fetchSubjects();

    }, [fetchSubjects]);


    // =========================================================
    // REFRESH WHEN RETURNING TO DASHBOARD
    // =========================================================

    useEffect(() => {

        const handleFocus = () => {

            fetchSubjects();

        };


        window.addEventListener(
            "focus",
            handleFocus
        );


        return () => {

            window.removeEventListener(
                "focus",
                handleFocus
            );

        };

    }, [fetchSubjects]);


    // =========================================================
    // SELECT FIRST REAL SUBJECT
    // =========================================================

    const firstSubject =
        subjects.length > 0
            ? subjects[0]
            : null;


    // =========================================================
    // QUICK ACTIONS
    // =========================================================

    const actions = [

        {
            icon: MessageSquare,

            label: "Start AI Chat",

            color: "blue",

            path: firstSubject
                ? `/student/chat/${firstSubject.id}`
                : "/student/subjects",
        },


        {
            icon: ClipboardCheck,

            label: "Take a Quiz",

            color: "green",

            path: firstSubject
                ? `/student/quiz/${firstSubject.id}`
                : "/student/subjects",
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


    // =========================================================
    // RENDER
    // =========================================================

    return (

        <section className="rounded-2xl border border-gray-200 bg-white p-5">

            <h2 className="text-lg font-semibold text-gray-900">
                Quick Actions
            </h2>


            <div className="mt-5 space-y-2">

                {actions.map((action) => {

                    const Icon =
                        action.icon;


                    return (

                        <Link
                            key={action.label}
                            to={action.path}
                            className="flex w-full items-center justify-between rounded-xl px-3 py-3 text-left transition hover:bg-gray-50"
                        >

                            {/* =================================================
                                LEFT
                            ================================================= */}

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

                                    <Icon
                                        size={16}
                                    />

                                </div>


                                <span className="text-sm font-medium text-gray-800">

                                    {action.label}

                                </span>

                            </div>


                            {/* =================================================
                                ARROW
                            ================================================= */}

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