import React, {
    useCallback,
    useEffect,
    useState,
} from "react";

import {
    ArrowLeft,
    CalendarClock,
    CheckCircle2,
    ClipboardCheck,
    Clock3,
    Eye,
    Loader2,
    RefreshCw,
    Users,
} from "lucide-react";

import {
    Link,
    useNavigate,
} from "react-router-dom";

const API_BASE =
    "http://localhost:8080";

// =====================================================
// FORMAT DEADLINE
// =====================================================

function formatDeadline(dateValue) {

    if (!dateValue) {
        return "No deadline";
    }

    const date =
        new Date(dateValue);

    if (
        Number.isNaN(
            date.getTime()
        )
    ) {
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

// =====================================================
// CHECK WHETHER QUIZ IS EXPIRED
// =====================================================

function isExpired(dateValue) {

    if (!dateValue) {
        return false;
    }

    const dueDate =
        new Date(dateValue);

    if (
        Number.isNaN(
            dueDate.getTime()
        )
    ) {
        return false;
    }

    return new Date() >= dueDate;
}

// =====================================================
// STUDENT QUIZZES PAGE
// =====================================================

function StudentQuizzesPage() {

    const navigate =
        useNavigate();

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
            localStorage.getItem(
                "userId"
            )
        );

    // =====================================================
    // LOAD CLASSROOM QUIZZES
    // =====================================================

    const loadQuizzes =
        useCallback(
            async (
                isRefresh = false
            ) => {

                try {

                    if (isRefresh) {
                        setRefreshing(true);
                    } else {
                        setLoading(true);
                    }

                    setError("");

                    // -----------------------------------------
                    // VALIDATE STUDENT
                    // -----------------------------------------

                    if (!studentId) {

                        throw new Error(
                            "Student account not found. Please login again."
                        );
                    }

                    // -----------------------------------------
                    // GET CLASSROOM ASSIGNMENTS
                    // -----------------------------------------

                    const response =
                        await fetch(
                            `${API_BASE}/api/quiz-assignments/student/${studentId}`,
                            {
                                cache: "no-store",
                            }
                        );

                    if (!response.ok) {

                        const message =
                            await response.text();

                        throw new Error(
                            message ||
                            "Unable to load classroom quizzes."
                        );
                    }

                    const assignments =
                        await response.json();

                    if (
                        !Array.isArray(
                            assignments
                        )
                    ) {

                        throw new Error(
                            "Invalid classroom quiz response."
                        );
                    }

                    // -----------------------------------------
                    // PROCESS ASSIGNMENTS
                    // -----------------------------------------

                    const processedQuizzes =
                        await Promise.all(
                            assignments.map(
                                async (
                                    assignment
                                ) => {

                                    // -----------------------------
                                    // BASIC VALIDATION
                                    // -----------------------------

                                    if (
                                        !assignment ||
                                        !assignment.quizId
                                    ) {
                                        return null;
                                    }

                                    // -----------------------------
                                    // ACTIVE ASSIGNMENT ONLY
                                    // -----------------------------

                                    if (
                                        assignment.status &&
                                        assignment.status.toUpperCase() !==
                                            "ACTIVE"
                                    ) {
                                        return null;
                                    }

                                    // -----------------------------
                                    // CHECK SUBMISSION
                                    // -----------------------------

                                    let submitted =
                                        false;

                                    let result =
                                        null;

                                    try {

                                        const submissionResponse =
                                            await fetch(
                                                `${API_BASE}/api/quiz-attempts/quiz/${assignment.quizId}/student/${studentId}`,
                                                {
                                                    cache: "no-store",
                                                }
                                            );

                                        if (
                                            submissionResponse.ok
                                        ) {

                                            const submissionData =
                                                await submissionResponse.json();

                                            submitted =
                                                submissionData?.submitted ===
                                                true;

                                            if (
                                                submitted
                                            ) {

                                                result =
                                                    {
                                                        score:
                                                            submissionData.score,

                                                        totalQuestions:
                                                            submissionData.totalQuestions,

                                                        correctAnswers:
                                                            submissionData.correctAnswers,

                                                        submittedAt:
                                                            submissionData.submittedAt,
                                                    };
                                            }
                                        }

                                    } catch (
                                        submissionError
                                    ) {

                                        console.error(
                                            `Unable to check submission for quiz ${assignment.quizId}:`,
                                            submissionError
                                        );
                                    }

                                    // -----------------------------
                                    // EXPIRED + NOT SUBMITTED
                                    //
                                    // Do not show expired quizzes.
                                    // Completed quizzes remain visible
                                    // even when their deadline has passed.
                                    // -----------------------------

                                    if (
                                        !submitted &&
                                        isExpired(
                                            assignment.dueAt
                                        )
                                    ) {

                                        return null;
                                    }

                                    // -----------------------------
                                    // RETURN QUIZ
                                    // -----------------------------

                                    return {

                                        ...assignment,

                                        id:
                                            assignment.quizId,

                                        title:
                                            assignment.quizTitle,

                                        submitted,

                                        result,
                                    };
                                }
                            )
                        );

                    // -----------------------------------------
                    // REMOVE NULL VALUES
                    // -----------------------------------------

                    const validQuizzes =
                        processedQuizzes
                            .filter(
                                (
                                    quiz
                                ) =>
                                    quiz !==
                                    null
                            );

                    // -----------------------------------------
                    // SORT
                    //
                    // Uncompleted quizzes first.
                    // Completed quizzes after them.
                    // -----------------------------------------

                    validQuizzes.sort(
                        (
                            a,
                            b
                        ) => {

                            if (
                                a.submitted !==
                                b.submitted
                            ) {

                                return a.submitted
                                    ? 1
                                    : -1;
                            }

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
                                aDue !==
                                bDue
                            ) {

                                return (
                                    aDue -
                                    bDue
                                );
                            }

                            return (
                                Number(
                                    b.quizId
                                ) -
                                Number(
                                    a.quizId
                                )
                            );
                        }
                    );

                    setQuizzes(
                        validQuizzes
                    );

                } catch (
                    loadError
                ) {

                    console.error(
                        "Classroom quizzes error:",
                        loadError
                    );

                    setError(
                        loadError.message ||
                        "Unable to load classroom quizzes."
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

    useEffect(
        () => {

            loadQuizzes();

        },
        [loadQuizzes]
    );

    // =====================================================
    // REFRESH
    // =====================================================

    const handleRefresh =
        () => {

            loadQuizzes(
                true
            );
        };

    // =====================================================
    // OPEN QUIZ / RESULT
    // =====================================================

    const handleOpenQuiz =
        (
            quiz
        ) => {

            if (
                !quiz ||
                !quiz.quizId ||
                !quiz.subjectId
            ) {

                setError(
                    "Quiz information is incomplete."
                );

                return;
            }

            // ---------------------------------------------
            // OPEN EXISTING QUIZ PAGE
            // ---------------------------------------------

            navigate(
                `/student/quiz/${quiz.subjectId}?quizId=${quiz.quizId}&classroomId=${quiz.classroomId}`
            );
        };

    // =====================================================
    // RENDER
    // =====================================================

    return (

        <div
            className="
                min-h-full
                bg-slate-50
                px-6
                pb-10
                pt-20
            "
        >

            <div
                className="
                    mx-auto
                    max-w-5xl
                "
            >

                {/* ================================================= */}
                {/* HEADER */}
                {/* ================================================= */}

                <div
                    className="
                        mb-8
                        flex
                        flex-wrap
                        items-start
                        justify-between
                        gap-4
                    "
                >

                    <div>

                        <Link
                            to="/student/dashboard"
                            className="
                                mb-4
                                inline-flex
                                items-center
                                gap-2
                                text-sm
                                font-medium
                                text-slate-500
                                transition
                                hover:text-blue-600
                            "
                        >

                            <ArrowLeft
                                size={17}
                            />

                            Back to Dashboard

                        </Link>

                        <div
                            className="
                                flex
                                items-center
                                gap-3
                            "
                        >

                            <div
                                className="
                                    flex
                                    h-11
                                    w-11
                                    items-center
                                    justify-center
                                    rounded-xl
                                    bg-blue-100
                                    text-blue-600
                                "
                            >

                                <ClipboardCheck
                                    size={23}
                                />

                            </div>

                            <div>

                                <h1
                                    className="
                                        text-3xl
                                        font-bold
                                        text-slate-900
                                    "
                                >
                                    Classroom Quizzes
                                </h1>

                                <p
                                    className="
                                        mt-1
                                        text-sm
                                        text-slate-500
                                    "
                                >
                                    Quizzes assigned to
                                    your enrolled classrooms.
                                </p>

                            </div>

                        </div>

                    </div>

                    <button
                        type="button"
                        onClick={
                            handleRefresh
                        }
                        disabled={
                            refreshing
                        }
                        className="
                            inline-flex
                            items-center
                            gap-2
                            rounded-xl
                            border
                            border-slate-200
                            bg-white
                            px-4
                            py-3
                            text-sm
                            font-semibold
                            text-slate-700
                            shadow-sm
                            transition
                            hover:bg-slate-50
                            disabled:cursor-not-allowed
                            disabled:opacity-60
                        "
                    >

                        {refreshing ? (

                            <Loader2
                                size={17}
                                className="
                                    animate-spin
                                "
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

                    <div
                        className="
                            mb-6
                            rounded-xl
                            border
                            border-red-200
                            bg-red-50
                            px-4
                            py-3
                            text-sm
                            text-red-700
                        "
                    >
                        {error}
                    </div>

                )}

                {/* ================================================= */}
                {/* LOADING */}
                {/* ================================================= */}

                {loading && (

                    <div
                        className="
                            rounded-2xl
                            border
                            border-slate-200
                            bg-white
                            p-12
                            text-center
                            shadow-sm
                        "
                    >

                        <Loader2
                            size={30}
                            className="
                                mx-auto
                                animate-spin
                                text-blue-600
                            "
                        />

                        <p
                            className="
                                mt-4
                                text-sm
                                text-slate-500
                            "
                        >
                            Loading your classroom quizzes...
                        </p>

                    </div>

                )}

                {/* ================================================= */}
                {/* EMPTY */}
                {/* ================================================= */}

                {!loading &&
                    quizzes.length === 0 && (

                        <div
                            className="
                                rounded-2xl
                                border
                                border-slate-200
                                bg-white
                                p-12
                                text-center
                                shadow-sm
                            "
                        >

                            <div
                                className="
                                    mx-auto
                                    flex
                                    h-16
                                    w-16
                                    items-center
                                    justify-center
                                    rounded-full
                                    bg-blue-50
                                    text-blue-600
                                "
                            >

                                <ClipboardCheck
                                    size={30}
                                />

                            </div>

                            <h2
                                className="
                                    mt-5
                                    text-xl
                                    font-semibold
                                    text-slate-900
                                "
                            >
                                No Quiz Available
                            </h2>

                            <p
                                className="
                                    mx-auto
                                    mt-2
                                    max-w-md
                                    text-sm
                                    leading-6
                                    text-slate-500
                                "
                            >
                                There are no open classroom
                                quizzes assigned to you right now.
                            </p>

                        </div>

                    )}

                {/* ================================================= */}
                {/* QUIZ LIST */}
                {/* ================================================= */}

                {!loading &&
                    quizzes.length > 0 && (

                        <div
                            className="
                                space-y-4
                            "
                        >

                            {quizzes.map(
                                (
                                    quiz
                                ) => (

                                    <div
                                        key={
                                            quiz.assignmentId
                                        }
                                        className="
                                            rounded-2xl
                                            border
                                            border-slate-200
                                            bg-white
                                            p-5
                                            shadow-sm
                                            transition
                                            hover:shadow-md
                                        "
                                    >

                                        <div
                                            className="
                                                flex
                                                flex-col
                                                gap-5
                                                md:flex-row
                                                md:items-center
                                                md:justify-between
                                            "
                                        >

                                            {/* ================================================= */}
                                            {/* QUIZ INFORMATION */}
                                            {/* ================================================= */}

                                            <div
                                                className="
                                                    min-w-0
                                                "
                                            >

                                                <div
                                                    className="
                                                        flex
                                                        items-start
                                                        gap-3
                                                    "
                                                >

                                                    <div
                                                        className={`
                                                            flex
                                                            h-11
                                                            w-11
                                                            shrink-0
                                                            items-center
                                                            justify-center
                                                            rounded-xl
                                                            ${
                                                                quiz.submitted
                                                                    ? "bg-green-100 text-green-600"
                                                                    : "bg-blue-100 text-blue-600"
                                                            }
                                                        `}
                                                    >

                                                        {quiz.submitted ? (

                                                            <CheckCircle2
                                                                size={22}
                                                            />

                                                        ) : (

                                                            <ClipboardCheck
                                                                size={22}
                                                            />

                                                        )}

                                                    </div>

                                                    <div
                                                        className="
                                                            min-w-0
                                                        "
                                                    >

                                                        <div
                                                            className="
                                                                flex
                                                                flex-wrap
                                                                items-center
                                                                gap-2
                                                            "
                                                        >

                                                            <h2
                                                                className="
                                                                    text-lg
                                                                    font-bold
                                                                    text-slate-900
                                                                "
                                                            >
                                                                {
                                                                    quiz.quizTitle ||
                                                                    "Untitled Quiz"
                                                                }
                                                            </h2>

                                                            {quiz.submitted && (

                                                                <span
                                                                    className="
                                                                        rounded-full
                                                                        bg-green-100
                                                                        px-2.5
                                                                        py-1
                                                                        text-xs
                                                                        font-semibold
                                                                        text-green-700
                                                                    "
                                                                >
                                                                    COMPLETED
                                                                </span>

                                                            )}

                                                        </div>

                                                        <p
                                                            className="
                                                                mt-1
                                                                text-sm
                                                                text-slate-500
                                                            "
                                                        >
                                                            {
                                                                quiz.subjectName ||
                                                                "Subject"
                                                            }
                                                        </p>

                                                    </div>

                                                </div>

                                                {/* ================================================= */}
                                                {/* DETAILS */}
                                                {/* ================================================= */}

                                                <div
                                                    className="
                                                        mt-4
                                                        flex
                                                        flex-wrap
                                                        gap-2
                                                    "
                                                >

                                                    {/* CLASSROOM */}

                                                    <span
                                                        className="
                                                            inline-flex
                                                            items-center
                                                            gap-1.5
                                                            rounded-lg
                                                            bg-blue-50
                                                            px-3
                                                            py-1.5
                                                            text-xs
                                                            font-medium
                                                            text-blue-700
                                                        "
                                                    >

                                                        <Users
                                                            size={14}
                                                        />

                                                        {
                                                            quiz.classroomName ||
                                                            "Classroom"
                                                        }

                                                    </span>

                                                    {/* DURATION */}

                                                    <span
                                                        className="
                                                            inline-flex
                                                            items-center
                                                            gap-1.5
                                                            rounded-lg
                                                            bg-slate-50
                                                            px-3
                                                            py-1.5
                                                            text-xs
                                                            font-medium
                                                            text-slate-600
                                                        "
                                                    >

                                                        <Clock3
                                                            size={14}
                                                        />

                                                        {
                                                            quiz.duration ||
                                                            0
                                                        }{" "}
                                                        minutes

                                                    </span>

                                                    {/* DEADLINE */}

                                                    {quiz.dueAt && (

                                                        <span
                                                            className="
                                                                inline-flex
                                                                items-center
                                                                gap-1.5
                                                                rounded-lg
                                                                bg-amber-50
                                                                px-3
                                                                py-1.5
                                                                text-xs
                                                                font-medium
                                                                text-amber-700
                                                            "
                                                        >

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

                                                    {/* SCORE */}

                                                    {quiz.submitted &&
                                                        quiz.result && (

                                                            <span
                                                                className="
                                                                    inline-flex
                                                                    items-center
                                                                    gap-1.5
                                                                    rounded-lg
                                                                    bg-green-50
                                                                    px-3
                                                                    py-1.5
                                                                    text-xs
                                                                    font-semibold
                                                                    text-green-700
                                                                "
                                                            >

                                                                <CheckCircle2
                                                                    size={14}
                                                                />

                                                                Score:{" "}
                                                                {
                                                                    quiz.result.score
                                                                }%

                                                            </span>

                                                        )}

                                                </div>

                                            </div>

                                            {/* ================================================= */}
                                            {/* ACTION */}
                                            {/* ================================================= */}

                                            <div
                                                className="
                                                    shrink-0
                                                "
                                            >

                                                <button
                                                    type="button"
                                                    onClick={() =>
                                                        handleOpenQuiz(
                                                            quiz
                                                        )
                                                    }
                                                    className={`
                                                        inline-flex
                                                        w-full
                                                        items-center
                                                        justify-center
                                                        gap-2
                                                        rounded-xl
                                                        px-5
                                                        py-3
                                                        text-sm
                                                        font-semibold
                                                        text-white
                                                        transition
                                                        md:w-auto
                                                        ${
                                                            quiz.submitted
                                                                ? "bg-slate-700 hover:bg-slate-800"
                                                                : "bg-blue-600 hover:bg-blue-700"
                                                        }
                                                    `}
                                                >

                                                    {quiz.submitted ? (

                                                        <>
                                                            <Eye
                                                                size={17}
                                                            />

                                                            View Result
                                                        </>

                                                    ) : (

                                                        <>
                                                            <ClipboardCheck
                                                                size={17}
                                                            />

                                                            Start Quiz
                                                        </>

                                                    )}

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