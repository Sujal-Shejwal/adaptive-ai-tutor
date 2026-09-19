import { useState } from "react";
import {
  Brain,
  Loader2,
} from "lucide-react";

const API_BASE =
  "http://localhost:8080";

const AdaptivePracticeButton = ({
  topicId,
  topicName,
}) => {

  const [loading, setLoading] =
    useState(false);

  const [error, setError] =
    useState("");

  // =====================================================
  // GET STUDENT ID
  // =====================================================

  const getStudentId = () => {

    const storedId =
      localStorage.getItem(
        "userId"
      );

    if (storedId) {

      const id =
        Number(storedId);

      if (
        Number.isInteger(id) &&
        id > 0
      ) {
        return id;
      }
    }

    try {

      const storedUser =
        JSON.parse(
          localStorage.getItem(
            "user"
          ) || "null"
        );

      const id =
        Number(
          storedUser?.id
        );

      if (
        Number.isInteger(id) &&
        id > 0
      ) {
        return id;
      }

    } catch {
      // Ignore invalid localStorage data.
    }

    return null;
  };

  // =====================================================
  // START ADAPTIVE PRACTICE
  // =====================================================

  const handlePractice =
    async () => {

      const studentId =
        getStudentId();

      // -------------------------------------------------
      // VALIDATE STUDENT
      // -------------------------------------------------

      if (!studentId) {

        setError(
          "Student account not found. Please log in again."
        );

        return;
      }

      // -------------------------------------------------
      // VALIDATE TOPIC
      // -------------------------------------------------

      if (!topicId) {

        setError(
          "Topic information is unavailable."
        );

        return;
      }

      try {

        setLoading(true);
        setError("");

        console.log(
          "Starting adaptive practice:",
          {
            studentId,
            topicId,
            topicName,
          }
        );

        // -------------------------------------------------
        // GENERATE ADAPTIVE QUIZ
        // -------------------------------------------------

        const response =
          await fetch(
            `${API_BASE}/api/adaptive/quiz`,
            {
              method: "POST",

              headers: {
                "Content-Type":
                  "application/json",
              },

              body:
                JSON.stringify({
                  studentId,
                  topicId:
                    Number(topicId),
                  questionCount: 5,
                  duration: 15,
                  deadlineHours: 12,
                }),
            }
          );

        const data =
          await response
            .json()
            .catch(
              () => ({})
            );

        console.log(
          "Adaptive quiz response:",
          data
        );

        // -------------------------------------------------
        // API ERROR
        // -------------------------------------------------

        if (!response.ok) {

          throw new Error(
            data?.error ||
              data?.message ||
              "Unable to generate adaptive practice."
          );
        }

        // -------------------------------------------------
        // GET GENERATED QUIZ
        // -------------------------------------------------

        const generatedQuiz =
          data?.quiz;

        if (
          !generatedQuiz ||
          !generatedQuiz.id
        ) {

          throw new Error(
            "Adaptive quiz was generated, but quiz information is missing."
          );
        }

        // -------------------------------------------------
        // GET SUBJECT ID
        // -------------------------------------------------

        const generatedSubjectId =
          generatedQuiz?.subject?.id;

        if (!generatedSubjectId) {

          throw new Error(
            "Generated quiz does not contain subject information."
          );
        }

        // -------------------------------------------------
        // GET QUIZ ID
        // -------------------------------------------------

        const quizId =
          generatedQuiz.id;

        // -------------------------------------------------
        // EXACT QUIZ URL
        // -------------------------------------------------

        const quizUrl =
          `/student/quiz/${generatedSubjectId}?quizId=${quizId}`;

        console.log(
          "Opening adaptive quiz:",
          quizUrl
        );

        // -------------------------------------------------
        // USE HARD NAVIGATION
        // -------------------------------------------------
        // This avoids any conflicting component/router
        // navigation state and forces AppRoutes to load
        // QuizPage with the exact quizId.
        // -------------------------------------------------

        window.location.assign(
          quizUrl
        );

      } catch (requestError) {

        console.error(
          "Adaptive practice error:",
          requestError
        );

        setError(
          requestError?.message ||
            "Unable to start adaptive practice."
        );

      } finally {

        setLoading(false);
      }
    };

  // =====================================================
  // UI
  // =====================================================

  return (
    <div className="mt-4">

      <button
        type="button"
        onClick={
          handlePractice
        }
        disabled={
          loading
        }
        className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-blue-300"
      >

        {loading ? (

          <>
            <Loader2
              size={16}
              className="animate-spin"
            />

            Generating Practice...
          </>

        ) : (

          <>
            <Brain
              size={16}
            />

            Practice This Topic
          </>

        )}

      </button>

      {error && (

        <p className="mt-2 text-xs text-red-600">
          {error}
        </p>

      )}

      <p className="mt-2 text-xs text-slate-400">
        AI will adjust the quiz difficulty using your
        performance in{" "}
        {topicName ||
          "this topic"}.
      </p>

    </div>
  );
};

export default AdaptivePracticeButton;