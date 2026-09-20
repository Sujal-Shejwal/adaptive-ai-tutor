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
  useSearchParams,
} from "react-router-dom";

import {
  useEffect,
  useRef,
  useState,
} from "react";

import staticSubjects from "../../data/subjects";

const API_BASE = "http://localhost:8080";

function QuizPage() {
  const { subjectId } = useParams();

  const [searchParams] =
    useSearchParams();

  const requestedQuizId =
    searchParams.get("quizId");

  const requestedClassroomId =
    searchParams.get("classroomId");

  // =====================================================
  // SUBJECT STATE
  // =====================================================

  const [displaySubject, setDisplaySubject] =
    useState(null);

  const [subjectsLoaded, setSubjectsLoaded] =
    useState(false);

  // =====================================================
  // QUIZ STATE
  // =====================================================

  const [quiz, setQuiz] =
    useState(null);

  const [questions, setQuestions] =
    useState([]);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState("");

  // =====================================================
  // SUBMISSION STATE
  // =====================================================

  const [alreadySubmitted, setAlreadySubmitted] =
    useState(false);

  const [quizExpired, setQuizExpired] =
    useState(false);

  // =====================================================
  // QUIZ UI STATE
  // =====================================================

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

  // =====================================================
  // RESULT
  // =====================================================

  const [result, setResult] =
    useState(null);

  const [submitting, setSubmitting] =
    useState(false);

  // =====================================================
  // TIMER
  // =====================================================

  const [timeLeft, setTimeLeft] =
    useState(0);

  // =====================================================
  // REFS FOR TIMER / SUBMISSION SAFETY
  // =====================================================

  const answersRef =
    useRef({});

  const currentQuestionRef =
    useRef(0);

  const selectedAnswerRef =
    useRef(null);

  const submittingRef =
    useRef(false);

  // =====================================================
  // SYNC REFS
  // =====================================================

  useEffect(() => {
    answersRef.current = answers;
  }, [answers]);

  useEffect(() => {
    currentQuestionRef.current =
      currentQuestion;
  }, [currentQuestion]);

  useEffect(() => {
    selectedAnswerRef.current =
      selectedAnswer;
  }, [selectedAnswer]);

  useEffect(() => {
    submittingRef.current =
      submitting;
  }, [submitting]);

  // =====================================================
  // FORMAT TIMER
  // =====================================================

  const formatTime = (seconds) => {
    const safeSeconds =
      Math.max(
        0,
        Number(seconds) || 0
      );

    const minutes =
      Math.floor(
        safeSeconds / 60
      );

    const remainingSeconds =
      safeSeconds % 60;

    return `${String(
      minutes
    ).padStart(2, "0")}:${String(
      remainingSeconds
    ).padStart(2, "0")}`;
  };

  // =====================================================
  // FORMAT DATE
  // =====================================================

  const formatDeadline = (
    dateValue
  ) => {
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
  // CURRENT STUDENT
  // =====================================================

  const getStudentId = () => {
    const storedUserId =
      localStorage.getItem("userId");

    const studentId =
      Number(storedUserId);

    if (
      !Number.isFinite(
        studentId
      ) ||
      studentId <= 0
    ) {
      return null;
    }

    return studentId;
  };

  // =====================================================
  // RESET PAGE STATE
  // =====================================================

  const resetPageState = () => {
    setLoading(true);
    setError("");

    setDisplaySubject(null);
    setQuiz(null);
    setQuestions([]);

    setAlreadySubmitted(false);
    setQuizExpired(false);

    setQuizStarted(false);

    setCurrentQuestion(0);
    setSelectedAnswer(null);

    setAnswers({});
    answersRef.current = {};

    setShowAnswer(false);
    setShowResult(false);

    setResult(null);

    setSubmitting(false);
    submittingRef.current = false;

    setTimeLeft(0);
  };

  // =====================================================
  // FETCH JSON HELPER
  // =====================================================

  const fetchJson = async (
    url,
    options = {}
  ) => {
    const response =
      await fetch(
        url,
        options
      );

    const data =
      await response
        .json()
        .catch(() => null);

    if (!response.ok) {
      const message =
        data?.message ||
        data?.error ||
        `Request failed with status ${response.status}.`;

      throw new Error(
        message
      );
    }

    return data;
  };

  // =====================================================
  // LOAD BACKEND SUBJECTS
  // =====================================================

  const loadBackendSubjects =
    async () => {
      const data =
        await fetchJson(
          `${API_BASE}/api/subjects`
        );

      if (
        !Array.isArray(data)
      ) {
        throw new Error(
          "Invalid subjects response."
        );
      }

      return data;
    };

  // =====================================================
  // RESOLVE SUBJECT
  // =====================================================

  const resolveSubject = (
    backendSubjects
  ) => {
    const normalizedRoute =
      String(
        subjectId ?? ""
      )
        .trim()
        .toLowerCase();

    if (
      !normalizedRoute
    ) {
      return null;
    }

    // ---------------------------------------------
    // Backend ID / CODE / NAME
    // ---------------------------------------------

    const backendMatch =
      backendSubjects.find(
        (item) => {
          const id =
            String(
              item?.id ?? ""
            )
              .trim()
              .toLowerCase();

          const code =
            String(
              item?.code ?? ""
            )
              .trim()
              .toLowerCase();

          const name =
            String(
              item?.name ?? ""
            )
              .trim()
              .toLowerCase();

          return (
            id ===
              normalizedRoute ||
            code ===
              normalizedRoute ||
            name ===
              normalizedRoute
          );
        }
      );

    if (
      backendMatch
    ) {
      return backendMatch;
    }

    // ---------------------------------------------
    // Static fallback
    // ---------------------------------------------

    const staticMatch =
      staticSubjects.find(
        (item) =>
          String(
            item?.id ?? ""
          )
            .trim()
            .toLowerCase() ===
          normalizedRoute
      );

    return (
      staticMatch ||
      null
    );
  };

  // =====================================================
  // FORMAT QUESTIONS
  // =====================================================

  const formatQuestions = (
    questionData
  ) => {
    if (
      !Array.isArray(
        questionData
      )
    ) {
      return [];
    }

    return questionData
      .map(
        (question) => ({
          id:
            question?.id,

          question:
            String(
              question?.question ??
                ""
            ),

          options: [
            question?.option1,
            question?.option2,
            question?.option3,
            question?.option4,
          ].map(
            (value) =>
              String(
                value ?? ""
              )
          ),

          correctAnswer:
            Number(
              question?.correctAnswer
            ),
        })
      )
      .filter(
        (question) =>
          question.id != null &&
          question.question.trim() !== "" &&
          question.options.length ===
            4 &&
          question.options.every(
            (option) =>
              option.trim() !== ""
          ) &&
          Number.isInteger(
            question.correctAnswer
          ) &&
          question.correctAnswer >= 0 &&
          question.correctAnswer <= 3
      );
  };

  // =====================================================
  // LOAD SUBMISSION STATUS
  // =====================================================

  const loadSubmissionStatus =
    async (
      quizId,
      studentId
    ) => {
      const data =
        await fetchJson(
          `${API_BASE}/api/quiz-attempts/quiz/${quizId}/student/${studentId}`
        );

      return data;
    };

  // =====================================================
  // APPLY PREVIOUS SUBMISSION
  // =====================================================

  const applyPreviousSubmission = (
    submissionData,
    quizId,
    studentId
  ) => {
    const previousResult = {
      id:
        submissionData?.attemptId ??
        submissionData?.id,

      quizId:
        quizId,

      studentId:
        studentId,

      score:
        Number(
          submissionData?.score
        ) || 0,

      totalQuestions:
        Number(
          submissionData?.totalQuestions
        ) || 0,

      correctAnswers:
        Number(
          submissionData?.correctAnswers
        ) || 0,

      submittedAt:
        submissionData?.submittedAt,
    };

    setAlreadySubmitted(
      true
    );

    setResult(
      previousResult
    );

    setShowResult(
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

    return previousResult;
  };

  // =====================================================
  // CHECK DEADLINE
  // =====================================================

  const isDeadlinePassed = (
    dueAt
  ) => {
    if (!dueAt) {
      return false;
    }

    const dueDate =
      new Date(dueAt);

    if (
      Number.isNaN(
        dueDate.getTime()
      )
    ) {
      return false;
    }

    return (
      new Date().getTime() >=
      dueDate.getTime()
    );
  };

  // =====================================================
  // LOAD SPECIFIC QUIZ
  // =====================================================

  const loadSpecificQuiz = async (
    backendSubjects
  ) => {
    const selectedQuiz =
      await fetchJson(
        `${API_BASE}/api/quizzes/${requestedQuizId}`
      );

    if (
      !selectedQuiz?.id
    ) {
      throw new Error(
        "Invalid quiz data."
      );
    }

    // ---------------------------------------------
    // RESOLVE QUIZ SUBJECT
    // ---------------------------------------------

    const quizSubject =
      selectedQuiz?.subject;

    let resolvedSubject =
      null;

    if (
      quizSubject
    ) {
      resolvedSubject =
        backendSubjects.find(
          (item) =>
            String(
              item?.id ?? ""
            ).toLowerCase() ===
              String(
                quizSubject?.id ?? ""
              ).toLowerCase() ||
            String(
              item?.name ?? ""
            ).toLowerCase() ===
              String(
                quizSubject?.name ?? ""
              ).toLowerCase() ||
            String(
              item?.code ?? ""
            ).toLowerCase() ===
              String(
                quizSubject?.code ?? ""
              ).toLowerCase()
        );
    }

    if (
      !resolvedSubject
    ) {
      resolvedSubject =
        resolveSubject(
          backendSubjects
        );
    }

    if (
      !resolvedSubject &&
      quizSubject
    ) {
      resolvedSubject =
        {
          id:
            quizSubject?.id,

          name:
            quizSubject?.name ||
            "Subject",

          code:
            quizSubject?.code ||
            "",
        };
    }

    if (
      !resolvedSubject
    ) {
      throw new Error(
        "The subject for this quiz could not be found."
      );
    }

    setDisplaySubject(
      resolvedSubject
    );

    // ---------------------------------------------
    // QUESTIONS
    // ---------------------------------------------

    const questionData =
      await fetchJson(
        `${API_BASE}/api/quizzes/${selectedQuiz.id}/questions`
      );

    const formattedQuestions =
      formatQuestions(
        questionData
      );

    if (
      formattedQuestions.length ===
      0
    ) {
      throw new Error(
        "This quiz has no valid questions."
      );
    }

    setQuestions(
      formattedQuestions
    );

    // ---------------------------------------------
    // STUDENT
    // ---------------------------------------------

    const studentId =
      getStudentId();

    if (!studentId) {
      throw new Error(
        "Student account not found. Please log in again."
      );
    }

    // ---------------------------------------------
    // LOAD CLASSROOM-SPECIFIC ASSIGNMENT (OPTIONAL)
    // ---------------------------------------------
    //
    // Classroom quiz URLs include classroomId.
    // Normal/practice quiz URLs may not.
    //
    // When classroomId exists, use the classroom
    // assignment deadline instead of the original
    // quiz deadline.
    // ---------------------------------------------

    if (requestedClassroomId) {
      const assignmentData =
        await fetchJson(
          `${API_BASE}/api/quiz-assignments/student/${studentId}/classroom/${requestedClassroomId}/quiz/${selectedQuiz.id}`
        );

      if (!assignmentData?.quizId) {
        throw new Error(
          "This quiz is not assigned to this classroom."
        );
      }

      // Use the classroom assignment deadline.
      // Do not use the original quiz deadline.
      if (assignmentData?.dueAt) {
        selectedQuiz.dueAt =
          assignmentData.dueAt;
      }
    }

    setQuiz(
      selectedQuiz
    );

    // ---------------------------------------------
    // SUBMISSION STATUS
    // ---------------------------------------------

    const submissionData =
      await loadSubmissionStatus(
        selectedQuiz.id,
        studentId
      );

    if (
      submissionData?.submitted ===
      true
    ) {
      applyPreviousSubmission(
        submissionData,
        selectedQuiz.id,
        studentId
      );

      return;
    }

    // ---------------------------------------------
    // DEADLINE
    // ---------------------------------------------

    if (
      isDeadlinePassed(
        selectedQuiz?.dueAt
      )
    ) {
      setQuizExpired(
        true
      );

      return;
    }

    // ---------------------------------------------
    // TIMER
    // ---------------------------------------------

    const duration =
      Number(
        selectedQuiz?.duration
      );

    setTimeLeft(
      duration > 0
        ? duration * 60
        : 5 * 60
    );
  };

  // =====================================================
  // LOAD SUBJECT QUIZ
  // =====================================================

  const loadSubjectQuiz = async (
    backendSubjects
  ) => {
    // ---------------------------------------------
    // RESOLVE SUBJECT FROM BACKEND
    // ---------------------------------------------

    const resolvedSubject =
      resolveSubject(
        backendSubjects
      );

    if (
      !resolvedSubject
    ) {
      throw new Error(
        "Subject not found."
      );
    }

    setDisplaySubject(
      resolvedSubject
    );

    // ---------------------------------------------
    // LOAD QUIZZES
    // ---------------------------------------------

    const quizData =
      await fetchJson(
        `${API_BASE}/api/quizzes/subject/${resolvedSubject.id}`
      );

    if (
      !Array.isArray(
        quizData
      ) ||
      quizData.length === 0
    ) {
      setQuiz(null);
      setQuestions([]);
      return;
    }

    // ---------------------------------------------
    // NEWEST FIRST
    // ---------------------------------------------

    const sortedQuizzes =
      [...quizData].sort(
        (a, b) =>
          Number(
            b?.id || 0
          ) -
          Number(
            a?.id || 0
          )
      );

    let selectedQuiz =
      null;

    let selectedQuestions =
      [];

    // ---------------------------------------------
    // FIND LATEST QUIZ WITH VALID QUESTIONS
    // ---------------------------------------------

    for (
      const candidateQuiz of
        sortedQuizzes
    ) {
      try {
        const candidateQuestions =
          await fetchJson(
            `${API_BASE}/api/quizzes/${candidateQuiz.id}/questions`
          );

        const formatted =
          formatQuestions(
            candidateQuestions
          );

        if (
          formatted.length > 0
        ) {
          selectedQuiz =
            candidateQuiz;

          selectedQuestions =
            formatted;

          break;
        }
      } catch (
        questionError
      ) {
        console.error(
          `Could not load questions for quiz ${candidateQuiz?.id}:`,
          questionError
        );
      }
    }

    // ---------------------------------------------
    // NO VALID QUIZ
    // ---------------------------------------------

    if (
      !selectedQuiz
    ) {
      setQuiz(null);
      setQuestions([]);
      return;
    }

    setQuiz(
      selectedQuiz
    );

    setQuestions(
      selectedQuestions
    );

    // ---------------------------------------------
    // STUDENT
    // ---------------------------------------------

    const studentId =
      getStudentId();

    if (!studentId) {
      throw new Error(
        "Student account not found. Please log in again."
      );
    }

    // ---------------------------------------------
    // SUBMISSION STATUS
    // ---------------------------------------------

    const submissionData =
      await loadSubmissionStatus(
        selectedQuiz.id,
        studentId
      );

    if (
      submissionData?.submitted ===
      true
    ) {
      applyPreviousSubmission(
        submissionData,
        selectedQuiz.id,
        studentId
      );

      return;
    }

    // ---------------------------------------------
    // DEADLINE
    // ---------------------------------------------

    if (
      isDeadlinePassed(
        selectedQuiz?.dueAt
      )
    ) {
      setQuizExpired(
        true
      );

      return;
    }

    // ---------------------------------------------
    // TIMER
    // ---------------------------------------------

    const duration =
      Number(
        selectedQuiz?.duration
      );

    setTimeLeft(
      duration > 0
        ? duration * 60
        : 5 * 60
    );
  };

  // =====================================================
  // MAIN QUIZ LOADER
  // =====================================================

  useEffect(() => {
    let cancelled =
      false;

    const loadQuiz =
      async () => {
        resetPageState();

        try {
          const backendSubjects =
            await loadBackendSubjects();

          if (
            cancelled
          ) {
            return;
          }

          setSubjectsLoaded(
            true
          );

          if (
            requestedQuizId
          ) {
            await loadSpecificQuiz(
              backendSubjects
            );
          } else {
            await loadSubjectQuiz(
              backendSubjects
            );
          }
        } catch (
          loadError
        ) {
          if (
            cancelled
          ) {
            return;
          }

          console.error(
            "Quiz loading error:",
            loadError
          );

          setError(
            loadError?.message ||
              "Unable to load quiz. Please try again."
          );
        } finally {
          if (
            !cancelled
          ) {
            setLoading(
              false
            );
          }
        }
      };

    loadQuiz();

    return () => {
      cancelled = true;
    };
  }, [
    subjectId,
    requestedQuizId,
    requestedClassroomId,
  ]);

  // =====================================================
  // START QUIZ
  // =====================================================

  const handleStartQuiz =
    () => {
      if (
        !quiz ||
        questions.length ===
          0
      ) {
        return;
      }

      if (
        alreadySubmitted
      ) {
        return;
      }

      if (
        isDeadlinePassed(
          quiz?.dueAt
        )
      ) {
        setQuizExpired(
          true
        );

        return;
      }

      setQuizStarted(
        true
      );

      setCurrentQuestion(
        0
      );

      currentQuestionRef.current =
        0;

      setSelectedAnswer(
        null
      );

      selectedAnswerRef.current =
        null;

      setAnswers({});

      answersRef.current =
        {};

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

      const duration =
        Number(
          quiz?.duration
        );

      setTimeLeft(
        duration > 0
          ? duration * 60
          : 5 * 60
      );
    };

  // =====================================================
  // SELECT ANSWER
  // =====================================================

  const handleSelectAnswer =
    (answerIndex) => {
      if (
        showAnswer ||
        submitting
      ) {
        return;
      }

      if (
        !Number.isInteger(
          answerIndex
        ) ||
        answerIndex < 0 ||
        answerIndex > 3
      ) {
        return;
      }

      setSelectedAnswer(
        answerIndex
      );

      selectedAnswerRef.current =
        answerIndex;
    };

  // =====================================================
  // CHECK ANSWER
  // =====================================================

  const handleCheckAnswer =
    () => {
      if (
        selectedAnswer ===
          null ||
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

      const updatedAnswers =
        {
          ...answersRef.current,
          [question.id]:
            selectedAnswer,
        };

      setAnswers(
        updatedAnswers
      );

      answersRef.current =
        updatedAnswers;

      setShowAnswer(
        true
      );
    };

  // =====================================================
  // SUBMIT QUIZ
  // =====================================================

  const handleSubmitQuiz =
    async (
      providedAnswers
    ) => {
      if (
        submittingRef.current ||
        alreadySubmitted ||
        !quiz
      ) {
        return;
      }

      const studentId =
        getStudentId();

      if (!studentId) {
        setError(
          "Student account not found. Please log in again."
        );

        return;
      }

      // ---------------------------------------------
      // FINAL ANSWERS
      // ---------------------------------------------

      const finalAnswers =
        {
          ...(providedAnswers ||
            answersRef.current),
        };

      // Save currently selected answer as well.
      const currentQ =
        questions[
          currentQuestionRef.current
        ];

      const currentSelected =
        selectedAnswerRef.current;

      if (
        currentQ &&
        currentSelected !==
          null &&
        currentSelected !==
          undefined &&
        Number.isInteger(
          currentSelected
        )
      ) {
        finalAnswers[
          currentQ.id
        ] =
          currentSelected;
      }

      try {
        setSubmitting(
          true
        );

        submittingRef.current =
          true;

        setError("");

        // ---------------------------------------------
        // DEADLINE CHECK
        // ---------------------------------------------

        if (
          isDeadlinePassed(
            quiz?.dueAt
          )
        ) {
          setQuizExpired(
            true
          );

          setQuizStarted(
            false
          );

          return;
        }

        // ---------------------------------------------
        // SUBMIT
        // ---------------------------------------------

        const response =
          await fetch(
            `${API_BASE}/api/quiz-attempts/quiz/${quiz.id}/submit`,
            {
              method:
                "POST",

              headers: {
                "Content-Type":
                  "application/json",
              },

              body:
                JSON.stringify({
                  studentId:
                    studentId,

                  answers:
                    finalAnswers,
                }),
            }
          );

        const responseData =
          await response
            .json()
            .catch(
              () => null
            );

        // ---------------------------------------------
        // DUPLICATE SUBMISSION
        // ---------------------------------------------

        if (
          response.status ===
          409
        ) {
          const submissionData =
            await loadSubmissionStatus(
              quiz.id,
              studentId
            );

          if (
            submissionData?.submitted
          ) {
            applyPreviousSubmission(
              submissionData,
              quiz.id,
              studentId
            );

            return;
          }
        }

        // ---------------------------------------------
        // OTHER ERRORS
        // ---------------------------------------------

        if (
          !response.ok
        ) {
          throw new Error(
            responseData?.message ||
              responseData?.error ||
              "Unable to submit quiz."
          );
        }

        // ---------------------------------------------
        // RESULT
        // ---------------------------------------------

        const finalResult = {
          id:
            responseData?.id,

          quizId:
            responseData?.quizId ??
            quiz.id,

          studentId:
            responseData?.studentId ??
            studentId,

          score:
            Number(
              responseData?.score
            ) || 0,

          totalQuestions:
            Number(
              responseData?.totalQuestions
            ) ||
            questions.length,

          correctAnswers:
            Number(
              responseData?.correctAnswers
            ) || 0,

          submittedAt:
            responseData?.submittedAt ||
            new Date().toISOString(),
        };

        setResult(
          finalResult
        );

        setAlreadySubmitted(
          true
        );

        setQuizStarted(
          false
        );

        setShowResult(
          true
        );

        setShowAnswer(
          false
        );

        setSelectedAnswer(
          null
        );

        selectedAnswerRef.current =
          null;

        setAnswers(
          finalAnswers
        );

        answersRef.current =
          finalAnswers;
      } catch (
        submitError
      ) {
        console.error(
          "Quiz submission error:",
          submitError
        );

        setError(
          submitError?.message ||
            "Unable to submit quiz."
        );
      } finally {
        setSubmitting(
          false
        );

        submittingRef.current =
          false;
      }
    };

  // =====================================================
  // NEXT QUESTION
  // =====================================================

  const handleNextQuestion =
    () => {
      if (
        submitting ||
        !questions.length
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

      // ---------------------------------------------
      // SAVE CURRENT ANSWER
      // ---------------------------------------------

      const updatedAnswers =
        {
          ...answersRef.current,
        };

      if (
        selectedAnswer !==
          null &&
        selectedAnswer !==
          undefined
      ) {
        updatedAnswers[
          question.id
        ] =
          selectedAnswer;
      }

      setAnswers(
        updatedAnswers
      );

      answersRef.current =
        updatedAnswers;

      // ---------------------------------------------
      // LAST QUESTION
      // ---------------------------------------------

      if (
        currentQuestion ===
        questions.length - 1
      ) {
        handleSubmitQuiz(
          updatedAnswers
        );

        return;
      }

      // ---------------------------------------------
      // NEXT
      // ---------------------------------------------

      const nextIndex =
        currentQuestion + 1;

      setCurrentQuestion(
        nextIndex
      );

      currentQuestionRef.current =
        nextIndex;

      setSelectedAnswer(
        null
      );

      selectedAnswerRef.current =
        null;

      setShowAnswer(
        false
      );
    };

  // =====================================================
  // DEADLINE WATCHER
  // =====================================================

  useEffect(() => {
    if (
      !quiz ||
      alreadySubmitted ||
      quizExpired
    ) {
      return;
    }

    if (
      !quiz?.dueAt
    ) {
      return;
    }

    const interval =
      setInterval(() => {
        if (
          isDeadlinePassed(
            quiz.dueAt
          )
        ) {
          setQuizExpired(
            true
          );

          if (
            !submittingRef.current
          ) {
            setQuizStarted(
              false
            );
          }
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
        // ---------------------------------------------
        // GLOBAL DEADLINE
        // ---------------------------------------------

        if (
          quiz?.dueAt &&
          isDeadlinePassed(
            quiz.dueAt
          )
        ) {
          clearInterval(
            timer
          );

          setQuizExpired(
            true
          );

          setQuizStarted(
            false
          );

          return;
        }

        // ---------------------------------------------
        // QUIZ DURATION
        // ---------------------------------------------

        setTimeLeft(
          (previousTime) => {
            if (
              previousTime <=
              1
            ) {
              clearInterval(
                timer
              );

              const finalAnswers =
                {
                  ...answersRef.current,
                };

              const currentQ =
                questions[
                  currentQuestionRef.current
                ];

              const selected =
                selectedAnswerRef.current;

              if (
                currentQ &&
                selected !==
                  null &&
                selected !==
                  undefined
              ) {
                finalAnswers[
                  currentQ.id
                ] =
                  selected;
              }

              handleSubmitQuiz(
                finalAnswers
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
      clearInterval(
        timer
      );
    };
  }, [
    quizStarted,
    showResult,
    alreadySubmitted,
    quiz,
    questions,
  ]);

  // =====================================================
  // LOADING
  // =====================================================

  if (
    loading ||
    !subjectsLoaded
  ) {
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

  if (
    error
  ) {
    return (
      <div className="min-h-full bg-slate-50 px-6 pb-10 pt-20">
        <div className="mx-auto max-w-3xl">

          <Link
            to="/student/quizzes"
            className="mb-6 inline-flex items-center gap-2 text-sm font-medium text-slate-500 hover:text-blue-600"
          >
            <ArrowLeft
              size={17}
            />

            Back to Quizzes
          </Link>

          <div className="rounded-2xl border border-red-200 bg-red-50 p-10 text-center">

            <h2 className="text-xl font-semibold text-red-700">
              Quiz Error
            </h2>

            <p className="mt-2 text-sm text-red-600">
              {error}
            </p>

            <button
              type="button"
              onClick={() =>
                window.location.reload()
              }
              className="mt-6 rounded-xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white hover:bg-blue-700"
            >
              Try Again
            </button>

          </div>
        </div>
      </div>
    );
  }

  // =====================================================
  // EXPIRED
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
            to="/student/quizzes"
            className="mb-6 inline-flex items-center gap-2 text-sm font-medium text-slate-500 hover:text-blue-600"
          >
            <ArrowLeft
              size={17}
            />

            Back to Quizzes
          </Link>

          <div className="rounded-2xl border border-red-200 bg-white p-10 text-center shadow-sm">

            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-red-100 text-red-500">
              <CalendarClock
                size={30}
              />
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
              <Clock3
                size={16}
              />

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
    (
      questions.length ===
        0 &&
      !showResult
    )
  ) {
    return (
      <div className="min-h-full bg-slate-50 px-6 pb-10 pt-20">

        <div className="mx-auto max-w-3xl">

          <Link
            to="/student/quizzes"
            className="mb-6 inline-flex items-center gap-2 text-sm font-medium text-slate-500 hover:text-blue-600"
          >
            <ArrowLeft
              size={17}
            />

            Back to Quizzes
          </Link>

          <div className="rounded-2xl border border-slate-200 bg-white p-10 text-center shadow-sm">

            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-blue-50 text-blue-600">
              <ClipboardCheck
                size={26}
              />
            </div>

            <h2 className="mt-5 text-xl font-semibold text-slate-900">
              Quiz Not Available
            </h2>

            <p className="mx-auto mt-2 max-w-md text-sm text-slate-500">
              There is currently no quiz available for{" "}
              <span className="font-medium text-slate-700">
                {displaySubject?.name ||
                  "this subject"}
              </span>
              .
            </p>

          </div>
        </div>
      </div>
    );
  }

  // =====================================================
  // RESULT SCREEN
  // =====================================================

  if (
    showResult &&
    result
  ) {
    const correct =
      Number(
        result.correctAnswers
      ) || 0;

    const total =
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
            to="/student/quizzes"
            className="mb-6 inline-flex items-center gap-2 text-sm font-medium text-slate-500 hover:text-blue-600"
          >
            <ArrowLeft
              size={17}
            />

            Back to Quizzes
          </Link>

          <div className="rounded-2xl border border-slate-200 bg-white px-8 py-10 shadow-sm">

            <div className="mb-6 rounded-xl border border-green-200 bg-green-50 px-4 py-3 text-center">
              <p className="text-sm font-semibold text-green-700">
                Quiz Already Submitted
              </p>

              <p className="mt-1 text-xs text-green-600">
                This quiz cannot be attempted again.
              </p>
            </div>

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
                Submission Complete
              </h1>

              <p className="mt-2 text-sm text-slate-500">

                You answered{" "}

                <span className="font-semibold text-slate-900">
                  {correct}
                </span>{" "}

                out of{" "}

                <span className="font-semibold text-slate-900">
                  {total}
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
                  {correct}
                </p>

                <p className="mt-1 text-xs text-slate-500">
                  Correct
                </p>
              </div>

              <div className="rounded-xl bg-red-50 px-3 py-5 text-center">

                <p className="text-2xl font-bold text-red-500">
                  {Math.max(
                    0,
                    total -
                      correct
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

            <Link
              to="/student/progress"
              className="mt-8 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 py-3 text-sm font-medium text-white hover:bg-blue-700"
            >
              <BarChart3
                size={16}
              />

              View Progress
            </Link>

          </div>
        </div>
      </div>
    );
  }

  // =====================================================
  // START QUIZ SCREEN
  // =====================================================

  if (
    !quizStarted
  ) {
    return (
      <div className="min-h-full bg-slate-50 px-6 pb-10 pt-20">

        <div className="mx-auto max-w-[680px]">

          <Link
            to="/student/quizzes"
            className="mb-6 inline-flex items-center gap-2 text-sm font-medium text-slate-500 hover:text-blue-600"
          >
            <ArrowLeft
              size={17}
            />

            Back to Quizzes
          </Link>

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
              {quiz.title}
            </h1>

            <p className="mx-auto mt-3 max-w-md text-sm leading-6 text-slate-500">
              Test your knowledge of{" "}
              <span className="font-medium text-slate-700">
                {displaySubject?.name ||
                  quiz?.subject?.name ||
                  "this subject"}
              </span>
              .
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
                  {Number(
                    quiz.duration
                  ) > 0
                    ? Number(
                        quiz.duration
                      )
                    : 5}{" "}
                  min
                </p>

                <p className="mt-1 text-xs text-slate-500">
                  Time Limit
                </p>
              </div>

            </div>

            <div className="mx-auto mt-5 inline-flex items-center gap-2 rounded-xl bg-blue-50 px-4 py-3 text-sm text-blue-600">
              <CalendarClock
                size={16}
              />

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
  // ACTIVE QUESTION
  // =====================================================

  const question =
    questions[
      currentQuestion
    ];

  const progress =
    questions.length > 0
      ? (
          (currentQuestion +
            1) /
          questions.length
        ) * 100
      : 0;

  // =====================================================
  // QUESTION SAFETY
  // =====================================================

  if (
    !question
  ) {
    return (
      <div className="min-h-full bg-slate-50 px-6 pb-10 pt-20">

        <div className="mx-auto max-w-3xl rounded-2xl border border-red-200 bg-red-50 p-10 text-center">

          <h2 className="text-xl font-semibold text-red-700">
            Question unavailable
          </h2>

          <p className="mt-2 text-sm text-red-600">
            The selected quiz question could not be loaded.
          </p>

          <Link
            to="/student/quizzes"
            className="mt-6 inline-flex items-center gap-2 rounded-xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white hover:bg-blue-700"
          >
            <ArrowLeft
              size={16}
            />

            Back to Quizzes
          </Link>

        </div>
      </div>
    );
  }

  // =====================================================
  // ACTIVE QUIZ
  // =====================================================

  return (
    <div className="min-h-full bg-slate-50 px-6 pb-10 pt-8">

      <div className="mx-auto w-full max-w-[675px]">

        {/* HEADER */}

        <div className="flex items-start justify-between">

          <div>

            <h1 className="text-2xl font-bold text-slate-900">
              {quiz.title}
            </h1>

            <p className="mt-1 text-sm text-slate-500">
              Test your knowledge of{" "}
              {displaySubject?.name ||
                quiz?.subject?.name ||
                "Subject"}
            </p>

          </div>

          <div className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700">

            {currentQuestion +
              1}{" "}
            /{" "}
            {questions.length}

          </div>

        </div>

        {/* PROGRESS + TIMER */}

        <div className="mt-4 flex items-center justify-between">

          <div className="h-2 flex-1 overflow-hidden rounded-full bg-slate-100">

            <div
              className="h-full rounded-full bg-blue-600 transition-all duration-300"
              style={{
                width:
                  `${progress}%`,
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

            <Clock3
              size={16}
            />

            {formatTime(
              timeLeft
            )}

          </div>

        </div>

        {/* GLOBAL DEADLINE */}

        {quiz.dueAt && (
          <div className="mt-3 flex items-center justify-center gap-2 text-xs text-slate-400">

            <CalendarClock
              size={14}
            />

            Submission deadline:{" "}

            {formatDeadline(
              quiz.dueAt
            )}

          </div>
        )}

        {/* QUESTION CARD */}

        <div className="mt-6 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">

          <span className="inline-flex rounded-lg bg-blue-100 px-3 py-1.5 text-xs font-medium text-blue-600">
            Question{" "}
            {currentQuestion +
              1}
          </span>

          <h2 className="mt-5 text-lg font-semibold leading-7 text-slate-900">
            {question.question}
          </h2>

          {/* OPTIONS */}

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

                if (
                  isCorrect
                ) {
                  optionClasses =
                    "border-green-400 bg-green-50 text-green-600";
                }

                if (
                  isWrong
                ) {
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

        {/* ACTION */}

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