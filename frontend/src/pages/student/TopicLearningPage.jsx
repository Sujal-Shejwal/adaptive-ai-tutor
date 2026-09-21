import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

import {
  ArrowLeft,
  BookOpen,
  CheckCircle2,
  FileText,
  ExternalLink,
  LibraryBig,
  Loader2,
  AlertCircle,
  Video,
} from "lucide-react";

const API_URL = "http://localhost:8080";

const TopicLearningPage = () => {
  const { topicId } = useParams();
  const navigate = useNavigate();

  const [topic, setTopic] = useState(null);
  const [notes, setNotes] = useState([]);
  const [videos, setVideos] = useState([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // =====================================================
  // TOPIC PROGRESS STATE
  // =====================================================

  const [completed, setCompleted] = useState(false);
  const [progressLoading, setProgressLoading] = useState(false);

  // =====================================================
  // GET LOGGED-IN USER ID
  // =====================================================

  const getUserId = () => {
    try {
      // Primary source used by the login flow.
      const storedId =
        localStorage.getItem("userId");

      if (storedId) {
        return storedId;
      }

      // Fallback for sessions that stored the complete user object.
      const storedUser =
        JSON.parse(
          localStorage.getItem("user") || "null"
        );

      return storedUser?.id
        ? String(storedUser.id)
        : null;
    } catch (error) {
      console.error(
        "Unable to read logged-in user:",
        error
      );

      return null;
    }
  };

  // =====================================================
  // LOAD TOPIC + NOTES + PROGRESS
  // =====================================================

  useEffect(() => {
    loadTopicData();
  }, [topicId]);

  const loadTopicData = async () => {
    try {
      setLoading(true);
      setError("");

      // -------------------------------------------------
      // GET TOPIC
      // -------------------------------------------------

      const topicResponse = await fetch(
        `${API_URL}/api/topics/${topicId}`
      );

      if (!topicResponse.ok) {
        throw new Error("Unable to load topic");
      }

      const topicData = await topicResponse.json();

      setTopic(topicData);

      // -------------------------------------------------
      // GET NOTES FOR THIS TOPIC
      // -------------------------------------------------

      const notesResponse = await fetch(
        `${API_URL}/api/notes/topic/${topicId}`
      );

      if (!notesResponse.ok) {
        throw new Error("Unable to load learning materials");
      }

      const notesData = await notesResponse.json();

      setNotes(notesData);

      // -------------------------------------------------
      // GET VIDEOS FOR THIS TOPIC
      // -------------------------------------------------

      try {
        const videosResponse = await fetch(
          `${API_URL}/api/videos/topic/${topicId}`
        );

        if (videosResponse.ok) {
          const videosData = await videosResponse.json();
          setVideos(Array.isArray(videosData) ? videosData : []);
        } else {
          console.warn(
            "Unable to load topic videos:",
            videosResponse.status
          );
          setVideos([]);
        }
      } catch (videoError) {
        console.error(
          "Topic videos loading error:",
          videoError
        );
        setVideos([]);
      }

      // -------------------------------------------------
      // GET TOPIC PROGRESS
      // -------------------------------------------------

      const userId = getUserId();

      if (userId) {
        const progressResponse = await fetch(
          `${API_URL}/api/progress/user/${userId}/topic/${topicId}`
        );

        if (progressResponse.ok) {
          const progressData =
            await progressResponse.json();

          setCompleted(
            progressData?.completed === true ||
            progressData?.isCompleted === true
          );
        } else if (progressResponse.status === 404) {
          // No progress record yet.
          setCompleted(false);
        } else {
          throw new Error(
            "Unable to load topic progress."
          );
        }
      } else {
        console.warn("No logged-in user ID found.");
        setCompleted(false);
      }
    } catch (err) {
      console.error("Topic loading error:", err);

      setVideos([]);

      setError(
        err.message || "Something went wrong while loading the topic."
      );
    } finally {
      setLoading(false);
    }
  };

  // =====================================================
  // OPEN PDF
  // =====================================================

  const openPdf = (noteId) => {
    const pdfUrl = `${API_URL}/api/notes/${noteId}/file`;

    window.open(
      pdfUrl,
      "_blank",
      "noopener,noreferrer"
    );
  };

  // =====================================================
  // MARK TOPIC COMPLETE
  // =====================================================

  const handleMarkComplete = async () => {
    try {
      const userId = getUserId();

      // Make sure user ID exists
      if (!userId) {
        alert("User session not found. Please login again.");
        return;
      }

      setProgressLoading(true);

      console.log("Marking topic complete...");
      console.log("User ID:", userId);
      console.log("Topic ID:", topicId);

      const response = await fetch(
        `${API_URL}/api/progress/user/${userId}/topic/${topicId}/complete`,
        {
          method: "POST",
          headers: {
            Accept: "application/json",
          },
        }
      );

      if (!response.ok) {
        const errorText = await response.text();

        console.error(
          "Progress API error:",
          response.status,
          errorText
        );

        throw new Error(
          errorText || "Unable to mark topic as complete"
        );
      }

      const progressData = await response.json();

      console.log("Topic progress saved:", progressData);

      // Update UI immediately
      setCompleted(true);
    } catch (error) {
      console.error("Progress error:", error);

      alert(
        error.message ||
          "Something went wrong while saving progress."
      );
    } finally {
      setProgressLoading(false);
    }
  };

  // =====================================================
  // LOADING
  // =====================================================

  if (loading) {
    return (
      <div className="flex min-h-[70vh] items-center justify-center">
        <div className="flex items-center gap-3 text-slate-500">
          <Loader2 className="h-5 w-5 animate-spin text-blue-600" />

          <span className="text-sm font-medium">
            Loading topic...
          </span>
        </div>
      </div>
    );
  }

  // =====================================================
  // ERROR
  // =====================================================

  if (error) {
    return (
      <div className="flex min-h-[70vh] items-center justify-center px-6">
        <div className="flex max-w-md items-start gap-3 rounded-2xl border border-red-200 bg-red-50 px-5 py-4">
          <AlertCircle className="mt-0.5 h-5 w-5 flex-shrink-0 text-red-500" />

          <div>
            <p className="text-sm font-semibold text-red-700">
              Unable to load topic
            </p>

            <p className="mt-1 text-sm text-red-600">
              {error}
            </p>

            <button
              onClick={loadTopicData}
              className="mt-3 rounded-lg bg-red-600 px-3 py-2 text-xs font-semibold text-white transition hover:bg-red-700"
            >
              Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  // =====================================================
  // TOPIC NOT FOUND
  // =====================================================

  if (!topic) {
    return (
      <div className="flex min-h-[70vh] items-center justify-center">
        <p className="text-sm text-slate-500">
          Topic not found.
        </p>
      </div>
    );
  }

  // =====================================================
  // MAIN UI
  // =====================================================

  return (
    <div className="min-h-screen bg-slate-50 px-8 py-7 pt-[96px]">

      {/* =================================================
          BACK TO UNIT
      ================================================= */}

      <button
        onClick={() => navigate(-1)}
        className="mb-6 flex items-center gap-2 border-none bg-transparent p-0 text-sm font-medium text-blue-600 transition hover:text-blue-700"
      >
        <ArrowLeft className="h-4 w-4" />

        Back to Unit
      </button>

      {/* =================================================
          TOPIC HEADER
      ================================================= */}

      <section className="mb-6 rounded-2xl border border-slate-200 bg-white p-7 shadow-sm">

        <div className="flex items-center gap-5">

          {/* Icon */}

          <div className="flex h-16 w-16 flex-shrink-0 items-center justify-center rounded-2xl bg-blue-100">
            <BookOpen className="h-8 w-8 text-blue-600" />
          </div>

          {/* Topic Information */}

          <div className="min-w-0">

            <p className="mb-1 text-sm font-medium text-blue-600">
              Topic {topic.topicNumber}
            </p>

            <h1 className="text-2xl font-bold leading-tight text-slate-900 md:text-[28px]">
              {topic.title}
            </h1>

            <p className="mt-2 text-sm text-slate-500">
              {topic.unit
                ? `Unit ${topic.unit.unitNumber} · ${topic.unit.title}`
                : "Learning Topic"}
            </p>

          </div>

        </div>

      </section>

      {/* =================================================
          ABOUT THIS TOPIC
      ================================================= */}

      <section className="mb-6 rounded-2xl border border-slate-200 bg-white p-7 shadow-sm">

        <div className="mb-5 flex items-center gap-4">

          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-100">
            <FileText className="h-5 w-5 text-blue-600" />
          </div>

          <h2 className="text-lg font-semibold text-slate-900">
            About This Topic
          </h2>

        </div>

        <p className="text-[15px] leading-7 text-slate-500">
          {topic.description ||
            "Learn the basic concepts and principles covered in this topic."}
        </p>

      </section>

      {/* =================================================
          LEARNING CONTENT
      ================================================= */}

      <section className="mb-6 rounded-2xl border border-slate-200 bg-white p-7 shadow-sm">

        {/* Header */}

        <div className="mb-6 flex items-center justify-between gap-4">

          <div className="flex items-center gap-4">

            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-100">
              <LibraryBig className="h-5 w-5 text-emerald-600" />
            </div>

            <div>

              <h2 className="text-lg font-semibold text-slate-900">
                Learning Content
              </h2>

              <p className="mt-1 text-xs text-slate-400">
                Study materials uploaded by your teacher
              </p>

            </div>

          </div>

          {/* File Count */}

          {(notes.length + videos.length) > 0 && (
            <div className="rounded-full bg-blue-50 px-3 py-1.5 text-xs font-semibold text-blue-600">
              {notes.length + videos.length}{" "}
              {notes.length + videos.length === 1
                ? "Resource"
                : "Resources"}
            </div>
          )}

        </div>

        {/* =================================================
            NOTES AVAILABLE
        ================================================= */}

        {(notes.length > 0 || videos.length > 0) ? (

          <div className="space-y-3">

            {/* PDF NOTES */}
            {notes.map((note) => (

              <div
                key={`note-${note.id}`}
                className="group flex items-center justify-between gap-5 rounded-xl border border-slate-200 bg-white p-4 transition hover:border-blue-200 hover:bg-slate-50"
              >

                <div className="flex min-w-0 items-center gap-4">

                  <div className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-xl bg-red-50">
                    <FileText className="h-5 w-5 text-red-500" />
                  </div>

                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold text-slate-900">
                      {note.fileName}
                    </p>

                    <p className="mt-1 text-xs text-slate-400">
                      PDF · Learning Material
                    </p>
                  </div>

                </div>

                <button
                  onClick={() => openPdf(note.id)}
                  className="flex flex-shrink-0 items-center gap-2 rounded-lg bg-blue-600 px-4 py-2.5 text-xs font-semibold text-white transition hover:bg-blue-700"
                >
                  <ExternalLink className="h-4 w-4" />
                  View PDF
                </button>

              </div>

            ))}

            {/* VIDEOS */}
            {videos.map((video) => (

              <div
                key={`video-${video.id}`}
                className="group flex items-center justify-between gap-5 rounded-xl border border-slate-200 bg-white p-4 transition hover:border-red-200 hover:bg-slate-50"
              >

                <div className="flex min-w-0 items-center gap-4">

                  <div className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-xl bg-red-50">
                    <Video className="h-5 w-5 text-red-500" />
                  </div>

                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold text-slate-900">
                      {video.title || "Video"}
                    </p>

                    <p className="mt-1 truncate text-xs text-slate-400">
                      YouTube · Video Resource
                    </p>
                  </div>

                </div>

                <a
                  href={video.videoUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex flex-shrink-0 items-center gap-2 rounded-lg bg-red-600 px-4 py-2.5 text-xs font-semibold text-white transition hover:bg-red-700"
                >
                  <ExternalLink className="h-4 w-4" />
                  Watch on YouTube
                </a>

              </div>

            ))}

          </div>

        ) : (

          /* =================================================
             EMPTY STATE
          ================================================= */

          <div className="rounded-xl border border-dashed border-slate-300 bg-slate-50 px-5 py-14 text-center">

            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-emerald-100">
              <LibraryBig className="h-8 w-8 text-emerald-600" />
            </div>

            <h3 className="text-base font-semibold text-slate-800">
              No learning content yet
            </h3>

            <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-400">
              Your teacher has not uploaded notes or added a video for this topic yet.
            </p>

          </div>

        )}

      </section>

      {/* =================================================
          TOPIC PROGRESS
      ================================================= */}

      <section className="flex items-center justify-between gap-5 rounded-2xl border border-slate-200 bg-white px-7 py-5 shadow-sm">

        <div>

          <h3 className="text-base font-semibold text-slate-900">
            Topic Progress
          </h3>

          <p className="mt-1 text-xs text-slate-400">
            {completed
              ? "You have completed this topic."
              : "Complete this topic after studying the learning material."}
          </p>

        </div>

        <button
          onClick={handleMarkComplete}
          disabled={completed || progressLoading}
          className={`flex flex-shrink-0 items-center gap-2 rounded-lg px-4 py-2.5 text-xs font-semibold text-white transition ${
            completed
              ? "cursor-default bg-emerald-600"
              : "bg-blue-600 hover:bg-blue-700"
          } ${
            progressLoading
              ? "cursor-wait opacity-70"
              : ""
          }`}
        >

          {progressLoading ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />

              Saving...
            </>
          ) : completed ? (
            <>
              <CheckCircle2 className="h-4 w-4" />

              Completed
            </>
          ) : (
            <>
              <CheckCircle2 className="h-4 w-4" />

              Mark Complete
            </>
          )}

        </button>

      </section>

    </div>
  );
};

export default TopicLearningPage;