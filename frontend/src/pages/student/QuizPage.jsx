import {
    ArrowLeft,
    CheckCircle,
    XCircle,
    Clock3,
    ClipboardCheck,
    RotateCcw,
    BarChart3,
} from "lucide-react";

import {
    Link,
    useParams,
} from "react-router-dom";

import {
    useEffect,
    useState,
} from "react";

import subjects from "../../data/subjects";
import quizzes from "../../data/quizzes";


function QuizPage() {

    const { subjectId } = useParams();


    /* ===================================================== */
    /* SUBJECT + QUIZ */
    /* ===================================================== */

    const subject = subjects.find(
        (item) => item.id === subjectId
    );

    const quiz = quizzes[subjectId];


    /* ===================================================== */
    /* QUIZ STATE */
    /* ===================================================== */

    const [quizStarted, setQuizStarted] =
        useState(false);

    const [currentQuestion, setCurrentQuestion] =
        useState(0);

    const [selectedAnswer, setSelectedAnswer] =
        useState(null);

    const [answers, setAnswers] =
        useState({});

    const [showAnswer, setShowAnswer] =
        useState(false);

    const [showResult, setShowResult] =
        useState(false);


    /* ===================================================== */
    /* TIMER */
    /* ===================================================== */

    /*
     * Temporary Day 10 timer.
     * Later this value will come from teacher/backend.
     */
    const quizDurationMinutes = 5;


    const [timeLeft, setTimeLeft] =
        useState(quizDurationMinutes * 60);


    /* ===================================================== */
    /* QUIZ DATA */
    /* ===================================================== */

    const totalQuestions =
        quiz?.questions?.length || 0;

    const question =
        quiz?.questions?.[currentQuestion];


    const progress =
        totalQuestions
            ? ((currentQuestion + 1) / totalQuestions) * 100
            : 0;


    /* ===================================================== */
    /* TIMER */
    /* ===================================================== */

    useEffect(() => {

        if (!quizStarted || showResult) {
            return;
        }


        const timer = setInterval(() => {

            setTimeLeft((previousTime) => {

                if (previousTime <= 1) {

                    clearInterval(timer);

                    setQuizStarted(false);

                    setShowResult(true);

                    return 0;
                }


                return previousTime - 1;
            });

        }, 1000);


        return () => {
            clearInterval(timer);
        };

    }, [quizStarted, showResult]);


    /* ===================================================== */
    /* FORMAT TIMER */
    /* ===================================================== */

    const formatTime = (seconds) => {

        const minutes =
            Math.floor(seconds / 60);

        const remainingSeconds =
            seconds % 60;


        return `${String(minutes).padStart(2, "0")}:${String(
            remainingSeconds
        ).padStart(2, "0")}`;
    };


    /* ===================================================== */
    /* SUBJECT NOT FOUND */
    /* ===================================================== */

    if (!subject) {

        return (
            <div className="min-h-full bg-slate-50 px-6 pb-10 pt-20">

                <div className="mx-auto max-w-3xl rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">

                    <h1 className="text-2xl font-bold text-slate-900">
                        Subject Not Found
                    </h1>

                    <p className="mt-2 text-sm text-slate-500">
                        The subject you are trying to access does not exist.
                    </p>

                    <Link
                        to="/student/subjects"
                        className="mt-5 inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-blue-700"
                    >
                        <ArrowLeft size={16} />
                        Back to Subjects
                    </Link>

                </div>

            </div>
        );
    }


    /* ===================================================== */
    /* QUIZ NOT AVAILABLE */
    /* ===================================================== */

    if (!quiz) {

        return (
            <div className="min-h-full bg-slate-50 px-6 pb-10 pt-20">

                <div className="mx-auto max-w-3xl">

                    <Link
                        to="/student/subjects"
                        className="mb-6 inline-flex items-center gap-2 text-sm font-medium text-slate-500 hover:text-blue-600"
                    >
                        <ArrowLeft size={17} />
                        Back to Subjects
                    </Link>


                    <div className="rounded-2xl border border-slate-200 bg-white p-10 text-center shadow-sm">

                        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-green-100 text-green-600">
                            <ClipboardCheck size={26} />
                        </div>

                        <h2 className="mt-5 text-xl font-semibold text-slate-900">
                            Quiz Not Available
                        </h2>

                        <p className="mx-auto mt-2 max-w-md text-sm text-slate-500">
                            There is currently no quiz available for {subject.name}.
                        </p>

                    </div>

                </div>

            </div>
        );
    }


    /* ===================================================== */
    /* START QUIZ */
    /* ===================================================== */

    const handleStartQuiz = () => {

        setQuizStarted(true);

        setCurrentQuestion(0);

        setSelectedAnswer(null);

        setAnswers({});

        setShowAnswer(false);

        setShowResult(false);

        setTimeLeft(
            quizDurationMinutes * 60
        );
    };


    /* ===================================================== */
    /* CHECK ANSWER */
    /* ===================================================== */

    const handleCheckAnswer = () => {

        if (selectedAnswer === null) {
            return;
        }


        setAnswers(
            (previousAnswers) => ({
                ...previousAnswers,
                [question.id]: selectedAnswer,
            })
        );


        setShowAnswer(true);
    };


    /* ===================================================== */
    /* NEXT QUESTION */
    /* ===================================================== */

    const handleNextQuestion = () => {

        if (
            currentQuestion ===
            totalQuestions - 1
        ) {

            setQuizStarted(false);

            setShowResult(true);

            return;
        }


        setCurrentQuestion(
            (previousQuestion) =>
                previousQuestion + 1
        );


        setSelectedAnswer(null);

        setShowAnswer(false);
    };


    /* ===================================================== */
    /* RETRY QUIZ */
    /* ===================================================== */

    const handleRetry = () => {

        setQuizStarted(false);

        setCurrentQuestion(0);

        setSelectedAnswer(null);

        setAnswers({});

        setShowAnswer(false);

        setShowResult(false);

        setTimeLeft(
            quizDurationMinutes * 60
        );
    };


    /* ===================================================== */
    /* SCORE */
    /* ===================================================== */

    const calculateScore = () => {

        let score = 0;


        quiz.questions.forEach(
            (item) => {

                if (
                    answers[item.id] ===
                    item.correctAnswer
                ) {
                    score++;
                }

            }
        );


        return score;
    };


    /* ===================================================== */
    /* RESULT SCREEN */
    /* ===================================================== */

    if (showResult) {

        const score =
            calculateScore();


        const percentage =
            Math.round(
                (score / totalQuestions) * 100
            );


        let resultTitle = "Keep Practicing!";

        if (percentage >= 80) {
            resultTitle = "Excellent Work!";
        } else if (percentage >= 50) {
            resultTitle = "Good Effort!";
        }


        return (
            <div className="min-h-full bg-slate-50 px-6 pb-10 pt-20">

                <div className="mx-auto max-w-[680px]">


                    {/* Back */}
                    <Link
                        to="/student/subjects"
                        className="mb-6 inline-flex items-center gap-2 text-sm font-medium text-slate-500 hover:text-blue-600"
                    >
                        <ArrowLeft size={17} />
                        Back to Subjects
                    </Link>


                    {/* Result Card */}
                    <div className="rounded-2xl border border-slate-200 bg-white px-8 py-10 shadow-sm">

                        {/* Score Circle */}
                        <div className="flex justify-center">

                            <div
                                className="relative flex h-24 w-24 items-center justify-center rounded-full"
                                style={{
                                    background:
                                        `conic-gradient(#f59e0b ${percentage}%, #f1f5f9 ${percentage}%)`,
                                }}
                            >

                                <div className="flex h-[78px] w-[78px] items-center justify-center rounded-full bg-white">

                                    <span className="text-2xl font-bold text-slate-900">
                                        {percentage}%
                                    </span>

                                </div>

                            </div>

                        </div>


                        <div className="mt-7 text-center">

                            <h1 className="text-2xl font-bold text-slate-900">
                                {resultTitle}
                            </h1>


                            <p className="mt-2 text-sm text-slate-500">
                                You answered{" "}
                                <span className="font-semibold text-slate-900">
                                    {score}
                                </span>{" "}
                                out of{" "}
                                <span className="font-semibold text-slate-900">
                                    {totalQuestions}
                                </span>{" "}
                                questions correctly.
                            </p>

                        </div>


                        {/* Stats */}
                        <div className="mt-8 grid grid-cols-3 gap-4">

                            <div className="rounded-xl bg-green-50 px-3 py-5 text-center">

                                <p className="text-2xl font-bold text-green-600">
                                    {score}
                                </p>

                                <p className="mt-1 text-xs text-slate-500">
                                    Correct
                                </p>

                            </div>


                            <div className="rounded-xl bg-red-50 px-3 py-5 text-center">

                                <p className="text-2xl font-bold text-red-500">
                                    {totalQuestions - score}
                                </p>

                                <p className="mt-1 text-xs text-slate-500">
                                    Incorrect
                                </p>

                            </div>


                            <div className="rounded-xl bg-blue-50 px-3 py-5 text-center">

                                <p className="text-2xl font-bold text-blue-600">
                                    {percentage}%
                                </p>

                                <p className="mt-1 text-xs text-slate-500">
                                    Score
                                </p>

                            </div>

                        </div>


                        {/* Buttons */}
                        <div className="mt-8 grid grid-cols-2 gap-3">

                            <button
                                type="button"
                                onClick={handleRetry}
                                className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 px-4 py-3 text-sm font-medium text-slate-700 hover:bg-slate-50"
                            >
                                <RotateCcw size={16} />
                                Retry Quiz
                            </button>


                            <Link
                                to="/student/progress"
                                className="inline-flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 py-3 text-sm font-medium text-white hover:bg-blue-700"
                            >
                                <BarChart3 size={16} />
                                View Progress
                            </Link>

                        </div>

                    </div>


                    {/* Answer Review */}
                    <div className="mt-6">

                        <h2 className="mb-4 text-lg font-bold text-slate-900">
                            Answer Review
                        </h2>


                        <div className="space-y-3">

                            {quiz.questions.map(
                                (item, index) => {

                                    const studentAnswer =
                                        answers[item.id];


                                    const isCorrect =
                                        studentAnswer ===
                                        item.correctAnswer;


                                    return (
                                        <div
                                            key={item.id}
                                            className={`rounded-xl border bg-white p-4 ${
                                                isCorrect
                                                    ? "border-green-400"
                                                    : "border-red-400"
                                            }`}
                                        >

                                            <div className="flex items-start gap-3">

                                                {isCorrect ? (
                                                    <CheckCircle
                                                        size={19}
                                                        className="mt-0.5 shrink-0 text-green-500"
                                                    />
                                                ) : (
                                                    <XCircle
                                                        size={19}
                                                        className="mt-0.5 shrink-0 text-red-500"
                                                    />
                                                )}


                                                <div className="min-w-0">

                                                    <p className="text-sm font-medium leading-6 text-slate-900">
                                                        Q{index + 1}.{" "}
                                                        {item.question}
                                                    </p>


                                                    <p className="mt-2 text-xs text-green-500">
                                                        ✓{" "}
                                                        {item.options[
                                                            item.correctAnswer
                                                        ]}
                                                    </p>


                                                    {!isCorrect && (
                                                        <p className="mt-1 text-xs text-red-500">
                                                            ✕ Your answer:{" "}
                                                            {studentAnswer !==
                                                            undefined
                                                                ? item.options[
                                                                    studentAnswer
                                                                ]
                                                                : "Not Answered"}
                                                        </p>
                                                    )}

                                                </div>

                                            </div>

                                        </div>
                                    );
                                }
                            )}

                        </div>

                    </div>

                </div>

            </div>
        );
    }


    /* ===================================================== */
    /* START SCREEN */
    /* ===================================================== */

    if (!quizStarted) {

        return (
            <div className="min-h-full bg-slate-50 px-6 pb-10 pt-20">

                <div className="mx-auto max-w-[680px]">


                    <Link
                        to="/student/subjects"
                        className="mb-6 inline-flex items-center gap-2 text-sm font-medium text-slate-500 hover:text-blue-600"
                    >
                        <ArrowLeft size={17} />
                        Back to Subjects
                    </Link>


                    {/* Start card */}
                    <div className="rounded-2xl border border-slate-200 bg-white px-8 py-10 text-center shadow-sm">

                        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-green-100 text-green-600">

                            <ClipboardCheck
                                size={30}
                            />

                        </div>


                        <p className="mt-6 text-sm text-slate-500">
                            Practice Quiz
                        </p>


                        <h1 className="mt-2 text-3xl font-bold text-slate-900">
                            {subject.name} Quiz
                        </h1>


                        <p className="mx-auto mt-3 max-w-md text-sm leading-6 text-slate-500">
                            Test your knowledge of {subject.name}.
                        </p>


                        <div className="mx-auto mt-8 flex max-w-md justify-center gap-4">

                            <div className="flex-1 rounded-xl bg-slate-50 px-4 py-4">

                                <p className="text-xl font-bold text-slate-900">
                                    {totalQuestions}
                                </p>

                                <p className="mt-1 text-xs text-slate-500">
                                    Questions
                                </p>

                            </div>


                            <div className="flex-1 rounded-xl bg-slate-50 px-4 py-4">

                                <p className="text-xl font-bold text-slate-900">
                                    5 min
                                </p>

                                <p className="mt-1 text-xs text-slate-500">
                                    Time Limit
                                </p>

                            </div>

                        </div>


                        <button
                            type="button"
                            onClick={handleStartQuiz}
                            className="mt-8 w-full rounded-xl bg-blue-600 px-5 py-3.5 text-sm font-semibold text-white hover:bg-blue-700"
                        >
                            Start Quiz
                        </button>

                    </div>

                </div>

            </div>
        );
    }


    /* ===================================================== */
    /* ACTIVE QUIZ — FIGMA STYLE */
    /* ===================================================== */

    return (
        <div className="min-h-full bg-slate-50 px-6 pb-10 pt-8">

            <div className="mx-auto w-full max-w-[675px]">


                {/* ============================================= */}
                {/* QUIZ TITLE */}
                {/* ============================================= */}

                <div className="flex items-start justify-between">

                    <div>

                        <h1 className="text-2xl font-bold text-slate-900">
                            {subject.name ===
                            "Database Management System"
                                ? "DBMS Quiz"
                                : `${subject.name} Quiz`}
                        </h1>


                        <p className="mt-1 text-sm text-slate-500">
                            Test your knowledge of{" "}
                            {subject.name}
                        </p>

                    </div>


                    {/* Question Counter */}
                    <div className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700">

                        {currentQuestion + 1} /{" "}
                        {totalQuestions}

                    </div>

                </div>


                {/* ============================================= */}
                {/* TIMER */}
                {/* ============================================= */}

                <div className="mt-4 flex items-center justify-between">

                    <div className="h-2 flex-1 overflow-hidden rounded-full bg-slate-100">

                        <div
                            className="h-full rounded-full bg-blue-600 transition-all duration-300"
                            style={{
                                width: `${progress}%`,
                            }}
                        />

                    </div>


                    <div
                        className={`ml-4 flex items-center gap-1.5 text-sm font-medium ${
                            timeLeft <= 60
                                ? "text-red-500"
                                : "text-slate-500"
                        }`}
                    >

                        <Clock3 size={16} />

                        {formatTime(timeLeft)}

                    </div>

                </div>


                {/* ============================================= */}
                {/* QUESTION CARD */}
                {/* ============================================= */}

                <div className="mt-6 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">

                    {/* Question badge */}
                    <span className="inline-flex rounded-lg bg-blue-100 px-3 py-1.5 text-xs font-medium text-blue-600">
                        Question {currentQuestion + 1}
                    </span>


                    {/* Question */}
                    <h2 className="mt-5 text-lg font-semibold leading-7 text-slate-900">
                        {question.question}
                    </h2>


                    {/* ========================================= */}
                    {/* OPTIONS */}
                    {/* ========================================= */}

                    <div className="mt-6 space-y-3">

                        {question.options.map(
                            (option, index) => {

                                const isSelected =
                                    selectedAnswer ===
                                    index;

                                const isCorrect =
                                    showAnswer &&
                                    index ===
                                    question.correctAnswer;

                                const isWrong =
                                    showAnswer &&
                                    isSelected &&
                                    index !==
                                    question.correctAnswer;


                                let optionClasses =
                                    "border-slate-200 bg-white text-slate-900";


                                if (
                                    !showAnswer &&
                                    isSelected
                                ) {

                                    optionClasses =
                                        "border-blue-400 bg-blue-50 text-blue-700";

                                }


                                if (isCorrect) {

                                    optionClasses =
                                        "border-green-400 bg-green-50 text-green-600";

                                }


                                if (isWrong) {

                                    optionClasses =
                                        "border-red-400 bg-red-50 text-red-500";

                                }


                                return (
                                    <button
                                        key={option}
                                        type="button"
                                        disabled={
                                            showAnswer
                                        }
                                        onClick={() =>
                                            setSelectedAnswer(
                                                index
                                            )
                                        }
                                        className={`flex w-full items-center gap-3 rounded-xl border px-4 py-3.5 text-left transition ${optionClasses}`}
                                    >

                                        {/* Letter */}
                                        <span
                                            className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-xs font-medium ${
                                                isCorrect
                                                    ? "bg-white text-green-600"
                                                    : isWrong
                                                    ? "bg-white text-red-500"
                                                    : "bg-slate-100 text-slate-500"
                                            }`}
                                        >
                                            {String.fromCharCode(
                                                65 + index
                                            )}
                                        </span>


                                        {/* Text */}
                                        <span className="flex-1 text-sm font-medium">
                                            {option}
                                        </span>


                                        {/* Check */}
                                        {isCorrect && (
                                            <CheckCircle
                                                size={19}
                                                className="text-green-500"
                                            />
                                        )}


                                        {/* Wrong */}
                                        {isWrong && (
                                            <XCircle
                                                size={19}
                                                className="text-red-500"
                                            />
                                        )}

                                    </button>
                                );
                            }
                        )}

                    </div>

                </div>


                {/* ============================================= */}
                {/* ACTION BUTTON */}
                {/* ============================================= */}

                <div className="mt-4">

                    {!showAnswer ? (

                        <button
                            type="button"
                            onClick={
                                handleCheckAnswer
                            }
                            disabled={
                                selectedAnswer ===
                                null
                            }
                            className="w-full rounded-xl bg-slate-400 px-5 py-3.5 text-sm font-semibold text-white transition disabled:cursor-not-allowed disabled:opacity-100 enabled:bg-blue-600 enabled:hover:bg-blue-700"
                        >
                            Check Answer
                        </button>

                    ) : (

                        <button
                            type="button"
                            onClick={
                                handleNextQuestion
                            }
                            className="flex w-full items-center justify-center gap-2 rounded-xl bg-blue-600 px-5 py-3.5 text-sm font-semibold text-white hover:bg-blue-700"
                        >

                            {currentQuestion ===
                            totalQuestions - 1
                                ? "Submit Quiz"
                                : "Next Question"}

                            <span className="text-base">
                                →
                            </span>

                        </button>

                    )}

                </div>

            </div>

        </div>
    );
}


export default QuizPage;