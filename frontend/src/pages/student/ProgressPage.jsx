import {
  BarChart3,
  CalendarDays,
  ClipboardCheck,
  Loader2,
  Target,
  TrendingDown,
} from "lucide-react";

import { useEffect, useMemo, useState } from "react";

const API_URL = "http://localhost:8080";

const colorStyles = {
  blue: {
    progress: "bg-blue-600",
    text: "text-blue-600",
  },
  green: {
    progress: "bg-emerald-500",
    text: "text-emerald-600",
  },
  orange: {
    progress: "bg-orange-500",
    text: "text-orange-600",
  },
  purple: {
    progress: "bg-violet-500",
    text: "text-violet-600",
  },
};

function getUserId() {
  const id = localStorage.getItem("userId");
  if (id) return Number(id);

  try {
    const user = JSON.parse(localStorage.getItem("user") || "null");
    return user?.id ? Number(user.id) : null;
  } catch {
    return null;
  }
}

function formatDate(value) {
  if (!value) return "Unknown date";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Unknown date";

  return date.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function formatDateTime(value) {
  if (!value) return "Unknown date";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Unknown date";

  return date.toLocaleString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function ProgressCircle({ value = 0, label, color = "blue" }) {
  const safeValue = Math.min(100, Math.max(0, Number(value) || 0));

  const ringColor =
    color === "blue"
      ? "#2563eb"
      : color === "green"
        ? "#10b981"
        : color === "orange"
          ? "#f59e0b"
          : "#8b5cf6";

  return (
    <div className="flex flex-col items-center">
      <div
        className="relative flex h-24 w-24 items-center justify-center rounded-full"
        style={{
          background: `conic-gradient(${ringColor} ${safeValue}%, #eef0f3 ${safeValue}%)`,
        }}
      >
        <div className="flex h-[74px] w-[74px] items-center justify-center rounded-full bg-white">
          <span className="text-lg font-bold text-slate-900">
            {Math.round(safeValue)}%
          </span>
        </div>
      </div>

      <p className={`mt-3 text-sm font-medium ${colorStyles[color]?.text || "text-blue-600"}`}>
        {label}
      </p>
    </div>
  );
}

function scoreClasses(score) {
  const value = Number(score) || 0;

  if (value >= 80) return "bg-emerald-50 text-emerald-700";
  if (value >= 50) return "bg-orange-50 text-orange-700";
  return "bg-red-50 text-red-700";
}

function ProgressPage() {
  const [subjects, setSubjects] = useState([]);
  const [quizAttempts, setQuizAttempts] = useState([]);
  const [quizzes, setQuizzes] = useState([]);
  const [recentActivity, setRecentActivity] = useState([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const userId = getUserId();

  useEffect(() => {
    let cancelled = false;

    const loadProgress = async () => {
      try {
        setLoading(true);
        setError("");

        if (!userId) {
          throw new Error(
            "Student account not found. Please log in again."
          );
        }

        const [
          subjectsResponse,
          progressResponse,
          attemptsResponse,
          quizzesResponse,
          recentResponse,
        ] = await Promise.all([
          fetch(`${API_URL}/api/subjects`),
          fetch(`${API_URL}/api/progress/user/${userId}/subjects`),
          fetch(`${API_URL}/api/quiz-attempts/student/${userId}`),
          fetch(`${API_URL}/api/quizzes`),
          fetch(`${API_URL}/api/progress/user/${userId}/recent`),
        ]);

        if (!subjectsResponse.ok)
          throw new Error("Failed to load subjects.");

        if (!progressResponse.ok)
          throw new Error("Failed to load subject progress.");

        if (!attemptsResponse.ok)
          throw new Error("Failed to load quiz attempts.");

        if (!quizzesResponse.ok)
          throw new Error("Failed to load quizzes.");

        const [
          subjectsData,
          progressData,
          attemptsData,
          quizzesData,
          recentData,
        ] = await Promise.all([
          subjectsResponse.json(),
          progressResponse.json(),
          attemptsResponse.json(),
          quizzesResponse.json(),
          recentResponse.json(),
        ]);

        if (cancelled) return;

        const colors = ["blue", "green", "orange", "purple"];

        const mappedSubjects = Array.isArray(subjectsData)
          ? subjectsData.map((subject, index) => ({
              id: subject.id,
              name: subject.name || "Subject",
              code: subject.code || "",
              progress:
                Number(progressData?.[subject.id]) || 0,
              color: colors[index % colors.length],
            }))
          : [];

        setSubjects(mappedSubjects);
        setQuizAttempts(
          Array.isArray(attemptsData) ? attemptsData : []
        );
        setQuizzes(
          Array.isArray(quizzesData) ? quizzesData : []
        );
        setRecentActivity(
          Array.isArray(recentData) ? recentData : []
        );
      } catch (err) {
        console.error("Progress loading error:", err);
        if (!cancelled) {
          setError(
            err.message || "Unable to load progress."
          );
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    loadProgress();

    return () => {
      cancelled = true;
    };
  }, [userId]);

  const quizById = useMemo(() => {
    const map = new Map();

    quizzes.forEach((quiz) => {
      map.set(Number(quiz.id), quiz);
    });

    return map;
  }, [quizzes]);

  const overallProgress = useMemo(() => {
    if (!subjects.length) return 0;

    const total = subjects.reduce(
      (sum, subject) => sum + (Number(subject.progress) || 0),
      0
    );

    return Math.round(total / subjects.length);
  }, [subjects]);

  const quizAverageBySubject = useMemo(() => {
    const totals = new Map();

    quizAttempts.forEach((attempt) => {
      const quiz = quizById.get(Number(attempt.quizId));
      if (!quiz) return;

      const subjectId = Number(quiz.subjectId);
      const score = Number(attempt.score);

      if (!Number.isFinite(score)) return;

      const current = totals.get(subjectId) || {
        total: 0,
        count: 0,
      };

      current.total += score;
      current.count += 1;
      totals.set(subjectId, current);
    });

    const result = new Map();

    totals.forEach((item, subjectId) => {
      result.set(
        subjectId,
        Math.round(item.total / item.count)
      );
    });

    return result;
  }, [quizAttempts, quizById]);

  const recentQuizScores = useMemo(() => {
    return [...quizAttempts]
      .filter((attempt) => attempt?.submittedAt)
      .sort(
        (a, b) =>
          new Date(b.submittedAt).getTime() -
          new Date(a.submittedAt).getTime()
      )
      .slice(0, 5)
      .map((attempt) => {
        const quiz = quizById.get(Number(attempt.quizId));

        const subject = subjects.find(
          (item) =>
            Number(item.id) === Number(quiz?.subjectId)
        );

        return {
          id: attempt.id,
          title:
            quiz?.title || `Quiz #${attempt.quizId}`,
          subject:
            subject?.code ||
            subject?.name ||
            "Subject",
          date: attempt.submittedAt,
          score: Number(attempt.score) || 0,
        };
      });
  }, [quizAttempts, quizById, subjects]);

  const areasToImprove = useMemo(
    () =>
      [...subjects]
        .sort((a, b) => a.progress - b.progress)
        .slice(0, 4),
    [subjects]
  );

  const learningHistory = useMemo(() => {
    const entries = [];

    recentActivity.forEach((activity) => {
      if (!activity.completedAt) return;

      entries.push({
        date: activity.completedAt,
        text: `Completed topic: ${
          activity.topic?.title ||
          activity.topicTitle ||
          "Completed topic"
        }`,
      });
    });

    quizAttempts.forEach((attempt) => {
      if (!attempt.submittedAt) return;

      const quiz = quizById.get(Number(attempt.quizId));

      entries.push({
        date: attempt.submittedAt,
        text: `Completed Quiz: ${
          quiz?.title || `Quiz #${attempt.quizId}`
        } (${Number(attempt.score) || 0}%)`,
      });
    });

    entries.sort(
      (a, b) =>
        new Date(b.date).getTime() -
        new Date(a.date).getTime()
    );

    const groups = new Map();

    entries.forEach((entry) => {
      const key = formatDate(entry.date);

      if (!groups.has(key)) {
        groups.set(key, {
          date: key,
          activities: [],
        });
      }

      groups.get(key).activities.push(entry.text);
    });

    return Array.from(groups.values()).slice(0, 5);
  }, [recentActivity, quizAttempts, quizById]);

  const learningInsight = useMemo(() => {
    if (!subjects.length) {
      return "Start completing topics and quizzes to build your learning progress.";
    }

    const sorted = [...subjects].sort(
      (a, b) => b.progress - a.progress
    );

    const strongest = sorted[0];
    const weakest = sorted[sorted.length - 1];

    if (strongest.id === weakest.id) {
      return `Your current progress in ${strongest.name} is ${strongest.progress}%. Keep completing topics to improve.`;
    }

    return `Your strongest subject is ${strongest.name} at ${strongest.progress}%. Focus more on ${weakest.name}, currently at ${weakest.progress}%, to improve your overall progress.`;
  }, [subjects]);

  if (loading) {
    return (
      <div className="min-h-full bg-slate-50 px-6 pb-10 pt-20">
        <div className="mx-auto flex max-w-[1100px] items-center justify-center rounded-2xl border border-slate-200 bg-white p-16 shadow-sm">
          <div className="flex items-center gap-3 text-slate-500">
            <Loader2
              size={22}
              className="animate-spin text-blue-600"
            />
            <span className="text-sm font-medium">
              Loading your progress...
            </span>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-full bg-slate-50 px-6 pb-10 pt-20">
        <div className="mx-auto max-w-3xl rounded-2xl border border-red-200 bg-red-50 p-8">
          <h1 className="text-lg font-semibold text-red-700">
            Unable to load progress
          </h1>
          <p className="mt-2 text-sm text-red-600">
            {error}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-full bg-slate-50 px-6 pb-10 pt-20">
      <div className="mx-auto max-w-[1100px]">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-900">
            Learning Progress
          </h1>
          <p className="mt-2 text-sm text-slate-500">
            Track your performance and identify areas for improvement.
          </p>
        </div>

        <div className="grid grid-cols-2 gap-4 xl:grid-cols-5">
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <ProgressCircle
              value={overallProgress}
              label="Overall Progress"
              color="blue"
            />
          </div>

          {subjects.map((subject) => (
            <div
              key={subject.id}
              className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"
            >
              <ProgressCircle
                value={subject.progress}
                label={subject.code || subject.name}
                color={subject.color}
              />
            </div>
          ))}
        </div>

        <div className="mt-8 grid grid-cols-1 gap-6 xl:grid-cols-[1.8fr_1fr]">
          <div className="space-y-6">
            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
              <h2 className="text-lg font-bold text-slate-900">
                Subject-wise Progress
              </h2>

              <p className="mt-1 text-xs text-slate-400">
                Progress is calculated from completed topics.
              </p>

              <div className="mt-6 space-y-6">
                {subjects.length === 0 ? (
                  <p className="text-sm text-slate-500">
                    No subjects available yet.
                  </p>
                ) : (
                  subjects.map((subject) => {
                    const styles =
                      colorStyles[subject.color] ||
                      colorStyles.blue;

                    const quizAverage =
                      quizAverageBySubject.get(
                        Number(subject.id)
                      );

                    return (
                      <div key={subject.id}>
                        <div className="flex items-end justify-between gap-4">
                          <div>
                            <p className="text-sm font-medium text-slate-900">
                              {subject.name}
                            </p>

                            <p className="mt-1 text-xs text-slate-400">
                              Quiz avg:{" "}
                              {quizAverage !== undefined
                                ? `${quizAverage}%`
                                : "No quiz attempts yet"}
                            </p>
                          </div>

                          <span
                            className={`text-sm font-semibold ${styles.text}`}
                          >
                            {subject.progress}%
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
                  })
                )}
              </div>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-bold text-slate-900">
                  Recent Quiz Scores
                </h2>

                <ClipboardCheck
                  size={18}
                  className="text-blue-600"
                />
              </div>

              <div className="mt-5 space-y-4">
                {recentQuizScores.length === 0 ? (
                  <div className="rounded-xl bg-slate-50 p-5 text-center">
                    <p className="text-sm font-medium text-slate-700">
                      No quiz attempts yet
                    </p>
                    <p className="mt-1 text-xs text-slate-400">
                      Completed quizzes will appear here.
                    </p>
                  </div>
                ) : (
                  recentQuizScores.map((quiz) => (
                    <div
                      key={quiz.id}
                      className="flex items-center gap-4"
                    >
                      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-slate-100 text-slate-500">
                        <ClipboardCheck size={17} />
                      </div>

                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-medium text-slate-900">
                          {quiz.title}
                        </p>

                        <p className="mt-0.5 text-xs text-slate-400">
                          {quiz.subject} ·{" "}
                          {formatDate(quiz.date)}
                        </p>
                      </div>

                      <div className="flex items-center gap-2">
                        <div className="hidden w-24 overflow-hidden rounded-full bg-slate-100 sm:block">
                          <div
                            className={`h-1.5 rounded-full ${
                              quiz.score >= 80
                                ? "bg-emerald-500"
                                : quiz.score >= 50
                                  ? "bg-orange-500"
                                  : "bg-red-500"
                            }`}
                            style={{
                              width: `${quiz.score}%`,
                            }}
                          />
                        </div>

                        <span
                          className={`rounded-full px-2.5 py-1 text-xs font-semibold ${scoreClasses(
                            quiz.score
                          )}`}
                        >
                          {quiz.score}%
                        </span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <div className="flex items-center gap-2">
                <TrendingDown
                  size={18}
                  className="text-red-500"
                />

                <h2 className="text-lg font-bold text-slate-900">
                  Areas to Improve
                </h2>
              </div>

              <p className="mt-1 text-xs text-slate-400">
                Subjects with the lowest current progress.
              </p>

              <div className="mt-5 space-y-3">
                {areasToImprove.length === 0 ? (
                  <p className="text-sm text-slate-500">
                    No progress data available yet.
                  </p>
                ) : (
                  areasToImprove.map((subject) => (
                    <div
                      key={subject.id}
                      className="rounded-xl bg-red-50 p-4"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <p className="text-sm font-medium text-slate-800">
                            {subject.name}
                          </p>

                          <p className="mt-1 text-[11px] text-slate-400">
                            {subject.code || "Subject"}
                          </p>
                        </div>

                        <span className="text-sm font-semibold text-red-500">
                          {subject.progress}%
                        </span>
                      </div>

                      <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-red-100">
                        <div
                          className="h-full rounded-full bg-red-500"
                          style={{
                            width: `${subject.progress}%`,
                          }}
                        />
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

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
                {learningHistory.length === 0 ? (
                  <div className="rounded-xl bg-slate-50 p-5 text-center">
                    <p className="text-sm font-medium text-slate-700">
                      No learning activity yet
                    </p>

                    <p className="mt-1 text-xs text-slate-400">
                      Topic completions and quiz submissions will appear here.
                    </p>
                  </div>
                ) : (
                  learningHistory.map((group) => (
                    <div key={group.date}>
                      <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-400">
                        {group.date}
                      </p>

                      <div className="mt-2 space-y-2">
                        {group.activities
                          .slice(0, 4)
                          .map((activity, index) => (
                            <div
                              key={`${group.date}-${index}-${activity}`}
                              className="flex items-start gap-2"
                            >
                              <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-blue-500" />

                              <p className="text-xs leading-5 text-slate-600">
                                {activity}
                              </p>
                            </div>
                          ))}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

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
                    {learningInsight}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {quizAttempts.length > 0 && (
          <div className="mt-6 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
                <BarChart3 size={19} />
              </div>

              <div>
                <p className="text-sm font-semibold text-slate-900">
                  Quiz activity
                </p>

                <p className="text-xs text-slate-500">
                  {quizAttempts.length} quiz submission
                  {quizAttempts.length !== 1 ? "s" : ""}{" "}
                  recorded in your account.
                </p>
              </div>

              <div className="ml-auto hidden text-xs text-slate-400 sm:block">
                Last submission:{" "}
                {formatDateTime(
                  [...quizAttempts].sort(
                    (a, b) =>
                      new Date(b.submittedAt).getTime() -
                      new Date(a.submittedAt).getTime()
                  )[0]?.submittedAt
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default ProgressPage;
