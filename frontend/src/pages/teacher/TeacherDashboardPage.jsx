import {
  Users,
  FileText,
  BookOpen,
  TrendingUp,
  Upload,
  FileText as PdfIcon,
  Trash2,
  ClipboardList,
  Plus,
  Clock,
  Loader2,
  Eye,
  X,
  Award,
  CheckCircle,
} from "lucide-react";

import {
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  useNavigate,
} from "react-router-dom";

import {
  teacherStats,
  teacherDocuments,
  teacherSubjects,
} from "../../data/teacher";

const statIcons = {
  students: Users,
  notes: FileText,
  subjects: BookOpen,
  progress: TrendingUp,
};

export default function TeacherDashboardPage() {

  const navigate = useNavigate();

  // =====================================================
  // DOCUMENT STATE
  // =====================================================

  const [
    selectedSubject,
    setSelectedSubject,
  ] = useState("All");

  const [
    documents,
    setDocuments,
  ] = useState(teacherDocuments);

  // =====================================================
  // QUIZ STATE
  // =====================================================

  const [
    quizzes,
    setQuizzes,
  ] = useState([]);

  const [
    quizLoading,
    setQuizLoading,
  ] = useState(true);

  const [
    quizError,
    setQuizError,
  ] = useState("");

  // =====================================================
  // RESULTS STATE
  // =====================================================

  const [
    selectedResultsQuiz,
    setSelectedResultsQuiz,
  ] = useState(null);

  const [
    quizResults,
    setQuizResults,
  ] = useState([]);

  const [
    resultsLoading,
    setResultsLoading,
  ] = useState(false);

  const [
    resultsError,
    setResultsError,
  ] = useState("");

  // =====================================================
  // FETCH QUIZZES
  // =====================================================

  useEffect(() => {

    const fetchQuizzes = async () => {

      try {

        setQuizLoading(true);

        setQuizError("");

        const response =
          await fetch(
            "http://localhost:8080/api/quizzes"
          );

        if (!response.ok) {

          throw new Error(
            `Failed to fetch quizzes (${response.status})`
          );
        }

        const data =
          await response.json();

        setQuizzes(
          Array.isArray(data)
            ? data
            : []
        );

      } catch (error) {

        console.error(
          "Error fetching quizzes:",
          error
        );

        setQuizError(
          "Unable to load quizzes. Please try again."
        );

      } finally {

        setQuizLoading(false);
      }
    };

    fetchQuizzes();

  }, []);

  // =====================================================
  // FILTER DOCUMENTS
  // =====================================================

  const filteredDocuments =
    useMemo(() => {

      if (
        selectedSubject ===
        "All"
      ) {
        return documents;
      }

      return documents.filter(
        (document) =>
          document.subject ===
          selectedSubject
      );

    }, [
      documents,
      selectedSubject,
    ]);

  // =====================================================
  // DELETE DOCUMENT
  // =====================================================

  const handleDeleteDocument = (
    documentId
  ) => {

    setDocuments(
      (currentDocuments) =>
        currentDocuments.filter(
          (document) =>
            document.id !==
            documentId
        )
    );
  };

  // =====================================================
  // CREATE QUIZ
  // =====================================================

  const handleCreateQuiz = () => {

    navigate(
      "/teacher/create-quiz"
    );
  };

  // =====================================================
  // OPEN QUIZ
  // =====================================================

  const handleOpenQuiz = (
    quizId
  ) => {

    navigate(
      `/teacher/quiz/${quizId}`
    );
  };

  // =====================================================
  // VIEW QUIZ RESULTS
  // =====================================================

  const handleViewResults = async (
    quiz
  ) => {

    // Close if same quiz is already open
    if (
      selectedResultsQuiz?.id ===
      quiz.id
    ) {

      setSelectedResultsQuiz(
        null
      );

      setQuizResults([]);

      setResultsError("");

      return;
    }

    try {

      setSelectedResultsQuiz(
        quiz
      );

      setResultsLoading(
        true
      );

      setResultsError("");

      setQuizResults([]);

      const response =
        await fetch(
          `http://localhost:8080/api/quiz-attempts/quiz/${quiz.id}`
        );

      if (!response.ok) {

        throw new Error(
          "Failed to load quiz results."
        );
      }

      const data =
        await response.json();

      setQuizResults(
        Array.isArray(data)
          ? data
          : []
      );

    } catch (error) {

      console.error(
        "Error loading quiz results:",
        error
      );

      setResultsError(
        "Unable to load quiz results."
      );

    } finally {

      setResultsLoading(
        false
      );
    }
  };

  // =====================================================
  // FORMAT DATE
  // =====================================================

  const formatDate = (
    dateValue
  ) => {

    if (!dateValue) {
      return "Not available";
    }

    const date =
      new Date(
        dateValue
      );

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
  // SCORE STYLE
  // =====================================================

  const getScoreClasses = (
    score
  ) => {

    const value =
      Number(score) || 0;

    if (value >= 80) {
      return "bg-[#dcfce7] text-[#15803d]";
    }

    if (value >= 50) {
      return "bg-[#fef3c7] text-[#a16207]";
    }

    return "bg-[#fee2e2] text-[#dc2626]";
  };

  // =====================================================
  // AVERAGE SCORE
  // =====================================================

  const averageScore =
    quizResults.length > 0
      ? Math.round(
          quizResults.reduce(
            (
              total,
              result
            ) =>
              total +
              Number(
                result.score || 0
              ),
            0
          ) /
            quizResults.length
        )
      : 0;

  // =====================================================
  // RENDER
  // =====================================================

  return (
    <div className="min-h-[calc(100vh-65px)] bg-[#f8fafc] px-8 py-7">

      <div className="mx-auto max-w-[1025px]">

        {/* =====================================================
            HEADING
        ===================================================== */}

        <div className="flex items-start justify-between">

          <div>

            <h1 className="text-[25px] font-bold leading-[30px] tracking-tight text-[#17233c]">
              Teacher Dashboard
            </h1>

            <p className="mt-[3px] text-[14px] leading-5 text-[#64748b]">
              Manage your course content and track student activity.
            </p>

          </div>

          <div className="flex items-center gap-3">

            {/* CREATE QUIZ */}

            <button
              type="button"
              onClick={
                handleCreateQuiz
              }
              className="flex h-[40px] items-center gap-2 rounded-xl border border-[#2563eb] bg-white px-4 text-[13px] font-semibold text-[#2563eb] shadow-sm transition hover:bg-blue-50"
            >

              <Plus
                className="h-[15px] w-[15px]"
                strokeWidth={2}
              />

              Create Quiz

            </button>

            {/* UPLOAD NOTES */}

            <button
              type="button"
              onClick={() =>
                navigate(
                  "/teacher/upload-notes"
                )
              }
              className="flex h-[40px] items-center gap-2 rounded-xl bg-[#2563eb] px-4 text-[13px] font-semibold text-white shadow-sm transition hover:bg-blue-700"
            >

              <Upload
                className="h-[15px] w-[15px]"
                strokeWidth={1.8}
              />

              Upload Notes

            </button>

          </div>

        </div>

        {/* =====================================================
            STATISTICS
        ===================================================== */}

        <div className="mt-7 grid grid-cols-4 gap-4">

          {teacherStats.map(
            (stat) => {

              const Icon =
                statIcons[
                  stat.type
                ];

              let iconStyle =
                "bg-[#dbeafe] text-[#2563eb]";

              if (
                stat.type ===
                "notes"
              ) {

                iconStyle =
                  "bg-[#d1fae5] text-[#10b981]";
              }

              if (
                stat.type ===
                "subjects"
              ) {

                iconStyle =
                  "bg-[#fef3c7] text-[#f59e0b]";
              }

              if (
                stat.type ===
                "progress"
              ) {

                iconStyle =
                  "bg-[#ede9fe] text-[#8b5cf6]";
              }

              return (

                <div
                  key={stat.id}
                  className="h-[139px] rounded-2xl border border-[#e2e8f0] bg-white px-5 py-5"
                >

                  <div
                    className={`flex h-[38px] w-[38px] items-center justify-center rounded-xl ${iconStyle}`}
                  >

                    <Icon
                      className="h-[18px] w-[18px]"
                      strokeWidth={1.8}
                    />

                  </div>

                  <p className="mt-[13px] text-[25px] font-bold leading-[30px] text-[#17233c]">
                    {stat.value}
                  </p>

                  <p className="mt-[1px] text-[13px] leading-5 text-[#64748b]">
                    {stat.label}
                  </p>

                </div>
              );
            }
          )}

        </div>

        {/* =====================================================
            QUIZZES
        ===================================================== */}

        <section className="mt-8 rounded-2xl border border-[#e2e8f0] bg-white">

          {/* HEADER */}

          <div className="flex items-center justify-between px-6 pb-4 pt-6">

            <div>

              <h2 className="text-[16px] font-bold leading-5 text-[#17233c]">
                Quizzes
              </h2>

              <p className="mt-1 text-[12px] text-[#94a3b8]">
                Quizzes created in the system.
              </p>

            </div>

            <button
              type="button"
              onClick={
                handleCreateQuiz
              }
              className="flex items-center gap-2 rounded-lg bg-[#2563eb] px-3 py-2 text-[12px] font-semibold text-white transition hover:bg-blue-700"
            >

              <Plus
                className="h-4 w-4"
                strokeWidth={2}
              />

              Create Quiz

            </button>

          </div>

          {/* QUIZ LOADING */}

          {quizLoading && (

            <div className="flex items-center justify-center gap-2 py-12 text-sm text-[#64748b]">

              <Loader2
                className="h-5 w-5 animate-spin"
                strokeWidth={1.8}
              />

              Loading quizzes...

            </div>
          )}

          {/* QUIZ ERROR */}

          {!quizLoading &&
            quizError && (

              <div className="px-6 pb-6">

                <div className="rounded-xl border border-red-100 bg-red-50 px-4 py-4 text-center">

                  <p className="text-sm font-medium text-red-600">
                    {quizError}
                  </p>

                  <button
                    type="button"
                    onClick={() =>
                      window.location.reload()
                    }
                    className="mt-3 rounded-lg bg-red-500 px-4 py-2 text-xs font-semibold text-white hover:bg-red-600"
                  >
                    Retry
                  </button>

                </div>

              </div>
            )}

          {/* QUIZ LIST */}

          {!quizLoading &&
            !quizError &&
            quizzes.length >
              0 && (

              <div className="px-6 pb-5">

                {quizzes.map(
                  (
                    quiz,
                    index
                  ) => {

                    const isResultsOpen =
                      selectedResultsQuiz?.id ===
                      quiz.id;

                    return (

                      <div
                        key={quiz.id}
                        className={`${
                          index !==
                          quizzes.length - 1
                            ? "border-b border-[#f1f5f9]"
                            : ""
                        }`}
                      >

                        {/* =========================================
                            QUIZ ROW
                        ========================================= */}

                        <div className="group flex min-h-[78px] items-center gap-4 px-4">

                          {/* ICON */}

                          <div className="flex h-[44px] w-[44px] shrink-0 items-center justify-center rounded-xl bg-[#ede9fe]">

                            <ClipboardList
                              className="h-[20px] w-[20px] text-[#8b5cf6]"
                              strokeWidth={1.8}
                            />

                          </div>

                          {/* QUIZ INFO */}

                          <div className="min-w-0 flex-1">

                            <p className="truncate text-[14px] font-semibold leading-5 text-[#17233c]">
                              {quiz.title}
                            </p>

                            <div className="mt-[3px] flex items-center gap-4 text-[12px] text-[#94a3b8]">

                              <span className="flex items-center gap-1">

                                <Clock
                                  className="h-3.5 w-3.5"
                                  strokeWidth={1.8}
                                />

                                {quiz.duration} minutes

                              </span>

                              <span>
                                Quiz ID:{" "}
                                {quiz.id}
                              </span>

                              {quiz.dueAt && (

                                <span className="text-[#2563eb]">

                                  Due{" "}
                                  {formatDate(
                                    quiz.dueAt
                                  )}

                                </span>

                              )}

                            </div>

                          </div>

                          {/* SUBJECT */}

                          <span className="rounded-lg bg-[#dbeafe] px-3 py-[5px] text-[11px] font-medium text-[#2563eb]">

                            Subject{" "}
                            {quiz.subjectId}

                          </span>

                          {/* VIEW RESULTS */}

                          <button
                            type="button"
                            onClick={() =>
                              handleViewResults(
                                quiz
                              )
                            }
                            className={`flex items-center gap-1.5 rounded-lg px-3 py-2 text-[11px] font-semibold transition ${
                              isResultsOpen
                                ? "bg-[#17233c] text-white hover:bg-slate-800"
                                : "border border-[#2563eb] bg-white text-[#2563eb] hover:bg-blue-50"
                            }`}
                          >

                            {isResultsOpen ? (
                              <>
                                <X
                                  className="h-3.5 w-3.5"
                                  strokeWidth={2}
                                />

                                Close
                              </>
                            ) : (
                              <>
                                <Eye
                                  className="h-3.5 w-3.5"
                                  strokeWidth={2}
                                />

                                View Results
                              </>
                            )}

                          </button>

                          {/* OPEN QUIZ */}

                          <button
                            type="button"
                            onClick={() =>
                              handleOpenQuiz(
                                quiz.id
                              )
                            }
                            className="rounded-lg border border-[#e2e8f0] px-3 py-2 text-[11px] font-semibold text-[#475569] transition hover:border-[#2563eb] hover:bg-blue-50 hover:text-[#2563eb]"
                          >
                            Open
                          </button>

                        </div>

                        {/* =========================================
                            RESULTS PANEL
                        ========================================= */}

                        {isResultsOpen && (

                          <div className="px-4 pb-5 pt-2">

                            {resultsLoading && (

                              <div className="flex items-center justify-center gap-2 rounded-xl bg-[#f8fafc] py-8 text-sm text-[#64748b]">

                                <Loader2
                                  className="h-5 w-5 animate-spin"
                                  strokeWidth={1.8}
                                />

                                Loading student results...

                              </div>

                            )}

                            {!resultsLoading &&
                              resultsError && (

                                <div className="rounded-xl border border-red-100 bg-red-50 px-4 py-4 text-center">

                                  <p className="text-sm text-red-600">
                                    {resultsError}
                                  </p>

                                </div>
                              )}

                            {!resultsLoading &&
                              !resultsError && (

                                <div className="rounded-xl border border-[#e2e8f0] bg-[#f8fafc] p-4">

                                  {/* RESULT SUMMARY */}

                                  <div className="mb-4 grid grid-cols-3 gap-3">

                                    <div className="rounded-xl bg-white p-4">

                                      <div className="flex items-center gap-2 text-xs text-[#64748b]">

                                        <Users
                                          className="h-4 w-4 text-[#2563eb]"
                                          strokeWidth={1.8}
                                        />

                                        Submissions

                                      </div>

                                      <p className="mt-2 text-xl font-bold text-[#17233c]">
                                        {
                                          quizResults.length
                                        }
                                      </p>

                                    </div>

                                    <div className="rounded-xl bg-white p-4">

                                      <div className="flex items-center gap-2 text-xs text-[#64748b]">

                                        <Award
                                          className="h-4 w-4 text-[#8b5cf6]"
                                          strokeWidth={1.8}
                                        />

                                        Average Score

                                      </div>

                                      <p className="mt-2 text-xl font-bold text-[#17233c]">

                                        {
                                          averageScore
                                        }%

                                      </p>

                                    </div>

                                    <div className="rounded-xl bg-white p-4">

                                      <div className="flex items-center gap-2 text-xs text-[#64748b]">

                                        <CheckCircle
                                          className="h-4 w-4 text-[#10b981]"
                                          strokeWidth={1.8}
                                        />

                                        Deadline

                                      </div>

                                      <p className="mt-2 text-sm font-semibold text-[#17233c]">

                                        {quiz.dueAt
                                          ? formatDate(
                                              quiz.dueAt
                                            )
                                          : "No deadline"}

                                      </p>

                                    </div>

                                  </div>

                                  {/* NO RESULTS */}

                                  {quizResults.length ===
                                    0 && (

                                    <div className="rounded-xl border border-dashed border-[#cbd5e1] bg-white py-8 text-center">

                                      <Users
                                        className="mx-auto h-7 w-7 text-[#94a3b8]"
                                        strokeWidth={1.8}
                                      />

                                      <p className="mt-2 text-sm font-semibold text-[#475569]">
                                        No submissions yet
                                      </p>

                                      <p className="mt-1 text-xs text-[#94a3b8]">
                                        Students have not submitted this quiz.
                                      </p>

                                    </div>
                                  )}

                                  {/* RESULTS */}

                                  {quizResults.length >
                                    0 && (

                                    <div className="overflow-hidden rounded-xl border border-[#e2e8f0] bg-white">

                                      <div className="grid grid-cols-[1.8fr_0.7fr_0.8fr_1.3fr] border-b border-[#e2e8f0] bg-[#f8fafc] px-4 py-3 text-[10px] font-semibold uppercase tracking-wide text-[#64748b]">

                                        <span>
                                          Student
                                        </span>

                                        <span>
                                          Score
                                        </span>

                                        <span>
                                          Correct
                                        </span>

                                        <span>
                                          Submitted
                                        </span>

                                      </div>

                                      {quizResults.map(
                                        (
                                          submission
                                        ) => (

                                          <div
                                            key={
                                              submission.id
                                            }
                                            className="grid grid-cols-[1.8fr_0.7fr_0.8fr_1.3fr] items-center border-b border-[#f1f5f9] px-4 py-3 last:border-b-0"
                                          >

                                            {/* STUDENT */}

                                            <div className="flex items-center gap-3">

                                              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#dbeafe] text-[10px] font-bold text-[#2563eb]">

                                                {String(
                                                  submission.studentName ||
                                                    submission.studentId ||
                                                    "S"
                                                )
                                                  .slice(
                                                    0,
                                                    2
                                                  )
                                                  .toUpperCase()}

                                              </div>

                                              <div className="min-w-0">

                                                <p className="truncate text-[12px] font-semibold text-[#17233c]">

                                                  {submission.studentName ||
                                                    `Student ID #${submission.studentId}`}

                                                </p>

                                                <p className="truncate text-[10px] text-[#94a3b8]">

                                                  {submission.studentEmail ||
                                                    `Student ID #${submission.studentId}`}

                                                </p>

                                              </div>

                                            </div>

                                            {/* SCORE */}

                                            <div>

                                              <span
                                                className={`inline-flex rounded-lg px-2.5 py-1 text-[10px] font-semibold ${getScoreClasses(
                                                  submission.score
                                                )}`}
                                              >

                                                {
                                                  submission.score
                                                }%

                                              </span>

                                            </div>

                                            {/* CORRECT */}

                                            <p className="text-[12px] font-medium text-[#475569]">

                                              {
                                                submission.correctAnswers
                                              }
                                              /
                                              {
                                                submission.totalQuestions
                                              }

                                            </p>

                                            {/* SUBMITTED */}

                                            <p className="text-[11px] text-[#64748b]">

                                              {formatDate(
                                                submission.submittedAt
                                              )}

                                            </p>

                                          </div>
                                        )
                                      )}

                                    </div>
                                  )}

                                </div>
                              )}

                          </div>
                        )}

                      </div>
                    );
                  }
                )}

              </div>
            )}

          {/* EMPTY QUIZ STATE */}

          {!quizLoading &&
            !quizError &&
            quizzes.length ===
              0 && (

              <div className="px-6 pb-8 pt-4 text-center">

                <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-[#f1f5f9]">

                  <ClipboardList
                    className="h-6 w-6 text-[#94a3b8]"
                    strokeWidth={1.8}
                  />

                </div>

                <p className="mt-3 text-sm font-medium text-[#475569]">
                  No quizzes created yet.
                </p>

                <p className="mt-1 text-xs text-[#94a3b8]">
                  Create your first quiz to get started.
                </p>

                <button
                  type="button"
                  onClick={
                    handleCreateQuiz
                  }
                  className="mt-4 inline-flex items-center gap-2 rounded-lg bg-[#2563eb] px-4 py-2 text-xs font-semibold text-white hover:bg-blue-700"
                >

                  <Plus
                    className="h-4 w-4"
                    strokeWidth={2}
                  />

                  Create Quiz

                </button>

              </div>
            )}

        </section>

        {/* =====================================================
            UPLOADED DOCUMENTS
        ===================================================== */}

        <section className="mt-8 rounded-2xl border border-[#e2e8f0] bg-white">

          {/* HEADER */}

          <div className="flex items-center justify-between px-6 pb-3 pt-6">

            <h2 className="text-[16px] font-bold leading-5 text-[#17233c]">
              Uploaded Documents
            </h2>

            <div className="flex items-center gap-2">

              {teacherSubjects.map(
                (subject) => (

                  <button
                    key={
                      subject
                    }
                    type="button"
                    onClick={() =>
                      setSelectedSubject(
                        subject
                      )
                    }
                    className={`rounded-lg px-[12px] py-[7px] text-[12px] font-medium transition ${
                      selectedSubject ===
                      subject
                        ? "bg-[#2563eb] text-white"
                        : "bg-[#f1f5f9] text-[#64748b] hover:bg-gray-200"
                    }`}
                  >
                    {subject}
                  </button>

                )
              )}

            </div>

          </div>

          {/* DOCUMENTS */}

          <div className="px-6 pb-4">

            {filteredDocuments.map(
              (
                document,
                index
              ) => (

                <div
                  key={
                    document.id
                  }
                  className={`group flex h-[76px] items-center gap-4 px-4 ${
                    index !==
                    filteredDocuments.length -
                      1
                      ? "border-b border-[#f1f5f9]"
                      : ""
                  }`}
                >

                  {/* PDF ICON */}

                  <div className="flex h-[44px] w-[44px] shrink-0 items-center justify-center rounded-xl bg-[#fff1f2]">

                    <PdfIcon
                      className="h-[19px] w-[19px] text-[#ff3b30]"
                      strokeWidth={1.7}
                    />

                  </div>

                  {/* FILE INFO */}

                  <div className="min-w-0 flex-1">

                    <p className="truncate text-[14px] font-medium leading-5 text-[#17233c]">
                      {document.name}
                    </p>

                    <p className="mt-[2px] text-[12px] leading-4 text-[#94a3b8]">

                      {document.pages}{" "}
                      pages ·{" "}
                      {document.size}{" "}
                      · Uploaded{" "}

                      {
                        document.uploadedDate
                      }

                    </p>

                  </div>

                  {/* SUBJECT */}

                  <span
                    className={`rounded-lg px-3 py-[5px] text-[11px] font-medium ${
                      document.subject ===
                      "DBMS"
                        ? "bg-[#dbeafe] text-[#2563eb]"
                        : document.subject ===
                          "OS"
                          ? "bg-[#d1fae5] text-[#10b981]"
                          : document.subject ===
                            "CN"
                            ? "bg-[#fef3c7] text-[#f59e0b]"
                            : "bg-[#ede9fe] text-[#8b5cf6]"
                    }`}
                  >
                    {
                      document.subject
                    }
                  </span>

                  {/* DELETE */}

                  <button
                    type="button"
                    title={`Delete ${document.name}`}
                    aria-label={`Delete ${document.name}`}
                    onClick={() =>
                      handleDeleteDocument(
                        document.id
                      )
                    }
                    className="rounded-lg p-2 text-gray-300 opacity-0 transition hover:bg-red-50 hover:text-red-500 group-hover:opacity-100"
                  >

                    <Trash2
                      className="h-4 w-4"
                      strokeWidth={1.8}
                    />

                  </button>

                </div>
              )
            )}

            {/* EMPTY DOCUMENTS */}

            {filteredDocuments.length ===
              0 && (

              <div className="py-12 text-center">

                <FileText className="mx-auto h-8 w-8 text-gray-300" />

                <p className="mt-3 text-sm text-gray-500">
                  No documents found.
                </p>

              </div>
            )}

          </div>

        </section>

      </div>

    </div>
  );
}