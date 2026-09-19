import {
    BookOpen,
    MessageSquare,
    ClipboardCheck,
    ArrowRight,
} from "lucide-react";

import { Link } from "react-router-dom";
import { useCallback, useEffect, useState } from "react";


// =====================================================
// COLOR STYLES
// =====================================================

const colorStyles = {
    blue: {
        icon: "bg-blue-100 text-blue-600",
        progress: "bg-blue-600",
        button: "border-blue-500 text-blue-600 hover:bg-blue-50",
        study: "bg-blue-600 hover:bg-blue-700",
    },

    green: {
        icon: "bg-green-100 text-green-600",
        progress: "bg-green-500",
        button: "border-green-500 text-green-600 hover:bg-green-50",
        study: "bg-green-500 hover:bg-green-600",
    },

    orange: {
        icon: "bg-orange-100 text-orange-600",
        progress: "bg-orange-500",
        button: "border-orange-500 text-orange-600 hover:bg-orange-50",
        study: "bg-orange-500 hover:bg-orange-600",
    },

    purple: {
        icon: "bg-purple-100 text-purple-600",
        progress: "bg-purple-500",
        button: "border-purple-500 text-purple-600 hover:bg-purple-50",
        study: "bg-purple-500 hover:bg-purple-600",
    },
};


// =====================================================
// SUBJECTS PAGE
// =====================================================

