import {
    BarChart3,
    BookOpen,
    CalendarDays,
    CheckCircle2,
    ClipboardCheck,
    Clock3,
    Target,
    TrendingUp,
} from "lucide-react";


/* ========================================================= */
/* DUMMY PROGRESS DATA */
/* ========================================================= */

const progressData = {
    overall: 59,

    subjects: [
        {
            id: "dbms",
            name: "Database Management System",
            shortName: "DBMS",
            progress: 68,
            quizAverage: 74,
            color: "blue",
        },
        {
            id: "os",
            name: "Operating System",
            shortName: "OS",
            progress: 52,
            quizAverage: 68,
            color: "green",
        },
        {
            id: "cn",
            name: "Computer Networks",
            shortName: "CN",
            progress: 41,
            quizAverage: 61,
            color: "orange",
        },
        {
            id: "java",
            name: "Java Programming",
            shortName: "JAVA",
            progress: 75,
            quizAverage: 82,
            color: "purple",
        },
    ],

    weakTopics: [
        {
            topic: "Concurrency Control in DBMS",
            subject: "DBMS",
            progress: 38,
        },
        {
            topic: "Deadlock Detection & Recovery",
            subject: "OS",
            progress: 41,
        },
        {
            topic: "Subnetting & VLSM",
            subject: "CN",
            progress: 45,
        },
        {
            topic: "Java Multithreading",
            subject: "Java",
            progress: 48,
        },
    ],

    recentQuizScores: [
        {
            title: "SQL Basics",
            subject: "DBMS",
            date: "14 Jul",
            score: 90,
        },
        {
            title: "Process Scheduling",
            subject: "OS",
            date: "13 Jul",
            score: 72,
        },
        {
            title: "TCP/IP Model",
            subject: "CN",
            date: "12 Jul",
            score: 68,
        },
        {
            title: "OOP Concepts",
            subject: "Java",
            date: "11 Jul",
            score: 82,
        },
        {
            title: "ER Diagrams",
            subject: "DBMS",
            date: "10 Jul",
            score: 78,
        },
    ],

    learningHistory: [
        {
            date: "TODAY",
            activities: [
                "Completed Quiz: SQL Advanced (74%)",
                "Studied Unit 4: Transaction Management",
            ],
        },
        {
            date: "YESTERDAY",
            activities: [
                "Asked 8 questions in OS (Process Scheduling)",
                "Completed Quiz: TCP/IP (68%)",
            ],
        },
        {
            date: "12 JUL",
            activities: [
                "Studied Java Unit 7: Exception Handling",
                "Quiz: OOP Concepts (82%)",
            ],
        },
        {
            date: "11 JUL",
            activities: [
                "Completed 3 units in Computer Networks",
                "Progress milestone: 50% CN reached",
            ],
        },
    ],
};


/* ========================================================= */
/* COLOR SETTINGS */
/* ========================================================= */

const colorStyles = {
    blue: {
        ring: "text-blue-600",
        progress: "bg-blue-600",
        text: "text-blue-600",
    },

    green: {
        ring: "text-emerald-500",
        progress: "bg-emerald-500",
        text: "text-emerald-600",
    },

    orange: {
        ring: "text-orange-500",
        progress: "bg-orange-500",
        text: "text-orange-500",
    },

    purple: {
        ring: "text-violet-500",
        progress: "bg-violet-500",
        text: "text-violet-500",
    },
};


/* ========================================================= */
/* PROGRESS CIRCLE */
/* ========================================================= */

function ProgressCircle({
    value,
    label,
    color = "blue",
    size = "large",
}) {

    const styles = colorStyles[color];


    const dimensions =
        size === "large"
            ? "h-24 w-24"
            : "h-20 w-20";


    const innerDimensions =
        size === "large"
            ? "h-[74px] w-[74px]"
            : "h-[62px] w-[62px]";


    return (
        <div className="flex flex-col items-center">

            <div
                className={`relative flex ${dimensions} items-center justify-center rounded-full`}
                style={{
                    background:
                        `conic-gradient(
                            ${
                                color === "blue"
                                    ? "#2563eb"
                                    : color === "green"
                                    ? "#10b981"
                                    : color === "orange"
                                    ? "#f59e0b"
                                    : "#8b5cf6"
                            }
                            ${value}%,
                            #eef0f3 ${value}%
                        )`,
                }}
            >

                <div
                    className={`flex ${innerDimensions} items-center justify-center rounded-full bg-white`}
                >

                    <span className="text-lg font-bold text-slate-900">
                        {value}%
                    </span>

                </div>

            </div>


            <p className={`mt-3 text-sm font-medium ${styles.text}`}>
                {label}
            </p>

        </div>
    );
}


