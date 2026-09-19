import { useEffect, useState } from "react";
import {
  Brain,
  CheckCircle2,
  Target,
  TrendingUp,
  AlertCircle,
  Sparkles,
} from "lucide-react";

import WelcomeSection from "../../components/sections/WelcomeSection";
import StatisticsCards from "../../components/sections/StatisticsCards";
import SubjectsSection from "../../components/sections/SubjectsSection";
import RecentActivity from "../../components/sections/RecentActivity";
import QuickActions from "../../components/sections/QuickActions";
import AdaptivePracticeButton from "../../components/AdaptivePracticeButton";

// =====================================================
// API
// =====================================================

const API_BASE = "http://localhost:8080";

// =====================================================
// ADAPTIVE LEARNING INSIGHTS
// =====================================================

const AdaptiveLearningInsights = () => {
  const [analysis, setAnalysis] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // ---------------------------------------------------
  // GET LOGGED-IN STUDENT ID
  // ---------------------------------------------------

  const getStudentId = () => {
    const storedId =
      localStorage.getItem("userId");

    if (storedId) {
      const parsedId =
        Number(storedId);

      if (
        !Number.isNaN(parsedId) &&
        parsedId > 0
      ) {
        return parsedId;
      }
    }

    try {
      const storedUser =
        JSON.parse(
          localStorage.getItem("user") || "null"
        );

      const parsedId =
        storedUser?.id
          ? Number(storedUser.id)
          : null;

      return parsedId &&
        !Number.isNaN(parsedId)
        ? parsedId
        : null;

    } catch {
      return null;
    }
  };

  // ---------------------------------------------------
  // LOAD PERFORMANCE
  // ---------------------------------------------------

  useEffect(() => {
    const studentId =
      getStudentId();

    if (!studentId) {
      setError(
        "Student account not found."
      );

      setLoading(false);

      return;
    }

    let cancelled = false;

    const loadPerformance = async () => {

      try {

        setLoading(true);
        setError("");

        const response =
          await fetch(
            `${API_BASE}/api/performance/student/${studentId}`
          );

        const data =
          await response
            .json()
            .catch(() => ({}));

        if (!response.ok) {

          throw new Error(
            data?.error ||
              data?.message ||
              "Unable to load learning insights."
          );
        }

        if (!cancelled) {
          setAnalysis(data);
        }

      } catch (requestError) {

        console.error(
          "Adaptive learning insights error:",
          requestError
        );

        if (!cancelled) {

          setError(
            requestError?.message ||
              "Unable to load learning insights."
          );
        }

      } finally {

        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    loadPerformance();

    return () => {
      cancelled = true;
    };

  }, []);

  // ---------------------------------------------------
  // LOADING
  // ---------------------------------------------------

  if (loading) {

    return (
      <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">

        <div className="flex items-center gap-3">

          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50">

            <Brain
              size={20}
              className="animate-pulse text-blue-600"
            />

          </div>

          <div>

            <h2 className="text-lg font-semibold text-slate-900">
              Adaptive Learning Insights
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              Analyzing your learning performance...
            </p>

          </div>

        </div>

      </section>
    );
  }

  // ---------------------------------------------------
  // ERROR
  // ---------------------------------------------------

  if (error) {

    return (
      <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">

        <div className="flex items-start gap-3">

          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-red-50">

            <AlertCircle
              size={20}
              className="text-red-500"
            />

          </div>

          <div>

            <h2 className="text-lg font-semibold text-slate-900">
              Adaptive Learning Insights
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              {error}
            </p>

          </div>

        </div>

      </section>
    );
  }

  // ---------------------------------------------------
  // SAFE DEFAULTS
  // ---------------------------------------------------

  const averageScore =
    Number(
      analysis?.averageScore || 0
    );

  const totalQuizzes =
    Number(
      analysis?.totalQuizzes || 0
    );

  // ---------------------------------------------------
  // SORT ALL WEAK TOPICS BY LOWEST SCORE
  // ---------------------------------------------------

  const weakTopics =
    Array.isArray(
      analysis?.weakTopics
    )
      ? [...analysis.weakTopics].sort(
          (a, b) =>
            Number(
              a?.averageScore || 0
            ) -
            Number(
              b?.averageScore || 0
            )
        )
      : [];

  const strongTopics =
    Array.isArray(
      analysis?.strongTopics
    )
      ? analysis.strongTopics
      : [];

  // =====================================================
  // DYNAMIC AI RECOMMENDATION
  // =====================================================

  let recommendationTitle =
    "Keep building your skills";

  let recommendationText =
    "Continue practicing regularly. Your AI Tutor will adjust explanations and examples according to your performance.";

  if (
    totalQuizzes === 0
  ) {

    recommendationTitle =
      "Start your learning journey";

    recommendationText =
      "Complete your first quiz so the AI Tutor can understand your performance and personalize your learning.";

  } else if (
    weakTopics.length > 0
  ) {

    const priorityTopic =
      weakTopics[0];

    const additionalWeakTopics =
      weakTopics
        .slice(1, 3)
        .map(
          (topic) =>
            topic?.topicName
        )
        .filter(Boolean);

    if (
      additionalWeakTopics.length === 0
    ) {

      recommendationTitle =
        `Focus on ${priorityTopic.topicName}`;

    } else {

      recommendationTitle =
        `Focus on ${priorityTopic.topicName} and ${additionalWeakTopics.join(
          ", "
        )}`;
    }

    const priorityScore =
      Number(
        priorityTopic.averageScore || 0
      ).toFixed(0);

    if (
      additionalWeakTopics.length === 0
    ) {

      recommendationText =
        `${priorityTopic.topicName} currently has your lowest performance at ${priorityScore}%. Review the fundamentals, practice easier questions, and gradually move toward more difficult problems.`;

    } else {

      recommendationText =
        `${priorityTopic.topicName} needs the most attention at ${priorityScore}%. Strengthen its fundamentals first, then practice ${additionalWeakTopics.join(
          " and "
        )}. Your AI Tutor will adapt explanations and difficulty as your performance improves.`;
    }

  } else if (
    averageScore >= 80
  ) {

    recommendationTitle =
      "Ready for more challenge";

    recommendationText =
      "Your recent quiz performance is strong. Try deeper explanations, challenging examples, and higher-level practice.";

  } else {

    recommendationTitle =
      "Keep strengthening your basics";

    recommendationText =
      "Your performance is developing. Continue with clear explanations, examples, and regular practice before moving to harder questions.";
  }

  // ---------------------------------------------------
  // RENDER
  // ---------------------------------------------------

  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">

      {/* ============================================= */}
      {/* HEADER */}
      {/* ============================================= */}

      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">

        <div className="flex items-center gap-3">

          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-50">

            <Brain
              size={22}
              className="text-blue-600"
            />

          </div>

          <div>

            <h2 className="text-lg font-semibold text-slate-900">
              Adaptive Learning Insights
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              Personalized from your quiz performance
            </p>

          </div>

        </div>

        <div className="flex items-center gap-2 rounded-xl bg-slate-50 px-3 py-2">

          <TrendingUp
            size={16}
            className="text-blue-600"
          />

          <span className="text-sm font-semibold text-slate-700">
            {averageScore.toFixed(0)}% average
          </span>

        </div>

      </div>

      {/* ============================================= */}
      {/* STATS */}
      {/* ============================================= */}

      <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-3">

        {/* Average */}

        <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">

          <div className="flex items-center gap-2">

            <Target
              size={17}
              className="text-blue-600"
            />

            <span className="text-xs font-semibold uppercase tracking-wide text-slate-500">
              Average Score
            </span>

          </div>

          <p className="mt-2 text-2xl font-bold text-slate-900">
            {averageScore.toFixed(0)}%
          </p>

        </div>

        {/* Completed Quizzes */}

        <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">

          <div className="flex items-center gap-2">

            <CheckCircle2
              size={17}
              className="text-emerald-600"
            />

            <span className="text-xs font-semibold uppercase tracking-wide text-slate-500">
              Quizzes Completed
            </span>

          </div>

          <p className="mt-2 text-2xl font-bold text-slate-900">
            {totalQuizzes}
          </p>

        </div>

        {/* Weak Topics */}

        <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">

          <div className="flex items-center gap-2">

            <AlertCircle
              size={17}
              className="text-orange-500"
            />

            <span className="text-xs font-semibold uppercase tracking-wide text-slate-500">
              Needs Attention
            </span>

          </div>

          <p className="mt-2 text-2xl font-bold text-slate-900">
            {weakTopics.length}
          </p>

        </div>

      </div>

      {/* ============================================= */}
      {/* AI RECOMMENDATION */}
      {/* ============================================= */}

      <div className="mt-6 rounded-xl border border-blue-100 bg-blue-50 p-5">

        <div className="flex items-start gap-3">

          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-white">

            <Sparkles
              size={17}
              className="text-blue-600"
            />

          </div>

          <div className="min-w-0">

            <p className="text-xs font-semibold uppercase tracking-wide text-blue-600">
              AI Recommendation
            </p>

            <h3 className="mt-1 text-base font-semibold text-slate-900">
              {recommendationTitle}
            </h3>

            <p className="mt-2 text-sm leading-6 text-slate-600">
              {recommendationText}
            </p>

          </div>

        </div>

      </div>

      {/* ============================================= */}
      {/* WEAK + STRONG TOPICS */}
      {/* ============================================= */}

      <div className="mt-6 grid grid-cols-1 gap-5 lg:grid-cols-2">

        {/* =========================================== */}
        {/* WEAK TOPICS */}
        {/* =========================================== */}

        <div>

          <div className="mb-3 flex items-center gap-2">

            <AlertCircle
              size={17}
              className="text-orange-500"
            />

            <h3 className="text-sm font-semibold text-slate-900">
              Topics That Need Attention
            </h3>

          </div>

          {weakTopics.length === 0 ? (

            <div className="rounded-xl border border-dashed border-slate-200 p-4">

              <p className="text-sm text-slate-500">
                No weak topic has been detected yet.
              </p>

            </div>

          ) : (

            <div className="space-y-3">

              {weakTopics
                .slice(0, 4)
                .map(
                  (topic) => (

                    <div
                      key={
                        topic.topicId
                      }
                      className="rounded-xl border border-slate-200 p-4"
                    >

                      <div className="flex items-center justify-between gap-3">

                        <div className="min-w-0">

                          <p className="truncate text-sm font-semibold text-slate-800">
                            {topic.topicName}
                          </p>

                          <p className="mt-1 text-xs text-slate-400">
                            {topic.subjectName}
                          </p>

                        </div>

                        <span className="shrink-0 rounded-lg bg-orange-50 px-2.5 py-1 text-xs font-semibold text-orange-600">
                          {Number(
                            topic.averageScore || 0
                          ).toFixed(0)}
                          %
                        </span>

                      </div>

                      {/* Progress */}

                      <div className="mt-3 h-2 overflow-hidden rounded-full bg-slate-100">

                        <div
                          className="h-full rounded-full bg-orange-400"
                          style={{
                            width: `${Math.min(
                              100,
                              Math.max(
                                0,
                                Number(
                                  topic.averageScore || 0
                                )
                              )
                            )}%`,
                          }}
                        />

                      </div>

                      {/* ================================= */}
                      {/* ADAPTIVE PRACTICE BUTTON */}
                      {/* ================================= */}

                      <AdaptivePracticeButton
                        topicId={
                          topic.topicId
                        }
                        topicName={
                          topic.topicName
                        }
                      />

                    </div>

                  )
                )}

            </div>

          )}

        </div>

        {/* =========================================== */}
        {/* STRONG TOPICS */}
        {/* =========================================== */}

        <div>

          <div className="mb-3 flex items-center gap-2">

            <CheckCircle2
              size={17}
              className="text-emerald-600"
            />

            <h3 className="text-sm font-semibold text-slate-900">
              Strong Topics
            </h3>

          </div>

          {strongTopics.length === 0 ? (

            <div className="rounded-xl border border-dashed border-slate-200 p-4">

              <p className="text-sm text-slate-500">
                No strong topic has been detected yet.
              </p>

            </div>

          ) : (

            <div className="space-y-3">

              {strongTopics
                .slice(0, 4)
                .map(
                  (topic) => (

                    <div
                      key={
                        topic.topicId
                      }
                      className="rounded-xl border border-slate-200 p-4"
                    >

                      <div className="flex items-center justify-between gap-3">

                        <div className="min-w-0">

                          <p className="truncate text-sm font-semibold text-slate-800">
                            {topic.topicName}
                          </p>

                          <p className="mt-1 text-xs text-slate-400">
                            {topic.subjectName}
                          </p>

                        </div>

                        <span className="shrink-0 rounded-lg bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-600">
                          {Number(
                            topic.averageScore || 0
                          ).toFixed(0)}
                          %
                        </span>

                      </div>

                      <div className="mt-3 h-2 overflow-hidden rounded-full bg-slate-100">

                        <div
                          className="h-full rounded-full bg-emerald-500"
                          style={{
                            width: `${Math.min(
                              100,
                              Math.max(
                                0,
                                Number(
                                  topic.averageScore || 0
                                )
                              )
                            )}%`,
                          }}
                        />

                      </div>

                    </div>

                  )
                )}

            </div>

          )}

        </div>

      </div>

    </section>
  );
};

// =====================================================
// DASHBOARD PAGE
// =====================================================

const DashboardPage = () => {
  return (
    <div className="min-h-screen bg-slate-50 px-8 py-7 pt-[96px]">

      <WelcomeSection />

      <StatisticsCards />

      {/* ================================================= */}
      {/* ADAPTIVE AI */}
      {/* ================================================= */}

      <div className="mt-8">
        <AdaptiveLearningInsights />
      </div>

      {/* ================================================= */}
      {/* EXISTING DASHBOARD CONTENT */}
      {/* ================================================= */}

      <div className="mt-8 grid grid-cols-1 gap-6 xl:grid-cols-[minmax(0,2fr)_380px]">

        {/* Left */}

        <div>
          <SubjectsSection />
        </div>

        {/* Right */}

        <div className="space-y-6">
          <RecentActivity />
          <QuickActions />
        </div>

      </div>

    </div>
  );
};

export default DashboardPage;