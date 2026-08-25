import {
    ArrowRight,
    MessageSquare,
    ClipboardCheck,
} from "lucide-react";

import { Link } from "react-router-dom";
import { useCallback, useEffect, useState } from "react";


const colorStyles = {
    blue: {
        icon: "bg-blue-100 text-blue-600",
        progress: "bg-blue-600",
        ask: "border-blue-600 text-blue-600 hover:bg-blue-50",
        continue: "bg-blue-600 hover:bg-blue-700",
    },

    green: {
        icon: "bg-emerald-100 text-emerald-600",
        progress: "bg-emerald-500",
        ask: "border-emerald-500 text-emerald-600 hover:bg-emerald-50",
        continue: "bg-emerald-500 hover:bg-emerald-600",
    },

    orange: {
        icon: "bg-orange-100 text-orange-600",
        progress: "bg-orange-500",
        ask: "border-orange-500 text-orange-600 hover:bg-orange-50",
        continue: "bg-orange-500 hover:bg-orange-600",
    },

    purple: {
        icon: "bg-purple-100 text-purple-600",
        progress: "bg-purple-500",
        ask: "border-purple-500 text-purple-600 hover:bg-purple-50",
        continue: "bg-purple-500 hover:bg-purple-600",
    },
};


const SubjectsSection = () => {

    const [subjects, setSubjects] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");


    // =========================================================
    // GET LOGGED-IN USER ID
    // =========================================================

    const userId =
        localStorage.getItem("userId") || "13";


    // =========================================================
    // FETCH SUBJECT DATA
    // =========================================================

    const fetchSubjects = useCallback(async () => {

        try {

            setError("");


            // =====================================================
            // 1. GET ALL SUBJECTS
            // =====================================================

            const subjectsResponse = await fetch(
                "http://localhost:8080/api/subjects"
            );


            if (!subjectsResponse.ok) {
                throw new Error(
                    "Failed to fetch subjects."
                );
            }


            const subjectsData =
                await subjectsResponse.json();


            // =====================================================
            // 2. GET SUBJECT PROGRESS
            // =====================================================

            const progressResponse = await fetch(
                `http://localhost:8080/api/progress/user/${userId}/subjects`
            );


            if (!progressResponse.ok) {
                throw new Error(
                    "Failed to fetch subject progress."
                );
            }


            const progressData =
                await progressResponse.json();


            // =====================================================
            // 3. GET UNITS FOR EACH SUBJECT
            // =====================================================

            const colors = [
                "blue",
                "green",
                "orange",
                "purple",
            ];


            const formattedSubjects =
                await Promise.all(

                    subjectsData.map(
                        async (subject, index) => {

                            let units = [];


                            try {

                                const unitsResponse =
                                    await fetch(
                                        `http://localhost:8080/api/units/subject/${subject.id}`
                                    );


                                if (unitsResponse.ok) {

                                    units =
                                        await unitsResponse.json();

                                }

                            } catch (unitError) {

                                console.error(
                                    `Error fetching units for subject ${subject.id}:`,
                                    unitError
                                );

                            }


                            // =================================================
                            // CALCULATE TOTAL TOPICS
                            // =================================================

                            const totalTopics =
                                units.reduce(
                                    (total, unit) =>
                                        total +
                                        (unit.topics || 0),
                                    0
                                );


                            // =================================================
                            // GET REAL PROGRESS
                            // =================================================

                            const progress =
                                progressData[subject.id] ?? 0;


                            return {

                                id: subject.id,

                                name: subject.name,

                                code: subject.code,

                                description:
                                    subject.description,

                                shortName:
                                    subject.code,

                                color:
                                    colors[
                                        index %
                                        colors.length
                                    ],

                                units:
                                    units.length,

                                topics:
                                    totalTopics,

                                progress:
                                    progress,

                            };

                        }
                    )
                );


            // =====================================================
            // SAVE REAL DATA
            // =====================================================

            setSubjects(formattedSubjects);

        } catch (error) {

            console.error(
                "Dashboard subjects error:",
                error
            );


            setError(
                "Unable to load subjects."
            );

        } finally {

            setLoading(false);

        }

    }, [userId]);


    // =========================================================
    // INITIAL LOAD
    // =========================================================

    useEffect(() => {

        setLoading(true);

        fetchSubjects();

    }, [fetchSubjects]);


    // =========================================================
    // REFRESH WHEN USER RETURNS TO DASHBOARD
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
    // AUTO REFRESH EVERY 5 SECONDS
    // =========================================================

    useEffect(() => {

        const interval =
            setInterval(() => {

                fetchSubjects();

            }, 5000);


        return () => {

            clearInterval(interval);

        };

    }, [fetchSubjects]);


    // =========================================================
    // LOADING
    // =========================================================

    if (loading) {

        return (

            <section>

                <div className="mb-4 flex items-center justify-between">

                    <h2 className="text-lg font-semibold text-gray-900">
                        My Subjects
                    </h2>


                    <Link
                        to="/student/subjects"
                        className="flex items-center gap-1 text-sm font-medium text-blue-600"
                    >
                        View all
                        <ArrowRight size={16} />
                    </Link>

                </div>


                <div className="rounded-2xl border border-gray-200 bg-white p-6">

                    <p className="text-sm text-gray-500">
                        Loading subjects...
                    </p>

                </div>

            </section>

        );

    }


    // =========================================================
    // ERROR
    // =========================================================

    if (error) {

        return (

            <section>

                <div className="mb-4 flex items-center justify-between">

                    <h2 className="text-lg font-semibold text-gray-900">
                        My Subjects
                    </h2>


                    <Link
                        to="/student/subjects"
                        className="flex items-center gap-1 text-sm font-medium text-blue-600"
                    >
                        View all
                        <ArrowRight size={16} />
                    </Link>

                </div>


                <div className="rounded-2xl border border-red-200 bg-red-50 p-6">

                    <p className="text-sm text-red-600">
                        {error}
                    </p>

                </div>

            </section>

        );

    }


    // =========================================================
    // DASHBOARD
    // =========================================================

    return (

        <section>

            {/* =====================================================
                HEADER
            ===================================================== */}

            <div className="mb-4 flex items-center justify-between">

                <h2 className="text-lg font-semibold text-gray-900">
                    My Subjects
                </h2>


                <Link
                    to="/student/subjects"
                    className="flex items-center gap-1 text-sm font-medium text-blue-600 transition hover:text-blue-700"
                >
                    View all
                    <ArrowRight size={16} />
                </Link>

            </div>


            {/* =====================================================
                SUBJECT CARDS
            ===================================================== */}

            <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">

                {subjects.map((subject) => {

                    const styles =
                        colorStyles[
                            subject.color
                        ];


                    return (

                        <div
                            key={subject.id}
                            className="rounded-2xl border border-gray-200 bg-white p-5"
                        >

                            {/* =================================================
                                SUBJECT INFORMATION
                            ================================================= */}

                            <div className="flex items-start gap-3">

                                <div
                                    className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-xs font-semibold ${styles.icon}`}
                                >
                                    {subject.shortName}
                                </div>


                                <div className="min-w-0">

                                    <h3 className="text-sm font-medium text-gray-900">
                                        {subject.name}
                                    </h3>


                                    <p className="mt-1 text-xs text-gray-500">
                                        {subject.units} Units ·{" "}
                                        {subject.topics} Topics
                                    </p>

                                </div>

                            </div>


                            {/* =================================================
                                PROGRESS
                            ================================================= */}

                            <div className="mt-5">

                                <div className="mb-2 flex items-center justify-between">

                                    <span className="text-xs text-gray-500">
                                        Progress
                                    </span>


                                    <span
                                        className={`text-xs font-medium ${styles.icon.split(" ")[1]}`}
                                    >
                                        {subject.progress}%
                                    </span>

                                </div>


                                <div className="h-1.5 rounded-full bg-gray-100">

                                    <div
                                        className={`h-1.5 rounded-full transition-all duration-500 ${styles.progress}`}
                                        style={{
                                            width: `${subject.progress}%`,
                                        }}
                                    />

                                </div>

                            </div>


                            {/* =================================================
                                ACTIONS
                            ================================================= */}

                            <div className="mt-4 grid grid-cols-3 gap-2">

                                {/* ASK AI */}

                                <Link
                                    to={`/student/chat/${subject.id}`}
                                    className={`flex items-center justify-center gap-1 rounded-lg border py-2 text-xs font-medium transition ${styles.ask}`}
                                >

                                    <MessageSquare size={14} />

                                    Ask AI

                                </Link>


                                {/* QUIZ */}

                                <Link
                                    to={`/student/quiz/${subject.id}`}
                                    className="flex items-center justify-center gap-1 rounded-lg border border-gray-300 py-2 text-xs font-medium text-gray-700 transition hover:bg-gray-50"
                                >

                                    <ClipboardCheck size={14} />

                                    Quiz

                                </Link>


                                {/* CONTINUE */}

                                <Link
                                    to={`/student/study/${subject.id}`}
                                    className={`flex items-center justify-center gap-1 rounded-lg py-2 text-xs font-medium text-white transition ${styles.continue}`}
                                >

                                    Continue

                                    <ArrowRight size={14} />

                                </Link>

                            </div>

                        </div>

                    );

                })}

            </div>

        </section>

    );

};


export default SubjectsSection;