function SubjectsPage() {

    const [subjects, setSubjects] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");


    // =====================================================
    // GET LOGGED-IN USER ID
    // =====================================================

    const getUserId = () => {

        const storedId =
            localStorage.getItem("userId");

        if (storedId) {
            return storedId;
        }

        try {

            const storedUser =
                JSON.parse(
                    localStorage.getItem("user") ||
                    "null"
                );

            return storedUser?.id
                ? String(storedUser.id)
                : null;

        } catch {

            return null;
        }
    };

    const userId =
        getUserId();


    // =====================================================
    // FETCH SUBJECT DATA
    // =====================================================

    const fetchSubjects = useCallback(async () => {

        if (!userId) {

            setError(
                "User is not logged in."
            );

            setLoading(false);

            return;
        }


        try {

            setError("");


            // =================================================
            // 1. GET ALL SUBJECTS
            // =================================================

            const subjectsResponse =
                await fetch(
                    "http://localhost:8080/api/subjects"
                );


            if (!subjectsResponse.ok) {

                throw new Error(
                    "Failed to fetch subjects."
                );
            }


            const subjectsData =
                await subjectsResponse.json();


            // =================================================
            // 2. GET SUBJECT PROGRESS
            // =================================================

            const progressResponse =
                await fetch(
                    `http://localhost:8080/api/progress/user/${userId}/subjects`
                );


            if (!progressResponse.ok) {

                throw new Error(
                    "Failed to fetch subject progress."
                );
            }


            const progressData =
                await progressResponse.json();


            console.log(
                "Subject progress:",
                progressData
            );


            // =================================================
            // 3. GET UNITS FOR EACH SUBJECT
            // =================================================

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
                            // 4. CALCULATE TOTAL TOPICS
                            // =================================================

                            const totalTopics =
                                units.reduce(
                                    (
                                        total,
                                        unit
                                    ) =>
                                        total +
                                        (
                                            unit.topics || 0
                                        ),
                                    0
                                );


                            // =================================================
                            // 5. GET REAL PROGRESS
                            // =================================================

                            const progress =
                                progressData[subject.id] ?? 0;


                            return {

                                id:
                                    subject.id,

                                name:
                                    subject.name,

                                code:
                                    subject.code,

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


            // =================================================
            // 6. SAVE REAL DATA
            // =================================================

            setSubjects(
                formattedSubjects
            );

        } catch (error) {

            console.error(
                "Error fetching subjects:",
                error
            );


            setError(
                "Unable to load subjects. Please try again."
            );

        } finally {

            setLoading(false);

        }

    }, [userId]);


    // =====================================================
    // INITIAL LOAD
    // =====================================================

    useEffect(() => {

        setLoading(true);

        fetchSubjects();

    }, [fetchSubjects]);


    // =====================================================
    // REFRESH WHEN USER RETURNS TO PAGE
    // =====================================================

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


    // =====================================================
    // AUTO REFRESH EVERY 5 SECONDS
    // =====================================================

    useEffect(() => {

        const interval =
            setInterval(() => {

                fetchSubjects();

            }, 5000);


        return () => {

            clearInterval(interval);

        };

    }, [fetchSubjects]);


    // =====================================================
    // LOADING STATE
    // =====================================================

    if (loading) {

        return (

            <div className="min-h-full bg-slate-50 px-6 pb-8 pt-20">

                <div className="rounded-2xl border border-slate-200 bg-white p-8 text-center shadow-sm">

                    <p className="text-sm text-slate-500">
                        Loading subjects...
                    </p>

                </div>

            </div>

        );

    }


    // =====================================================
    // ERROR STATE
    // =====================================================

    if (error) {

        return (

            <div className="min-h-full bg-slate-50 px-6 pb-8 pt-20">

                <div className="rounded-2xl border border-red-200 bg-red-50 p-8 text-center">

                    <p className="text-sm text-red-600">
                        {error}
                    </p>

                </div>

            </div>

        );

    }


    // =====================================================
    // SUBJECTS PAGE
    // =====================================================

    return (

        <div className="min-h-full bg-slate-50 px-6 pb-8 pt-20">


            {/* =================================================
                PAGE HEADER
            ================================================= */}

            <div className="mb-8">

                <h1 className="text-3xl font-bold text-slate-900">
                    My Subjects
                </h1>


                <p className="mt-2 text-slate-500">
                    Select a subject to view units, notes, and start learning.
                </p>

            </div>


            {/* =================================================
                EMPTY STATE
            ================================================= */}

            {subjects.length === 0 && (

                <div className="rounded-2xl border border-slate-200 bg-white p-8 text-center shadow-sm">

                    <p className="text-sm text-slate-500">
                        No subjects are available yet.
                    </p>

                </div>

            )}


            {/* =================================================
                SUBJECT CARDS
            ================================================= */}

            {subjects.length > 0 && (

                <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">

                    {subjects.map((subject) => {

                        const styles =
                            colorStyles[
                                subject.color
                            ];


                        return (

                            <div
                                key={subject.id}
                                className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition hover:shadow-md"
                            >


                                {/* ==========================================
                                    CARD HEADER
                                ========================================== */}

                                <div className="flex items-start gap-4">

                                    <div
                                        className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl text-sm font-bold ${styles.icon}`}
                                    >
                                        {subject.shortName}
                                    </div>


                                    <div className="flex-1">

                                        <h2 className="text-lg font-semibold text-slate-900">
                                            {subject.name}
                                        </h2>


                                        <p className="mt-1 text-sm text-slate-500">
                                            {subject.units} Units ·{" "}
                                            {subject.topics} Topics
                                        </p>

                                    </div>

                                </div>


                                {/* ==========================================
                                    DESCRIPTION
                                ========================================== */}

                                <p className="mt-5 text-sm leading-6 text-slate-500">
                                    {subject.description}
                                </p>


                                {/* ==========================================
                                    PROGRESS
                                ========================================== */}

                                <div className="mt-6">

                                    <div className="mb-2 flex items-center justify-between">

                                        <span className="text-sm font-medium text-slate-600">
                                            Progress
                                        </span>


                                        <span className="text-sm font-semibold text-slate-900">
                                            {subject.progress}%
                                        </span>

                                    </div>


                                    <div className="h-2 w-full overflow-hidden rounded-full bg-slate-100">

                                        <div
                                            className={`h-full rounded-full transition-all duration-500 ${styles.progress}`}
                                            style={{
                                                width: `${subject.progress}%`,
                                            }}
                                        />

                                    </div>

                                </div>


                                {/* ==========================================
                                    ACTIONS
                                ========================================== */}

                                <div className="mt-6 flex gap-3">


                                    {/* ASK AI */}

                                    <Link
                                        to={`/student/chat/${subject.id}`}
                                        className={`flex flex-1 items-center justify-center gap-2 rounded-lg border px-4 py-2.5 text-sm font-medium transition ${styles.button}`}
                                    >

                                        <MessageSquare
                                            size={17}
                                        />

                                        Ask AI

                                    </Link>


                                    {/* QUIZ */}

                                    <Link
                                        to={`/student/quiz/${subject.id}`}
                                        className="flex flex-1 items-center justify-center gap-2 rounded-lg border border-slate-300 px-4 py-2.5 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
                                    >

                                        <ClipboardCheck
                                            size={17}
                                        />

                                        Quiz

                                    </Link>


                                    {/* STUDY */}

                                    <Link
                                        to={`/student/study/${subject.id}`}
                                        className={`flex flex-1 items-center justify-center gap-2 rounded-lg px-4 py-2.5 text-sm font-medium text-white transition ${styles.study}`}
                                    >

                                        <BookOpen
                                            size={17}
                                        />

                                        Study

                                        <ArrowRight
                                            size={16}
                                        />

                                    </Link>

                                </div>

                            </div>

                        );

                    })}

                </div>

            )}

        </div>

    );

}


export default SubjectsPage;