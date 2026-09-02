import {
    Plus,
    Trash2,
    Loader2,
    ClipboardCheck,
    Clock3,
    Users,
    Eye,
    X,
    Award,
    CheckCircle,
    Sparkles,
} from "lucide-react";

import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

function TeacherQuizzesPage() {

    const navigate = useNavigate();

    // =====================================================
    // STATE
    // =====================================================

    const [subjects, setSubjects] = useState([]);

    const [quizzes, setQuizzes] = useState([]);

    const [loading, setLoading] = useState(true);

    const [creating, setCreating] = useState(false);

    const [deletingId, setDeletingId] =
        useState(null);

    const [error, setError] = useState("");

    const [showForm, setShowForm] = useState(false);

    // =====================================================
    // SUBMISSION STATE
    // =====================================================

    const [selectedQuizId, setSelectedQuizId] =
        useState(null);

    const [submissions, setSubmissions] =
        useState([]);

    const [loadingSubmissions, setLoadingSubmissions] =
        useState(false);

    const [submissionError, setSubmissionError] =
        useState("");

    // =====================================================
    // QUIZ FORM
    // =====================================================

    const [quizData, setQuizData] = useState({
        title: "",
        duration: 10,
        subjectId: "",
        deadlineHours: 24,
    });

    // =====================================================
    // QUESTIONS
    // =====================================================

    const [questions, setQuestions] = useState([
        {
            question: "",
            option1: "",
            option2: "",
            option3: "",
            option4: "",
            correctAnswer: 0,
        },
    ]);

    // =====================================================
    // GET TEACHER ID
    // =====================================================

    const getTeacherId = () => {

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

    const teacherId =
        getTeacherId();

    // =====================================================
    // FETCH SUBJECTS
    // =====================================================

    const fetchSubjects = async () => {

        try {

            const response = await fetch(
                "http://localhost:8080/api/subjects"
            );

            if (!response.ok) {

                throw new Error(
                    "Failed to fetch subjects."
                );
            }

            const data =
                await response.json();

            setSubjects(data);

        } catch (error) {

            console.error(
                "Subject fetch error:",
                error
            );

            setError(
                "Unable to load subjects."
            );
        }
    };

    // =====================================================
    // FETCH TEACHER QUIZZES
    // =====================================================

    const fetchQuizzes = async () => {

        if (!teacherId) {

            setQuizzes([]);

            setLoading(false);

            return;
        }

        try {

            const response = await fetch(
                `http://localhost:8080/api/quizzes/teacher/${teacherId}`
            );

            if (!response.ok) {

                throw new Error(
                    "Failed to fetch quizzes."
                );
            }

            const data =
                await response.json();

            setQuizzes(data);

        } catch (error) {

            console.error(
                "Quiz fetch error:",
                error
            );

            setError(
                "Unable to load quizzes."
            );

        } finally {

            setLoading(false);
        }
    };

    // =====================================================
    // INITIAL LOAD
    // =====================================================

    useEffect(() => {

        fetchSubjects();

        fetchQuizzes();

    }, []);

    // =====================================================
    // QUIZ INPUT
    // =====================================================

    const handleQuizChange = (event) => {

        const {
            name,
            value,
        } = event.target;

        setQuizData((previous) => ({
            ...previous,
            [name]: value,
        }));
    };

    // =====================================================
    // QUESTION INPUT
    // =====================================================

    const handleQuestionChange = (
        questionIndex,
        field,
        value
    ) => {

        setQuestions((previous) =>
            previous.map(
                (question, index) =>
                    index === questionIndex
                        ? {
                              ...question,
                              [field]:
                                  field ===
                                  "correctAnswer"
                                      ? Number(value)
                                      : value,
                          }
                        : question
            )
        );
    };

    // =====================================================
    // ADD QUESTION
    // =====================================================

    const addQuestion = () => {

        setQuestions((previous) => [
            ...previous,

            {
                question: "",
                option1: "",
                option2: "",
                option3: "",
                option4: "",
                correctAnswer: 0,
            },
        ]);
    };

    // =====================================================
    // REMOVE QUESTION
    // =====================================================

    const removeQuestion = (
        indexToRemove
    ) => {

        if (questions.length === 1) {
            return;
        }

        setQuestions((previous) =>
            previous.filter(
                (_, index) =>
                    index !== indexToRemove
            )
        );
    };

    // =====================================================
    // RESET FORM
    // =====================================================

    const resetForm = () => {

        setQuizData({
            title: "",
            duration: 10,
            subjectId: "",
            deadlineHours: 24,
        });

        setQuestions([
            {
                question: "",
                option1: "",
                option2: "",
                option3: "",
                option4: "",
                correctAnswer: 0,
            },
        ]);

        setShowForm(false);
    };

    // =====================================================
    // FORMAT DATE
    // =====================================================

    const formatDate = (dateValue) => {

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
            return "Invalid date";
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
    };

    // =====================================================
    // GET SUBJECT NAME
    // =====================================================

    const getSubjectName = (
        subjectId
    ) => {

        const subject =
            subjects.find(
                (item) =>
                    Number(item.id) ===
                    Number(subjectId)
            );

        return (
            subject?.name ||
            "Subject"
        );
    };

    // =====================================================
    // GET SCORE COLOR
    // =====================================================

    const getScoreClasses = (
        score
    ) => {

        const numericScore =
            Number(score) || 0;

        if (numericScore >= 80) {
            return "bg-green-50 text-green-700";
        }

        if (numericScore >= 50) {
            return "bg-yellow-50 text-yellow-700";
        }

        return "bg-red-50 text-red-700";
    };

    // =====================================================
    // LOAD SUBMISSIONS
    // =====================================================

    const loadSubmissions = async (
        quizId
    ) => {

        // -------------------------------------------------
        // CLOSE IF SAME QUIZ IS CLICKED AGAIN
        // -------------------------------------------------

        if (
            selectedQuizId ===
            quizId
        ) {

            setSelectedQuizId(
                null
            );

            setSubmissions([]);

            setSubmissionError("");

            return;
        }

        try {

            setSelectedQuizId(
                quizId
            );

            setLoadingSubmissions(
                true
            );

            setSubmissionError("");

            const response =
                await fetch(
                    `http://localhost:8080/api/quiz-attempts/quiz/${quizId}`
                );

            if (
                !response.ok
            ) {

                throw new Error(
                    "Failed to load student submissions."
                );
            }

            const data =
                await response.json();

            setSubmissions(
                Array.isArray(data)
                    ? data
                    : []
            );

        } catch (error) {

            console.error(
                "Submission fetch error:",
                error
            );

            setSubmissionError(
                "Unable to load student submissions."
            );

            setSubmissions([]);

        } finally {

            setLoadingSubmissions(
                false
            );
        }
    };

    // =====================================================
    // DELETE QUIZ
    // =====================================================

    const handleDeleteQuiz = async (
        quiz
    ) => {

        if (!quiz?.id) {
            return;
        }

        const confirmed =
            window.confirm(
                `Delete "${quiz.title}"? This action cannot be undone.`
            );

        if (!confirmed) {
            return;
        }

        const wasSelected =
            selectedQuizId === quiz.id;

        setDeletingId(quiz.id);
        setError("");

        try {

            const response =
                await fetch(
                    `http://localhost:8080/api/quizzes/${quiz.id}`,
                    {
                        method: "DELETE",
                    }
                );

            const responseText =
                await response.text();

            if (!response.ok) {

                throw new Error(
                    responseText ||
                    `Failed to delete quiz (${response.status}).`
                );
            }

            setQuizzes(
                (previous) =>
                    previous.filter(
                        (item) =>
                            item.id !== quiz.id
                    )
            );

            if (wasSelected) {

                setSelectedQuizId(null);
                setSubmissions([]);
                setSubmissionError("");
            }

        } catch (deleteError) {

            console.error(
                "Delete quiz error:",
                deleteError
            );

            setError(
                deleteError.message ||
                "Unable to delete quiz. Please try again."
            );

        } finally {

            setDeletingId(null);
        }
    };


    // =====================================================
    // CREATE QUIZ
    // =====================================================

    const handleSubmit = async (
        event
    ) => {

        event.preventDefault();

        setCreating(true);

        setError("");

        try {

            // -------------------------------------------------
            // TEACHER
            // -------------------------------------------------

            if (!teacherId) {

                throw new Error(
                    "Teacher login information not found."
                );
            }

            // -------------------------------------------------
            // TITLE
            // -------------------------------------------------

            if (
                !quizData.title.trim()
            ) {

                throw new Error(
                    "Please enter a quiz title."
                );
            }

            // -------------------------------------------------
            // SUBJECT
            // -------------------------------------------------

            if (
                !quizData.subjectId
            ) {

                throw new Error(
                    "Please select a subject."
                );
            }

            // -------------------------------------------------
            // DURATION
            // -------------------------------------------------

            if (
                Number(
                    quizData.duration
                ) < 1
            ) {

                throw new Error(
                    "Quiz duration must be at least 1 minute."
                );
            }

            // -------------------------------------------------
            // DEADLINE
            // -------------------------------------------------

            const deadlineHours =
                Number(
                    quizData.deadlineHours
                );

            if (
                deadlineHours !== 12 &&
                deadlineHours !== 24 &&
                deadlineHours !== 48
            ) {

                throw new Error(
                    "Please select a valid submission window."
                );
            }

            // -------------------------------------------------
            // QUESTIONS
            // -------------------------------------------------

            if (
                questions.length === 0
            ) {

                throw new Error(
                    "Add at least one question."
                );
            }

            // -------------------------------------------------
            // VALIDATE QUESTIONS
            // -------------------------------------------------

            for (
                let index = 0;
                index <
                questions.length;
                index++
            ) {

                const question =
                    questions[index];

                if (
                    !question.question.trim() ||
                    !question.option1.trim() ||
                    !question.option2.trim() ||
                    !question.option3.trim() ||
                    !question.option4.trim()
                ) {

                    throw new Error(
                        `Please complete Question ${
                            index + 1
                        }.`
                    );
                }
            }

            // -------------------------------------------------
            // CREATE QUIZ
            // -------------------------------------------------

            const quizResponse =
                await fetch(
                    "http://localhost:8080/api/quizzes",
                    {
                        method: "POST",

                        headers: {
                            "Content-Type":
                                "application/json",
                        },

                        body:
                            JSON.stringify({
                                title:
                                    quizData.title.trim(),

                                duration:
                                    Number(
                                        quizData.duration
                                    ),

                                subjectId:
                                    Number(
                                        quizData.subjectId
                                    ),

                                teacherId:
                                    Number(
                                        teacherId
                                    ),

                                deadlineHours:
                                    deadlineHours,
                            }),
                    }
                );

            // -------------------------------------------------
            // QUIZ CREATION ERROR
            // -------------------------------------------------

            if (
                !quizResponse.ok
            ) {

                const responseText =
                    await quizResponse.text();

                throw new Error(
                    responseText ||
                        "Failed to create quiz."
                );
            }

            // -------------------------------------------------
            // CREATED QUIZ
            // -------------------------------------------------

            const createdQuiz =
                await quizResponse.json();

            // -------------------------------------------------
            // ADD QUESTIONS
            // -------------------------------------------------

            for (
                const question
                of questions
            ) {

                const questionResponse =
                    await fetch(
                        `http://localhost:8080/api/quizzes/${createdQuiz.id}/questions`,
                        {
                            method: "POST",

                            headers: {
                                "Content-Type":
                                    "application/json",
                            },

                            body:
                                JSON.stringify(
                                    question
                                ),
                        }
                    );

                if (
                    !questionResponse.ok
                ) {

                    throw new Error(
                        "Quiz was created, but a question could not be added."
                    );
                }
            }

            // -------------------------------------------------
            // SUCCESS
            // -------------------------------------------------

            alert(
                `Quiz created successfully!\n\nSubmission window: ${deadlineHours} hours`
            );

            resetForm();

            await fetchQuizzes();

        } catch (error) {

            console.error(
                "Create quiz error:",
                error
            );

            setError(
                error.message ||
                    "Unable to create quiz."
            );

        } finally {

            setCreating(false);
        }
    };

    // =====================================================
    // RENDER
    // =====================================================

    return (

        <div className="min-h-full bg-slate-50 px-6 pb-10 pt-20">

            <div className="mx-auto max-w-6xl">

                {/* ================================================= */}
                {/* HEADER */}
                {/* ================================================= */}

                <div className="mb-8 flex items-center justify-between">

                    <div>

                        <h1 className="text-3xl font-bold text-slate-900">
                            Manage Quizzes
                        </h1>

                        <p className="mt-2 text-sm text-slate-500">
                            Create quizzes and add as many
                            questions as your students need.
                        </p>

                    </div>

                    <div className="flex flex-wrap items-center gap-3">

                        <button
                            type="button"
                            onClick={() =>
                                navigate(
                                    "/teacher/ai-quiz-generator"
                                )
                            }
                            className="flex items-center gap-2 rounded-xl border border-blue-200 bg-white px-5 py-3 text-sm font-semibold text-blue-600 transition hover:bg-blue-50"
                        >

                            <Sparkles size={18} />

                            Generate with AI

                        </button>

                        <button
                            type="button"
                            onClick={() =>
                                setShowForm(
                                    !showForm
                                )
                            }
                            className="flex items-center gap-2 rounded-xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-blue-700"
                        >

                            <Plus size={18} />

                            Create Quiz

                        </button>

                    </div>

                </div>

                {/* ================================================= */}
                {/* ERROR */}
                {/* ================================================= */}

                {error && (

                    <div className="mb-6 rounded-xl border border-red-200 bg-red-50 p-4">

                        <p className="text-sm text-red-600">
                            {error}
                        </p>

                    </div>

                )}

                {/* ================================================= */}
                {/* CREATE QUIZ FORM */}
                {/* ================================================= */}

                {showForm && (

                    <form
                        onSubmit={
                            handleSubmit
                        }
                        className="mb-8 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"
                    >

                        <div className="mb-6">

                            <h2 className="text-xl font-bold text-slate-900">
                                Create New Quiz
                            </h2>

                            <p className="mt-1 text-sm text-slate-500">
                                Create the quiz, choose the
                                submission window, then add
                                questions.
                            </p>

                        </div>

                        {/* ========================================= */}
                        {/* QUIZ DETAILS */}
                        {/* ========================================= */}

                        <div className="grid grid-cols-1 gap-5 md:grid-cols-4">

                            {/* TITLE */}

                            <div>

                                <label className="mb-2 block text-sm font-medium text-slate-700">
                                    Quiz Title
                                </label>

                                <input
                                    type="text"
                                    name="title"
                                    value={
                                        quizData.title
                                    }
                                    onChange={
                                        handleQuizChange
                                    }
                                    placeholder="e.g. DBMS Unit 1 Quiz"
                                    required
                                    className="w-full rounded-xl border border-slate-300 px-4 py-3 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                                />

                            </div>

                            {/* SUBJECT */}

                            <div>

                                <label className="mb-2 block text-sm font-medium text-slate-700">
                                    Subject
                                </label>

                                <select
                                    name="subjectId"
                                    value={
                                        quizData.subjectId
                                    }
                                    onChange={
                                        handleQuizChange
                                    }
                                    required
                                    className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                                >

                                    <option value="">
                                        Select subject
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

                            {/* DURATION */}

                            <div>

                                <label className="mb-2 block text-sm font-medium text-slate-700">
                                    Quiz Duration
                                </label>

                                <div className="relative">

                                    <input
                                        type="number"
                                        name="duration"
                                        value={
                                            quizData.duration
                                        }
                                        onChange={
                                            handleQuizChange
                                        }
                                        min="1"
                                        required
                                        className="w-full rounded-xl border border-slate-300 px-4 py-3 pr-20 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                                    />

                                    <span className="absolute right-4 top-1/2 -translate-y-1/2 text-xs text-slate-400">
                                        minutes
                                    </span>

                                </div>

                            </div>

                            {/* DEADLINE */}

                            <div>

                                <label className="mb-2 block text-sm font-medium text-slate-700">
                                    Submission Window
                                </label>

                                <select
                                    name="deadlineHours"
                                    value={
                                        quizData.deadlineHours
                                    }
                                    onChange={
                                        handleQuizChange
                                    }
                                    required
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
                                    Students must submit before this window expires.
                                </p>

                            </div>

                        </div>

                        {/* ========================================= */}
                        {/* QUESTIONS HEADER */}
                        {/* ========================================= */}

                        <div className="mt-8 flex items-center justify-between">

                            <div>

                                <h3 className="text-lg font-semibold text-slate-900">
                                    Questions
                                </h3>

                                <p className="mt-1 text-sm text-slate-500">

                                    {questions.length}{" "}

                                    question

                                    {questions.length !==
                                    1
                                        ? "s"
                                        : ""}

                                </p>

                            </div>

                            <button
                                type="button"
                                onClick={
                                    addQuestion
                                }
                                className="flex items-center gap-2 rounded-lg border border-blue-200 px-4 py-2 text-sm font-medium text-blue-600 transition hover:bg-blue-50"
                            >

                                <Plus size={16} />

                                Add Question

                            </button>

                        </div>

                        {/* ========================================= */}
                        {/* QUESTIONS */}
                        {/* ========================================= */}

                        <div className="mt-5 space-y-5">

                            {questions.map(
                                (
                                    question,
                                    index
                                ) => (

                                    <div
                                        key={
                                            index
                                        }
                                        className="rounded-2xl border border-slate-200 bg-slate-50 p-5"
                                    >

                                        {/* QUESTION HEADER */}

                                        <div className="mb-5 flex items-center justify-between">

                                            <h4 className="font-semibold text-slate-900">

                                                Question{" "}

                                                {index + 1}

                                            </h4>

                                            {questions.length >
                                                1 && (

                                                <button
                                                    type="button"
                                                    onClick={() =>
                                                        removeQuestion(
                                                            index
                                                        )
                                                    }
                                                    className="rounded-lg p-2 text-slate-400 transition hover:bg-red-50 hover:text-red-500"
                                                >

                                                    <Trash2
                                                        size={
                                                            17
                                                        }
                                                    />

                                                </button>

                                            )}

                                        </div>

                                        {/* QUESTION */}

                                        <textarea
                                            value={
                                                question.question
                                            }
                                            onChange={(
                                                event
                                            ) =>
                                                handleQuestionChange(
                                                    index,
                                                    "question",
                                                    event
                                                        .target
                                                        .value
                                                )
                                            }
                                            placeholder={`Enter Question ${
                                                index + 1
                                            }...`}
                                            rows="3"
                                            required
                                            className="w-full resize-none rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                                        />

                                        {/* OPTIONS */}

                                        <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-2">

                                            {[
                                                "option1",
                                                "option2",
                                                "option3",
                                                "option4",
                                            ].map(
                                                (
                                                    option,
                                                    optionIndex
                                                ) => (

                                                    <div
                                                        key={
                                                            option
                                                        }
                                                    >

                                                        <label className="mb-2 block text-xs font-medium text-slate-600">

                                                            Option{" "}

                                                            {
                                                                optionIndex +
                                                                1
                                                            }

                                                        </label>

                                                        <input
                                                            type="text"
                                                            value={
                                                                question[
                                                                    option
                                                                ]
                                                            }
                                                            onChange={(
                                                                event
                                                            ) =>
                                                                handleQuestionChange(
                                                                    index,
                                                                    option,
                                                                    event
                                                                        .target
                                                                        .value
                                                                )
                                                            }
                                                            placeholder={`Option ${
                                                                optionIndex +
                                                                1
                                                            }`}
                                                            required
                                                            className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                                                        />

                                                    </div>

                                                )
                                            )}

                                        </div>

                                        {/* CORRECT ANSWER */}

                                        <div className="mt-4">

                                            <label className="mb-2 block text-xs font-medium text-slate-600">
                                                Correct Answer
                                            </label>

                                            <select
                                                value={
                                                    question.correctAnswer
                                                }
                                                onChange={(
                                                    event
                                                ) =>
                                                    handleQuestionChange(
                                                        index,
                                                        "correctAnswer",
                                                        event
                                                            .target
                                                            .value
                                                    )
                                                }
                                                className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 md:w-1/2"
                                            >

                                                <option value={0}>
                                                    Option 1
                                                </option>

                                                <option value={1}>
                                                    Option 2
                                                </option>

                                                <option value={2}>
                                                    Option 3
                                                </option>

                                                <option value={3}>
                                                    Option 4
                                                </option>

                                            </select>

                                        </div>

                                    </div>

                                )
                            )}

                        </div>

                        {/* ========================================= */}
                        {/* FORM BUTTONS */}
                        {/* ========================================= */}

                        <div className="mt-7 flex justify-end gap-3">

                            <button
                                type="button"
                                onClick={
                                    resetForm
                                }
                                disabled={
                                    creating
                                }
                                className="rounded-xl border border-slate-300 px-5 py-3 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
                            >
                                Cancel
                            </button>

                            <button
                                type="submit"
                                disabled={
                                    creating
                                }
                                className="flex items-center gap-2 rounded-xl bg-blue-600 px-6 py-3 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
                            >

                                {creating && (

                                    <Loader2
                                        size={
                                            17
                                        }
                                        className="animate-spin"
                                    />

                                )}

                                {creating
                                    ? "Creating Quiz..."
                                    : "Create Quiz"}

                            </button>

                        </div>

                    </form>

                )}

                {/* ================================================= */}
                {/* EXISTING QUIZZES */}
                {/* ================================================= */}

                <section className="rounded-2xl border border-slate-200 bg-white p-6">

                    <div className="mb-6">

                        <h2 className="text-xl font-bold text-slate-900">
                            My Quizzes
                        </h2>

                        <p className="mt-1 text-sm text-slate-500">
                            Quizzes created by you.
                        </p>

                    </div>

                    {/* LOADING */}

                    {loading && (

                        <div className="py-10 text-center">

                            <Loader2
                                size={28}
                                className="mx-auto animate-spin text-blue-600"
                            />

                            <p className="mt-3 text-sm text-slate-500">
                                Loading quizzes...
                            </p>

                        </div>

                    )}

                    {/* EMPTY */}

                    {!loading &&
                        quizzes.length ===
                            0 && (

                            <div className="rounded-xl border border-dashed border-slate-300 py-12 text-center">

                                <ClipboardCheck
                                    size={40}
                                    className="mx-auto text-slate-300"
                                />

                                <h3 className="mt-4 font-semibold text-slate-900">
                                    No quizzes yet
                                </h3>

                                <p className="mt-2 text-sm text-slate-500">
                                    Create your first quiz
                                    for your students.
                                </p>

                            </div>

                        )}

                    {/* QUIZ LIST */}

                    {!loading &&
                        quizzes.length >
                            0 && (

                            <div className="space-y-4">

                                {quizzes.map(
                                    (quiz) => {

                                        const isSelected =
                                            selectedQuizId ===
                                            quiz.id;

                                        const quizSubmissions =
                                            isSelected
                                                ? submissions
                                                : [];

                                        const averageScore =
                                            quizSubmissions.length >
                                            0
                                                ? Math.round(
                                                      quizSubmissions.reduce(
                                                          (
                                                              total,
                                                              item
                                                          ) =>
                                                              total +
                                                              Number(
                                                                  item.score
                                                              ),
                                                          0
                                                      ) /
                                                          quizSubmissions.length
                                                  )
                                                : 0;

                                        return (

                                            <div
                                                key={
                                                    quiz.id
                                                }
                                                className="rounded-xl border border-slate-200 p-5 transition hover:shadow-sm"
                                            >

                                                {/* ================================= */}
                                                {/* QUIZ HEADER */}
                                                {/* ================================= */}

                                                <div className="flex items-start gap-4">

                                                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-blue-100 text-blue-600">

                                                        <ClipboardCheck
                                                            size={
                                                                21
                                                            }
                                                        />

                                                    </div>

                                                    <div className="min-w-0 flex-1">

                                                        <h3 className="font-semibold text-slate-900">
                                                            {
                                                                quiz.title
                                                            }
                                                        </h3>

                                                        <p className="mt-1 text-sm text-slate-500">
                                                            {getSubjectName(
                                                                quiz.subjectId
                                                            )}
                                                        </p>

                                                        <div className="mt-3 flex flex-wrap gap-2">

                                                            <span className="rounded-lg bg-slate-100 px-2.5 py-1 text-xs text-slate-500">

                                                                {
                                                                    quiz.duration
                                                                }{" "}

                                                                minutes

                                                            </span>

                                                            <span className="inline-flex items-center gap-1 rounded-lg bg-blue-50 px-2.5 py-1 text-xs text-blue-600">

                                                                <Clock3
                                                                    size={
                                                                        13
                                                                    }
                                                                />

                                                                {quiz.dueAt
                                                                    ? `Due ${formatDate(
                                                                          quiz.dueAt
                                                                      )}`
                                                                    : "No deadline"}

                                                            </span>

                                                            {quiz.createdAt && (

                                                                <span className="rounded-lg bg-slate-50 px-2.5 py-1 text-xs text-slate-400">

                                                                    Created{" "}

                                                                    {formatDate(
                                                                        quiz.createdAt
                                                                    )}

                                                                </span>

                                                            )}

                                                        </div>

                                                    </div>

                                                    <div className="flex shrink-0 items-center gap-2">

                                                        {/* VIEW SUBMISSIONS */}

                                                        <button
                                                            type="button"
                                                            onClick={() =>
                                                                loadSubmissions(
                                                                    quiz.id
                                                                )
                                                            }
                                                            className={`flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold transition ${
                                                                isSelected
                                                                    ? "bg-slate-900 text-white hover:bg-slate-800"
                                                                    : "bg-blue-600 text-white hover:bg-blue-700"
                                                            }`}
                                                        >

                                                            {isSelected ? (
                                                                <>

                                                                    <X
                                                                        size={
                                                                            16
                                                                        }
                                                                    />

                                                                    Close

                                                                </>
                                                            ) : (
                                                                <>

                                                                    <Eye
                                                                        size={
                                                                            16
                                                                        }
                                                                    />

                                                                    View Results

                                                                </>
                                                            )}

                                                        </button>


                                                        {/* DELETE QUIZ */}

                                                        <button
                                                            type="button"
                                                            onClick={() =>
                                                                handleDeleteQuiz(
                                                                    quiz
                                                                )
                                                            }
                                                            disabled={
                                                                deletingId ===
                                                                quiz.id
                                                            }
                                                            className="rounded-xl p-2.5 text-slate-400 transition hover:bg-red-50 hover:text-red-600 disabled:cursor-not-allowed disabled:opacity-50"
                                                            title="Delete quiz"
                                                        >

                                                            {deletingId ===
                                                            quiz.id ? (

                                                                <Loader2
                                                                    size={
                                                                        18
                                                                    }
                                                                    className="animate-spin"
                                                                />

                                                            ) : (

                                                                <Trash2
                                                                    size={
                                                                        18
                                                                    }
                                                                />

                                                            )}

                                                        </button>

                                                    </div>

                                                </div>

                                                {/* ================================= */}
                                                {/* SUBMISSIONS */}
                                                {/* ================================= */}

                                                {isSelected && (

                                                    <div className="mt-5 border-t border-slate-100 pt-5">

                                                        {/* LOADING */}

                                                        {loadingSubmissions && (

                                                            <div className="py-8 text-center">

                                                                <Loader2
                                                                    size={
                                                                        24
                                                                    }
                                                                    className="mx-auto animate-spin text-blue-600"
                                                                />

                                                                <p className="mt-3 text-sm text-slate-500">
                                                                    Loading student submissions...
                                                                </p>

                                                            </div>

                                                        )}

                                                        {/* ERROR */}

                                                        {!loadingSubmissions &&
                                                            submissionError && (

                                                                <div className="rounded-xl border border-red-200 bg-red-50 p-4">

                                                                    <p className="text-sm text-red-600">
                                                                        {
                                                                            submissionError
                                                                        }
                                                                    </p>

                                                                </div>

                                                            )}

                                                        {/* STATS */}

                                                        {!loadingSubmissions &&
                                                            !submissionError && (

                                                                <>

                                                                    <div className="mb-5 grid grid-cols-1 gap-3 sm:grid-cols-3">

                                                                        <div className="rounded-xl bg-slate-50 p-4">

                                                                            <div className="flex items-center gap-2">

                                                                                <Users
                                                                                    size={
                                                                                        18
                                                                                    }
                                                                                    className="text-blue-600"
                                                                                />

                                                                                <span className="text-xs font-medium text-slate-500">
                                                                                    Submissions
                                                                                </span>

                                                                            </div>

                                                                            <p className="mt-2 text-2xl font-bold text-slate-900">
                                                                                {
                                                                                    quizSubmissions.length
                                                                                }
                                                                            </p>

                                                                        </div>

                                                                        <div className="rounded-xl bg-slate-50 p-4">

                                                                            <div className="flex items-center gap-2">

                                                                                <Award
                                                                                    size={
                                                                                        18
                                                                                    }
                                                                                    className="text-purple-600"
                                                                                />

                                                                                <span className="text-xs font-medium text-slate-500">
                                                                                    Average Score
                                                                                </span>

                                                                            </div>

                                                                            <p className="mt-2 text-2xl font-bold text-slate-900">

                                                                                {
                                                                                    averageScore
                                                                                }%

                                                                            </p>

                                                                        </div>

                                                                        <div className="rounded-xl bg-slate-50 p-4">

                                                                            <div className="flex items-center gap-2">

                                                                                <CheckCircle
                                                                                    size={
                                                                                        18
                                                                                    }
                                                                                    className="text-green-600"
                                                                                />

                                                                                <span className="text-xs font-medium text-slate-500">
                                                                                    Deadline
                                                                                </span>

                                                                            </div>

                                                                            <p className="mt-2 text-sm font-semibold text-slate-900">

                                                                                {quiz.dueAt
                                                                                    ? formatDate(
                                                                                          quiz.dueAt
                                                                                      )
                                                                                    : "No deadline"}

                                                                            </p>

                                                                        </div>

                                                                    </div>

                                                                    {/* EMPTY SUBMISSIONS */}

                                                                    {quizSubmissions.length ===
                                                                        0 && (

                                                                        <div className="rounded-xl border border-dashed border-slate-300 py-10 text-center">

                                                                            <Users
                                                                                size={
                                                                                    32
                                                                                }
                                                                                className="mx-auto text-slate-300"
                                                                            />

                                                                            <h4 className="mt-3 font-semibold text-slate-900">
                                                                                No submissions yet
                                                                            </h4>

                                                                            <p className="mt-1 text-sm text-slate-500">
                                                                                Students have not submitted this quiz yet.
                                                                            </p>

                                                                        </div>

                                                                    )}

                                                                    {/* SUBMISSION TABLE */}

                                                                    {quizSubmissions.length >
                                                                        0 && (

                                                                        <div className="overflow-x-auto rounded-xl border border-slate-200">

                                                                            <table className="w-full min-w-[700px] text-left">

                                                                                <thead className="bg-slate-50">

                                                                                    <tr>

                                                                                        <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wide text-slate-500">
                                                                                            Student
                                                                                        </th>

                                                                                        <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wide text-slate-500">
                                                                                            Score
                                                                                        </th>

                                                                                        <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wide text-slate-500">
                                                                                            Correct
                                                                                        </th>

                                                                                        <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wide text-slate-500">
                                                                                            Submitted
                                                                                        </th>

                                                                                    </tr>

                                                                                </thead>

                                                                                <tbody className="divide-y divide-slate-100 bg-white">

                                                                                    {quizSubmissions.map(
                                                                                        (
                                                                                            submission
                                                                                        ) => (

                                                                                            <tr
                                                                                                key={
                                                                                                    submission.id
                                                                                                }
                                                                                            >

                                                                                                <td className="px-4 py-4">

                                                                                                    <div className="flex items-center gap-3">

                                                                                                        <div className="flex h-9 w-9 items-center justify-center rounded-full bg-blue-100 text-xs font-bold text-blue-600">

                                                                                                            {String(
                                                                                                                submission.studentId
                                                                                                            ).slice(
                                                                                                                0,
                                                                                                                2
                                                                                                            )}

                                                                                                        </div>

                                                                                                        <div>

                                                                                                            <p className="text-sm font-semibold text-slate-900">
                                                                                                                {submission.studentName ||
                                                                                                                    `Student ID #${submission.studentId}`}
                                                                                                            </p>

                                                                                                            <p className="text-xs text-slate-400">
                                                                                                                {submission.studentEmail ||
                                                                                                                    `Attempt #${submission.id}`}
                                                                                                            </p>

                                                                                                        </div>

                                                                                                    </div>

                                                                                                </td>

                                                                                                <td className="px-4 py-4">

                                                                                                    <span
                                                                                                        className={`inline-flex rounded-lg px-3 py-1.5 text-xs font-semibold ${getScoreClasses(
                                                                                                            submission.score
                                                                                                        )}`}
                                                                                                    >

                                                                                                        {
                                                                                                            submission.score
                                                                                                        }%

                                                                                                    </span>

                                                                                                </td>

                                                                                                <td className="px-4 py-4">

                                                                                                    <p className="text-sm font-medium text-slate-900">

                                                                                                        {
                                                                                                            submission.correctAnswers
                                                                                                        }

                                                                                                        {" / "}

                                                                                                        {
                                                                                                            submission.totalQuestions
                                                                                                        }

                                                                                                    </p>

                                                                                                </td>

                                                                                                <td className="px-4 py-4">

                                                                                                    <p className="text-sm text-slate-600">

                                                                                                        {formatDate(
                                                                                                            submission.submittedAt
                                                                                                        )}

                                                                                                    </p>

                                                                                                </td>

                                                                                            </tr>

                                                                                        )
                                                                                    )}

                                                                                </tbody>

                                                                            </table>

                                                                        </div>

                                                                    )}

                                                                </>

                                                            )}

                                                    </div>

                                                )}

                                            </div>
                                        );
                                    }
                                )}

                            </div>

                        )}

                </section>

            </div>

        </div>
    );
}

export default TeacherQuizzesPage;