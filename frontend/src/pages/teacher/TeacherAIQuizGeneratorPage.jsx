import React, { useEffect, useState } from "react";

import {
    ArrowLeft,
    BrainCircuit,
    CheckCircle2,
    Clock3,
    FileQuestion,
    Loader2,
    Sparkles,
    XCircle,
} from "lucide-react";

import { useNavigate } from "react-router-dom";

const API_URL = "http://localhost:8080";

function TeacherAIQuizGeneratorPage() {

    const navigate = useNavigate();

    // =====================================================
    // DATA STATE
    // =====================================================

    const [subjects, setSubjects] = useState([]);
    const [units, setUnits] = useState([]);
    const [topics, setTopics] = useState([]);

    // =====================================================
    // SELECTION STATE
    // =====================================================

    const [selectedSubjectId, setSelectedSubjectId] =
        useState("");

    const [selectedUnitId, setSelectedUnitId] =
        useState("");

    const [selectedTopicId, setSelectedTopicId] =
        useState("");

    // =====================================================
    // QUIZ SETTINGS
    // =====================================================

    const [questionCount, setQuestionCount] =
        useState(5);

    const [duration, setDuration] =
        useState(10);

    const [deadlineHours, setDeadlineHours] =
        useState(24);

    // =====================================================
    // UI STATE
    // =====================================================

    const [loadingSubjects, setLoadingSubjects] =
        useState(false);

    const [loadingUnits, setLoadingUnits] =
        useState(false);

    const [loadingTopics, setLoadingTopics] =
        useState(false);

    const [generating, setGenerating] =
        useState(false);

    const [error, setError] =
        useState("");

    const [success, setSuccess] =
        useState("");

    const [generatedQuiz, setGeneratedQuiz] =
        useState(null);

    // =====================================================
    // GET TEACHER ID
    // =====================================================

    const teacherId =
        localStorage.getItem("userId");

    // =====================================================
    // FETCH SUBJECTS
    // =====================================================

    const fetchSubjects = async () => {

        try {

            setLoadingSubjects(true);
            setError("");

            const response =
                await fetch(
                    `${API_URL}/api/subjects`
                );

            if (!response.ok) {

                throw new Error(
                    "Unable to load subjects."
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
                "Subject fetch error:",
                error
            );

            setError(
                "Unable to load subjects."
            );

        } finally {

            setLoadingSubjects(false);
        }
    };

    // =====================================================
    // FETCH UNITS
    // =====================================================

    const fetchUnits = async (
        subjectId
    ) => {

        try {

            setLoadingUnits(true);
            setError("");

            const response =
                await fetch(
                    `${API_URL}/api/units/subject/${subjectId}`
                );

            if (!response.ok) {

                throw new Error(
                    "Unable to load units."
                );
            }

            const data =
                await response.json();

            setUnits(
                Array.isArray(data)
                    ? data
                    : []
            );

        } catch (error) {

            console.error(
                "Unit fetch error:",
                error
            );

            setError(
                "Unable to load units."
            );

        } finally {

            setLoadingUnits(false);
        }
    };

    // =====================================================
    // FETCH TOPICS
    // =====================================================

    const fetchTopics = async (
        unitId
    ) => {

        try {

            setLoadingTopics(true);
            setError("");

            const response =
                await fetch(
                    `${API_URL}/api/topics/unit/${unitId}`
                );

            if (!response.ok) {

                throw new Error(
                    "Unable to load topics."
                );
            }

            const data =
                await response.json();

            setTopics(
                Array.isArray(data)
                    ? data
                    : []
            );

        } catch (error) {

            console.error(
                "Topic fetch error:",
                error
            );

            setError(
                "Unable to load topics."
            );

        } finally {

            setLoadingTopics(false);
        }
    };

    // =====================================================
    // INITIAL LOAD
    // =====================================================

    useEffect(() => {

        fetchSubjects();

    }, []);

    // =====================================================
    // SUBJECT CHANGE
    // =====================================================

    const handleSubjectChange = async (
        event
    ) => {

        const subjectId =
            event.target.value;

        setSelectedSubjectId(
            subjectId
        );

        setSelectedUnitId("");
        setSelectedTopicId("");

        setUnits([]);
        setTopics([]);

        setGeneratedQuiz(null);
        setError("");
        setSuccess("");

        if (subjectId) {

            await fetchUnits(
                subjectId
            );
        }
    };

    // =====================================================
    // UNIT CHANGE
    // =====================================================

    const handleUnitChange = async (
        event
    ) => {

        const unitId =
            event.target.value;

        setSelectedUnitId(
            unitId
        );

        setSelectedTopicId("");

        setTopics([]);

        setGeneratedQuiz(null);
        setError("");
        setSuccess("");

        if (unitId) {

            await fetchTopics(
                unitId
            );
        }
    };

    // =====================================================
    // TOPIC CHANGE
    // =====================================================

    const handleTopicChange = async (
        event
    ) => {

        const topicId =
            event.target.value;

        setSelectedTopicId(
            topicId
        );

        setGeneratedQuiz(null);
        setError("");
        setSuccess("");
    };

    // =====================================================
    // FIND SELECTED TOPIC
    // =====================================================

    const selectedTopic =
        topics.find(
            (topic) =>
                Number(topic.id) ===
                Number(selectedTopicId)
        );

    // =====================================================
    // GENERATE QUIZ
    // =====================================================

    const handleGenerateQuiz = async (
        event
    ) => {

        event.preventDefault();

        setError("");
        setSuccess("");
        setGeneratedQuiz(null);

        // -------------------------------------------------
        // VALIDATE TEACHER
        // -------------------------------------------------

        if (!teacherId) {

            setError(
                "Teacher login information not found. Please login again."
            );

            return;
        }

        // -------------------------------------------------
        // VALIDATE SUBJECT
        // -------------------------------------------------

        if (!selectedSubjectId) {

            setError(
                "Please select a subject."
            );

            return;
        }

        // -------------------------------------------------
        // VALIDATE UNIT
        // -------------------------------------------------

        if (!selectedUnitId) {

            setError(
                "Please select a unit."
            );

            return;
        }

        // -------------------------------------------------
        // VALIDATE TOPIC
        // -------------------------------------------------

        if (!selectedTopicId) {

            setError(
                "Please select a topic."
            );

            return;
        }

        // -------------------------------------------------
        // VALIDATE QUESTION COUNT
        // -------------------------------------------------

        const numericQuestionCount =
            Number(questionCount);

        if (
            numericQuestionCount < 1 ||
            numericQuestionCount > 20
        ) {

            setError(
                "Question count must be between 1 and 20."
            );

            return;
        }

        // -------------------------------------------------
        // VALIDATE DURATION
        // -------------------------------------------------

        const numericDuration =
            Number(duration);

        if (
            numericDuration < 1
        ) {

            setError(
                "Quiz duration must be at least 1 minute."
            );

            return;
        }

        // -------------------------------------------------
        // VALIDATE DEADLINE
        // -------------------------------------------------

        const numericDeadline =
            Number(deadlineHours);

        if (
            numericDeadline !== 12 &&
            numericDeadline !== 24 &&
            numericDeadline !== 48
        ) {

            setError(
                "Please select a valid submission window."
            );

            return;
        }

        // -------------------------------------------------
        // GENERATE
        // -------------------------------------------------

        try {

            setGenerating(true);

            const response =
                await fetch(
                    `${API_URL}/api/quizzes/ai/generate`,
                    {
                        method: "POST",

                        headers: {
                            "Content-Type":
                                "application/json",
                        },

                        body:
                            JSON.stringify({
                                topicId:
                                    Number(
                                        selectedTopicId
                                    ),

                                questionCount:
                                    numericQuestionCount,

                                duration:
                                    numericDuration,

                                subjectId:
                                    Number(
                                        selectedSubjectId
                                    ),

                                teacherId:
                                    Number(
                                        teacherId
                                    ),

                                deadlineHours:
                                    numericDeadline,
                            }),
                    }
                );

            const responseText =
                await response.text();

            let responseData = null;

            try {

                responseData =
                    responseText
                        ? JSON.parse(
                            responseText
                        )
                        : null;

            } catch {

                responseData = null;
            }

            if (!response.ok) {

                throw new Error(
                    responseData?.error ||
                    "Unable to generate AI quiz."
                );
            }

            setGeneratedQuiz(
                responseData
            );

            setSuccess(
                "AI quiz generated successfully!"
            );

        } catch (error) {

            console.error(
                "AI quiz generation error:",
                error
            );

            setError(
                error.message ||
                "Unable to generate AI quiz."
            );

        } finally {

            setGenerating(false);
        }
    };

    // =====================================================
    // GET OPTION TEXT
    // =====================================================

    const getOptionClass = (
        question,
        optionIndex
    ) => {

        if (
            Number(
                question.correctAnswer
            ) === optionIndex
        ) {

            return "border-green-300 bg-green-50";
        }

        return "border-slate-200 bg-white";
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

                <div className="mb-8 flex items-center justify-between gap-4">

                    <div>

                        <button
                            type="button"
                            onClick={() =>
                                navigate(
                                    "/teacher/quizzes"
                                )
                            }
                            className="mb-4 inline-flex items-center gap-2 text-sm font-medium text-slate-500 transition hover:text-slate-900"
                        >

                            <ArrowLeft
                                size={17}
                            />

                            Back to Quizzes

                        </button>

                        <div className="flex items-center gap-3">

                            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-100 text-blue-600">

                                <BrainCircuit
                                    size={23}
                                />

                            </div>

                            <div>

                                <h1 className="text-3xl font-bold text-slate-900">

                                    AI Quiz Generator

                                </h1>

                                <p className="mt-1 text-sm text-slate-500">

                                    Generate MCQ questions from
                                    teacher-uploaded course material.

                                </p>

                            </div>

                        </div>

                    </div>

                </div>

                {/* ================================================= */}
                {/* ERROR */}
                {/* ================================================= */}

                {error && (

                    <div className="mb-6 flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 p-4">

                        <XCircle
                            className="mt-0.5 shrink-0 text-red-500"
                            size={20}
                        />

                        <p className="text-sm text-red-700">

                            {error}

                        </p>

                    </div>
                )}

                {/* ================================================= */}
                {/* SUCCESS */}
                {/* ================================================= */}

                {success && (

                    <div className="mb-6 flex items-start gap-3 rounded-xl border border-green-200 bg-green-50 p-4">

                        <CheckCircle2
                            className="mt-0.5 shrink-0 text-green-600"
                            size={20}
                        />

                        <p className="text-sm text-green-700">

                            {success}

                        </p>

                    </div>
                )}

                {/* ================================================= */}
                {/* GENERATOR FORM */}
                {/* ================================================= */}

                {!generatedQuiz && (

                    <form
                        onSubmit={
                            handleGenerateQuiz
                        }
                        className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"
                    >

                        {/* ================================================= */}
                        {/* INTRO */}
                        {/* ================================================= */}

                        <div className="mb-7 rounded-xl bg-blue-50 p-5">

                            <div className="flex items-start gap-3">

                                <Sparkles
                                    className="mt-0.5 shrink-0 text-blue-600"
                                    size={21}
                                />

                                <div>

                                    <h2 className="font-semibold text-slate-900">

                                        Generate from course material

                                    </h2>

                                    <p className="mt-1 text-sm leading-6 text-slate-600">

                                        Select the exact topic containing
                                        your learning material. The AI will
                                        read that topic's uploaded PDF and
                                        generate the requested MCQs.

                                    </p>

                                </div>

                            </div>

                        </div>

                        {/* ================================================= */}
                        {/* COURSE SELECTION */}
                        {/* ================================================= */}

                        <div className="grid grid-cols-1 gap-5 md:grid-cols-3">

                            {/* SUBJECT */}

                            <div>

                                <label className="mb-2 block text-sm font-medium text-slate-700">

                                    Subject

                                </label>

                                <select
                                    value={
                                        selectedSubjectId
                                    }
                                    onChange={
                                        handleSubjectChange
                                    }
                                    disabled={
                                        loadingSubjects
                                    }
                                    className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                                >

                                    <option value="">

                                        {loadingSubjects
                                            ? "Loading subjects..."
                                            : "Select subject"}

                                    </option>

                                    {subjects.map(
                                        (
                                            subject
                                        ) => (

                                            <option
                                                key={
                                                    subject.id
                                                }
                                                value={
                                                    subject.id
                                                }
                                            >

                                                {
                                                    subject.name
                                                }

                                            </option>
                                        )
                                    )}

                                </select>

                            </div>

                            {/* UNIT */}

                            <div>

                                <label className="mb-2 block text-sm font-medium text-slate-700">

                                    Unit

                                </label>

                                <select
                                    value={
                                        selectedUnitId
                                    }
                                    onChange={
                                        handleUnitChange
                                    }
                                    disabled={
                                        !selectedSubjectId ||
                                        loadingUnits
                                    }
                                    className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100 disabled:bg-slate-50"
                                >

                                    <option value="">

                                        {loadingUnits
                                            ? "Loading units..."
                                            : "Select unit"}

                                    </option>

                                    {units.map(
                                        (
                                            unit
                                        ) => (

                                            <option
                                                key={
                                                    unit.id
                                                }
                                                value={
                                                    unit.id
                                                }
                                            >

                                                Unit {
                                                    unit.unitNumber
                                                }{" "}
                                                -{" "}
                                                {
                                                    unit.title
                                                }

                                            </option>
                                        )
                                    )}

                                </select>

                            </div>

                            {/* TOPIC */}

                            <div>

                                <label className="mb-2 block text-sm font-medium text-slate-700">

                                    Topic

                                </label>

                                <select
                                    value={
                                        selectedTopicId
                                    }
                                    onChange={
                                        handleTopicChange
                                    }
                                    disabled={
                                        !selectedUnitId ||
                                        loadingTopics
                                    }
                                    className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100 disabled:bg-slate-50"
                                >

                                    <option value="">

                                        {loadingTopics
                                            ? "Loading topics..."
                                            : "Select topic"}

                                    </option>

                                    {topics.map(
                                        (
                                            topic
                                        ) => (

                                            <option
                                                key={
                                                    topic.id
                                                }
                                                value={
                                                    topic.id
                                                }
                                            >

                                                Topic {
                                                    topic.topicNumber
                                                }{" "}
                                                -{" "}
                                                {
                                                    topic.title
                                                }

                                            </option>
                                        )
                                    )}

                                </select>

                            </div>

                        </div>

                        {/* ================================================= */}
                        {/* SELECTED TOPIC INFO */}
                        {/* ================================================= */}

                        {selectedTopic && (

                            <div className="mt-5 rounded-xl border border-slate-200 bg-slate-50 p-4">

                                <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">

                                    Selected Topic

                                </p>

                                <h3 className="mt-1 font-semibold text-slate-900">

                                    {
                                        selectedTopic.title
                                    }

                                </h3>

                                {selectedTopic.description && (

                                    <p className="mt-1 text-sm leading-6 text-slate-500">

                                        {
                                            selectedTopic.description
                                        }

                                    </p>
                                )}

                            </div>
                        )}

                        {/* ================================================= */}
                        {/* SETTINGS */}
                        {/* ================================================= */}

                        <div className="mt-7 border-t border-slate-100 pt-7">

                            <div className="grid grid-cols-1 gap-5 md:grid-cols-3">

                                {/* QUESTIONS */}

                                <div>

                                    <label className="mb-2 flex items-center gap-2 text-sm font-medium text-slate-700">

                                        <FileQuestion
                                            size={17}
                                            className="text-blue-500"
                                        />

                                        Questions

                                    </label>

                                    <input
                                        type="number"
                                        min="1"
                                        max="20"
                                        value={
                                            questionCount
                                        }
                                        onChange={(
                                            event
                                        ) =>
                                            setQuestionCount(
                                                event.target.value
                                            )
                                        }
                                        className="w-full rounded-xl border border-slate-300 px-4 py-3 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                                    />

                                    <p className="mt-1 text-xs text-slate-400">

                                        1 to 20 questions

                                    </p>

                                </div>

                                {/* DURATION */}

                                <div>

                                    <label className="mb-2 flex items-center gap-2 text-sm font-medium text-slate-700">

                                        <Clock3
                                            size={17}
                                            className="text-blue-500"
                                        />

                                        Duration

                                    </label>

                                    <input
                                        type="number"
                                        min="1"
                                        value={
                                            duration
                                        }
                                        onChange={(
                                            event
                                        ) =>
                                            setDuration(
                                                event.target.value
                                            )
                                        }
                                        className="w-full rounded-xl border border-slate-300 px-4 py-3 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                                    />

                                    <p className="mt-1 text-xs text-slate-400">

                                        Minutes

                                    </p>

                                </div>

                                {/* DEADLINE */}

                                <div>

                                    <label className="mb-2 block text-sm font-medium text-slate-700">

                                        Submission Window

                                    </label>

                                    <select
                                        value={
                                            deadlineHours
                                        }
                                        onChange={(
                                            event
                                        ) =>
                                            setDeadlineHours(
                                                event.target.value
                                            )
                                        }
                                        className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                                    >

                                        <option value={12}>

                                            12 Hours

                                        </option>

                                        <option value={24}>

                                            24 Hours

                                        </option>

                                        <option value={48}>

                                            48 Hours

                                        </option>

                                    </select>

                                    <p className="mt-1 text-xs text-slate-400">

                                        Time available for students to submit

                                    </p>

                                </div>

                            </div>

                        </div>

                        {/* ================================================= */}
                        {/* BUTTON */}
                        {/* ================================================= */}

                        <div className="mt-8 flex justify-end">

                            <button
                                type="submit"
                                disabled={
                                    generating
                                }
                                className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-6 py-3 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
                            >

                                {generating ? (

                                    <>
                                        <Loader2
                                            size={18}
                                            className="animate-spin"
                                        />

                                        Generating Quiz...

                                    </>

                                ) : (

                                    <>
                                        <Sparkles
                                            size={18}
                                        />

                                        Generate Quiz with AI

                                    </>
                                )}

                            </button>

                        </div>

                    </form>
                )}

                {/* ================================================= */}
                {/* GENERATED QUIZ */}
                {/* ================================================= */}

                {generatedQuiz && (

                    <div className="space-y-6">

                        {/* HEADER */}

                        <div className="rounded-2xl border border-green-200 bg-green-50 p-6">

                            <div className="flex items-start justify-between gap-4">

                                <div>

                                    <div className="mb-2 flex items-center gap-2 text-green-700">

                                        <CheckCircle2
                                            size={20}
                                        />

                                        <span className="text-sm font-semibold">

                                            Quiz Generated Successfully

                                        </span>

                                    </div>

                                    <h2 className="text-2xl font-bold text-slate-900">

                                        {
                                            generatedQuiz.quiz?.title ||
                                            "Generated Quiz"
                                        }

                                    </h2>

                                    <div className="mt-3 flex flex-wrap gap-4 text-sm text-slate-500">

                                        <span>

                                            {
                                                generatedQuiz.quiz?.duration
                                            }{" "}
                                            minutes

                                        </span>

                                        <span>

                                            {
                                                generatedQuiz.questions?.length ||
                                                0
                                            }{" "}
                                            questions

                                        </span>

                                    </div>

                                </div>

                            </div>

                        </div>

                        {/* QUESTIONS */}

                        <div className="space-y-5">

                            {(
                                generatedQuiz.questions ||
                                []
                            ).map(
                                (
                                    question,
                                    index
                                ) => (

                                    <div
                                        key={
                                            question.id ||
                                            index
                                        }
                                        className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"
                                    >

                                        <div className="flex items-start gap-4">

                                            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-blue-50 text-sm font-bold text-blue-600">

                                                {
                                                    index +
                                                    1
                                                }

                                            </div>

                                            <div className="min-w-0 flex-1">

                                                <h3 className="font-semibold leading-6 text-slate-900">

                                                    {
                                                        question.question
                                                    }

                                                </h3>

                                                <div className="mt-4 grid gap-3">

                                                    {[
                                                        question.option1,
                                                        question.option2,
                                                        question.option3,
                                                        question.option4,
                                                    ].map(
                                                        (
                                                            option,
                                                            optionIndex
                                                        ) => (

                                                            <div
                                                                key={
                                                                    optionIndex
                                                                }
                                                                className={`rounded-xl border px-4 py-3 text-sm ${getOptionClass(
                                                                    question,
                                                                    optionIndex
                                                                )}`}
                                                            >

                                                                <span className="mr-2 font-semibold text-slate-500">

                                                                    {
                                                                        String.fromCharCode(
                                                                            65 +
                                                                            optionIndex
                                                                        )
                                                                    }.

                                                                </span>

                                                                {
                                                                    option
                                                                }

                                                                {Number(
                                                                    question.correctAnswer
                                                                ) ===
                                                                    optionIndex && (

                                                                        <span className="ml-2 font-semibold text-green-700">

                                                                            ✓ Correct

                                                                        </span>
                                                                    )}

                                                            </div>
                                                        )
                                                    )}

                                                </div>

                                            </div>

                                        </div>

                                    </div>
                                )
                            )}

                        </div>

                        {/* ACTIONS */}

                        <div className="flex flex-wrap justify-end gap-3">

                            <button
                                type="button"
                                onClick={() =>
                                    navigate(
                                        "/teacher/quizzes"
                                    )
                                }
                                className="rounded-xl border border-slate-300 bg-white px-5 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
                            >

                                Back to Quizzes

                            </button>

                            <button
                                type="button"
                                onClick={() => {
                                    setGeneratedQuiz(
                                        null
                                    );

                                    setSuccess(
                                        ""
                                    );

                                    setError(
                                        ""
                                    );
                                }}
                                className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-blue-700"
                            >

                                <Sparkles
                                    size={17}
                                />

                                Generate Another

                            </button>

                        </div>

                    </div>
                )}

            </div>

        </div>
    );
}

export default TeacherAIQuizGeneratorPage;