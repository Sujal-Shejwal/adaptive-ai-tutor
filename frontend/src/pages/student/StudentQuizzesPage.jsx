import React, { useCallback, useEffect, useState } from "react";

import {
    ArrowLeft,
    CalendarClock,
    CheckCircle2,
    Clock3,
    FileQuestion,
    Loader2,
    RefreshCw,
    ClipboardCheck,
} from "lucide-react";

import {
    Link,
    useNavigate,
} from "react-router-dom";

const API_BASE = "http://localhost:8080";

function formatDeadline(dateValue) {
    if (!dateValue) {
        return "No deadline";
    }

    const date = new Date(dateValue);

    if (Number.isNaN(date.getTime())) {
        return "Invalid deadline";
    }

    return date.toLocaleString(
        "en-IN",
        {
            day: "2-digit",
            month: "short",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit",
        }
    );
}

function StudentQuizzesPage() {

    const navigate = useNavigate();

    const [quizzes, setQuizzes] =
        useState([]);

    const [loading, setLoading] =
        useState(true);

    const [error, setError] =
        useState("");

    const [refreshing, setRefreshing] =
        useState(false);

    const studentId =
        Number(
            localStorage.getItem("userId")
        );

    // =====================================================
    // LOAD AVAILABLE QUIZZES
    // =====================================================

    const loadQuizzes = useCallback(
        async (isRefresh = false) => {

            try {

                if (isRefresh) {
                    setRefreshing(true);
                } else {
                    setLoading(true);
                }

                setError("");

                if (!studentId) {
                    throw new Error(
                        "Student account not found. Please login again."
                    );
                }

                // -------------------------------------------------
                // 1. GET ALL QUIZZES
                // -------------------------------------------------

                const quizResponse =
                    await fetch(
                        `${API_BASE}/api/quizzes`
                    );

                if (!quizResponse.ok) {
                    throw new Error(
                        "Failed to load quizzes."
                    );
                }

                const quizData =
                    await quizResponse.json();

                if (
                    !Array.isArray(
                        quizData
                    )
                ) {
                    throw new Error(
                        "Invalid quizzes response."
                    );
                }

                // -------------------------------------------------
                // 2. CHECK EVERY QUIZ
                // -------------------------------------------------

                const checkedQuizzes =
                    await Promise.all(
                        quizData.map(
                            async (quiz) => {

                                if (!quiz?.id) {
                                    return null;
                                }

                                // ---------------------------------
                                // CHECK GLOBAL DEADLINE
                                // ---------------------------------

                                if (
                                    quiz.dueAt
                                ) {

                                    const dueDate =
                                        new Date(
                                            quiz.dueAt
                                        );

                                    if (
                                        !Number.isNaN(
                                            dueDate.getTime()
                                        ) &&
                                        new Date() >= dueDate
                                    ) {
                                        return null;
                                    }
                                }

                                try {

                                    // ---------------------------------
                                    // LOAD QUESTIONS
                                    // ---------------------------------

                                    const questionResponse =
                                        await fetch(
                                            `${API_BASE}/api/quizzes/${quiz.id}/questions`
                                        );

                                    if (
                                        !questionResponse.ok
                                    ) {
                                        return null;
                                    }

                                    const questions =
                                        await questionResponse.json();

                                    if (
                                        !Array.isArray(
                                            questions
                                        ) ||
                                        questions.length === 0
                                    ) {
                                        return null;
                                    }

                                    // ---------------------------------
                                    // CHECK STUDENT SUBMISSION
                                    // ---------------------------------

                                    const submissionResponse =
                                        await fetch(
                                            `${API_BASE}/api/quiz-attempts/quiz/${quiz.id}/student/${studentId}`
                                        );

                                    if (
                                        !submissionResponse.ok
                                    ) {
                                        return null;
                                    }

                                    const submissionData =
                                        await submissionResponse.json();

                                    if (
                                        submissionData?.submitted ===
                                        true
                                    ) {
                                        return null;
                                    }

                                    return {
                                        ...quiz,
                                        questionCount:
                                            questions.length,
                                    };

                                } catch (
                                    quizError
                                ) {

                                    console.error(
                                        `Unable to check quiz ${quiz.id}:`,
                                        quizError
                                    );

                                    return null;
                                }
                            }
                        )
                    );

                // -------------------------------------------------
                // 3. KEEP CURRENTLY AVAILABLE QUIZZES
                // -------------------------------------------------

                const availableQuizzes =
                    checkedQuizzes
                        .filter(
                            (quiz) =>
                                quiz !== null
                        )
                        .sort(
                            (a, b) => {

                                const aDue =
                                    a.dueAt
                                        ? new Date(
                                            a.dueAt
                                        ).getTime()
                                        : Number.MAX_SAFE_INTEGER;

                                const bDue =
                                    b.dueAt
                                        ? new Date(
                                            b.dueAt
                                        ).getTime()
                                        : Number.MAX_SAFE_INTEGER;

                                if (
                                    aDue !== bDue
                                ) {
                                    return (
                                        aDue -
                                        bDue
                                    );
                                }

                                return (
                                    Number(b.id) -
                                    Number(a.id)
                                );
                            }
                        );

                setQuizzes(
                    availableQuizzes
                );

            } catch (loadError) {

                console.error(
                    "Available quizzes error:",
                    loadError
                );

                setError(
                    loadError.message ||
                    "Unable to load available quizzes."
                );

                setQuizzes([]);

            } finally {

                setLoading(false);
                setRefreshing(false);
            }
        },
        [studentId]
    );

    // =====================================================
    // INITIAL LOAD
    // =====================================================

    useEffect(() => {
        loadQuizzes();
    }, [loadQuizzes]);

    // =====================================================
    // REFRESH
    // =====================================================

    const handleRefresh = () => {
        loadQuizzes(true);
    };

    // =====================================================
    // RENDER
    // =====================================================

    return (
        <div className="min-h-full bg-slate-50 px-6 pb-10 pt-20">

            <div className="mx-auto max-w-5xl">

                {/* ================================================= */}
                {/* HEADER */}
                {/* ================================================= */}

                <div className="mb-8 flex flex-wrap items-start justify-between gap-4">

                    <div>

                        <Link
                            to="/student/dashboard"
                            className="mb-4 inline-flex items-center gap-2 text-sm font-medium text-slate-500 transition hover:text-blue-600"
                        >
                            <ArrowLeft size={17} />
                            Back to Dashboard
                        </Link>

                        <div className="flex items-center gap-3">

                            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-100 text-blue-600">

                                <ClipboardCheck
                                    size={23}
                                />

                            </div>

                            <div>

                                <h1 className="text-3xl font-bold text-slate-900">
                                    Available Quizzes
                                </h1>

                                <p className="mt-1 text-sm text-slate-500">
                                    Quizzes that are currently open for you.
                                </p>

                            </div>

                        </div>

                    </div>

                    <button
                        type="button"
                        onClick={handleRefresh}
                        disabled={refreshing}
                        className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-700 shadow-sm transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
                    >

                        {refreshing ? (
                            <Loader2
                                size={17}
                                className="animate-spin"
                            />
                        ) : (
                            <RefreshCw
                                size={17}
                            />
                        )}

                        Refresh

                    </button>

                </div>

                {/* ================================================= */}
                {/* ERROR */}
                {/* ================================================= */}

                {error && (

                    <div className="mb-6 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                        {error}
                    </div>
                )}

                {/* ================================================= */}
                {/* LOADING */}
                {/* ================================================= */}

                {loading && (

                    <div className="rounded-2xl border border-slate-200 bg-white p-12 text-center shadow-sm">

                        <Loader2
                            size={30}
                            className="mx-auto animate-spin text-blue-600"
                        />

                        <p className="mt-4 text-sm text-slate-500">
                            Checking available quizzes...
                        </p>

                    </div>
                )}

                {/* ================================================= */}
                {/* EMPTY */}
                {/* ================================================= */}

                {!loading &&
                    quizzes.length === 0 && (

                        <div className="rounded-2xl border border-slate-200 bg-white p-12 text-center shadow-sm">

                            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-blue-50 text-blue-600">

                                <ClipboardCheck
                                    size={30}
                                />

                            </div>

                            <h2 className="mt-5 text-xl font-semibold text-slate-900">
                                No Quiz Available
                            </h2>

                            <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-500">
                                There are no open quizzes available right now.
                                Check again later.
                            </p>

                        </div>
                    )}

                {/* ================================================= */}
                {/* QUIZ LIST */}
                {/* ================================================= */}

                {!loading &&
                    quizzes.length > 0 && (

                        <div className="space-y-4">

                            {quizzes.map(
                                (quiz) => (

                                    <div
                                        key={quiz.id}
                                        className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:shadow-md"
                                    >

                                        <div className="flex flex-col gap-5 md:flex-row md:items-center md:justify-between">

                                            <div className="min-w-0">

                                                <div className="flex items-start gap-3">

                                                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-blue-100 text-blue-600">

                                                        <ClipboardCheck
                                                            size={22}
                                                        />

                                                    </div>

                                                    <div className="min-w-0">

                                                        <h2 className="truncate text-lg font-bold text-slate-900">
                                                            {
                                                                quiz.title ||
                                                                "Untitled Quiz"
                                                            }
                                                        </h2>

                                                        <p className="mt-1 text-sm text-slate-500">
                                                            {
                                                                quiz.subject?.name ||
                                                                "Subject"
                                                            }
                                                        </p>

                                                    </div>

                                                </div>

                                                <div className="mt-4 flex flex-wrap gap-2">

                                                    <span className="inline-flex items-center gap-1.5 rounded-lg bg-slate-50 px-3 py-1.5 text-xs font-medium text-slate-600">

                                                        <FileQuestion
                                                            size={14}
                                                        />

                                                        {
                                                            quiz.questionCount
                                                        }{" "}
                                                        questions

                                                    </span>

                                                    <span className="inline-flex items-center gap-1.5 rounded-lg bg-slate-50 px-3 py-1.5 text-xs font-medium text-slate-600">

                                                        <Clock3
                                                            size={14}
                                                        />

                                                        {
                                                            quiz.duration ||
                                                            0
                                                        }{" "}
                                                        minutes

                                                    </span>

                                                    {quiz.dueAt && (

                                                        <span className="inline-flex items-center gap-1.5 rounded-lg bg-blue-50 px-3 py-1.5 text-xs font-medium text-blue-700">

                                                            <CalendarClock
                                                                size={14}
                                                            />

                                                            Due{" "}
                                                            {
                                                                formatDeadline(
                                                                    quiz.dueAt
                                                                )
                                                            }

                                                        </span>
                                                    )}

                                                </div>

                                            </div>

                                            <div className="shrink-0">

                                                <button
                                                    type="button"
                                                    onClick={() =>
                                                        navigate(
                                                            `/student/quiz/${quiz.subject?.id}?quizId=${quiz.id}`
                                                        )
                                                    }
                                                    className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-blue-700 md:w-auto"
                                                >

                                                    <CheckCircle2
                                                        size={17}
                                                    />

                                                    Start Quiz

                                                </button>

                                            </div>

                                        </div>

                                    </div>
                                )
                            )}

                        </div>
                    )}

            </div>

        </div>
    );
}

export default StudentQuizzesPage;