/* ========================================================= */
/* PROGRESS PAGE */
/* ========================================================= */

function ProgressPage() {

    return (
        <div className="min-h-full bg-slate-50 px-6 pb-10 pt-20">


            {/* ================================================= */}
            {/* PAGE HEADER */}
            {/* ================================================= */}

            <div className="mx-auto max-w-[1100px]">

                <div className="mb-8">

                    <h1 className="text-3xl font-bold text-slate-900">
                        Learning Progress
                    </h1>


                    <p className="mt-2 text-sm text-slate-500">
                        Track your performance and identify areas for improvement.
                    </p>

                </div>


                {/* ================================================= */}
                {/* TOP PROGRESS CARDS */}
                {/* ================================================= */}

                <div className="grid grid-cols-2 gap-4 xl:grid-cols-5">


                    {/* Overall */}
                    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">

                        <ProgressCircle
                            value={
                                progressData.overall
                            }
                            label="Overall Progress"
                            color="blue"
                            size="large"
                        />

                    </div>


                    {/* Subjects */}
                    {progressData.subjects.map(
                        (subject) => {

                            return (
                                <div
                                    key={subject.id}
                                    className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"
                                >

                                    <ProgressCircle
                                        value={
                                            subject.progress
                                        }
                                        label={
                                            subject.shortName
                                        }
                                        color={
                                            subject.color
                                        }
                                        size="large"
                                    />

                                </div>
                            );
                        }
                    )}

                </div>


                {/* ================================================= */}
                {/* MAIN GRID */}
                {/* ================================================= */}

                <div className="mt-8 grid grid-cols-1 gap-6 xl:grid-cols-[1.8fr_1fr]">


                    {/* ================================================= */}
                    {/* LEFT COLUMN */}
                    {/* ================================================= */}

                    <div className="space-y-6">


                        {/* SUBJECT-WISE PROGRESS */}
                        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">

                            <h2 className="text-lg font-bold text-slate-900">
                                Subject-wise Progress
                            </h2>


                            <div className="mt-6 space-y-6">

                                {progressData.subjects.map(
                                    (subject) => {

                                        const styles =
                                            colorStyles[
                                                subject.color
                                            ];


                                        return (
                                            <div
                                                key={
                                                    subject.id
                                                }
                                            >

                                                <div className="flex items-end justify-between">

                                                    <div>

                                                        <p className="text-sm font-medium text-slate-900">
                                                            {
                                                                subject.name
                                                            }
                                                        </p>

                                                        <p className="mt-1 text-xs text-slate-400">
                                                            Quiz avg:{" "}
                                                            {
                                                                subject.quizAverage
                                                            }
                                                            %
                                                        </p>

                                                    </div>


                                                    <span
                                                        className={`text-sm font-semibold ${styles.text}`}
                                                    >
                                                        {
                                                            subject.progress
                                                        }
                                                        %
                                                    </span>

                                                </div>


                                                <div className="mt-2 h-2 overflow-hidden rounded-full bg-slate-100">

                                                    <div
                                                        className={`h-full rounded-full ${styles.progress}`}
                                                        style={{
                                                            width: `${subject.progress}%`,
                                                        }}
                                                    />

                                                </div>

                                            </div>
                                        );
                                    }
                                )}

                            </div>

                        </div>


                        {/* RECENT QUIZ SCORES */}
                        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">

                            <h2 className="text-lg font-bold text-slate-900">
                                Recent Quiz Scores
                            </h2>


                            <div className="mt-5 space-y-4">

                                {progressData.recentQuizScores.map(
                                    (quiz) => {

                                        const scoreColor =
                                            quiz.score >= 80
                                                ? "bg-emerald-500"
                                                : quiz.score >= 60
                                                ? "bg-orange-500"
                                                : "bg-red-500";


                                        return (
                                            <div
                                                key={`${quiz.title}-${quiz.date}`}
                                                className="flex items-center gap-4"
                                            >

                                                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-slate-100 text-slate-500">

                                                    <ClipboardCheck
                                                        size={17}
                                                    />

                                                </div>


                                                <div className="min-w-0 flex-1">

                                                    <p className="truncate text-sm font-medium text-slate-900">
                                                        {
                                                            quiz.title
                                                        }
                                                    </p>

                                                    <p className="mt-0.5 text-xs text-slate-400">
                                                        {
                                                            quiz.subject
                                                        }
                                                        {" "}
                                                        ·{" "}
                                                        {
                                                            quiz.date
                                                        }
                                                    </p>

                                                </div>


                                                <div className="flex items-center gap-2">

                                                    <div className="hidden w-24 overflow-hidden rounded-full bg-slate-100 sm:block">

                                                        <div
                                                            className={`h-1.5 rounded-full ${scoreColor}`}
                                                            style={{
                                                                width: `${quiz.score}%`,
                                                            }}
                                                        />

                                                    </div>


                                                    <span className="w-9 text-right text-sm font-semibold text-emerald-500">
                                                        {
                                                            quiz.score
                                                        }
                                                        %
                                                    </span>

                                                </div>

                                            </div>
                                        );
                                    }
                                )}

                            </div>

                        </div>

                    </div>


                    {/* ================================================= */}
                    {/* RIGHT COLUMN */}
                    {/* ================================================= */}

                    <div className="space-y-6">


                        {/* ================================================= */}
                        {/* WEAK TOPICS */}
                        {/* ================================================= */}

                        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">

                            <div className="flex items-center gap-2">

                                <TrendingUp
                                    size={18}
                                    className="text-red-500"
                                />

                                <h2 className="text-lg font-bold text-slate-900">
                                    Weak Topics
                                </h2>

                            </div>


                            <div className="mt-5 space-y-3">

                                {progressData.weakTopics.map(
                                    (topic) => {

                                        return (
                                            <div
                                                key={
                                                    topic.topic
                                                }
                                                className="rounded-xl bg-red-50 p-4"
                                            >

                                                <div className="flex items-start justify-between gap-3">

                                                    <div>

                                                        <p className="text-sm font-medium text-slate-800">
                                                            {
                                                                topic.topic
                                                            }
                                                        </p>

                                                        <p className="mt-1 text-[11px] text-slate-400">
                                                            {
                                                                topic.subject
                                                            }
                                                        </p>

                                                    </div>


                                                    <span className="text-sm font-semibold text-red-500">
                                                        {
                                                            topic.progress
                                                        }
                                                        %
                                                    </span>

                                                </div>


                                                <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-red-100">

                                                    <div
                                                        className="h-full rounded-full bg-red-500"
                                                        style={{
                                                            width: `${topic.progress}%`,
                                                        }}
                                                    />

                                                </div>

                                            </div>
                                        );
                                    }
                                )}

                            </div>

                        </div>


                        {/* ================================================= */}
                        {/* LEARNING HISTORY */}
                        {/* ================================================= */}

                        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">

                            <div className="flex items-center gap-2">

                                <CalendarDays
                                    size={18}
                                    className="text-blue-600"
                                />

                                <h2 className="text-lg font-bold text-slate-900">
                                    Learning History
                                </h2>

                            </div>


                            <div className="mt-5 space-y-5">

                                {progressData.learningHistory.map(
                                    (group) => {

                                        return (
                                            <div
                                                key={
                                                    group.date
                                                }
                                            >

                                                <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-400">
                                                    {
                                                        group.date
                                                    }
                                                </p>


                                                <div className="mt-2 space-y-2">

                                                    {group.activities.map(
                                                        (
                                                            activity
                                                        ) => {

                                                            return (
                                                                <div
                                                                    key={
                                                                        activity
                                                                    }
                                                                    className="flex items-start gap-2"
                                                                >

                                                                    <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-blue-500" />

                                                                    <p className="text-xs leading-5 text-slate-600">
                                                                        {
                                                                            activity
                                                                        }
                                                                    </p>

                                                                </div>
                                                            );
                                                        }
                                                    )}

                                                </div>

                                            </div>
                                        );
                                    }
                                )}

                            </div>

                        </div>


                        {/* ================================================= */}
                        {/* QUICK INSIGHT */}
                        {/* ================================================= */}

                        <div className="rounded-2xl border border-blue-100 bg-blue-50 p-5">

                            <div className="flex items-start gap-3">

                                <Target
                                    size={20}
                                    className="mt-0.5 shrink-0 text-blue-600"
                                />

                                <div>

                                    <h3 className="text-sm font-semibold text-blue-900">
                                        Learning Insight
                                    </h3>

                                    <p className="mt-1 text-xs leading-5 text-blue-700">
                                        Your Java performance is strongest.
                                        Focus on the weak topics in DBMS
                                        and Computer Networks to improve
                                        your overall progress.
                                    </p>

                                </div>

                            </div>

                        </div>

                    </div>

                </div>

            </div>

        </div>
    );
}


export default ProgressPage;