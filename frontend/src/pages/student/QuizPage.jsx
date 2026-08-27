import {
  ArrowLeft,
  CheckCircle,
  XCircle,
  Clock3,
  ClipboardCheck,
  RotateCcw,
  BarChart3,
  Loader2,
  CalendarClock,
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

function QuizPage() {
  const { subjectId } = useParams();

  const frontendSubject = subjects.find(
    (item) =>
      String(item.id).toLowerCase() ===
        String(subjectId).toLowerCase() ||
      String(item.code || "").toLowerCase() ===
        String(subjectId).toLowerCase()
  );

  const [backendSubject, setBackendSubject] = useState(null);

  const [quiz, setQuiz] = useState(null);
  const [questions, setQuestions] = useState([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [alreadySubmitted, setAlreadySubmitted] = useState(false);
  const [submittedResult, setSubmittedResult] = useState(null);
  const [quizExpired, setQuizExpired] = useState(false);

  const [quizStarted, setQuizStarted] = useState(false);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [answers, setAnswers] = useState({});
  const [showAnswer, setShowAnswer] = useState(false);
  const [showResult, setShowResult] = useState(false);

  const [result, setResult] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [timeLeft, setTimeLeft] = useState(0);

  // =====================================================
  // FORMAT TIME
  // =====================================================

  const formatTime = (seconds) => {
    const safeSeconds = Math.max(
      0,
      Number(seconds) || 0
    );

    const minutes =
      Math.floor(safeSeconds / 60);

    const remainingSeconds =
      safeSeconds % 60;

    return `${String(minutes).padStart(
      2,
      "0"
    )}:${String(remainingSeconds).padStart(
      2,
      "0"
    )}`;
  };

  // =====================================================
  // FORMAT DATE
  // =====================================================

  const formatDeadline = (dateValue) => {
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
  };

  // =====================================================
  // LOAD QUIZ
  // =====================================================

  useEffect(() => {
    let cancelled = false;

    const loadQuiz = async () => {
      try {
        setLoading(true);
        setError("");

        setQuiz(null);
        setQuestions([]);

        setAlreadySubmitted(false);
        setSubmittedResult(null);
        setQuizExpired(false);

        setQuizStarted(false);
        setCurrentQuestion(0);
        setSelectedAnswer(null);
        setAnswers({});
        setShowAnswer(false);
        setShowResult(false);

        setResult(null);
        setSubmitting(false);
        setTimeLeft(0);

        // =================================================
        // 1. LOAD BACKEND SUBJECTS
        // =================================================

        const subjectResponse =
          await fetch(
            "http://localhost:8080/api/subjects"
          );

        if (!subjectResponse.ok) {
          throw new Error(
            "Failed to load subjects."
          );
        }

        const backendSubjects =
          await subjectResponse.json();

        if (
          !Array.isArray(
            backendSubjects
          )
        ) {
          throw new Error(
            "Invalid subjects response."
          );
        }

        // =================================================
        // 2. FIND BACKEND SUBJECT
        // =================================================

        const routeValue =
          String(subjectId)
            .trim()
            .toLowerCase();

        const frontendName =
          String(
            frontendSubject?.name || ""
          )
            .trim()
            .toLowerCase();

        const matchedSubject =
          backendSubjects.find(
            (item) => {

              const id =
                String(
                  item.id || ""
                )
                  .trim()
                  .toLowerCase();

              const code =
                String(
                  item.code || ""
                )
                  .trim()
                  .toLowerCase();

              const name =
                String(
                  item.name || ""
                )
                  .trim()
                  .toLowerCase();

              return (
                id === routeValue ||
                code === routeValue ||
                name === routeValue ||
                name === frontendName ||
                code ===
                  frontendName
              );
            }
          );

        if (!matchedSubject) {
          throw new Error(
            `No backend subject found for "${subjectId}".`
          );
        }

        if (cancelled) {
          return;
        }

        setBackendSubject(
          matchedSubject
        );

        // =================================================
        // 3. LOAD QUIZZES FOR SUBJECT
        // =================================================

        const quizResponse =
          await fetch(
            `http://localhost:8080/api/quizzes/subject/${matchedSubject.id}`
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

        if (
          quizData.length === 0
        ) {
          return;
        }

        // =================================================
        // 4. NEWEST QUIZ FIRST
        // =================================================

        const sortedQuizzes =
          [...quizData].sort(
            (a, b) =>
              Number(b.id) -
              Number(a.id)
          );

        // =================================================
        // 5. FIND FIRST QUIZ WITH QUESTIONS
        // =================================================

        let foundQuiz = null;
        let foundQuestions = [];

        for (
          const candidateQuiz
          of sortedQuizzes
        ) {
          try {
            const questionResponse =
              await fetch(
                `http://localhost:8080/api/quizzes/${candidateQuiz.id}/questions`
              );

            if (
              !questionResponse.ok
            ) {
              console.warn(
                `Questions request failed for quiz ${candidateQuiz.id}`
              );

              continue;
            }

            const questionData =
              await questionResponse.json();

            console.log(
              `Quiz ${candidateQuiz.id} questions:`,
              questionData
            );

            if (
              Array.isArray(
                questionData
              ) &&
              questionData.length > 0
            ) {
              foundQuiz =
                candidateQuiz;

              foundQuestions =
                questionData;

              break;
            }
          } catch (questionError) {
            console.error(
              `Failed to load questions for quiz ${candidateQuiz.id}:`,
              questionError
            );
          }
        }

        // =================================================
        // 6. NO QUIZ FOUND
        // =================================================

        if (!foundQuiz) {
          if (!cancelled) {
            setQuiz(null);
            setQuestions([]);
          }

          return;
        }

        if (cancelled) {
          return;
        }

        setQuiz(foundQuiz);

        // =================================================
        // 7. STUDENT ID
        // =================================================

        const getStudentId = () => {
          const storedId =
            localStorage.getItem("userId");

          if (storedId) {
            return Number(storedId);
          }

          try {
            const storedUser =
              JSON.parse(
                localStorage.getItem("user") || "null"
              );

            return storedUser?.id
              ? Number(storedUser.id)
              : null;
          } catch {
            return null;
          }
        };

        const studentId =
          getStudentId();

        if (!studentId) {
          throw new Error(
            "Student account not found. Please log in again."
          );
        }

        // =================================================
        // 8. CHECK SUBMISSION
        // =================================================

        const submissionResponse =
          await fetch(
            `http://localhost:8080/api/quiz-attempts/quiz/${foundQuiz.id}/student/${studentId}`
          );

        if (
          !submissionResponse.ok
        ) {
          throw new Error(
            "Unable to check quiz submission status."
          );
        }

        const submissionData =
          await submissionResponse.json();

        if (cancelled) {
          return;
        }

        // =================================================
        // 9. ALREADY SUBMITTED
        // =================================================

        if (
          submissionData.submitted ===
          true
        ) {
          setAlreadySubmitted(
            true
          );

          const previousResult =
            {
              id:
                submissionData.attemptId,

              quizId:
                foundQuiz.id,

              studentId,

              score:
                submissionData.score,

              totalQuestions:
                submissionData.totalQuestions,

              correctAnswers:
                submissionData.correctAnswers,

              submittedAt:
                submissionData.submittedAt,
            };

          setSubmittedResult(
            previousResult
          );

          setResult(
            previousResult
          );

          setShowResult(
            true
          );

          return;
        }

        // =================================================
        // 10. CHECK DEADLINE
        // =================================================

        if (
          foundQuiz.dueAt
        ) {
          const dueDate =
            new Date(
              foundQuiz.dueAt
            );

          if (
            !Number.isNaN(
              dueDate.getTime()
            ) &&
            new Date() >=
              dueDate
          ) {
            setQuizExpired(
              true
            );

            return;
          }
        }

        // =================================================
        // 11. FORMAT QUESTIONS
        // =================================================

        const formattedQuestions =
          foundQuestions.map(
            (question) => ({
              id:
                question.id,

              question:
                question.question,

              options: [
                question.option1,
                question.option2,
                question.option3,
                question.option4,
              ],

              correctAnswer:
                question.correctAnswer,
            })
          );

        setQuestions(
          formattedQuestions
        );

        // =================================================
        // 12. START TIMER VALUE
        // =================================================

        setTimeLeft(
          Number(
            foundQuiz.duration
          ) > 0
            ? Number(
                foundQuiz.duration
              ) * 60
            : 5 * 60
        );

      } catch (loadError) {
        if (!cancelled) {
          console.error(
            "Quiz loading error:",
            loadError
          );

          setError(
            loadError.message ||
              "Unable to load quiz."
          );
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    loadQuiz();

    return () => {
      cancelled = true;
    };

  }, [subjectId]);

  // =====================================================
  // START QUIZ
  // =====================================================

  const handleStartQuiz = () => {
    if (
      !quiz ||
      alreadySubmitted ||
      questions.length === 0
    ) {
      return;
    }

    if (
      quiz.dueAt &&
      new Date() >=
        new Date(
          quiz.dueAt
        )
    ) {
      setQuizExpired(true);
      return;
    }

    setQuizStarted(true);
    setCurrentQuestion(0);
    setSelectedAnswer(null);
    setAnswers({});
    setShowAnswer(false);
    setShowResult(false);
    setSubmitting(false);

    setTimeLeft(
      Number(quiz.duration) > 0
        ? Number(quiz.duration) * 60
        : 5 * 60
    );
  };

  // =====================================================
  // SELECT ANSWER
  // =====================================================

  const handleSelectAnswer = (
    answerIndex
  ) => {
    if (
      showAnswer ||
      submitting
    ) {
      return;
    }

    setSelectedAnswer(
      answerIndex
    );
  };

  // =====================================================
  // CHECK ANSWER
  // =====================================================

  const handleCheckAnswer =
    () => {

      if (
        selectedAnswer === null ||
        selectedAnswer ===
          undefined
      ) {
        return;
      }

      const question =
        questions[
          currentQuestion
        ];

      if (!question) {
        return;
      }

      setAnswers(
        (previous) => ({
          ...previous,
          [question.id]:
            selectedAnswer,
        })
      );

      setShowAnswer(true);
    };

  // =====================================================
  // SUBMIT QUIZ
  // =====================================================

  const handleSubmitQuiz =
    async (
      finalAnswers = answers
    ) => {

      if (
        submitting ||
        alreadySubmitted ||
        !quiz
      ) {
        return;
      }

      try {
        setSubmitting(true);
        setError("");

        if (
          quiz.dueAt &&
          new Date() >=
            new Date(
              quiz.dueAt
            )
        ) {
          setQuizExpired(true);
          setQuizStarted(false);
          return;
        }

        const getStudentId = () => {
          const storedId =
            localStorage.getItem("userId");

          if (storedId) {
            return Number(storedId);
          }

          try {
            const storedUser =
              JSON.parse(
                localStorage.getItem("user") || "null"
              );

            return storedUser?.id
              ? Number(storedUser.id)
              : null;
          } catch {
            return null;
          }
        };

        const studentId =
          getStudentId();

        if (!studentId) {
          throw new Error(
            "Student account not found. Please log in again."
          );
        }

        const response =
          await fetch(
            `http://localhost:8080/api/quiz-attempts/quiz/${quiz.id}/submit`,
            {
              method: "POST",

              headers: {
                "Content-Type":
                  "application/json",
              },

              body:
                JSON.stringify({
                  studentId,
                  answers:
                    finalAnswers,
                }),
            }
          );

        if (!response.ok) {
          let message =
            "Unable to submit quiz.";

          try {
            const errorData =
              await response.json();

            if (
              errorData?.message
            ) {
              message =
                errorData.message;
            } else if (
              errorData?.error
            ) {
              message =
                errorData.error;
            }
          } catch {
            // Ignore parsing error.
          }

          throw new Error(
            message
          );
        }

        const submittedAttempt =
          await response.json();

        const finalResult =
          {
            id:
              submittedAttempt.id,

            quizId:
              submittedAttempt.quizId,

            studentId:
              submittedAttempt.studentId,

            score:
              submittedAttempt.score,

            totalQuestions:
              submittedAttempt.totalQuestions,

            correctAnswers:
              submittedAttempt.correctAnswers,

            submittedAt:
              submittedAttempt.submittedAt,
          };

        setResult(
          finalResult
        );

        setSubmittedResult(
          finalResult
        );

        setAlreadySubmitted(
          true
        );

        setQuizStarted(
          false
        );

        setShowAnswer(
          false
        );

        setSelectedAnswer(
          null
        );

        setShowResult(
          true
        );

      } catch (submitError) {
        console.error(
          "Quiz submission error:",
          submitError
        );

        setError(
          submitError.message ||
            "Unable to submit quiz."
        );

      } finally {
        setSubmitting(false);
      }
    };

  // =====================================================
  // NEXT QUESTION
  // =====================================================

  const handleNextQuestion =
    () => {

      if (submitting) {
        return;
      }

      const question =
        questions[
          currentQuestion
        ];

      if (!question) {
        return;
      }

      const updatedAnswers = {
        ...answers,
      };

      if (
        selectedAnswer !== null &&
        selectedAnswer !==
          undefined
      ) {
        updatedAnswers[
          question.id
        ] = selectedAnswer;
      }

      setAnswers(
        updatedAnswers
      );

      if (
        currentQuestion ===
        questions.length - 1
      ) {
        handleSubmitQuiz(
          updatedAnswers
        );

        return;
      }

      setCurrentQuestion(
        (previous) =>
          previous + 1
      );

      setSelectedAnswer(
        null
      );

      setShowAnswer(false);
    };

  // =====================================================
  // DEADLINE WATCHER
  // =====================================================

  useEffect(() => {
    if (
      !quiz ||
      alreadySubmitted ||
      quizStarted ||
      quizExpired ||
      !quiz.dueAt
    ) {
      return;
    }

    const interval =
      setInterval(() => {
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
          setQuizExpired(
            true
          );
        }
      }, 1000);

    return () => {
      clearInterval(
        interval
      );
    };
  }, [
    quiz,
    alreadySubmitted,
    quizStarted,
    quizExpired,
  ]);

  // =====================================================
  // QUIZ TIMER
  // =====================================================

  useEffect(() => {
    if (
      !quizStarted ||
      showResult ||
      alreadySubmitted
    ) {
      return;
    }

    const timer =
      setInterval(() => {

        if (quiz?.dueAt) {
          const dueDate =
            new Date(
              quiz.dueAt
            );

          if (
            !Number.isNaN(
              dueDate.getTime()
            ) &&
            new Date() >=
              dueDate
          ) {
            clearInterval(
              timer
            );

            handleSubmitQuiz(
              answers
            );

            return;
          }
        }

        setTimeLeft(
          (previousTime) => {

            if (
              previousTime <=
              1
            ) {
              clearInterval(
                timer
              );

              handleSubmitQuiz(
                answers
              );

              return 0;
            }

            return (
              previousTime - 1
            );
          }
        );

      }, 1000);

    return () => {
      clearInterval(timer);
    };
  }, [
    quizStarted,
    showResult,
    alreadySubmitted,
    quiz,
    answers,
  ]);

  // =====================================================
  // SUBJECT NOT FOUND
  // =====================================================

  if (
    !frontendSubject &&
    !backendSubject &&
    !loading &&
    !error
  ) {
    return (
      <div className="min-h-full bg-slate-50 px-6 pb-10 pt-20">
        <div className="mx-auto max-w-3xl rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">

          <h1 className="text-2xl font-bold text-slate-900">
            Subject Not Found
          </h1>

          <p className="mt-2 text-sm text-slate-500">
            The requested subject could not be found.
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

  // =====================================================
  // LOADING
  // =====================================================

  if (loading) {
    return (
      <div className="min-h-full bg-slate-50 px-6 pb-10 pt-20">
        <div className="mx-auto max-w-3xl rounded-2xl border border-slate-200 bg-white p-12 text-center shadow-sm">

          <Loader2
            size={30}
            className="mx-auto animate-spin text-blue-600"
          />

          <p className="mt-4 text-sm text-slate-500">
            Loading quiz...
          </p>

        </div>
      </div>
    );
  }

  // =====================================================
  // ERROR
  // =====================================================

  if (error) {
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

          <div className="rounded-2xl border border-red-200 bg-red-50 p-10 text-center">

            <h2 className="text-xl font-semibold text-red-700">
              Quiz Error
            </h2>

            <p className="mt-2 text-sm text-red-600">
              {error}
            </p>

          </div>

        </div>
      </div>
    );
  }

  // =====================================================
  // QUIZ EXPIRED
  // =====================================================

  if (
    quiz &&
    quizExpired &&
    !alreadySubmitted &&
    !quizStarted
  ) {
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

          <div className="rounded-2xl border border-red-200 bg-white p-10 text-center shadow-sm">

            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-red-100 text-red-500">
              <CalendarClock size={30} />
            </div>

            <p className="mt-6 text-sm font-medium text-slate-500">
              Submission Window Closed
            </p>

            <h1 className="mt-2 text-2xl font-bold text-slate-900">
              Quiz Expired
            </h1>

            <p className="mx-auto mt-3 max-w-md text-sm leading-6 text-slate-500">
              The submission deadline for{" "}
              <span className="font-medium text-slate-700">
                {quiz.title}
              </span>{" "}
              has passed.
            </p>

            <div className="mx-auto mt-6 inline-flex items-center gap-2 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-600">
              <Clock3 size={16} />
              Deadline:{" "}
              {formatDeadline(
                quiz.dueAt
              )}
            </div>

          </div>
        </div>
      </div>
    );
  }

  // =====================================================
  // NO QUIZ
  // =====================================================

  if (
    !quiz ||
    questions.length === 0
  ) {
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

            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-slate-100 text-slate-500">
              <ClipboardCheck size={26} />
            </div>

            <h2 className="mt-5 text-xl font-semibold text-slate-900">
              Quiz Not Available
            </h2>

            <p className="mx-auto mt-2 max-w-md text-sm text-slate-500">
              There is currently no attemptable quiz available for{" "}
              {backendSubject?.name ||
                frontendSubject?.name ||
                subjectId}.
            </p>

          </div>
        </div>
      </div>
    );
  }

  // =====================================================
  // RESULT
  // =====================================================

  if (
    showResult &&
    result
  ) {
    const score =
      Number(
        result.correctAnswers
      ) || 0;

    const totalQuestions =
      Number(
        result.totalQuestions
      ) || 0;

    const percentage =
      Number(
        result.score
      ) || 0;

    let resultTitle =
      "Keep Practicing!";

    if (
      percentage >= 80
    ) {
      resultTitle =
        "Excellent Work!";
    } else if (
      percentage >= 50
    ) {
      resultTitle =
        "Good Effort!";
    }

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

          <div className="rounded-2xl border border-slate-200 bg-white px-8 py-10 shadow-sm">

            {alreadySubmitted && (
              <div className="mb-6 rounded-xl border border-green-200 bg-green-50 px-4 py-3 text-center">

                <p className="text-sm font-semibold text-green-700">
                  Quiz Already Submitted
                </p>

                <p className="mt-1 text-xs text-green-600">
                  This quiz cannot be attempted again.
                </p>

              </div>
            )}

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
                {alreadySubmitted
                  ? "Submission Complete"
                  : resultTitle}
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

              {result.submittedAt && (
                <p className="mt-2 text-xs text-slate-400">
                  Submitted{" "}
                  {formatDeadline(
                    result.submittedAt
                  )}
                </p>
              )}

            </div>

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
                  {Math.max(
                    0,
                    totalQuestions -
                      score
                  )}
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

            <div
              className={`mt-8 ${
                alreadySubmitted
                  ? ""
                  : "grid grid-cols-2 gap-3"
              }`}
            >

              {!alreadySubmitted && (
                <button
                  type="button"
                  onClick={() => {
                    setQuizStarted(
                      false
                    );

                    setCurrentQuestion(
                      0
                    );

                    setSelectedAnswer(
                      null
                    );

                    setAnswers({});

                    setShowAnswer(
                      false
                    );

                    setShowResult(
                      false
                    );

                    setResult(
                      null
                    );

                    setError("");

                    setSubmitting(
                      false
                    );

                    setTimeLeft(
                      Number(
                        quiz.duration
                      ) > 0
                        ? Number(
                            quiz.duration
                          ) * 60
                        : 5 * 60
                    );
                  }}
                  className="inline-flex w-full items-center justify-center gap-2 rounded-xl border border-slate-200 px-4 py-3 text-sm font-medium text-slate-700 hover:bg-slate-50"
                >
                  <RotateCcw size={16} />
                  Retry Quiz
                </button>
              )}

              <Link
                to="/student/progress"
                className={`inline-flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 py-3 text-sm font-medium text-white hover:bg-blue-700 ${
                  alreadySubmitted
                    ? "w-full"
                    : ""
                }`}
              >
                <BarChart3 size={16} />
                View Progress
              </Link>

            </div>

          </div>

        </div>
      </div>
    );
  }

  // =====================================================
  // START SCREEN
  // =====================================================

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

          <div className="rounded-2xl border border-slate-200 bg-white px-8 py-10 text-center shadow-sm">

            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-green-100 text-green-600">
              <ClipboardCheck size={30} />
            </div>

            <p className="mt-6 text-sm text-slate-500">
              Practice Quiz
            </p>

            <h1 className="mt-2 text-3xl font-bold text-slate-900">
              {quiz.title}
            </h1>

            <p className="mx-auto mt-3 max-w-md text-sm leading-6 text-slate-500">
              Test your knowledge of{" "}
              {backendSubject?.name ||
                frontendSubject?.name}.
            </p>

            <div className="mx-auto mt-8 flex max-w-md justify-center gap-4">

              <div className="flex-1 rounded-xl bg-slate-50 px-4 py-4">

                <p className="text-xl font-bold text-slate-900">
                  {questions.length}
                </p>

                <p className="mt-1 text-xs text-slate-500">
                  Questions
                </p>

              </div>

              <div className="flex-1 rounded-xl bg-slate-50 px-4 py-4">

                <p className="text-xl font-bold text-slate-900">
                  {quiz.duration || 5} min
                </p>

                <p className="mt-1 text-xs text-slate-500">
                  Time Limit
                </p>

              </div>

            </div>

            <div className="mx-auto mt-5 inline-flex items-center gap-2 rounded-xl bg-blue-50 px-4 py-3 text-sm text-blue-600">
              <CalendarClock size={16} />
              Submit before{" "}
              {formatDeadline(
                quiz.dueAt
              )}
            </div>

            <button
              type="button"
              onClick={
                handleStartQuiz
              }
              className="mt-8 w-full rounded-xl bg-blue-600 px-5 py-3.5 text-sm font-semibold text-white hover:bg-blue-700"
            >
              Start Quiz
            </button>

          </div>

        </div>
      </div>
    );
  }

  // =====================================================
  // ACTIVE QUIZ
  // =====================================================

  const question =
    questions[
      currentQuestion
    ];

  const progress =
    questions.length
      ? ((currentQuestion + 1) /
          questions.length) *
        100
      : 0;

  if (!question) {
    return (
      <div className="min-h-full bg-slate-50 px-6 pb-10 pt-20">

        <div className="mx-auto max-w-3xl rounded-2xl border border-red-200 bg-red-50 p-10 text-center">

          <h2 className="text-xl font-semibold text-red-700">
            Question unavailable
          </h2>

          <p className="mt-2 text-sm text-red-600">
            The selected quiz question could not be loaded.
          </p>

        </div>

      </div>
    );
  }

  return (
    <div className="min-h-full bg-slate-50 px-6 pb-10 pt-8">

      <div className="mx-auto w-full max-w-[675px]">

        <div className="flex items-start justify-between">

          <div>

            <h1 className="text-2xl font-bold text-slate-900">
              {quiz.title}
            </h1>

            <p className="mt-1 text-sm text-slate-500">
              Test your knowledge of{" "}
              {backendSubject?.name ||
                frontendSubject?.name}
            </p>

          </div>

          <div className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700">
            {currentQuestion + 1} /{" "}
            {questions.length}
          </div>

        </div>

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
            {formatTime(
              timeLeft
            )}
          </div>

        </div>

        {quiz.dueAt && (
          <div className="mt-3 flex items-center justify-center gap-2 text-xs text-slate-400">
            <CalendarClock size={14} />
            Submission deadline:{" "}
            {formatDeadline(
              quiz.dueAt
            )}
          </div>
        )}

        <div className="mt-6 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">

          <span className="inline-flex rounded-lg bg-blue-100 px-3 py-1.5 text-xs font-medium text-blue-600">
            Question{" "}
            {currentQuestion + 1}
          </span>

          <h2 className="mt-5 text-lg font-semibold leading-7 text-slate-900">
            {question.question}
          </h2>

          <div className="mt-6 space-y-3">

            {question.options.map(
              (
                option,
                index
              ) => {

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
                    key={`${question.id}-${index}`}
                    type="button"
                    disabled={
                      showAnswer ||
                      submitting
                    }
                    onClick={() =>
                      handleSelectAnswer(
                        index
                      )
                    }
                    className={`flex w-full items-center gap-3 rounded-xl border px-4 py-3.5 text-left transition ${optionClasses}`}
                  >

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

                    <span className="flex-1 text-sm font-medium">
                      {option}
                    </span>

                    {isCorrect && (
                      <CheckCircle
                        size={19}
                        className="text-green-500"
                      />
                    )}

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

        <div className="mt-4">

          {!showAnswer ? (
            <button
              type="button"
              onClick={
                handleCheckAnswer
              }
              disabled={
                selectedAnswer ===
                  null ||
                submitting
              }
              className="w-full rounded-xl bg-slate-400 px-5 py-3.5 text-sm font-semibold text-white transition disabled:cursor-not-allowed enabled:bg-blue-600 enabled:hover:bg-blue-700"
            >
              Check Answer
            </button>
          ) : (
            <button
              type="button"
              onClick={
                handleNextQuestion
              }
              disabled={
                submitting
              }
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-blue-600 px-5 py-3.5 text-sm font-semibold text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
            >

              {submitting ? (
                <>
                  <Loader2
                    size={17}
                    className="animate-spin"
                  />
                  Submitting...
                </>
              ) : (
                <>
                  {currentQuestion ===
                  questions.length - 1
                    ? "Submit Quiz"
                    : "Next Question"}

                  <span className="text-base">
                    →
                  </span>
                </>
              )}

            </button>
          )}

        </div>

      </div>
    </div>
  );
}

export default QuizPage;